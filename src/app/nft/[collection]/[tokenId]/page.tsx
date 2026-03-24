"use client";

import { use } from "react";
import Image from "next/image";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatEther } from "viem";
import { MARKETPLACE_ADDRESS, hasMarketplace } from "@/consts/addresses";
import { marketplaceAbi, nftAbi } from "@/consts/abis";
import toast from "react-hot-toast";
import { useNovaPrice } from "@/lib/useNovaPrice";
import { useNFTMetadata } from "@/lib/useNFTMetadata";

type Listing = {
  listingId: bigint;
  seller: `0x${string}`;
  nftContract: `0x${string}`;
  tokenId: bigint;
  price: bigint;
  isActive: boolean;
};

export default function NFTDetailPage({
  params,
}: {
  params: Promise<{ collection: string; tokenId: string }>;
}) {
  const { collection, tokenId } = use(params);
  const { address, isConnected } = useAccount();
  const collectionAddr = collection as `0x${string}`;

  // Get NFT owner
  const { data: owner, isLoading: loadingOwner } = useReadContract({
    address: collectionAddr,
    abi: nftAbi,
    functionName: "ownerOf",
    args: [BigInt(tokenId)],
  });

  // Get NFT metadata URI
  const { data: tokenURI } = useReadContract({
    address: collectionAddr,
    abi: nftAbi,
    functionName: "tokenURI",
    args: [BigInt(tokenId)],
  });

  // Get collection name
  const { data: collectionName } = useReadContract({
    address: collectionAddr,
    abi: nftAbi,
    functionName: "name",
  });

  // Get active listings and find this NFT
  const { data: listings } = useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: marketplaceAbi,
    functionName: "getActiveListings",
    query: { enabled: hasMarketplace },
  });

  const allListings = (listings as Listing[] | undefined) ?? [];
  const listing = allListings.find(
    (l) =>
      l.nftContract.toLowerCase() === collection.toLowerCase() &&
      l.tokenId.toString() === tokenId
  );

  const { novaToUsd } = useNovaPrice();
  const { metadata } = useNFTMetadata(tokenURI as string | undefined);
  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });
  const isBuying = isPending || isConfirming;

  function handleBuy() {
    if (!listing || !hasMarketplace) return;
    writeContract(
      {
        address: MARKETPLACE_ADDRESS,
        abi: marketplaceAbi,
        functionName: "buyNFT",
        args: [listing.listingId],
        value: listing.price,
      },
      {
        onSuccess: () => toast.success("NFT purchased successfully!"),
        onError: (err) => {
          console.error(err);
          toast.error("Failed to purchase NFT");
        },
      }
    );
  }

  if (loadingOwner) {
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
        <div className="aspect-square rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 relative">
          {metadata?.image ? (
            <img
              src={metadata.image}
              alt={metadata.name || `NFT #${tokenId}`}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600 text-6xl">
              ?
            </div>
          )}
        </div>

        {/* NFT Details */}
        <div>
          <p className="text-purple-400 text-sm font-medium mb-2">
            {(collectionName as string) ?? `${collection.slice(0, 6)}...${collection.slice(-4)}`}
          </p>
          <h1 className="text-3xl font-bold text-white mb-4">
            {metadata?.name || `NFT #${tokenId}`}
          </h1>

          {metadata?.description && (
            <p className="text-gray-400 mb-6">{metadata.description}</p>
          )}

          {/* Owner */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4 mb-6">
            <p className="text-gray-500 text-sm">Owner</p>
            <a
              href={`https://explorer.ethnova.net/address/${owner}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-purple-400 transition-colors"
            >
              {owner
                ? `${(owner as string).slice(0, 8)}...${(owner as string).slice(-6)}`
                : "Unknown"}
            </a>
          </div>

          {/* Token URI */}
          {tokenURI && (
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4 mb-6">
              <p className="text-gray-500 text-sm">Token URI</p>
              <p className="text-gray-300 text-sm break-all mt-1">
                {tokenURI as string}
              </p>
            </div>
          )}

          {/* Listing / Buy */}
          {listing ? (
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
              <div className="mb-4">
                <span className="text-gray-400 text-sm">Current Price</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-bold text-cyan-400">
                    {formatEther(listing.price)} NOVA
                  </span>
                  {novaToUsd(formatEther(listing.price)) && (
                    <span className="text-gray-500 text-lg">
                      ({novaToUsd(formatEther(listing.price))})
                    </span>
                  )}
                </div>
              </div>
              <p className="text-gray-500 text-sm mb-4">
                Seller: {listing.seller.slice(0, 6)}...
                {listing.seller.slice(-4)}
              </p>
              {isConnected ? (
                <button
                  onClick={handleBuy}
                  disabled={isBuying}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isBuying ? "Buying..." : "Buy Now"}
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
          {/* Add to Wallet */}
          {isConnected && (
            <button
              onClick={async () => {
                const ethereum = (window as unknown as { ethereum?: { request: (args: { method: string; params: unknown }) => Promise<unknown> } }).ethereum;
                if (!ethereum) return;
                try {
                  await ethereum.request({
                    method: "wallet_watchAsset",
                    params: {
                      type: "ERC721",
                      options: {
                        address: collection,
                        tokenId: tokenId,
                      },
                    },
                  });
                  toast.success("NFT added to wallet!");
                } catch {
                  toast.error("Failed to add to wallet");
                }
              }}
              className="mt-4 w-full py-2.5 border border-gray-700 rounded-lg text-sm text-gray-300 hover:border-purple-500 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Import to Wallet
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
