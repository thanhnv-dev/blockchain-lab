import { Address, beginCell, internal, SendMode, toNano } from "@ton/core";
import TonWalletVersion from "./common/TonWalletVersion";
import { TransactionNFTEmulateStatusType } from "./TonServices/type";
import TonServices from "./TonServices";
import { EmulateMessageToWalletResType } from "./TonServices/type";
import { TonOpCodes } from "./common/opCode";
import {
  NFTTransferSendParamType,
  TransferDataType,
} from "./tonTransactions.type";
import TransferUtils from "./transferUtils";

type NFTTransferResponseType = {
  emulateTransfer: EmulateMessageToWalletResType;
  transferData: TransferDataType;
};

class NFTTonTransfer {
  private buildTransferBody({
    recipientAddress,
    senderAddressString,
  }: {
    recipientAddress: string;
    senderAddressString: string;
  }): any {
    const body = beginCell()
      .storeUint(TonOpCodes.NFT_TRANSFER, 32)
      .storeUint(TransferUtils.getWalletQueryId(), 64)
      .storeAddress(Address.parse(recipientAddress))
      .storeAddress(Address.parse(senderAddressString))
      .storeUint(0, 1)
      .storeCoins(1)
      .storeUint(0, 1)
      .endCell();
    return body;
  }

  handleNFTTransfer = async ({
    recipientAddress,
    nftAddressString,
    senderAddressString,
    privateKey,
    publicKey,
    version,
    adminAddress,
    adminFee,
    amountSending,
    tonDataRes,
    currentDecimal,
    isRealisticTransaction = false,
    tonAdminBounce,
  }: NFTTransferSendParamType): Promise<
    NFTTransferResponseType | undefined
  > => {
    try {
      const tonServices = new TonServices();
      const { contract, secretKey } = await TransferUtils.initializeWallet(
        version ?? TonWalletVersion.V5,
        publicKey,
        privateKey
      );

      if (
        !Address.parse(recipientAddress) ||
        !Address.parse(senderAddressString)
      ) {
        console.error("Invalid address format");
        return undefined;
      }
      const bodyNFTTransfer = this.buildTransferBody({
        recipientAddress,
        senderAddressString,
      });
      const internalMessages = [
        internal({
          to: nftAddressString,
          bounce: true,
          value: amountSending,
          body: bodyNFTTransfer,
        }),
      ];
      if (adminFee > 0) {
        internalMessages.push(
          internal({
            to: adminAddress,
            bounce: tonAdminBounce,
            value: adminFee,
            body: "Admin Fee",
          })
        );
      }

      const seqno = await TransferUtils.getSeqno({
        currentSeqno: 0,
        finalFromAccountData: tonDataRes,
      });

      const transferData = await TransferUtils.createExternalTransfer({
        internalMessages,
        secretKey,
        sendMode: SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS,
        contract,
        seqno,
      });
      if (!transferData || !transferData.messageBOCString) {
        return undefined;
      }
      const emulateBalanceData = Number(toNano(1));
      const emulateTransferData = await tonServices.emulateMessageToWallet({
        boc: transferData.messageBOCString,
        params: [
          {
            address: senderAddressString,
            balance: isRealisticTransaction
              ? tonDataRes.balance
              : emulateBalanceData,
          },
        ],
      });
      if (!emulateTransferData || !emulateTransferData.data) {
        return undefined;
      }

      const emulateTransferDataResult =
        emulateTransferData.data as EmulateMessageToWalletResType;

      const actionsTransfer = emulateTransferDataResult.event.actions;

      const hasTransferError = actionsTransfer.some(
        (action) => action.status === TransactionNFTEmulateStatusType.Failed
      );
      if (hasTransferError) {
        return undefined;
      }

      return {
        emulateTransfer: emulateTransferDataResult,
        transferData: transferData,
      };
    } catch (error) {
      console.error("createTransfer error:", error);
      return undefined;
    }
  };
}
export default NFTTonTransfer;
