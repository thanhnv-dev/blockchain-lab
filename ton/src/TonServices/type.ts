import { ImagePreview, NftApprovedBy, Sale, TrustType } from "@ton-api/client";
import { AccountStatus, Address, Cell } from "@ton/core";
import TonEventType from "../common/TonEventType";

export type EmulateMessageToWalletType = {
  boc: Cell | string;
  params?: {
    address: Address | string;
    balance?: number | BigInt;
  }[];
};

export type SendMessageToBlockchainParamType = {
  boc: Cell | string;
  batch?: readonly [
    string?,
    string?,
    string?,
    string?,
    string?,
    string?,
    string?,
    string?,
    string?,
    string?
  ];
};

export type GetTonAccountsParamsType = {
  address: Address;
};

export type GetTonEventsParamsType = {
  address: string;
  limit?: number;
  beforeLt?: number;
  jettonId?: string;
};
export type GetTonTransactionsErrorType = {
  code?: number;
  error?: string;
};

export type TonAccount = {
  address: string;
  is_scam: boolean;
  is_wallet: boolean;
  name?: string;
};

export type JettonDataType = {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  image: string;
  verification: string;
};

export type TonTransfer = {
  sender: TonAccount;
  recipient: TonAccount;
  amount: number | string;
  comment: string;
  senders_wallet?: string;
  recipients_wallet?: string;
  jetton?: JettonDataType;
  simple_preview: {
    name: string;
    description: string;
    value: string;
  };
  nft: string | undefined;
  executor?: TonAccount;
  contract?: TonAccount;
  ton_attached?: string | number | string;
};

export type TonSimplePreview = {
  name: string;
  description: string;
  value: string;
  value_image?: string;
  accounts: TonAccount[];
};

export type DetailNFTByAddressUsingAPIType = {
  address: string;
};

export type TonEventsAction = {
  type: TonEventType;
  status: "ok" | "failed";
  TonTransfer?: TonTransfer;
  JettonTransfer?: TonTransfer;
  NftItemTransfer?: TonTransfer;
  JettonBurn?: TonTransfer;
  JettonMint?: TonTransfer;
  simple_preview: TonSimplePreview;
  base_transactions: string[];
  SmartContractExec?: TonTransfer;
};

export type TonEvent = {
  event_id: string;
  account: TonAccount;
  timestamp: number;
  actions: TonEventsAction[];
  is_scam: boolean;
  lt: number;
  in_progress: boolean;
  extra: number;
};

export type TonEventsDataType = {
  events: TonEvent[];
  next_from: number;
};

export type JettonBalanceDataType = {
  balances: BalanceItem[];
};

export type BalanceItem = {
  balance: string;
  price: JettonBalancePriceType;
  wallet_address: JettonBalanceWalletAddress;
  jetton: RiskType;
};

export type JettonBalancePriceType = {
  prices: {
    TON: number;
  };
  diff_24h: {
    TON: string;
  };
  diff_7d: {
    TON: string;
  };
  diff_30d: {
    TON: string;
  };
};

export type JettonBalanceWalletAddress = {
  address: string;
  is_scam: boolean;
  is_wallet: boolean;
};

export type RiskType = {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  image: string;
  verification: string;
};

export interface EmulateJettonDataType extends JettonDataType {
  custom_payload_api_uri: string;
}

export interface WalletAddressType extends TonAccount {
  icon: string;
}

export type RiskJettonType = {
  quantity: string;
  wallet_address: WalletAddressType;
};

export type CollectionType = {
  address: string;
  name: string;
  description: string;
};

export type EmulatePriceType = {
  value: string;
  token_name: string;
};

export type EmulateSaleType = {
  address: string;
  market: WalletAddressType;
  owner: WalletAddressType;
  price: EmulatePriceType;
};

export type EmulatePreviewsType = {
  resolution: string;
  url: string;
};

export type NFTsType = {
  address: string;
  index: number;
  owner: WalletAddressType;
  collection: CollectionType;
  verified: boolean;
  metadata: any;
  sale: EmulateSaleType;
  previews: EmulatePreviewsType[];
  dns: string;
  include_cnft: boolean;
  trust: string;
};

