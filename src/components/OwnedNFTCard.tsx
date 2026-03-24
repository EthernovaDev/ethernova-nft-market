"use client";

import { useReadContract } from "wagmi";
import { nftAbi } from "@/consts/abis";
import { useNFTMetadata } from "@/lib/useNFTMetadata";
import NFTCard from "./NFTCard";

type Props = {
  tokenId: bigint;
  collectionAddress: string;
};

export default function OwnedNFTCard({ tokenId, collectionAddress }: Props) {
  const { data: tokenURI } = useReadContract({
    address: collectionAddress as `0x${string}`,
    abi: nftAbi,
    functionName: "tokenURI",
    args: [tokenId],
  });

  const { metadata } = useNFTMetadata(tokenURI as string | undefined);

  return (
    <NFTCard
      tokenId={tokenId.toString()}
      name={metadata?.name || `NFT #${tokenId}`}
      image={metadata?.image || ""}
      collectionAddress={collectionAddress}
    />
  );
}
