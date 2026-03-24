"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { MARKETPLACE_ADDRESS, NFT_COLLECTION_ADDRESS, hasContracts } from "@/consts/addresses";
import { marketplaceAbi, nftAbi } from "@/consts/abis";
import toast from "react-hot-toast";

export default function SellPage() {
  const { address, isConnected } = useAccount();
  const [tokenId, setTokenId] = useState("");
  const [price, setPrice] = useState("");

  const { data: isApproved } = useReadContract({
    address: NFT_COLLECTION_ADDRESS,
    abi: nftAbi,
    functionName: "isApprovedForAll",
    args: address && hasContracts ? [address, MARKETPLACE_ADDRESS] : undefined,
    query: { enabled: !!address && hasContracts },
  });

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });

  const isListing = isPending || isConfirming;

  async function handleApprove() {
    if (!hasContracts) return;
    writeContract(
      {
        address: NFT_COLLECTION_ADDRESS,
        abi: nftAbi,
        functionName: "setApprovalForAll",
        args: [MARKETPLACE_ADDRESS, true],
      },
      {
        onSuccess: () => toast.success("Approval granted!"),
        onError: (err) => {
          console.error(err);
          toast.error("Approval failed");
        },
      }
    );
  }

  async function handleList() {
    if (!tokenId || !price || !hasContracts) return;
    writeContract(
      {
        address: MARKETPLACE_ADDRESS,
        abi: marketplaceAbi,
        functionName: "listNFT",
        args: [NFT_COLLECTION_ADDRESS, BigInt(tokenId), parseEther(price)],
      },
      {
        onSuccess: () => {
          toast.success("NFT listed successfully!");
          setTokenId("");
          setPrice("");
        },
        onError: (err) => {
          console.error(err);
          toast.error("Failed to list NFT");
        },
      }
    );
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
      ) : !isConnected ? (
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
          {!isApproved && (
            <div className="p-4 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
              <p className="text-yellow-400 text-sm mb-3">
                You need to approve the marketplace to transfer your NFTs first.
              </p>
              <button
                onClick={handleApprove}
                disabled={isListing}
                className="px-6 py-2 bg-yellow-600 rounded-lg font-semibold text-white hover:bg-yellow-500 transition-colors disabled:opacity-50"
              >
                {isListing ? "Approving..." : "Approve Marketplace"}
              </button>
            </div>
          )}

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
            disabled={isListing || !tokenId || !price || !isApproved}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isListing ? "Listing..." : "List NFT for Sale"}
          </button>
        </div>
      )}
    </div>
  );
}
