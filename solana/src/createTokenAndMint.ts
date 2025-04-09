import { Connection, Keypair } from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";

export const createTokenAndMint = async (
  connection: Connection,
  payer: Keypair
) => {
  // 1. Create new token (SPL)
  const mint = await createMint(connection, payer, payer.publicKey, null, 9);
  // 2. Create token account
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey
  );
  console.log("✅ Token Account:", tokenAccount.address.toBase58());

  // 3. Mint token
  await mintTo(
    connection,
    payer,
    mint,
    tokenAccount.address,
    payer,
    7000_000_000
  );

  console.log("✅ Mint Address:", mint.toBase58());
  return mint;
};
