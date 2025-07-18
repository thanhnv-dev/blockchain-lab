import { WalletContractV5R1 } from "@ton/ton";
import { keyPairFromSeed } from "@ton/crypto";
import * as bip39 from "bip39";
import { derivePath } from "ed25519-hd-key";

const main = async () => {
  const seedPhrase = "";
  const seed = await bip39.mnemonicToSeed(seedPhrase);
  const path = "m/44'/607'/0'";
  const derivedSeed = derivePath(path, seed.toString("hex")).key;
  let keyPair = keyPairFromSeed(derivedSeed);

  let workchain = 0;
  let wallet = WalletContractV5R1.create({
    workchain,
    publicKey: keyPair.publicKey,
    walletId: {
      networkGlobalId: -3,
    },
  });

  console.log(wallet.address.toString({}));
};

main().catch(console.error);
