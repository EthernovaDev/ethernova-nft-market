"use client";

import { useReadContract } from "wagmi";
import { formatEther } from "viem";
import { MARKETPLACE_ADDRESS, hasMarketplace } from "@/consts/addresses";
import { marketplaceAbi } from "@/consts/abis";
import NFTCard from "@/components/NFTCard";

type Listing = {
  listingId: bigint;
  seller: `0x${string}`;
  nftContract: `0x${string}`;
  tokenId: bigint;
  price: bigint;
  isActive: boolean;
};

export default function Home() {

  const { data: listings, isLoading } = useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: marketplaceAbi,
    functionName: "getActiveListings",
    query: { enabled: hasMarketplace },
  });

  const activeListings = (listings as Listing[] | undefined) ?? [];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Discover, Collect & Sell
              </span>
              <br />
              <span className="text-white">Extraordinary NFTs</span>
            </h1>
            <p className="text-gray-400 text-lg mb-8">
              The first NFT marketplace on the Ethernova blockchain.
              Buy, sell, and trade unique digital assets powered by NOVA.
            </p>
            <div className="flex items-center justify-center gap-4">
              <a
                href="#listings"
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity"
              >
                Explore NFTs
              </a>
              <a
                href="/sell"
                className="px-8 py-3 border border-gray-700 rounded-lg font-semibold text-gray-300 hover:border-purple-500 hover:text-white transition-all"
              >
                Start Selling
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">
                {activeListings.length}
              </p>
              <p className="text-gray-500 text-sm mt-1">Listed NFTs</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">121525</p>
              <p className="text-gray-500 text-sm mt-1">Chain ID</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">NOVA</p>
              <p className="text-gray-500 text-sm mt-1">Currency</p>
            </div>
          </div>
        </div>
      </section>

      {/* Listings */}
      <section id="listings" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-white mb-8">Latest Listings</h2>

        {!hasMarketplace ? (
          <div className="text-center py-20 bg-gray-900/50 rounded-2xl border border-gray-800">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🚀</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Marketplace Coming Soon
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Smart contracts are being deployed to Ethernova. Check back soon
              to start trading NFTs!
            </p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 animate-pulse"
              >
                <div className="aspect-square bg-gray-800" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-800 rounded w-3/4" />
                  <div className="h-3 bg-gray-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : activeListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {activeListings.map((listing) => (
              <NFTCard
                key={listing.listingId.toString()}
                tokenId={listing.tokenId.toString()}
                name={`NFT #${listing.tokenId}`}
                image=""
                price={formatEther(listing.price)}
                collectionAddress={listing.nftContract}
                seller={listing.seller}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-900/50 rounded-2xl border border-gray-800">
            <p className="text-gray-500">No NFTs listed yet. Be the first!</p>
          </div>
        )}
      </section>
    </div>
  );
}
