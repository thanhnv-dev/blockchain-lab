import { WalletContractV5R1 } from "@ton/ton";
import { keyPairFromSeed } from "@ton/crypto";
import * as bip39 from "bip39";
import { derivePath } from "ed25519-hd-key";

export const createWallet = async ({
  seedPhrase,
  derivationPath = "m/44'/607'/0'",
  isTestnet = true,
}: {
  seedPhrase: string;
  derivationPath?: string;
  isTestnet?: boolean;
}) => {
  const seed = await bip39.mnemonicToSeed(seedPhrase);
  const derivedSeed = derivePath(derivationPath, seed.toString("hex")).key;
  let keyPair = keyPairFromSeed(derivedSeed);

  let workchain = 0;
  let networkGlobalId = isTestnet ? -3 : -239;
  let wallet = WalletContractV5R1.create({
    workchain,
    publicKey: keyPair.publicKey,
    walletId: {
      networkGlobalId: networkGlobalId,
    },
  });

  return wallet;
};
