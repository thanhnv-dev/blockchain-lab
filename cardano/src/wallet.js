import * as CardanoWasm from "@emurgo/cardano-serialization-lib-nodejs";
// import * as bip39 from "bip39";

// const getRandomPrivAndPubKeys = () => {
//   const privateKey = CardanoWasm.PrivateKey.generate_ed25519();
//   const publicKey = privateKey.to_public();

//   return {
//     privateKey,
//     publicKey,
//   };
// };

// export const generateAddressFromMnemonic = (mnemonic, isMainnet = true) => {
//   const entropy = bip39.mnemonicToEntropy(mnemonic);
//   const entropyBytes = Buffer.from(entropy, "hex");

//   const rootPrivateKey = CardanoWasm.Bip32PrivateKey.from_bip39_entropy(
//     entropyBytes,
//     Buffer.from("") // passphrase (empty string for no passphrase)
//   );

//   // Path: m/1852'/1815'/0'/0/0 (Cardano CIP-1852 derivation path)
//   const accountPrivateKey = rootPrivateKey
//     .derive(harden(1852))
//     .derive(harden(1815))
//     .derive(harden(0))
//     .derive(0)
//     .derive(0);

//   // Get private key and public key for payment
//   const paymentPrivateKey = accountPrivateKey.to_raw_key();
//   const paymentPublicKey = paymentPrivateKey.to_public();

//   // Create stake private key and public key
//   // Path: m/1852'/1815'/0'/2/0 (stake key derivation for CIP-1852)
//   const stakePrivateKey = rootPrivateKey
//     .derive(harden(1852))
//     .derive(harden(1815))
//     .derive(harden(0))
//     .derive(2)
//     .derive(0)
//     .to_raw_key();

//   const stakePublicKey = stakePrivateKey.to_public();

//   // Create address with correct network ID
//   const networkId = isMainnet ? 1 : 0; // 1 for mainnet, 0 for testnet
//   const address = CardanoWasm.BaseAddress.new(
//     networkId,
//     CardanoWasm.Credential.from_keyhash(paymentPublicKey.hash()),
//     CardanoWasm.Credential.from_keyhash(stakePublicKey.hash())
//   ).to_address();

//   return {
//     address: address.to_bech32(),
//     privateKey: Buffer.from(paymentPrivateKey.as_bytes()).toString("hex"),
//     publicKey: "00" + Buffer.from(paymentPublicKey.as_bytes()).toString("hex"),
//     stakePrivateKey: Buffer.from(stakePrivateKey.as_bytes()).toString("hex"),
//     stakePublicKey: Buffer.from(stakePublicKey.as_bytes()).toString("hex"),
//   };
// };

// // Helper function to harden derivation path
// const harden = (num) => {
//   return 0x80000000 + num;
// };

// export const generateAddress = (isMainnet = false) => {
//   const { publicKey } = getRandomPrivAndPubKeys();

//   const networkId = isMainnet ? 1 : 0; // 1 for mainnet, 0 for testnet
//   const address = CardanoWasm.BaseAddress.new(
//     networkId,
//     CardanoWasm.Credential.from_keyhash(publicKey.hash()),
//     CardanoWasm.Credential.from_keyhash(publicKey.hash())
//   ).to_address();

//   return address.to_bech32();
// };

export const generateAddressFromKeys = (publicKeyHex, stakePublicKeyHex, isMainnet = true) => {
  // Remove "00" prefix if present (as used in the existing code)
  const cleanPublicKeyHex = publicKeyHex.startsWith("00") ? publicKeyHex.slice(2) : publicKeyHex;
  
  // Convert hex strings to CardanoWasm PublicKey objects
  const publicKeyBytes = Buffer.from(cleanPublicKeyHex, "hex");
  const stakePublicKeyBytes = Buffer.from(stakePublicKeyHex, "hex");
  
  const publicKey = CardanoWasm.PublicKey.from_bytes(publicKeyBytes);
  const stakePublicKey = CardanoWasm.PublicKey.from_bytes(stakePublicKeyBytes);

  // Create address with correct network ID
  const networkId = isMainnet ? 1 : 0; // 1 for mainnet, 0 for testnet
  const address = CardanoWasm.BaseAddress.new(
    networkId,
    CardanoWasm.Credential.from_keyhash(publicKey.hash()),
    CardanoWasm.Credential.from_keyhash(stakePublicKey.hash())
  ).to_address();

  return {
    address: address.to_bech32(),
    publicKey: "00" + cleanPublicKeyHex,
    stakePublicKey: stakePublicKeyHex,
  };
};
