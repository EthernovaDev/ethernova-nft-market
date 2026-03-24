"use client";

import Link from "next/link";
import Image from "next/image";
import { useNovaPrice } from "@/lib/useNovaPrice";

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
  const { novaToUsd } = useNovaPrice();
  const usdPrice = price ? novaToUsd(price) : null;

  return (
    <Link href={`/nft/${collectionAddress}/${tokenId}`}>
      <div className="group bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
        <div className="aspect-square overflow-hidden bg-gray-800 relative">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              className="object-contain group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600 text-4xl">
              ?
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-white font-semibold truncate">{name}</h3>
          {seller && (
            <p className="text-gray-500 text-xs mt-1 truncate">
              {seller.slice(0, 6)}...{seller.slice(-4)}
            </p>
          )}
          {price && (
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs">Price</span>
                <span className="text-cyan-400 font-bold">{price} NOVA</span>
              </div>
              {usdPrice && (
                <p className="text-right text-gray-500 text-xs mt-0.5">{usdPrice}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