export type TonTransaction = {
  hash: string;
  lt: number;
  account: WalletAddressType;
};

export type TonTraceType = {
  transaction: {
    hash: string;
    lt: number;
    account: WalletAddressType;
    success: boolean;
    utime: number;
    orig_status: string;
    end_status: string;
    total_fees: number;
    end_balance: number;
    transaction_type: string;
    state_update_old: string;
    state_update_new: string;
    in_msg: Message;
    out_msgs: Message[];
    block: string;
    prev_trans_hash: string;
    prev_trans_lt: number;
    compute_phase: {
      skipped: boolean;
      skip_reason: string;
      success: boolean;
      gas_fees: number;
      gas_used: number;
      vm_steps: number;
      exit_code: number;
      exit_code_description: string;
    };
    storage_phase: {
      fees_collected: number;
      fees_due: number;
      status_change: string;
    };
    credit_phase: {
      fees_collected: number;
      credit: number;
    };
    action_phase: {
      success: boolean;
      result_code: number;
      total_actions: number;
      skipped_actions: number;
      fwd_fees: number;
      total_fees: number;
      result_code_description: string;
    };
    bounce_phase: string;
    aborted: boolean;
    destroyed: boolean;
    raw: string;
  };
  interfaces: string[];
  children: string[];
  emulated: boolean;
};

export type Message = {
  msg_type: string;
  created_lt: number;
  ihr_disabled: boolean;
  bounce: boolean;
  bounced: boolean;
  value: number;
  fwd_fee: number;
  ihr_fee: number;
  destination: Entity;
  source: Entity;
  import_fee: number;
  created_at: number;
  op_code: string;
  init: {
    boc: string;
    interfaces: string[];
  };
  hash: string;
  raw_body: string;
  decoded_op_name: string;
  decoded_body: string;
};

export type Entity = {
  address: string;
  name: string;
  is_scam: boolean;
  icon: string;
  is_wallet: boolean;
};

export type TonRiskType = {
  transfer_all_remaining_balance: boolean;
  ton: number;
  wallet_address: RiskJettonType[];
  jetton: EmulateJettonDataType;
  nfts: NFTsType[];
};

export type EmulateMessageToWalletResType = {
  trace: TonTraceType;
  risk: TonRiskType;
  event: TonEvent;
};

export type NftItemResponse = {
  data: NftTonNewItem;
  error: null | string;
  isSuccess: boolean;
};

export type EventDetailProps = {
  eventId: string;
};
export type ItemsOwnerResponse = {
  data: NFTItemsOwner;
  error: null | string;
  isSuccess: boolean;
};

export interface NFTItemsOwner {
  nft_items: NftItem[];
}

export interface NftItem {
  address: string;
  index: number;
  owner: Owner;
  collection?: Collection;
  verified: boolean;
  metadata: Metadata;
  previews: Preview[];
  approvedBy?: any[];
  trust: TrustType;
  active?: boolean;
}

interface Preview {
  resolution: string;
  url: string;
}

interface Metadata {
  description: string;
  name: string;
  image: string;
  marketplace?: string;
  external_url?: string;
}

interface Collection {
  address: string;
  name: string;
  description: string;
}

interface Owner {
  address: string;
  is_scam?: boolean;
  is_wallet?: boolean;
}

export interface AccountTonAddress {
  /**
   * @format address
   * @example "0:10C1073837B93FDAAD594284CE8B8EFF7B9CF25427440EB2FC682762E1471365"
   */
  address: string;
  /**
   * Display name. Data collected from different sources like moderation lists, dns, collections names and over.
   * @example "Ton foundation"
   */
  name?: string;
  /**
   * Is this account was marked as part of scammers activity
   * @example true
   */
  isScam?: boolean;
  /** @example "https://ton.org/logo.png" */
  icon?: string;
  /** @example true */
  isWallet?: boolean;
}

export interface NftTonNewItem {
  address: string;

