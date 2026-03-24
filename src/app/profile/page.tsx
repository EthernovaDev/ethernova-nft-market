"use client";

import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { formatEther } from "viem";
import { MARKETPLACE_ADDRESS, NFT_COLLECTION_ADDRESS, hasContracts } from "@/consts/addresses";
import { marketplaceAbi, nftAbi } from "@/consts/abis";
import NFTCard from "@/components/NFTCard";
import OwnedNFTCard from "@/components/OwnedNFTCard";

type Listing = {
  listingId: bigint;
  seller: `0x${string}`;
  nftContract: `0x${string}`;
  tokenId: bigint;
  price: bigint;
  isActive: boolean;
};

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  // Get user's NFT balance
  const { data: balance } = useReadContract({
    address: NFT_COLLECTION_ADDRESS,
    abi: nftAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && hasContracts },
  });

  const nftBalance = Number(balance ?? 0n);

  // Get token IDs owned by user
  const tokenIndexes = Array.from({ length: nftBalance }, (_, i) => i);
  const { data: ownedTokenIds } = useReadContracts({
    contracts: tokenIndexes.map((index) => ({
      address: NFT_COLLECTION_ADDRESS,
      abi: nftAbi,
      functionName: "tokenOfOwnerByIndex" as const,
      args: [address!, BigInt(index)] as const,
    })),
    query: { enabled: nftBalance > 0 && !!address },
  });

  // Get active listings
  const { data: listings, isLoading: loadingListings } = useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: marketplaceAbi,
    functionName: "getActiveListings",
    query: { enabled: hasContracts },
  });

  const allListings = (listings as Listing[] | undefined) ?? [];
  const myListings = allListings.filter(
    (l) => l.seller.toLowerCase() === address?.toLowerCase()
  );

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <span className="text-5xl mb-4 block">👤</span>
        <h1 className="text-2xl font-bold text-white mb-2">Your Profile</h1>
        <p className="text-gray-500">Connect your wallet to view your NFTs and listings.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Profile header */}
      <div className="mb-12">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-cyan-400 rounded-full mb-4" />
        <h1 className="text-2xl font-bold text-white">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </h1>
        <a
          href={`https://explorer.ethnova.net/address/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-400 text-sm hover:underline"
        >
          View on Explorer
        </a>
      </div>

      {!hasContracts ? (
        <div className="text-center py-16 bg-gray-900/50 rounded-2xl border border-gray-800">
          <p className="text-gray-500">Contracts not deployed yet.</p>
        </div>
      ) : (
        <>
          {/* My NFTs */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-white mb-6">
              My NFTs ({nftBalance})
            </h2>
            {nftBalance > 0 && ownedTokenIds ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {ownedTokenIds.map((result, i) => {
                  if (result.status !== "success") return null;
                  const tid = result.result as bigint;
                  return (
                    <OwnedNFTCard
                      key={tid.toString()}
                      tokenId={tid}
                      collectionAddress={NFT_COLLECTION_ADDRESS}
                    />
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 py-8 text-center bg-gray-900/50 rounded-xl border border-gray-800">
                You don&apos;t own any NFTs yet.
              </p>
            )}
          </section>

          {/* My Listings */}
          <section>
            <h2 className="text-xl font-bold text-white mb-6">My Listings</h2>
            {loadingListings ? (
              <div className="text-gray-500">Loading listings...</div>
            ) : myListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {myListings.map((listing) => (
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
              <p className="text-gray-500 py-8 text-center bg-gray-900/50 rounded-xl border border-gray-800">
                You don&apos;t have any active listings.
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
