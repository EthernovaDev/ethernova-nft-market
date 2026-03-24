"use client";

import { useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import { getContract, sendTransaction } from "thirdweb";
import { client } from "@/lib/client";
import { ethernova } from "@/consts/chain";
import { MARKETPLACE_ADDRESS, NFT_COLLECTION_ADDRESS } from "@/consts/addresses";
import { createListing } from "thirdweb/extensions/marketplace";
import { isApprovedForAll, setApprovalForAll } from "thirdweb/extensions/erc721";
import toast from "react-hot-toast";

export default function SellPage() {
  const account = useActiveAccount();
  const [tokenId, setTokenId] = useState("");
  const [price, setPrice] = useState("");
  const [isListing, setIsListing] = useState(false);

  const hasContracts = MARKETPLACE_ADDRESS !== "" && NFT_COLLECTION_ADDRESS !== "";

  async function handleList() {
    if (!account || !tokenId || !price || !hasContracts) return;

    setIsListing(true);
    try {
      const marketplace = getContract({
        client,
        chain: ethernova,
        address: MARKETPLACE_ADDRESS,
      });

      const nftCollection = getContract({
        client,
        chain: ethernova,
        address: NFT_COLLECTION_ADDRESS,
      });

      // Check and set approval
      const approved = await isApprovedForAll({
        contract: nftCollection,
        owner: account.address,
        operator: MARKETPLACE_ADDRESS,
      });

      if (!approved) {
        const approveTx = setApprovalForAll({
          contract: nftCollection,
          operator: MARKETPLACE_ADDRESS,
          approved: true,
        });
        await sendTransaction({ transaction: approveTx, account });
        toast.success("Approval granted!");
      }

      // Create listing
      const listingTx = createListing({
        contract: marketplace,
        assetContractAddress: NFT_COLLECTION_ADDRESS,
        tokenId: BigInt(tokenId),
        pricePerToken: price,
      });

      await sendTransaction({ transaction: listingTx, account });
      toast.success("NFT listed successfully!");
      setTokenId("");
      setPrice("");
    } catch (error: unknown) {
      console.error(error);
      toast.error("Failed to list NFT");
    } finally {
      setIsListing(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">Sell Your NFT</h1>
      <p className="text-gray-400 mb-8">
        List your NFT on the Ethernova marketplace
      </p>

      {!hasContracts ? (
        <div className="text-center py-16 bg-gray-900/50 rounded-2xl border border-gray-800">
          <span className="text-4xl mb-4 block">🔧</span>
          <h3 className="text-xl font-semibold text-white mb-2">
            Contracts Not Deployed Yet
          </h3>
          <p className="text-gray-500">
            The marketplace contracts need to be deployed to Ethernova before you
            can list NFTs.
          </p>
        </div>
      ) : !account ? (
        <div className="text-center py-16 bg-gray-900/50 rounded-2xl border border-gray-800">
          <span className="text-4xl mb-4 block">🔗</span>
          <h3 className="text-xl font-semibold text-white mb-2">
            Connect Your Wallet
          </h3>
          <p className="text-gray-500">
            Connect your wallet to start listing NFTs.
          </p>
        </div>
      ) : (
        <div className="space-y-6 bg-gray-900/50 rounded-2xl border border-gray-800 p-8">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Token ID
            </label>
            <input
              type="number"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              placeholder="Enter the token ID of your NFT"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Price (NOVA)
            </label>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price in NOVA"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <button
            onClick={handleList}
            disabled={isListing || !tokenId || !price}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isListing ? "Listing..." : "List NFT for Sale"}
          </button>
        </div>
      )}
    </div>
  );
}
