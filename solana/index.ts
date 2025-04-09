import { Connection, clusterApiUrl } from "@solana/web3.js";
import { createKeypairFromSeed } from "./src/utils";
import { createTokenAndMint } from "./src/createTokenAndMint";
import { updateMetaData } from "./src/updateMetaData";

const main = async () => {
  // Connect to Solana network
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // Create keypair from seed phrase
  const seedPhrase =
    "night blur supply camp category rigid kit click robust flock river father";
  const payer = await createKeypairFromSeed(seedPhrase);
  console.log("✅ Payer:", payer.publicKey.toBase58());

  // Create new token
  const mint = await createTokenAndMint(connection, payer);

  // Mint token to an account
  const tokenAccount = await updateMetaData(payer, mint.toBase58());
};

main().catch(console.error);
