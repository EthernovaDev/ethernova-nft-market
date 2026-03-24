"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { NFT_COLLECTION_ADDRESS, hasNFTCollection } from "@/consts/addresses";
import { nftAbi } from "@/consts/abis";
import toast from "react-hot-toast";

export default function MintPage() {
  const { isConnected } = useAccount();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [mintedId, setMintedId] = useState<string | null>(null);

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: txHash,
    query: {
      enabled: !!txHash,
    },
  });

  const isMinting = isPending || isConfirming;

  function handleMint() {
    if (!name) {
      toast.error("Name is required");
      return;
    }

    // Build metadata JSON as a data URI
    const metadata = {
      name,
      description,
      image: imageUrl || "",
    };
    const metadataUri = "data:application/json;base64," + btoa(JSON.stringify(metadata));

    writeContract(
      {
        address: NFT_COLLECTION_ADDRESS as `0x${string}`,
        abi: [
          {
            inputs: [{ name: "uri", type: "string" }],
            name: "mint",
            outputs: [{ name: "", type: "uint256" }],
            stateMutability: "payable",
            type: "function",
          },
        ],
        functionName: "mint",
        args: [metadataUri],
        value: 0n,
      },
      {
        onSuccess: (hash) => {
          toast.success("NFT minted! Waiting for confirmation...");
        },
        onError: (err) => {
          console.error(err);
          toast.error("Mint failed");
        },
      }
    );
  }

  if (!hasNFTCollection) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <span className="text-4xl mb-4 block">🔧</span>
        <h1 className="text-2xl font-bold text-white mb-2">Coming Soon</h1>
        <p className="text-gray-500">NFT contract not deployed yet.</p>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <span className="text-4xl mb-4 block">🔗</span>
        <h1 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h1>
        <p className="text-gray-500">Connect your wallet to mint NFTs.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">Mint NFT</h1>
      <p className="text-gray-400 mb-8">
        Create a new NFT on the Ethernova blockchain
      </p>

      <div className="space-y-6 bg-gray-900/50 rounded-2xl border border-gray-800 p-8">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Awesome NFT"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your NFT..."
            rows={3}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Image URL
          </label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/my-nft.png"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
          {imageUrl && (
            <div className="mt-3 rounded-lg overflow-hidden border border-gray-700 bg-gray-800">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full max-h-64 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Mint Price</span>
            <span className="text-green-400 font-bold">FREE</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-400">Network</span>
            <span className="text-gray-300">Ethernova (121525)</span>
          </div>
        </div>

        <button
          onClick={handleMint}
          disabled={isMinting || !name}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending
            ? "Confirm in Wallet..."
            : isConfirming
              ? "Minting..."
              : "Mint NFT"}
        </button>

        {txHash && (
          <div className="p-4 bg-green-900/20 border border-green-700/30 rounded-lg">
            <p className="text-green-400 text-sm font-medium mb-1">
              {isConfirming ? "Transaction submitted!" : "NFT Minted!"}
            </p>
            <a
              href={`https://explorer.ethnova.net/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-300 text-xs hover:underline break-all"
            >
              View on Explorer: {txHash.slice(0, 20)}...
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
