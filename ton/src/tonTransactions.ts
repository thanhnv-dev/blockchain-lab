import { AccountStatus } from "@ton-api/client";
import { Address, internal, SendMode, toNano } from "@ton/core";
import TonWalletVersion from "./common/TonWalletVersion";
import { EmulateMessageToWalletResType } from "./TonServices/type";
import {
  CreateTransactionsParamType,
  CreateTransferForSwapParams,
  EstimateMaxParamType,
  TransferDataType,
} from "./tonTransactions.type";
import TransferUtils from "./transferUtils";

// MARK: Ton Transactions
class TonTransactions {
  /**
   * Creates a TON transfer transaction with optional admin fee
   * @param {Object} params - Transfer parameters
   * @param {string} params.valueNano - Amount to send in nano TON
   * @param {string} params.recipientAddress - Recipient's TON wallet address
   * @param {string} params.adminAddress - Admin wallet address to receive fee
   * @param {string} params.adminValueNano - Admin fee amount in nano TON
   * @param {string} params.privateKey - Base64 encoded private key (32 or 64 bytes)
   * @param {boolean} [params.estimateFee=false] - Whether to estimate transaction fee
   * @param {boolean} [params.bounce] - Whether to bounce transfer if recipient inactive (defaults to recipient account status)
   * @param {TonAccountsType} [params.fromAccountData] - Optional pre-fetched sender account data
   * @param {TonAccountsType} params.recipientAccountData - Pre-fetched recipient account data
   * @param {TonWalletVersion} [params.version] - Wallet version to use (default: V5)
   * @param {string} params.publicKey - Base64 encoded public key
   * @param {string} [params.memo] - Optional memo/comment for the transfer
   * @returns {Promise<{transferData: TransferDataType; fee?: EmulateMessageToWalletResType}|undefined>} Transfer data and optional fee estimation
   * @example
   * const result = await tonTransactions.createTransfer({
   *   valueNano: "1000000000", // 1 TON
   *   recipientAddress: "EQD...xyz",
   *   adminAddress: "EQD...abc",
   *   adminValueNano: "100000000", // 0.1 TON admin fee
   *   privateKey: "base64EncodedPrivateKey",
   *   publicKey: "base64EncodedPublicKey",
   *   estimateFee: true,
   *   recipientAccountData: { status: "active", ... }
   * });
   */
  async createTransfer({
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
    tonAdminBounce,
  }: CreateTransactionsParamType): Promise<
    | {
        transferData: TransferDataType;
        fee?: EmulateMessageToWalletResType;
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

      const [recipientAddressValid, adminTONAddress] = [
        Address.parse(recipientAddress),
        Address.parse(adminAddress),
      ];

      const adminFee = BigInt(Math.floor(Number(adminValueNano)));
      const sendAmount = BigInt(valueNano);

      console.log("=========================================");
      console.log("adminFee", adminFee);
      console.log("sendAmount", sendAmount);

      const internalMessages = [
        internal({
          to: recipientAddressValid,
          bounce: finalBounce,
          value: sendAmount,
          body: memo,
        }),
      ];

      if (adminFee > 0) {
        internalMessages.push(
          internal({
            to: adminTONAddress,
            bounce: tonAdminBounce,
            value: adminFee,
            body: "Admin fee",
          })
        );
      }

      const seqno = await TransferUtils.getSeqno({
        currentSeqno: 0,
        finalFromAccountData,
      });

      const transferData = await TransferUtils.createExternalTransfer({
        internalMessages,
        secretKey,
        sendMode: SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS,
        contract,
        seqno,
      });

      if (!estimateFee) {
        return { transferData: transferData, fee: undefined };
      }

      const balance = Number(finalFromAccountData.balance);

      const fee = await TransferUtils.estimateFee({
        boc: transferData.messageBOCString,
        address: finalFromAccountData.address,
        balance: balance,
      });

      if (!fee) {
        console.error("estimateFee error", fee);
        return undefined;
      }

      return { transferData, fee };
    } catch (error) {
      console.error("createTransfer error:", error);
      return undefined;
    }
  }

  /**
   * Estimates maximum possible transfer amount and admin fee for a TON transaction
   * @param {Object} params - Estimation parameters
   * @param {string} params.privateKey - Base64 encoded private key (32 or 64 bytes)
   * @param {string} params.publicKey - Base64 encoded public key
   * @param {TonWalletVersion} [params.version] - Wallet version to use (defaults to V5)
   * @param {string} params.recipientAddress - Recipient's TON wallet address
   * @param {string} params.adminAddress - Admin wallet address to receive fee
   * @param {number} params.adminPercent - Admin fee percentage (0-1)
   * @returns {Promise<{maxAmount: number; maxAdminFee: number}|undefined>} Maximum possible transfer amount and admin fee, or undefined if estimation fails
   * @example
   * const result = await tonTransactions.estimateMax({
   *   privateKey: "base64EncodedPrivateKey",
   *   publicKey: "base64EncodedPublicKey",
   *   recipientAddress: "EQD...xyz",
   *   adminAddress: "EQD...abc",
   *   adminPercent: 0.1 // 10% admin fee
   * });
   */
  estimateMax = async ({
    privateKey,
    publicKey,
    version,
    recipientAddress,
    adminAddress,
    adminPercent,
  }: EstimateMaxParamType): Promise<
    { maxAmount: number; maxAdminFee: number; totalFee: number } | undefined
  > => {
    try {
      // Create transaction with 2 messages: 1 message for admin fee and 1 message to transfer all remaining balance.
      // Increase original balance by 20% for emulate transaction params.
      // Then emulate this transaction and get the fee.
      // Finally calculate maxAmount = original balance - fee - adminFee
      const { contract, secretKey } = await TransferUtils.initializeWallet(
        version ?? TonWalletVersion.V5,
        publicKey,
        privateKey
      );

      const fromAccountData = await TransferUtils.getFinalAccountData({
        contract,
      });

      const balance = fromAccountData.balance;
      const adminFeeNano = Number(balance) * adminPercent;

      const adminFee = BigInt(Math.floor(adminFeeNano));
      const sendAmount = BigInt(balance);

      console.log("=========================================");
      console.log("adminFee", adminFee);
      console.log("sendAmount", sendAmount);

      const internalMessages = [
        internal({
          to: recipientAddress,
          bounce: true,
          value: sendAmount,
        }),
      ];

      if (adminFee > 0) {
        internalMessages.push(
          internal({
            to: adminAddress,
            bounce: true,
            value: adminFee,
            body: "Admin fee",
          })
        );
      }

      const seqno = await TransferUtils.getSeqno({
        currentSeqno: 0,
        finalFromAccountData: fromAccountData,
      });

      const transferData = await TransferUtils.createExternalTransfer({
        internalMessages,
        secretKey,
        sendMode: SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS,
        contract,
        seqno,
      });

      const fee = await TransferUtils.estimateFee({
        boc: transferData.messageBOCString,
        address: fromAccountData.address,
        balance: Number(toNano(100)),
      });

      if (!fee) {
        console.error("estimateFee error", fee);
        return undefined;
      }

      const baseBalance = Number(fromAccountData.balance);
      const networkFee = Math.abs(fee.event?.extra) * 1.05;
      const remainBalance = baseBalance - networkFee;
      const adminFeeNumber = remainBalance * adminPercent;

      const totalFee = networkFee + adminFeeNumber;

      const maxAmount = remainBalance - adminFeeNumber;

      console.log("maxAmount", maxAmount);

      return { maxAmount, maxAdminFee: adminFeeNumber, totalFee };
    } catch (error) {
      console.error("createTransfer error:", error);
      return undefined;
    }
  };
  async createTransferForSwap({
    valueNano,
    recipientAddress,
    privateKey,
    estimateFee = false,
    publicKey,
    accountData,
  }: CreateTransferForSwapParams): Promise<
    | {
        transferData: TransferDataType;
        fee?: number;
      }
    | undefined
  > {
    try {
      const { contract, secretKey } = await TransferUtils.initializeWallet(
        TonWalletVersion.V5,
        publicKey,
        privateKey
      );

      const finalFromAccountData = await TransferUtils.getFinalAccountData({
        fromAccountData: accountData,
        contract,
      });

      const recipientAddressValid = Address.parse(recipientAddress);

      const sendAmount = BigInt(valueNano);

      console.log("=========================================");
      console.log("sendAmount", sendAmount);

      const internalMessages = [
        internal({
          to: recipientAddressValid,
          bounce: false,
          value: sendAmount,
        }),
      ];

      const seqno = await TransferUtils.getSeqno({
        currentSeqno: 0,
        finalFromAccountData,
      });

      const transferData = await TransferUtils.createExternalTransfer({
        internalMessages,
        secretKey,
        sendMode: SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS,
        contract,
        seqno,
      });

      if (!estimateFee) {
        return { transferData: transferData, fee: undefined };
      }

      const balance = Number(finalFromAccountData.balance);

      const fee = await TransferUtils.estimateFee({
        boc: transferData.messageBOCString,
        address: finalFromAccountData.address,
        balance: balance,
      });

      if (!fee) {
        console.error("estimateFee error", fee);
        return undefined;
      }

      const extraFee = 1.05;
      const networkFee = Math.ceil(
        Number(Math.abs(fee.event?.extra) * extraFee)
      );

      return { transferData, fee: networkFee };
    } catch (error) {
      console.error("createTransfer error:", error);
      return undefined;
    }
  }
}

export default TonTransactions;
