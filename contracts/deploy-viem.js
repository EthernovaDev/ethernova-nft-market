import { createWalletClient, createPublicClient, http, defineChain, encodeAbiParameters } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { readFileSync } from "fs";

const ethernova = defineChain({
  id: 121525,
  name: "Ethernova",
  nativeCurrency: { name: "Nova", symbol: "NOVA", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.ethnova.net"] } },
});

const PRIVATE_KEY = "0xa6e4d9175c82237affb801650a0b262e6a754c0f946002a2e460db89cfe6520f";
const account = privateKeyToAccount(PRIVATE_KEY);

const publicClient = createPublicClient({
  chain: ethernova,
  transport: http(),
});

const walletClient = createWalletClient({
  account,
  chain: ethernova,
  transport: http(),
});

async function deployContract(name, binFile, abiFile, constructorArgs) {
  console.log(`\nDeploying ${name}...`);

  const bytecode = "0x" + readFileSync(binFile, "utf8").trim();
  const abi = JSON.parse(readFileSync(abiFile, "utf8"));

  const constructor = abi.find(item => item.type === "constructor");
  let data = bytecode;

  if (constructor && constructorArgs) {
    const encoded = encodeAbiParameters(constructor.inputs, constructorArgs);
    data = bytecode + encoded.slice(2);
  }

  // Get gas price and nonce
  const gasPrice = await publicClient.getGasPrice();
  const nonce = await publicClient.getTransactionCount({ address: account.address });

  console.log(`  Gas price: ${gasPrice}`);
  console.log(`  Nonce: ${nonce}`);

  const hash = await walletClient.sendTransaction({
    data: data,
    gas: 5000000n,
    gasPrice: gasPrice,
    nonce: nonce,
  });

  console.log(`  Tx hash: ${hash}`);
  console.log(`  Waiting for confirmation...`);

  const receipt = await publicClient.waitForTransactionReceipt({ hash, timeout: 600_000 });
  console.log(`  Contract address: ${receipt.contractAddress}`);
  console.log(`  Gas used: ${receipt.gasUsed}`);
  console.log(`  Status: ${receipt.status}`);

  return { address: receipt.contractAddress, nonce };
}

async function main() {
  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`Deployer: ${account.address}`);
  console.log(`Balance: ${Number(balance) / 1e18} NOVA`);

  // Deploy EthernovaNFT(name, symbol, mintPrice)
  const nft = await deployContract(
    "EthernovaNFT",
    "build/contracts_EthernovaNFT_sol_EthernovaNFT.bin",
    "build/contracts_EthernovaNFT_sol_EthernovaNFT.abi",
    ["Ethernova NFT", "ENFT", 0n]
  );

  // Deploy NovaMarketplace(platformFeeBps)
  const marketplace = await deployContract(
    "NovaMarketplace",
    "build/contracts_NovaMarketplace_sol_NovaMarketplace.bin",
    "build/contracts_NovaMarketplace_sol_NovaMarketplace.abi",
    [250n]
  );

  console.log("\n=== DEPLOYMENT COMPLETE ===");
  console.log(`EthernovaNFT:    ${nft.address}`);
  console.log(`NovaMarketplace: ${marketplace.address}`);
  console.log("\n--- Copy to src/consts/addresses.ts ---");
  console.log(`const _MARKETPLACE = "${marketplace.address}";`);
  console.log(`const _NFT_COLLECTION = "${nft.address}";`);
}

main().catch(console.error);
