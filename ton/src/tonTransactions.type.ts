import {
  Address,
  Cell,
  MessageRelaxed,
  OpenedContract,
  SendMode,
} from "@ton/core";
import { WalletContractV4, WalletContractV5R1 } from "@ton/ton";
import TonWalletVersion from "./common/TonWalletVersion";
import { TonAccountsType } from "./TonServices/type";

/**
 * Parameters for creating a TON transfer transaction
 */
export type CreateTransactionsParamType = {
  /** Base64 encoded private key (32 or 64 bytes) */
  privateKey: string;
  /** Recipient's TON wallet address */
  recipientAddress: string;
  /** Amount to send in nano TON */
  valueNano: string;
  /** Admin wallet address to receive fee */
  adminAddress: string;
  /** Fee amount in nano TON */
  adminValueNano: string;
  /** Whether to estimate transaction fee */
  estimateFee?: boolean;
  /** Whether to bounce transfer if recipient inactive */
  bounce?: boolean;
  /** Optional pre-fetched sender account data */
  fromAccountData?: TonAccountsType;
  /** Pre-fetched recipient account data */
  recipientAccountData: TonAccountsType;
  /** Wallet version to use (default: V5) */
  version?: TonWalletVersion;
  /** Base64 encoded public key */
  publicKey: string;
  /** Optional memo/comment for the transfer */
  memo?: string;
  tonAdminBounce: boolean;
};

export type CreateJettonTransactionsParamType = {
  /** Base64 encoded private key (32 or 64 bytes) */
  privateKey: string;
  /** Recipient's TON wallet address */
  recipientAddress: string;
  /** Amount to send in nano TON */
  valueNano: BigInt;
  /** Admin wallet address to receive fee */
  adminAddress: string;
  /** Fee amount in nano TON */
  adminValueNano: BigInt;
  /** Network fee amount in nano TON */
  networkFee?: BigInt;
  /** Whether to estimate transaction fee */
  estimateFee?: boolean;
  /** Whether to bounce transfer if recipient inactive */
  bounce?: boolean;
  /** Optional pre-fetched sender account data */
  fromAccountData?: TonAccountsType;
  /** Pre-fetched recipient account data */
  recipientAccountData: TonAccountsType;
  /** Wallet version to use (default: V5) */
  version?: TonWalletVersion;
  /** Base64 encoded public key */
  publicKey: string;
  /** Optional memo/comment for the transfer */
  memo?: string;
  /** Jetton wallet address */
  jettonAddress: string;
  /** Current sequence number */
  currentSeqno?: number;
  /** Minimum fee from remote config */
  minFeeFromRemoteConfig?: number;
  jettonAdminBounce: boolean;
};
export type CreateLockTransferParamType = {
  valueNano: BigInt;
  recipientAddress: string;
  privateKey: string;
  estimateFee?: boolean;
  bounce?: boolean;
  fromAccountData?: TonAccountsType;
  recipientAccountData: TonAccountsType;
  version?: TonWalletVersion;
  publicKey: string;
  memo?: string;
  jettonAddress: string;
  networkFee?: BigInt;
  currentSeqno?: number;
  minFeeFromRemoteConfig?: number;
};
export type EstimateMaxParamType = {
  /** Base64 encoded private key (32 or 64 bytes) */
  privateKey: string;
  /** Wallet version to use (default: V5) */
  version?: TonWalletVersion;
  /** Base64 encoded public key */
  publicKey: string;
  /** Recipient's TON wallet address */
  recipientAddress: string;
  /** Admin wallet address to receive fee */
  adminAddress: string;
  /** Admin fee percent */
  adminPercent: number;
};

export type EstimateJettonMaxParamType = {
  /** Base64 encoded private key (32 or 64 bytes) */
  privateKey: string;
  /** Wallet version to use (default: V5) */
  version?: TonWalletVersion;
  /** Base64 encoded public key */
  publicKey: string;
  /** Recipient's TON wallet address */
  recipientAddress: string;
  /** Jetton wallet address */
  jettonAddress: string;
  /** Admin wallet address to receive fee */
  adminAddress: string;
  /** Admin fee percent */
  adminFee: BigInt;
  /** Max value to transfer */
  maxValue: BigInt;
  /** Pre-fetched recipient account data */
  recipientAccountData?: TonAccountsType;
  /** Optional pre-fetched sender account data */
  fromAccountData?: TonAccountsType;
};

/**
 * Parameters for creating external transfer message
 */
export type CreateExternalTransferType = {
  /** Array of internal messages to include */
  internalMessages: MessageRelaxed[];
  /** Buffer containing 64-byte secret key */
  secretKey: Buffer;
  /** SendMode flags for the transfer */
  sendMode: SendMode;
  /** Opened wallet contract instance */
  contract: OpenedContract<WalletContractV5R1 | WalletContractV4>;
  /** Current sequence number for the wallet */
  seqno: number;
};

/**
 * Result data from transfer creation
 */
export type TransferDataType = {
  /** Transaction hash in hex format */
  txHash: string;
  /** Cell containing the message */
  cell: Cell;
  /** Base64 encoded BOC string of the message */
  messageBOCString: string;
};

export type NFTTransferResponse = {
  fromAccountData: TonAccountsType;
  transferData: TransferDataType;
};

export type NFTTransferSendParamType = {
  recipientAddress: string;
  nftAddressString: string;
  senderAddressString: string;
  privateKey: string;
  publicKey: string;
  version?: TonWalletVersion;
  nftId?: number;
  adminAddress: string;
  adminFee: bigint;
  amountSending: bigint;
  tonDataRes: TonAccountsType;
  currentDecimal: number;
  isRealisticTransaction?: boolean;
  tonAdminBounce: boolean;
};

export type JettonTransferBodyType = {
  sendAmount: bigint;
  recipientAddressValid: Address;
  excessesAddressValid: Address;
  memo?: string;
};

export type EstimateFeeType = {
  boc: string;
  address: Address;
  balance?: number;
};

export type CreateTransferForSwapParams = {
  valueNano: string;
  recipientAddress: string;
  privateKey: string;
  estimateFee: boolean;
  publicKey: string;
  accountData?: TonAccountsType;
};

export type CreateSwapTransferParamType = {
  valueNano: BigInt;
  recipientAddress: string;
  secretKey: Buffer<ArrayBufferLike>;
  estimateFee?: boolean;
  fromAccountData?: TonAccountsType;
  version?: TonWalletVersion;
  publicKey: string;
  memo?: string;
  jettonAddress: string;
  networkFee: bigint;
  currentSeqno?: number;
  minFeeFromRemoteConfig?: number;
};
