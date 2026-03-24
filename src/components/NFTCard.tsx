"use client";

import Link from "next/link";
import { MediaRenderer } from "thirdweb/react";
import { client } from "@/lib/client";

type NFTCardProps = {
  tokenId: string;
  name: string;
  image: string;
  price?: string;
  collectionAddress: string;
  seller?: string;
};

export default function NFTCard({
  tokenId,
  name,
  image,
  price,
  collectionAddress,
  seller,
}: NFTCardProps) {
  return (
    <Link href={`/nft/${collectionAddress}/${tokenId}`}>
      <div className="group bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
        <div className="aspect-square overflow-hidden bg-gray-800">
          <MediaRenderer
            client={client}
            src={image}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-4">
          <h3 className="text-white font-semibold truncate">{name}</h3>
          {seller && (
            <p className="text-gray-500 text-xs mt-1 truncate">
              {seller.slice(0, 6)}...{seller.slice(-4)}
            </p>
          )}
          {price && (
            <div className="mt-3 flex items-center justify-between">
              <span className="text-gray-400 text-xs">Price</span>
              <span className="text-cyan-400 font-bold">{price} NOVA</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
