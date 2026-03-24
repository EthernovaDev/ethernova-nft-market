"use client";

import { useAccount, useConnect, useDisconnect, useBalance, useSwitchChain } from "wagmi";
import { ethernova } from "@/consts/chain";
import { useState, useEffect } from "react";

export default function ConnectWallet() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const [showMenu, setShowMenu] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: balance } = useBalance({
    address,
    query: { enabled: isConnected },
  });

  // Don't render until client-side to avoid hydration mismatch
  if (!mounted) {
    return (
      <button
        disabled
        className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-lg font-semibold text-white text-sm opacity-50"
      >
        Connect Wallet
      </button>
    );
  }

  const wrongChain = isConnected && chain?.id !== ethernova.id;

  if (!isConnected) {
    const hasWallet = typeof window !== "undefined" && (window as unknown as Record<string, unknown>).ethereum;

    return (
      <div className="flex flex-col items-end gap-1">
        <button
          onClick={() => {
            if (!hasWallet) {
              window.open("https://metamask.io/download/", "_blank");
              return;
            }
            // Try all available connectors, pick the first one
            const connector = connectors[0];
            if (connector) {
              connect({ connector, chainId: ethernova.id });
            }
          }}
          disabled={isPending}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-lg font-semibold text-white text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isPending
            ? "Connecting..."
            : hasWallet
              ? "Connect Wallet"
              : "Install MetaMask"}
        </button>
        {error && (
          <p className="text-red-400 text-xs max-w-[200px] truncate">
            {error.message.includes("User rejected")
              ? "Connection rejected"
              : "Connection failed"}
          </p>
        )}
      </div>
    );
  }

  if (wrongChain) {
    return (
      <button
        onClick={() => switchChain({ chainId: ethernova.id })}
        className="px-5 py-2.5 bg-red-600 rounded-lg font-semibold text-white text-sm hover:bg-red-500 transition-colors"
      >
        Switch to Ethernova
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-3 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:border-purple-500/50 transition-colors"
      >
        <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-cyan-400 rounded-full" />
        <div className="text-left hidden sm:block">
          <p className="text-white text-sm font-medium">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
          <p className="text-gray-400 text-xs">
            {balance ? `${(Number(balance.value) / 1e18).toFixed(2)} NOVA` : "..."}
          </p>
        </div>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
            <a
              href={`https://explorer.ethnova.net/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
              onClick={() => setShowMenu(false)}
            >
              View on Explorer
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText(address ?? "");
                setShowMenu(false);
              }}
              className="block w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
            >
              Copy Address
            </button>
            <button
              onClick={() => {
                disconnect();
                setShowMenu(false);
              }}
              className="block w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-gray-800 transition-colors border-t border-gray-700"
            >
              Disconnect
            </button>
          </div>
        </>
      )}
    </div>
  );
}
