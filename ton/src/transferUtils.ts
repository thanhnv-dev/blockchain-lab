import { AccountStatus, Seqno } from "@ton-api/client";
import {
  beginCell,
  Cell,
  comment,
  external,
  OpenedContract,
  storeMessage,
} from "@ton/core";
import { WalletContractV4, WalletContractV5R1 } from "@ton/ton";
import TonWalletVersion from "./common/TonWalletVersion";
import nacl from "tweetnacl";
import TonServices from "./TonServices";
import {
  EmulateMessageToWalletResType,
  TonAccountsType,
} from "./TonServices/type";
import TonWallet from "./TonWallet";
import {
  CreateExternalTransferType,
  EstimateFeeType,
  TransferDataType,
} from "./tonTransactions.type";

/**
 * Creates an external transfer message for TON transactions
 * @param params - Parameters for creating external transfer
 * @param params.internalMessages - Array of internal messages to include in transfer
 * @param params.secretKey - Buffer containing secret key (64 bytes: private + public key)
 * @param params.sendMode - SendMode flags for the transfer
 * @param params.contract - OpenedContract instance (WalletContractV4 or WalletContractV5R1)
 * @param params.seqno - Current sequence number for the wallet
 * @returns Promise resolving to transfer data containing hash, cell and BOC
 * @throws Error if message creation fails
 * @example
 * const transfer = await _createExternalTransfer({
 *   internalMessages: [
 *     internal({
 *       to: recipientAddress,
 *       value: toNano("1.5"),
 *       body: "Test transfer"
 *     })
 *   ],
 *   secretKey: Buffer.from("your-secret-key-in-base64", "base64"),
 *   sendMode: SendMode.PAY_GAS_SEPARATELY,
 *   contract: walletContract,
 *   seqno: 1
 * });
 * @private
 */
const createExternalTransfer = async ({
  internalMessages,
  secretKey,
  sendMode,
  contract,
  seqno,
}: CreateExternalTransferType): Promise<TransferDataType> => {
  try {
    const senderWalletAddress = contract.address;

    const body = (
      contract as OpenedContract<WalletContractV5R1>
    ).createTransfer({
      messages: internalMessages,
      secretKey: secretKey,
      sendMode: sendMode,
      seqno: seqno,
    });

    const externalMessage = external({
      body,
      to: senderWalletAddress,
      init: seqno === 0 ? contract.init : undefined,
    });

    const externalMessageCell = beginCell()
      .store(storeMessage(externalMessage))
      .endCell();

    const externalMessageBOC = externalMessageCell.toBoc();

    return {
      txHash: externalMessageCell.hash().toString("hex"),
      cell: externalMessageCell,
      messageBOCString: externalMessageBOC.toString("base64"),
    };
  } catch (error) {
    console.error("createExternalTransfer error:", error);
    throw error;
  }
};
const createContract = async (version: TonWalletVersion, publicKey: string) => {
  const tonWallet = new TonWallet();
  const contract = await tonWallet.createContract(
    version ?? TonWalletVersion.V5,
    publicKey
  );
  return contract;
};

const getSecretKey = ({
  privateKey,
  publicKey,
}: {
  privateKey: string;
  publicKey: string;
}) => {
  try {
    const privateKeyBuffer = Buffer.from(privateKey, "base64");

    if (privateKeyBuffer.length === 32) {
      const publicKeyBuffer = Buffer.from(publicKey, "base64");

      return Buffer.concat([privateKeyBuffer, publicKeyBuffer]);
    } else if (privateKeyBuffer.length === 64) {
      return privateKeyBuffer;
    } else {
      console.error(`Invalid private key length: ${privateKeyBuffer.length}`);
      return undefined;
    }
  } catch (error) {
    console.error("Error processing private key:", error);
    return undefined;
  }
};

const getWalletQueryId = () => {
  const signature = (0x546de4ef).toString(16);
  const value = Buffer.concat([
    Buffer.from(signature, "hex"),
    nacl.randomBytes(4),
  ]);
  return BigInt("0x" + value.toString("hex"));
};

