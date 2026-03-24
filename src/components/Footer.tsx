import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Ethernova" width={24} height={24} className="rounded-md" />
            <span className="text-sm font-semibold text-gray-400">
              Ethernova NFT Marketplace
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="https://ethnova.net" target="_blank" className="hover:text-white transition-colors">
              Website
            </Link>
            <Link href="https://explorer.ethnova.net" target="_blank" className="hover:text-white transition-colors">
              Explorer
            </Link>
            <Link href="https://t.me/EthernovaChain" target="_blank" className="hover:text-white transition-colors">
              Telegram
            </Link>
          </div>
          <p className="text-xs text-gray-600">
            Powered by Ethernova Chain (ID: 121525)
          </p>
        </div>
      </div>
    </footer>
  );
}
