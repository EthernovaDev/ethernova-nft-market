"use client";

import { useActiveAccount, useReadContract } from "thirdweb/react";
import { getContract } from "thirdweb";
import { getOwnedNFTs } from "thirdweb/extensions/erc721";
import { getAllValidListings } from "thirdweb/extensions/marketplace";
import { client } from "@/lib/client";
import { ethernova } from "@/consts/chain";
import { MARKETPLACE_ADDRESS, NFT_COLLECTION_ADDRESS } from "@/consts/addresses";
import NFTCard from "@/components/NFTCard";

export default function ProfilePage() {
  const account = useActiveAccount();
  const hasContracts = MARKETPLACE_ADDRESS !== "" && NFT_COLLECTION_ADDRESS !== "";

  const nftContract = hasContracts
    ? getContract({
        client,
        chain: ethernova,
        address: NFT_COLLECTION_ADDRESS,
      })
    : null;

  const marketplaceContract = hasContracts
    ? getContract({
        client,
        chain: ethernova,
        address: MARKETPLACE_ADDRESS,
      })
    : null;

  const { data: ownedNFTs, isLoading: loadingOwned } = useReadContract(
    getOwnedNFTs,
    {
      contract: nftContract!,
      owner: account?.address ?? "",
      queryOptions: { enabled: !!nftContract && !!account },
    }
  );

  const { data: listings, isLoading: loadingListings } = useReadContract(
    getAllValidListings,
    {
      contract: marketplaceContract!,
      queryOptions: { enabled: !!marketplaceContract },
    }
  );

  const myListings = listings?.filter(
    (l) => l.creatorAddress.toLowerCase() === account?.address?.toLowerCase()
  );

  if (!account) {
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
          {account.address.slice(0, 6)}...{account.address.slice(-4)}
        </h1>
        <a
          href={`https://explorer.ethnova.net/address/${account.address}`}
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
            <h2 className="text-xl font-bold text-white mb-6">My NFTs</h2>
            {loadingOwned ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-900 rounded-xl border border-gray-800 animate-pulse">
                    <div className="aspect-square bg-gray-800 rounded-t-xl" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-800 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : ownedNFTs && ownedNFTs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {ownedNFTs.map((nft) => (
                  <NFTCard
                    key={nft.id.toString()}
                    tokenId={nft.id.toString()}
                    name={nft.metadata?.name ?? `NFT #${nft.id}`}
                    image={nft.metadata?.image ?? ""}
                    collectionAddress={NFT_COLLECTION_ADDRESS}
                  />
                ))}
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
            ) : myListings && myListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {myListings.map((listing) => (
                  <NFTCard
                    key={listing.id.toString()}
                    tokenId={listing.tokenId.toString()}
                    name={listing.asset?.metadata?.name ?? `NFT #${listing.tokenId}`}
                    image={listing.asset?.metadata?.image ?? ""}
                    price={listing.currencyValuePerToken?.displayValue}
                    collectionAddress={listing.assetContractAddress}
                    seller={listing.creatorAddress}
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
