"use client";

import Link from "next/link";
import Image from "next/image";
import ConnectWallet from "./ConnectWallet";

export default function Navbar() {
  return (
    <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Ethernova" width={32} height={32} className="rounded-lg" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Ethernova NFT
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                Explore
              </Link>
              <Link href="/mint" className="text-gray-400 hover:text-white transition-colors text-sm">
                Mint
              </Link>
              <Link href="/sell" className="text-gray-400 hover:text-white transition-colors text-sm">
                Sell
              </Link>
              <Link href="/profile" className="text-gray-400 hover:text-white transition-colors text-sm">
                Profile
              </Link>
            </div>
          </div>
          <ConnectWallet />
        </div>
      </div>
    </nav>
  );
}
