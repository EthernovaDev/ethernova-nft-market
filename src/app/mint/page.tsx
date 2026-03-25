"use client";

import { useState, useRef } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { NFT_COLLECTION_ADDRESS, hasNFTCollection } from "@/consts/addresses";
import toast from "react-hot-toast";

export default function MintPage() {
  const { isConnected } = useAccount();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
    query: { enabled: !!txHash },
  });

  const isMinting = isPending || isConfirming;

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Max 10MB");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleMint() {
    if (!name) {
      toast.error("Name is required");
      return;
    }

    let imageUrl = "";

    // Upload image if selected
    if (imageFile) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", imageFile);

        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || "Upload failed");
          setUploading(false);
          return;
        }

        imageUrl = `ipfs://${data.cid}`;
      } catch {
        toast.error("Upload failed");
        setUploading(false);
        return;
      }
    }

    // Upload metadata JSON to IPFS
    setUploading(true);
    let metadataUri = "";
    try {
      const metadata = {
        name,
        description: description || "",
        image: imageUrl,
      };
      const metadataBlob = new Blob([JSON.stringify(metadata)], { type: "application/json" });
      const metaForm = new FormData();
      metaForm.append("file", metadataBlob, "metadata.json");

      const metaRes = await fetch("/api/upload", { method: "POST", body: metaForm });
      const metaData = await metaRes.json();
      if (!metaRes.ok) {
        toast.error("Metadata upload failed");
        setUploading(false);
        return;
      }
      metadataUri = `ipfs://${metaData.cid}`;
    } catch {
      toast.error("Metadata upload failed");
      setUploading(false);
      return;
    }
    setUploading(false);

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
        onSuccess: () => {
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
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Image *
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
            onChange={handleFileSelect}
            className="hidden"
          />
          {imagePreview ? (
            <div className="relative group">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-h-80 object-contain rounded-lg border border-gray-700 bg-gray-800"
              />
              <button
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="absolute top-2 right-2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                X
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-48 border-2 border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-purple-500 transition-colors cursor-pointer bg-gray-800/30"
            >
              <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-gray-400 text-sm">Click to upload image</span>
              <span className="text-gray-600 text-xs">PNG, JPG, GIF, WEBP, SVG (max 10MB)</span>
            </button>
          )}
        </div>

        {/* Name */}
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

        {/* Description */}
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

        {/* Info */}
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

        {/* Mint Button */}
        <button
          onClick={handleMint}
          disabled={isMinting || uploading || !name || !imageFile}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading
            ? "Uploading image..."
            : isPending
              ? "Confirm in Wallet..."
              : isConfirming
                ? "Minting..."
                : "Mint NFT"}
        </button>

        {/* Success */}
        {txHash && (
          <div className={`p-4 rounded-lg border ${isSuccess ? "bg-green-900/20 border-green-700/30" : "bg-yellow-900/20 border-yellow-700/30"}`}>
            <p className={`text-sm font-medium mb-1 ${isSuccess ? "text-green-400" : "text-yellow-400"}`}>
              {isSuccess ? "NFT Minted Successfully!" : "Transaction submitted..."}
            </p>
            <a
              href={`https://explorer.ethnova.net/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:underline break-all text-gray-300"
            >
              View on Explorer
            </a>
            {isSuccess && (
              <p className="text-gray-400 text-sm mt-2">
                Go to <a href="/sell" className="text-purple-400 hover:underline">Sell</a> to list it on the marketplace.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
