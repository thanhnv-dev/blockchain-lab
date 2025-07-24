import { generateAddressFromMnemonic, generateAddressFromKeys } from "./src/wallet.js";

// Test data from the working example
const testMnemonic = "night blur supply camp category rigid kit click robust flock river father";

// Known expected values from the working output
const expectedMainnetAddress = "addr1q90q2mj2xwwl82ndj9h0jnnlzzx93ffj0rn0e4x6hlwa6wy4ke9atsgflz2zpdr6sf680cq2xzg22gp8y9ymmrsu778q2nu88f";
const expectedTestnetAddress = "addr_test1qp0q2mj2xwwl82ndj9h0jnnlzzx93ffj0rn0e4x6hlwa6wy4ke9atsgflz2zpdr6sf680cq2xzg22gp8y9ymmrsu778qf9p8tk";
const expectedPublicKey = "00d647aa133501ae56560544f5c809366439c39d3c372b9c87e6720c55ea0cdd50";
const expectedStakePublicKey = "c9b67e3b82201d4f0117b8c3c2487c85def3464ea56d1d7fd98f49910622bf87";

console.log("=== Testing generateAddressFromKeys function ===\n");

// Test 1: Generate keys from mnemonic first, then create address from those keys
console.log("Test 1: Generate address from keys derived from mnemonic");
const mnemonicResult = generateAddressFromMnemonic(testMnemonic, true);
const keysResult = generateAddressFromKeys(
  mnemonicResult.publicKey,
  mnemonicResult.stakePublicKey,
  true
);

console.log("Expected Mainnet Address:", expectedMainnetAddress);
console.log("Generated Address:", keysResult.address);
console.log("✅ Addresses match:", keysResult.address === expectedMainnetAddress);

// Test 2: Test with known public key and stake public key values
console.log("\nTest 2: Generate address from known key values");
const knownKeysResult = generateAddressFromKeys(
  expectedPublicKey,
  expectedStakePublicKey,
  true
);

console.log("Expected Mainnet Address:", expectedMainnetAddress);
console.log("Generated Address:", knownKeysResult.address);
console.log("✅ Addresses match:", knownKeysResult.address === expectedMainnetAddress);

// Test 3: Test testnet address generation
console.log("\nTest 3: Generate testnet address from keys");
const testnetKeysResult = generateAddressFromKeys(
  expectedPublicKey,
  expectedStakePublicKey,
  false
);

console.log("Expected Testnet Address:", expectedTestnetAddress);
console.log("Generated Address:", testnetKeysResult.address);
console.log("✅ Addresses match:", testnetKeysResult.address === expectedTestnetAddress);

// Test 4: Test with public key without "00" prefix
console.log("\nTest 4: Generate address from public key without '00' prefix");
const publicKeyWithoutPrefix = expectedPublicKey.slice(2); // Remove "00" prefix
const noPrefixResult = generateAddressFromKeys(
  publicKeyWithoutPrefix,
  expectedStakePublicKey,
  true
);

console.log("Expected Mainnet Address:", expectedMainnetAddress);
console.log("Generated Address:", noPrefixResult.address);
console.log("✅ Addresses match:", noPrefixResult.address === expectedMainnetAddress);

// Test 5: Verify returned values
console.log("\nTest 5: Verify returned object structure");
console.log("Returned public key:", keysResult.publicKey);
console.log("Expected public key:", expectedPublicKey);
console.log("✅ Public keys match:", keysResult.publicKey === expectedPublicKey);

console.log("Returned stake public key:", keysResult.stakePublicKey);
console.log("Expected stake public key:", expectedStakePublicKey);
console.log("✅ Stake public keys match:", keysResult.stakePublicKey === expectedStakePublicKey);

console.log("\n=== All tests completed ==="); 