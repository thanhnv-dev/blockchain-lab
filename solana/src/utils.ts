import { Keypair } from "@solana/web3.js";
import * as bip39 from "bip39";
import { derivePath } from "ed25519-hd-key";

export const createKeypairFromSeed = async (seedPhrase: string) => {
  const seed = await bip39.mnemonicToSeed(seedPhrase);
  const path = "m/44'/501'/0'";
  const derivedSeed = derivePath(path, seed.toString("hex")).key;
  return Keypair.fromSeed(derivedSeed);
};
