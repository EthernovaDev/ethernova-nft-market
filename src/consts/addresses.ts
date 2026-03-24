// Contract addresses - update these after deploying contracts to Ethernova
// Leave empty string until contracts are deployed
const _MARKETPLACE = "";
const _NFT_COLLECTION = "";

export const MARKETPLACE_ADDRESS = _MARKETPLACE as `0x${string}`;
export const NFT_COLLECTION_ADDRESS = _NFT_COLLECTION as `0x${string}`;

export const hasMarketplace = _MARKETPLACE.length > 0;
export const hasNFTCollection = _NFT_COLLECTION.length > 0;
export const hasContracts = hasMarketplace && hasNFTCollection;
