"use client";

import { use } from "react";
import { useActiveAccount, useReadContract, MediaRenderer } from "thirdweb/react";
import { getContract, prepareContractCall, sendTransaction } from "thirdweb";
import { getNFT } from "thirdweb/extensions/erc721";
import { getAllValidListings, buyFromListing } from "thirdweb/extensions/marketplace";
import { client } from "@/lib/client";
import { ethernova } from "@/consts/chain";
import { MARKETPLACE_ADDRESS } from "@/consts/addresses";
import toast from "react-hot-toast";

export default function NFTDetailPage({
  params,
}: {
  params: Promise<{ collection: string; tokenId: string }>;
}) {
  const { collection, tokenId } = use(params);
  const account = useActiveAccount();
  const hasMarketplace = MARKETPLACE_ADDRESS !== "";

  const nftContract = getContract({
    client,
    chain: ethernova,
    address: collection,
  });

  const marketplaceContract = hasMarketplace
    ? getContract({
        client,
        chain: ethernova,
        address: MARKETPLACE_ADDRESS,
      })
    : null;

  const { data: nft, isLoading: loadingNft } = useReadContract(getNFT, {
    contract: nftContract,
    tokenId: BigInt(tokenId),
  });

  const { data: listings } = useReadContract(getAllValidListings, {
    contract: marketplaceContract!,
    queryOptions: { enabled: !!marketplaceContract },
  });

  const listing = listings?.find(
    (l) =>
      l.assetContractAddress.toLowerCase() === collection.toLowerCase() &&
      l.tokenId.toString() === tokenId
  );

  async function handleBuy() {
    if (!account || !listing || !marketplaceContract) return;

    try {
      const tx = buyFromListing({
        contract: marketplaceContract,
        listingId: listing.id,
        quantity: 1n,
        recipient: account.address,
      });

      await sendTransaction({ transaction: tx, account });
      toast.success("NFT purchased successfully!");
    } catch (error: unknown) {
      console.error(error);
      toast.error("Failed to purchase NFT");
    }
  }

  if (loadingNft) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-square bg-gray-800 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-800 rounded w-3/4" />
            <div className="h-4 bg-gray-800 rounded w-1/2" />
            <div className="h-32 bg-gray-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* NFT Image */}
        <div className="aspect-square rounded-2xl overflow-hidden bg-gray-900 border border-gray-800">
          <MediaRenderer
            client={client}
            src={nft?.metadata?.image ?? ""}
            className="w-full h-full object-cover"
          />
        </div>

        {/* NFT Details */}
        <div>
          <p className="text-purple-400 text-sm font-medium mb-2">
            {collection.slice(0, 6)}...{collection.slice(-4)}
          </p>
          <h1 className="text-3xl font-bold text-white mb-4">
            {nft?.metadata?.name ?? `NFT #${tokenId}`}
          </h1>

          {nft?.metadata?.description && (
            <p className="text-gray-400 mb-6">{nft.metadata.description}</p>
          )}

          {/* Owner */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4 mb-6">
            <p className="text-gray-500 text-sm">Owner</p>
            <a
              href={`https://explorer.ethnova.net/address/${nft?.owner}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-purple-400 transition-colors"
            >
              {nft?.owner
                ? `${nft.owner.slice(0, 8)}...${nft.owner.slice(-6)}`
                : "Unknown"}
            </a>
          </div>

          {/* Listing / Buy */}
          {listing ? (
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400">Current Price</span>
                <span className="text-2xl font-bold text-cyan-400">
                  {listing.currencyValuePerToken?.displayValue} NOVA
                </span>
              </div>
              <p className="text-gray-500 text-sm mb-4">
                Seller: {listing.creatorAddress.slice(0, 6)}...
                {listing.creatorAddress.slice(-4)}
              </p>
              {account ? (
                <button
                  onClick={handleBuy}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity"
                >
                  Buy Now
                </button>
              ) : (
                <p className="text-center text-gray-500 text-sm">
                  Connect your wallet to buy this NFT
                </p>
              )}
            </div>
          ) : (
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6 text-center">
              <p className="text-gray-500">This NFT is not currently listed for sale.</p>
            </div>
          )}

          {/* Attributes */}
          {nft?.metadata?.attributes &&
            Array.isArray(nft.metadata.attributes) &&
            nft.metadata.attributes.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-3">Attributes</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(nft.metadata.attributes as Array<{ trait_type?: string; value?: string }>).map(
                    (attr, i) => (
                      <div
                        key={i}
                        className="bg-gray-900/50 rounded-lg border border-gray-800 p-3 text-center"
                      >
                        <p className="text-purple-400 text-xs uppercase">
                          {attr.trait_type}
                        </p>
                        <p className="text-white text-sm font-medium mt-1">
                          {attr.value}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
