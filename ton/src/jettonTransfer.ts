import { AccountStatus } from "@ton-api/client";
import {
  Address,
  beginCell,
  comment,
  internal,
  MessageRelaxed,
  OpenedContract,
  SendMode,
  toNano,
} from "@ton/core";
import { WalletContractV4, WalletContractV5R1 } from "@ton/ton";
import Big from "big.js";
import TonWalletVersion from "./common/TonWalletVersion";
import TonUtils from "./tonUtils";
import {
  EmulateMessageToWalletResType,
  TonAccountsType,
} from "./TonServices/type";
import { TonOpCodes } from "./common/opCode";
import {
  CreateJettonTransactionsParamType,
  CreateLockTransferParamType,
  CreateSwapTransferParamType,
  JettonTransferBodyType,
  TransferDataType,
} from "./tonTransactions.type";
import TransferUtils from "./transferUtils";

class JettonTransfer {
  // MARK: Create Jetton Transfer Body
  private createJettonTransferBody({
    sendAmount,
    recipientAddressValid,
    excessesAddressValid,
    memo,
  }: JettonTransferBodyType) {
    return (
      beginCell()
        .storeUint(TonOpCodes.JETTON_TRANSFER, 32)
        .storeUint(TransferUtils.getWalletQueryId(), 64)
        .storeCoins(sendAmount)
        .storeAddress(recipientAddressValid)
        .storeAddress(excessesAddressValid)
        .storeBit(false)
        .storeCoins(1)
        // .storeCoins(1n)
        .storeMaybeRef(memo ? comment(memo) : undefined)
        .endCell()
    );
  }

  private getNetworkFee(
    networkFee: BigInt | undefined,
    minFeeFromRemoteConfig?: number
  ) {
    let convertNetworkFee;

    if (networkFee?.toString()) {
      const bigNetworkFee = new Big(
        Math.ceil(new Big(networkFee?.toString()).div(2).toNumber())
      );

      convertNetworkFee = BigInt(bigNetworkFee.toFixed(0));

      const minFeeForJettonTransfer = TonUtils.getMinFeeForJettonTransaction(
        1,
        minFeeFromRemoteConfig
      );
      convertNetworkFee =
        minFeeForJettonTransfer > convertNetworkFee
          ? minFeeForJettonTransfer
          : convertNetworkFee;
    }

    return convertNetworkFee ?? toNano(1);
  }

  // MARK: Validate Addresses
  private validateAddresses({
    recipientAddress,
    adminAddress,
    fromAddress,
    jettonAddress,
  }: {
    recipientAddress: string;
    adminAddress: string;
    fromAddress: string;
    jettonAddress: string;
  }) {
    return {
      recipientAddressValid: Address.parse(recipientAddress),
      adminTONAddress: Address.parse(adminAddress),
      excessesAddressValid: Address.parse(fromAddress),
      jettonAddressValid: Address.parse(jettonAddress),
    };
  }

  // MARK: Convert Amounts
  private convertAmounts({
    adminValueNano,
    valueNano,
  }: {
    adminValueNano: BigInt;
    valueNano: BigInt;
  }) {
    return {
      adminFee: BigInt(new Big(adminValueNano.toString()).toFixed(0)),
      sendAmount: BigInt(new Big(valueNano.toString()).toFixed(0)),
    };
  }

  // MARK: Finalize Transfer
  private async finalizeTransfer({
    internalMessages,
    secretKey,
    contract,
    seqno,
    estimateFee,
    finalFromAccountData,
  }: {
    internalMessages: MessageRelaxed[];
    secretKey: Buffer;
    contract: OpenedContract<WalletContractV5R1 | WalletContractV4>;
    seqno: number;
    estimateFee: boolean;
    finalFromAccountData: TonAccountsType;
  }) {
    const transferData = await TransferUtils.createExternalTransfer({
      internalMessages,
      secretKey,
      sendMode: SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS,
      contract,
      seqno,
    });

    const fee = await TransferUtils.estimateFee({
      boc: transferData.messageBOCString,
      address: finalFromAccountData.address,
      balance: estimateFee ? Number(toNano(100)) : undefined,
    });
    if (!fee) {
      throw new Error("Failed to estimate fee");
    }
    return { transferData, fee, currentSeqno: seqno };
  }

