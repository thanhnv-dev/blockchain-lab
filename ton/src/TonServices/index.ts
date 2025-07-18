import { Seqno } from "@ton-api/client";
import { Address } from "@ton/core";
import EnvConfig from "../common/EnvConfig";
import { IApiResponse } from "./type";
import { sendGet, sendPost } from "../network/requests";
import { SendGetParamsType } from "../network/requests/sendGet";
import { SendPostParamsType } from "../network/requests/sendPost";
import {
  DetailJettonByAddressData,
  DetailJettonByAddressResponse,
} from "./type";
import {
  DetailNFTByAddressUsingAPIType,
  EmulateMessageToWalletResType,
  EmulateMessageToWalletType,
  EventDetail,
  EventDetailProps,
  GetRateTypeParams,
  GetRateTypeResponse,
  GetTonAccountsParamsType,
  GetTonEventsParamsType,
  GetTonTransactionsErrorType,
  ItemsOwnerResponse,
  JettonBalanceDataType,
  NftItem,
  NftItemResponse,
  NFTItemsOwner,
  SendMessageToBlockchainParamType,
  TonAccountsType,
  TonEventsDataType,
} from "./type";

// MARK: Ton Services
class TonServices {
  private readonly _handleTonError = <T>(
    result: IApiResponse<GetTonTransactionsErrorType | T>
  ) => {
    if (!result.isSuccess) {
      const error = JSON.stringify(result?.data);
      console.error("====================================");
      console.error("Ton API Error:", error);
      console.error("====================================");
    }
  };

  private readonly _tonGetApi = async <T>(params: SendGetParamsType) => {
    const result = await sendGet<T | GetTonTransactionsErrorType>({
      ...params,
      customBaseUrl: EnvConfig.TON_API_BASE_URL,
      customBearerToken: EnvConfig.TON_API_TOKEN,
    });
    this._handleTonError(result);

    return result;
  };
  private readonly _tonPostApi = async <T>(params: SendPostParamsType) => {
    const result = await sendPost<T | GetTonTransactionsErrorType>({
      ...params,
      customBaseUrl: EnvConfig.TON_API_BASE_URL,
      customBearerToken: EnvConfig.TON_API_TOKEN,
    });
    this._handleTonError(result);

    return result;
  };

  // MARK: |- Get Account
  getAccounts = async ({ address }: GetTonAccountsParamsType) => {
    const getAccountsRes = await this._tonGetApi<TonAccountsType>({
      // endPoint: `/v2/accounts/${Address.parse(
      //     '0:1b84c5a8b28c5ea174c98bd4e5c34f4c1233d5bdd25ef63d270ba2baae8d1dd6',
      // ).toString()}`,
      endPoint: `/v2/accounts/${address.toString()}`,
    });

    return getAccountsRes;
  };

  getDetailEventsUsingAPI = async ({ eventId }: EventDetailProps) => {
    const getDetailEventsUsingAPI = await this._tonGetApi<NftItemResponse>({
      endPoint: `/v2/events/${eventId}`,
    });
    return getDetailEventsUsingAPI.data as EventDetail;
  };

  // MARK: |- Get account seqno
  getAccountSeqno = async ({ address }: GetTonAccountsParamsType) => {
    const getAccountSeqnoRes = await this._tonGetApi<Seqno>({
      endPoint: `/v2/wallet/${address}/seqno`,
    });
    return getAccountSeqnoRes;
  };

  // MARK: |- Get Events
  getEvents = async ({ address, limit, beforeLt }: GetTonEventsParamsType) => {
    const getEventsRes = await this._tonGetApi<TonEventsDataType>({
      endPoint: `/v2/accounts/${address}/events?limit=${limit ?? 100}`,
      params: {
        before_lt: beforeLt,
      },
    });
    return getEventsRes?.data;
  };

