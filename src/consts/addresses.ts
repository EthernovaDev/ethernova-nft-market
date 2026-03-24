// Contract addresses - update these after deploying contracts to Ethernova
// Leave empty string until contracts are deployed
const _MARKETPLACE = "0xb21c06d94435839950f30649b17d2333bcb25c59";
const _NFT_COLLECTION = "0x8f6671a37578e77e79e15959531da97baf42419f";

export const MARKETPLACE_ADDRESS = _MARKETPLACE as `0x${string}`;
export const NFT_COLLECTION_ADDRESS = _NFT_COLLECTION as `0x${string}`;

export const hasMarketplace = _MARKETPLACE.length > 0;
export const hasNFTCollection = _NFT_COLLECTION.length > 0;
export const hasContracts = hasMarketplace && hasNFTCollection;