  /**
   * Creates a jetton transfer transaction with optional admin fee
   *
   * @param {CreateJettonTransactionsParamType} params - The parameters for creating the jetton transfer
   * @param {string} params.privateKey - Base64 encoded private key (32 or 64 bytes)
   * @param {string} params.recipientAddress - Recipient's TON wallet address
   * @param {BigInt} params.valueNano - Amount to send in nano TON
   * @param {string} params.adminAddress - Admin wallet address to receive fee
   * @param {BigInt} params.adminValueNano - Admin fee amount in nano TON
   * @param {BigInt} [params.networkFee] - Optional network fee amount in nano TON
   * @param {boolean} [params.estimateFee=false] - Whether to estimate transaction fee
   * @param {boolean} [params.bounce] - Whether to bounce transfer if recipient inactive
   * @param {TonAccountsType} [params.fromAccountData] - Optional pre-fetched sender account data
   * @param {TonAccountsType} params.recipientAccountData - Pre-fetched recipient account data
   * @param {TonWalletVersion} [params.version] - Wallet version to use (default: V5)
   * @param {string} params.publicKey - Base64 encoded public key
   * @param {string} [params.memo] - Optional memo/comment for the transfer
   * @param {string} params.jettonAddress - Jetton wallet address
   * @param {number} [params.currentSeqno] - Current sequence number
   *
   * @returns {Promise<{transferData: TransferDataType; fee?: EmulateMessageToWalletResType; currentSeqno: number} | undefined>}
   * Returns transfer data, estimated fee (if requested), and current sequence number. Returns undefined on error.
   *
   * @example
   * // Basic jetton transfer
   * const result = await tonTransactions.createJettonTransfer({
   *   privateKey: "base64EncodedPrivateKey",
   *   publicKey: "base64EncodedPublicKey",
   *   recipientAddress: "EQA...xyz",
   *   valueNano: BigInt("1000000000"), // 1 TON
   *   adminAddress: "EQB...abc",
   *   adminValueNano: BigInt("100000000"), // 0.1 TON admin fee
   *   jettonAddress: "EQC...def",
   *   recipientAccountData: {
   *     status: AccountStatus.Active,
   *     address: Address.parse("EQA...xyz")
   *   }
   * });
   *
   * @example
   * // Transfer with fee estimation
   * const resultWithFee = await tonTransactions.createJettonTransfer({
   *   privateKey: "base64EncodedPrivateKey",
   *   publicKey: "base64EncodedPublicKey",
   *   recipientAddress: "EQA...xyz",
   *   valueNano: BigInt("1000000000"),
   *   adminAddress: "EQB...abc",
   *   adminValueNano: BigInt("100000000"),
   *   jettonAddress: "EQC...def",
   *   estimateFee: true,
   *   memo: "Payment for services",
   *   recipientAccountData: {
   *     status: AccountStatus.Active,
   *     address: Address.parse("EQA...xyz")
   *   }
   * });
   *
   * @throws Will not throw errors directly, but returns undefined on failure
   */

  // MARK: Create Jetton Transfer
  async createJettonTransfer({
    valueNano,
    recipientAddress,
    adminAddress,
    adminValueNano,
    privateKey,
    estimateFee = false,
    bounce,
    fromAccountData,
    recipientAccountData,
    version,
    publicKey,
    memo,
    jettonAddress,
    networkFee,
    currentSeqno,
    minFeeFromRemoteConfig,
    jettonAdminBounce,
  }: CreateJettonTransactionsParamType): Promise<
    | {
        transferData: TransferDataType;
        fee?: EmulateMessageToWalletResType;
        currentSeqno: number;
      }
    | undefined
  > {
    try {
      const { contract, secretKey } = await TransferUtils.initializeWallet(
        version ?? TonWalletVersion.V5,
        publicKey,
        privateKey
      );

      const finalFromAccountData = await TransferUtils.getFinalAccountData({
        fromAccountData,
        contract,
      });

      const finalBounce =
        bounce ?? recipientAccountData.status === AccountStatus.Active;

      const {
        recipientAddressValid,
        adminTONAddress,
        excessesAddressValid,
        jettonAddressValid,
      } = this.validateAddresses({
        recipientAddress,
        adminAddress,
        fromAddress: finalFromAccountData.address.toString(),
        jettonAddress,
      });

      const { adminFee, sendAmount } = this.convertAmounts({
        adminValueNano,
        valueNano,
      });

      console.log("=================================================");
      console.log("sendAmount", sendAmount);
      console.log("adminFee", adminFee);

      const toValue = this.getNetworkFee(networkFee, minFeeFromRemoteConfig);

      console.log("toValue", toValue);

      const internalMessages = [
        internal({
          bounce: finalBounce,
          to: jettonAddressValid,
          value: toValue,
          body: this.createJettonTransferBody({
            sendAmount: sendAmount,
            recipientAddressValid: recipientAddressValid,
            excessesAddressValid: excessesAddressValid,
            memo: memo,
          }),
        }),
      ];

      if (adminFee > 0) {
        internalMessages.push(
          internal({
            bounce: jettonAdminBounce,
            to: jettonAddressValid,
            value: toValue,
            body: this.createJettonTransferBody({
              sendAmount: adminFee,
              recipientAddressValid: adminTONAddress,
              excessesAddressValid: excessesAddressValid,
              memo: "Admin fee",
            }),
          })
        );
      }

      const seqno = await TransferUtils.getSeqno({
        currentSeqno,
        finalFromAccountData,
      });

      const results = this.finalizeTransfer({
        internalMessages,
        secretKey,
        contract,
        seqno,
        estimateFee,
        finalFromAccountData,
      });

      return results;
    } catch (error) {
      console.error("createJettonTransfer error:", error);
      return undefined;
    }
  }