  index: number;
  owner?: AccountTonAddress;
  collection?: {
    address: string;
    /** @example "TON Diamonds" */
    name: string;
    /** @example "Best collection in TON network" */
    description: string;
  };
  /**
   * Collection master contract confirmed that this item is part of collection
   * @example true
   */
  verified: boolean;
  /** @example {} */
  metadata: Record<string, any>;
  sale?: Sale;
  previews?: ImagePreview[];
  /** @example "crypto.ton" */
  dns?: string;
  /**
   * please use trust field
   * @deprecated
   */
  approvedBy?: NftApprovedBy;
  /** @example false */
  includeCnft?: boolean;
  trust: TrustType;
  active?: boolean;
}

export interface Account {
  /**
   * @format address
   * @example "0:da6b1b6663a0e4d18cc8574ccd9db5296e367dd9324706f3bbd9eb1cd2caf0bf"
   */
  address: Address;
  /**
   * @format bigint
   * @example 123456789
   */
  balance: bigint;
  /**
   * {'USD': 1, 'IDR': 1000}
   * @example {}
   */
  currencies_balance?: Record<string, any>;
  /**
   * unix timestamp
   * @format int64
   * @example 1720860269
   */
  last_activity: number;
  status: AccountStatus;
  interfaces?: string[];
  /** @example "Ton foundation" */
  name?: string;
  /** @example true */
  is_scam?: boolean;
  /** @example "https://ton.org/logo.png" */
  icon?: string;
  /** @example true */
  memo_required?: boolean;
  /** @example ["get_item_data"] */
  get_methods: string[];
  is_suspended?: boolean;
  is_wallet: boolean;
}

export interface TonAccountsType extends Account {}

export type GetRateTypeParams = {
  address: string;
};

export type GetRateTypeResponse = {
  data: {
    rates: Record<string, GetRateRata>;
  };
  error: null | string;
  isSuccess: boolean;
};
export type GetRateRata = {
  prices: {
    TON: number;
  };
};

export interface EventDetail {
  event_id: string;
  timestamp: number;
  actions: ActionDetail[];
  value_flow: Valueflow[];
  is_scam: boolean;
  lt: number;
  in_progress: boolean;
}

interface Valueflow {
  account: Sender;
  ton: number;
  fees: number;
  jettons: Jetton2[];
}

interface Jetton2 {
  account: Sender;
  jetton: Jetton;
  qty: string;
}

interface ActionDetail {
  type: string;
  status: string;
  TonTransfer: TonTransferDetail;
  ExtraCurrencyTransfer: ExtraCurrencyTransfer;
  ContractDeploy: ContractDeploy;
  JettonTransfer: JettonTransfer;
  JettonBurn: JettonBurn;
  JettonMint: JettonMint;
  NftItemTransfer: NftItemTransfer;
  Subscribe: Subscribe;
  UnSubscribe: UnSubscribe;
  AuctionBid: AuctionBid;
  NftPurchase: NftPurchase;
  DepositStake: DepositStake;
  WithdrawStake: DepositStake;
  WithdrawStakeRequest: DepositStake;
  ElectionsDepositStake: ElectionsDepositStake;
  ElectionsRecoverStake: ElectionsDepositStake;
  JettonSwap: JettonSwap;
  SmartContractExec: SmartContractExec;
  DomainRenew: DomainRenew;
  simple_preview: Simplepreview;
  base_transactions: string[];
}

interface Simplepreview {
  name: string;
  description: string;
  action_image: string;
  value: string;
  value_image: string;
  accounts: Sender[];
}

interface DomainRenew {
  domain: string;
  contract_address: string;
  renewer: Sender;
}

interface SmartContractExec {
  executor: Sender;
  contract: Sender;
  ton_attached: number;
  operation: string;
  payload: string;
  refund: Refund;
}

interface JettonSwap {
  dex: string;
  amount_in: string;
  amount_out: string;
  ton_in: number;
  ton_out: number;
  user_wallet: Sender;
  router: Sender;
  jetton_master_in: Jetton;
  jetton_master_out: Jetton;
}

interface ElectionsDepositStake {
  amount: number;
  staker: Sender;
}

