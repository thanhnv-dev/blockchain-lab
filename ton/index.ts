import { createWallet } from "./src/wallet";

const main = async () => {
  const seedPhrase = "";

  let wallet = await createWallet({
    seedPhrase,
    derivationPath: "m/44'/607'/0'",
    isTestnet: true,
  });

  console.log(wallet.address.toString({}));
};

main().catch(console.error);