  // MARK: |- Get Jetton Events
  getJettonEvents = async ({
    address,
    limit,
    beforeLt,
    jettonId,
  }: Omit<GetTonEventsParamsType, "jettonId"> & {
    jettonId: string;
  }) => {
    const getEventsRes = await this._tonGetApi<TonEventsDataType>({
      endPoint: `/v2/accounts/${address}/jettons/${jettonId}/history?limit=${
        limit ?? 100
      }`,
      params: {
        before_lt: beforeLt,
      },
    });
    return getEventsRes?.data;
  };

  // MARK: |- Get jetton balance
  getJettons = async ({ address }: GetTonEventsParamsType) => {
    const getJettonRes = await this._tonGetApi<JettonBalanceDataType>({
      // endPoint: `/v2/accounts/0:1b84c5a8b28c5ea174c98bd4e5c34f4c1233d5bdd25ef63d270ba2baae8d1dd6/jettons?currencies=ton,usd`,
      endPoint: `/v2/accounts/${address}/jettons?currencies=ton,usd`,
    });
    return getJettonRes?.data;
  };

  // MARK: |- Get emulate message to wallet
  emulateMessageToWallet = async (body: EmulateMessageToWalletType) => {
    return await this._tonPostApi<EmulateMessageToWalletResType>({
      endPoint: `/v2/wallet/emulate`,
      body,
    });
  };

  // MARK: |- Send message to blockchain
  sendMessageToBlockchain = async (body: SendMessageToBlockchainParamType) => {
    return await this._tonPostApi<string>({
      endPoint: `/v2/blockchain/message`,
      body,
    });
  };
  getNFTItemsInCollectionByOwner = async (
    accountId_Address: string,
    query?: {
      collection?: Address;
      limit?: number;
      offset?: number;
      indirect_ownership?: boolean;
    }
  ): Promise<NftItem[]> => {
    try {
      const nftItemsInCollectionByOwner =
        await this._tonGetApi<ItemsOwnerResponse>({
          endPoint: `/v2/accounts/${accountId_Address}/nfts`,
          params: query,
        });

      if (
        nftItemsInCollectionByOwner.isSuccess &&
        nftItemsInCollectionByOwner.data &&
        "nft_items" in nftItemsInCollectionByOwner.data &&
        Array.isArray(
          (nftItemsInCollectionByOwner.data as NFTItemsOwner).nft_items
        )
      ) {
        return (nftItemsInCollectionByOwner.data as NFTItemsOwner).nft_items;
      }

      if ("error" in nftItemsInCollectionByOwner) {
        console.error(
          "getNFTItemsInCollectionByOwner error:",
          nftItemsInCollectionByOwner.error
        );
      }
      return [];
    } catch (error) {
      console.error(
        "Unexpected error in getNFTItemsInCollectionByOwner:",
        error
      );
      return [];
    }
  };

  getDetailNFTByAddressUsingAPI = async ({
    address,
  }: DetailNFTByAddressUsingAPIType) => {
    const getDetailNFTByAddressUsingAPI =
      await this._tonGetApi<NftItemResponse>({
        endPoint: `/v2/nfts/${address}`,
      });
    return getDetailNFTByAddressUsingAPI as NftItemResponse;
  };
  getDetailJettonByAddress = async ({
    address,
  }: DetailNFTByAddressUsingAPIType): Promise<DetailJettonByAddressData | null> => {
    try {
      const response = await this._tonGetApi<DetailJettonByAddressResponse>({
        endPoint: `/v2/jettons/${address}`,
      });

      if (!response || !response.data) {
        console.warn("Invalid response or missing metadata:", response);
        return null;
      }
      const resultJettonData = response.data as DetailJettonByAddressData;
      return resultJettonData;
    } catch (error) {
      console.error("Error fetching jetton details:", error);
      return null;
    }
  };
  getRate = async ({ address }: GetRateTypeParams) => {
    const getDetailNFTByAddressUsingAPI =
      await this._tonGetApi<GetRateTypeResponse>({
        endPoint: `/v2/rates?tokens=${address}&currencies=ton`,
      });
    return getDetailNFTByAddressUsingAPI as GetRateTypeResponse;
  };
}

export default TonServices;