const prepareForwardBody = (body?: Cell | string) => {
  return typeof body === "string" ? comment(body) : body;
};

/**
 * Estimates transaction fee by emulating message to wallet
 * @param params - Parameters for message emulation
 * @param params.boc - Base64 encoded BOC string of the message
 * @param params.params - Array of account parameters (address and balance)
 * @returns Promise resolving to fee estimation result or undefined if estimation fails
 * @example
 * const fee = await _estimateFee({
 *   boc: "te6ccgEBAgEAkwABYAGq/mH0U1mHLJZZxkY=",
 *   params: [{
 *     address: "EQBvW8Z5huBkMJYdnfAEM5JqTNkuWX3diqYENkWsIL0XggGG",
 *     balance: "1000000000"
 *   }]
 * });
 * @private
 */
const estimateFee = async ({
  boc,
  address,
  balance,
}: EstimateFeeType): Promise<EmulateMessageToWalletResType | undefined> => {
  try {
    const tonServices = new TonServices();
    const params = {
      boc,
      params: [
        {
          address,
          balance,
        },
      ],
    };
    const estimateFeeData = await tonServices.emulateMessageToWallet(params);

    const checkAction = (
      estimateFeeData?.data as EmulateMessageToWalletResType
    )?.event?.actions?.some((e) => e?.status === "failed");

    if (estimateFeeData.isSuccess && !checkAction) {
      return estimateFeeData.data as EmulateMessageToWalletResType;
    } else {
      console.error("estimateFee error:", estimateFeeData?.data);
      return undefined;
    }
  } catch (error) {
    console.error("estimateFee error:", error);
    return undefined;
  }
};

const initializeWallet = async (
  version: TonWalletVersion,
  publicKey: string,
  privateKey: string
) => {
  const tonWallet = new TonWallet();
  const contract = await tonWallet.createContract(
    version ?? TonWalletVersion.V5,
    publicKey
  );

  const secretKey = TransferUtils.getSecretKey({ privateKey, publicKey });
  if (!secretKey) {
    throw new Error("Invalid secret key");
  }

  return { contract, secretKey };
};

const getFinalAccountData = async ({
  fromAccountData,
  contract,
}: {
  fromAccountData?: TonAccountsType;
  contract: OpenedContract<WalletContractV5R1 | WalletContractV4>;
}) => {
  if (fromAccountData) {
    return fromAccountData;
  }

  const tonServices = new TonServices();
  const getAccountRes = await tonServices.getAccounts({
    address: contract.address,
  });

  if (!getAccountRes?.isSuccess) {
    throw new Error("Failed to get account data");
  }

  return getAccountRes.data as TonAccountsType;
};

// MARK: Get Seqno
const getSeqno = async ({
  finalFromAccountData,
  currentSeqno,
}: {
  finalFromAccountData: TonAccountsType;
  currentSeqno?: number;
}) => {
  let seqno = currentSeqno ?? 0;
  if (finalFromAccountData.status === AccountStatus.Active && !currentSeqno) {
    const tonServices = new TonServices();
    const getAccountSeqnoRes = await tonServices.getAccountSeqno({
      address: finalFromAccountData.address,
    });
    if (getAccountSeqnoRes?.isSuccess) {
      seqno = (getAccountSeqnoRes?.data as Seqno).seqno;
    }
  }
  return seqno;
};

const initContract = async (version: TonWalletVersion, publicKey: string) => {
  const tonWallet = new TonWallet();
  const contract = await tonWallet.createContract(
    version ?? TonWalletVersion.V5,
    publicKey
  );

  return { contract };
};
const TransferUtils = {
  createExternalTransfer,
  estimateFee,
  getSecretKey,
  getWalletQueryId,
  prepareForwardBody,
  initializeWallet,
  getFinalAccountData,
  getSeqno,
  initContract,
  createContract,
};

export default TransferUtils;