interface DepositStake {
  amount: number;
  staker: Sender;
  pool: Sender;
  implementation: string;
}

interface NftPurchase {
  auction_type: string;
  amount: Amount;
  nft: Nft;
  seller: Sender;
  buyer: Sender;
}

interface AuctionBid {
  auction_type: string;
  amount: Amount;
  nft: Nft;
  bidder: Sender;
  auction: Sender;
}

interface Nft {
  address: string;
  index: number;
  owner: Sender;
  collection: Collection;
  verified: boolean;
  metadata: Metadata;
  sale: SaleType;
  previews: Preview[];
  dns: string;
  include_cnft: boolean;
  trust: string;
}

interface Preview {
  resolution: string;
  url: string;
}

export type ActionDetailResponse = {
  data: ActionDetail;
  error: null | string;
  isSuccess: boolean;
};

interface SaleType {
  address: string;
  market: Sender;
  owner: Sender;
  price: Amount;
}

interface Metadata {}

interface Collection {
  address: string;
  name: string;
  description: string;
}

interface Amount {
  value: string;
  token_name: string;
}

interface UnSubscribe {
  subscriber: Sender;
  subscription: string;
  beneficiary: Sender;
}

interface Subscribe {
  subscriber: Sender;
  subscription: string;
  beneficiary: Sender;
  amount: number;
  initial: boolean;
}

interface NftItemTransfer {
  sender: Sender;
  recipient: Sender;
  nft: string;
  comment: string;
  encrypted_comment: Encryptedcomment;
  payload: string;
  refund: Refund;
}

interface JettonMint {
  recipient: Sender;
  recipients_wallet: string;
  amount: string;
  jetton: Jetton;
}

interface JettonBurn {
  sender: Sender;
  senders_wallet: string;
  amount: string;
  jetton: Jetton;
}

interface JettonTransfer {
  sender: Sender;
  recipient: Sender;
  senders_wallet: string;
  recipients_wallet: string;
  amount: string;
  comment: string;
  encrypted_comment: Encryptedcomment;
  refund: Refund;
  jetton: Jetton;
}

interface Jetton {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  image: string;
  verification: string;
  custom_payload_api_uri: string;
  score: number;
}

interface ContractDeploy {
  address: string;
  interfaces: string[];
}

interface ExtraCurrencyTransfer {
  sender: Sender;
  recipient: Sender;
  amount: string;
  comment: string;
  encrypted_comment: Encryptedcomment;
  currency: Currency;
}

interface Currency {
  id: number;
  symbol: string;
  decimals: number;
  image: string;
}

interface TonTransferDetail {
  sender: Sender;
  recipient: Sender;
  amount: number;
  comment: string;
  encrypted_comment: Encryptedcomment;
  refund: Refund;
}

interface Refund {
  type: string;
  origin: string;
}

interface Encryptedcomment {
  encryption_type: string;
  cipher_text: string;
}

interface Sender {
  address: string;
  name: string;
  is_scam: boolean;
  icon: string;
  is_wallet: boolean;
}

export type DetailJettonByAddressData = {
  mintable: boolean;
  total_supply: string;
  admin: Admin;
  metadata: MetadataTonToken;
  preview: string;
  verification: string;
  holders_count: number;
  score: number;
};

interface Admin {
  address: string;
  name: string;
  is_scam: boolean;
  icon: string;
  is_wallet: boolean;
}

export interface MetadataTonToken {
  address: string;
  name: string;
  symbol: string;
  decimals: string;
  image: string;
  description: string;
  social: string[][];
  websites: string[][];
  catalogs: string[][];
  custom_payload_api_uri: string;
}

export interface IApiResponse<T> extends ApiResponse {
  data?: T;
}

interface ApiResponse {
  isSuccess: boolean;
  status?: number;
}

export type DetailJettonByAddressResponse = {
  data: DetailJettonByAddressData;
  error: null | string;
  isSuccess: boolean;
};

export enum TransactionNFTEmulateStatusType {
  Completed = "ok",
  Failed = "failed",
}
