import hre from "hardhat";

async function main() {
  console.log("Deploying to Ethernova (Chain ID: 121525)...\n");

  // Deploy NFT Collection
  const EthernovaNFT = await hre.ethers.getContractFactory("EthernovaNFT");
  const nft = await EthernovaNFT.deploy(
    "Ethernova NFT",         // name
    "ENFT",                  // symbol
    hre.ethers.parseEther("0") // free mint to start
  );
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log(`EthernovaNFT deployed to: ${nftAddress}`);

  // Deploy Marketplace
  const NovaMarketplace = await hre.ethers.getContractFactory("NovaMarketplace");
  const marketplace = await NovaMarketplace.deploy(
    250 // 2.5% platform fee
  );
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log(`NovaMarketplace deployed to: ${marketplaceAddress}`);

  console.log("\n--- Update these in src/consts/addresses.ts ---");
  console.log(`export const MARKETPLACE_ADDRESS = "${marketplaceAddress}" as \`0x\${string}\`;`);
  console.log(`export const NFT_COLLECTION_ADDRESS = "${nftAddress}" as \`0x\${string}\`;`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
