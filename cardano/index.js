import {
  // generateAddressFromMnemonic,
  generateAddressFromKeys,
} from "./src/wallet.js";

const main = async () => {
  const mnemonic =
    "night blur supply camp category rigid kit click robust flock river father";

  // console.log("=== Create address from mnemonic (CIP-1852 Derivation) ===");

  // console.log("\n--- MAINNET ---");
  // const mainnetResult = generateAddressFromMnemonic(mnemonic, true);
  // console.log("Mnemonic:", mnemonic);
  // console.log("Mainnet Address:", mainnetResult.address);
  // console.log("Private Key:", mainnetResult.privateKey);
  // console.log("Public Key:", mainnetResult.publicKey);
  // console.log("Stake Private Key:", mainnetResult.stakePrivateKey);
  // console.log("Stake Public Key:", mainnetResult.stakePublicKey);

  // // Test testnet
  // console.log("\n--- TESTNET ---");
  // const testnetResult = generateAddressFromMnemonic(mnemonic, false);
  // console.log("Testnet Address:", testnetResult.address);
  // console.log("Private Key:", testnetResult.privateKey);
  // console.log("Public Key:", testnetResult.publicKey);
  // console.log("Stake Private Key:", testnetResult.stakePrivateKey);
  // console.log("Stake Public Key:", testnetResult.stakePublicKey);

  const result = generateAddressFromKeys(
    "00d647aa133501ae56560544f5c809366439c39d3c372b9c87e6720c55ea0cdd50",
    "c9b67e3b82201d4f0117b8c3c2487c85def3464ea56d1d7fd98f49910622bf87",
    true // for mainnet
  );
  console.log("Address:", result.address);
};

main();