  // MARK: Create Lock Transfer
  async createLockTransfer({
    valueNano,
    recipientAddress,
    privateKey,
    estimateFee = false,
    bounce,
    fromAccountData,
    recipientAccountData,
    version,
    publicKey,
    memo,
    jettonAddress,
    networkFee,
    currentSeqno,
    minFeeFromRemoteConfig,
  }: CreateLockTransferParamType): Promise<
    | {
        transferData: TransferDataType;
        fee?: EmulateMessageToWalletResType;
        currentSeqno: number;
      }
    | undefined
  > {
    try {
      const { contract, secretKey } = await TransferUtils.initializeWallet(
        version ?? TonWalletVersion.V5,
        publicKey,
        privateKey
      );

      const finalFromAccountData = await TransferUtils.getFinalAccountData({
        fromAccountData,
        contract,
      });

      const finalBounce =
        bounce ?? recipientAccountData.status === AccountStatus.Active;

      const [
        recipientAddressValid,
        finalFromAccountDataValid,
        jettonAddressValid,
      ] = [
        Address.parse(recipientAddress),
        Address.parse(finalFromAccountData.address.toString()),
        Address.parse(jettonAddress),
      ];

      const bigSendAmountValue = new Big(valueNano.toString());
      const sendAmount = BigInt(bigSendAmountValue.toFixed(0));

      const toValue = this.getNetworkFee(networkFee, minFeeFromRemoteConfig);

      console.log("=================================================");
      console.log("sendAmount", sendAmount);
      console.log("toValue", toValue);

      const internalMessages = [
        internal({
          bounce: finalBounce,
          to: jettonAddressValid,
          value: toValue,
          body: this.createJettonTransferBody({
            sendAmount: sendAmount,
            recipientAddressValid: recipientAddressValid,
            excessesAddressValid: finalFromAccountDataValid,
            memo: memo,
          }),
        }),
      ];

      const seqno = await TransferUtils.getSeqno({
        currentSeqno,
        finalFromAccountData,
      });

      return this.finalizeTransfer({
        internalMessages,
        secretKey,
        contract,
        seqno,
        estimateFee,
        finalFromAccountData,
      });
    } catch (error) {
      console.error("createLockTransfer error:", error);
      return undefined;
    }
  }

  // MARK: Create Lock Transfer
  async createSwapTransfer({
    valueNano,
    recipientAddress,
    estimateFee = false,
    fromAccountData,
    version,
    publicKey,
    memo,
    jettonAddress,
    networkFee,
    currentSeqno,
    secretKey,
    minFeeFromRemoteConfig,
  }: CreateSwapTransferParamType): Promise<
    | {
        transferData: TransferDataType;
        fee?: EmulateMessageToWalletResType;
        currentSeqno: number;
      }
    | undefined
  > {
    try {
      const { contract } = await TransferUtils.initContract(
        version ?? TonWalletVersion.V5,
        publicKey
      );

      const finalFromAccountData = await TransferUtils.getFinalAccountData({
        fromAccountData,
        contract,
      });

      const [
        recipientAddressValid,
        finalFromAccountDataValid,
        jettonAddressValid,
      ] = [
        Address.parse(recipientAddress),
        Address.parse(finalFromAccountData.address.toString()),
        Address.parse(jettonAddress),
      ];

      const bigSendAmountValue = new Big(valueNano.toString());
      const sendAmount = BigInt(bigSendAmountValue.toFixed(0));

      const minFeeForJettonTransfer = TonUtils.getMinFeeForJettonTransaction(
        1,
        minFeeFromRemoteConfig
      );

      const toValue =
        networkFee > minFeeForJettonTransfer
          ? networkFee
          : minFeeForJettonTransfer;

      console.log("=================================================");
      console.log("sendAmount", sendAmount);
      console.log("toValue", toValue);

      const internalMessages = [
        internal({
          bounce: false,
          to: jettonAddressValid,
          value: toValue,
          body: this.createJettonTransferBody({
            sendAmount: sendAmount,
            recipientAddressValid: recipientAddressValid,
            excessesAddressValid: finalFromAccountDataValid,
            memo: memo,
          }),
        }),
      ];

      const seqno = await TransferUtils.getSeqno({
        currentSeqno,
        finalFromAccountData,
      });

      return this.finalizeTransfer({
        internalMessages,
        secretKey,
        contract,
        seqno,
        estimateFee,
        finalFromAccountData,
      });
    } catch (error) {
      console.error("createLockTransfer error:", error);
      return undefined;
    }
  }
}

export default JettonTransfer;
