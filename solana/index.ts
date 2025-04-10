import { Connection, clusterApiUrl } from "@solana/web3.js";
import { createKeypairFromSeed } from "./src/utils";
import { createTokenAndMint } from "./src/createTokenAndMint";
import { updateMetaData } from "./src/updateMetaData";

const main = async () => {
  // Connect to Solana network
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // Create keypair from seed phrase
  const seedPhrase =
    "venture jungle believe gate smile bullet tissue maze story border furnace asthma";
  const payer = await createKeypairFromSeed(seedPhrase);
  console.log("✅ Payer:", payer.publicKey.toBase58());

  // Create new token
//   const mint = await createTokenAndMint(connection, payer);

  // Mint token to an account
  await updateMetaData(payer, "4gCGG7hqVWtWWwCU95cK5DRK6buh5JZjnCUzQptAmCdu", true);
};

main().catch(console.error);
