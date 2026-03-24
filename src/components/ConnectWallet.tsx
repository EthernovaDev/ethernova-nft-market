"use client";

import { useAccount, useDisconnect, useBalance, useSwitchChain } from "wagmi";
import { useConnect } from "wagmi";
import { ethernova } from "@/consts/chain";
import { useState, useEffect, useCallback } from "react";

export default function ConnectWallet() {
  const { address, isConnected, chain } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const [showMenu, setShowMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset connecting state when connection succeeds
  useEffect(() => {
    if (isConnected) setConnecting(false);
  }, [isConnected]);

  const { data: balance } = useBalance({
    address,
    query: { enabled: isConnected },
  });

  const getEthereum = useCallback(() => {
    if (typeof window !== "undefined") {
      return (window as unknown as { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum;
    }
    return undefined;
  }, []);

  const handleConnect = useCallback(async () => {
    setError("");
    setConnecting(true);

    const ethereum = getEthereum();
    if (!ethereum) {
      window.open("https://metamask.io/download/", "_blank");
      setConnecting(false);
      return;
    }

    try {
      // Request accounts directly via window.ethereum
      await ethereum.request({ method: "eth_requestAccounts" });

      // Try adding Ethernova chain
      try {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x" + ethernova.id.toString(16),
              chainName: ethernova.name,
              nativeCurrency: ethernova.nativeCurrency,
              rpcUrls: [ethernova.rpcUrls.default.http[0]],
              blockExplorerUrls: [ethernova.blockExplorers.default.url],
            },
          ],
        });
      } catch {
        // Chain might already exist, try switching
        try {
          await ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x" + ethernova.id.toString(16) }],
          });
        } catch {
          // ignore switch error
        }
      }

      // Now connect via wagmi to sync state
      const connector = connectors[0];
      if (connector) {
        connect({ connector });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Connection failed";
      if (msg.includes("rejected") || msg.includes("denied")) {
        setError("Rejected by user");
      } else {
        setError("Connection failed");
      }
      setConnecting(false);
    }
  }, [getEthereum, connectors, connect]);

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
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          onClick={handleConnect}
          disabled={connecting}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-lg font-semibold text-white text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {connecting ? "Check Wallet..." : "Connect Wallet"}
        </button>
        {error && (
          <p className="text-red-400 text-xs">{error}</p>
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
