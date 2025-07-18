import { TonApiClient } from "@ton-api/client";
import { ContractAdapter } from "@ton-api/ton-adapter";
import { mnemonicNew, mnemonicToPrivateKey } from "@ton/crypto";
import { OpenedContract, WalletContractV4, WalletContractV5R1 } from "@ton/ton";
import EnvConfig from "../common/EnvConfig";
import TonWalletVersion from "../common/TonWalletVersion";
import { TonNetwork } from "../common/TonNetwork";

// MARK: Ton Wallet
class TonWallet {
  client = new TonApiClient({
    baseUrl: EnvConfig.TON_API_BASE_URL,
    apiKey: EnvConfig.TON_API_TOKEN,
  });
  private readonly _adapter = new ContractAdapter(this.client);

  // MARK: |- Create Wallet
  createWallet = async (
    version: TonWalletVersion,
    publicKey: string
  ): Promise<WalletContractV5R1 | WalletContractV4> => {
    const publicKeyBuffer = Buffer.from(publicKey, "base64");
    const isTestNet = EnvConfig.ENV === "development";
    const isV5 = version === TonWalletVersion.V5;

    const walletConfig = {
      workchain: 0,
      publicKey: publicKeyBuffer,
    };
    let wallet;

    if (isV5) {
      wallet = WalletContractV5R1.create({
        ...walletConfig,
        walletId: {
          networkGlobalId: isTestNet ? TonNetwork.TESTNET : TonNetwork.MAINNET,
        },
      });
    } else {
      wallet = WalletContractV4.create(walletConfig);
    }

    return wallet;
  };

  // MARK: |- Create Contract
  createContract = async (
    version: TonWalletVersion,
    publicKey: string
  ): Promise<OpenedContract<WalletContractV5R1 | WalletContractV4>> => {
    const wallet = await this.createWallet(version, publicKey);
    return this.createContractFromWallet(wallet);
  };

  // MARK: |- Create Contract
  createContractFromWallet = async (
    wallet: WalletContractV5R1 | WalletContractV4
  ): Promise<OpenedContract<WalletContractV5R1 | WalletContractV4>> => {
    return this._adapter.open(wallet);
  };

  async createDummyWallet() {
    const dummyKey = await mnemonicToPrivateKey(await mnemonicNew());
    const wallet = await this.createWallet(
      TonWalletVersion.V5,
      dummyKey.publicKey.toString("base64")
    );
    return {
      key: dummyKey,
      wallet,
    };
  }
  // MARK: |- Create Dummy Secret Key
  createDummySecretKey = async () => {
    const dummyWallet = await mnemonicToPrivateKey(await mnemonicNew());
    const dummySecretKey = dummyWallet.secretKey;
    const dummyPublicKey = dummyWallet.publicKey;
    return { dummySecretKey, dummyPublicKey };
  };
}

export default TonWallet;
