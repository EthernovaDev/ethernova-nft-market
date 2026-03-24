"use client";

import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

export default function TestPage() {
  const [mounted, setMounted] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    setMounted(true);
    const hasEth = typeof window !== "undefined" && !!(window as unknown as Record<string, unknown>).ethereum;
    setLog((prev) => [...prev, `Mounted. window.ethereum: ${hasEth}`]);
    setLog((prev) => [...prev, `Connectors: ${connectors.map((c) => c.id).join(", ")}`]);
  }, [connectors]);

  useEffect(() => {
    if (error) {
      setLog((prev) => [...prev, `Error: ${error.message}`]);
    }
  }, [error]);

  useEffect(() => {
    if (isConnected && address) {
      setLog((prev) => [...prev, `Connected: ${address}`]);
    }
  }, [isConnected, address]);

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold text-white mb-4">Wallet Test Page</h1>
      <p className="text-gray-400 mb-4">mounted: {String(mounted)}</p>
      <p className="text-gray-400 mb-4">isConnected: {String(isConnected)}</p>
      <p className="text-gray-400 mb-4">isPending: {String(isPending)}</p>
      <p className="text-gray-400 mb-4">address: {address ?? "none"}</p>
      <p className="text-gray-400 mb-4">connectors: {connectors.map((c) => c.id).join(", ")}</p>

      <div className="flex gap-4 mb-6">
        {connectors.map((connector) => (
          <button
            key={connector.id}
            onClick={() => {
              setLog((prev) => [...prev, `Trying connector: ${connector.id}`]);
              connect(
                { connector, chainId: 121525 },
                {
                  onSuccess: (data) => setLog((prev) => [...prev, `Success: ${JSON.stringify(data)}`]),
                  onError: (err) => setLog((prev) => [...prev, `Fail: ${err.message}`]),
                }
              );
            }}
            disabled={isPending}
            className="px-4 py-2 bg-purple-600 rounded text-white text-sm"
          >
            {connector.id}
          </button>
        ))}

        <button
          onClick={async () => {
            const eth = (window as unknown as Record<string, { request: (a: { method: string }) => Promise<unknown> }>).ethereum;
            if (!eth) {
              setLog((prev) => [...prev, "No window.ethereum!"]);
              return;
            }
            try {
              setLog((prev) => [...prev, "Calling eth_requestAccounts..."]);
              const accounts = await eth.request({ method: "eth_requestAccounts" });
              setLog((prev) => [...prev, `Accounts: ${JSON.stringify(accounts)}`]);
            } catch (err: unknown) {
              setLog((prev) => [...prev, `Direct error: ${(err as Error).message}`]);
            }
          }}
          className="px-4 py-2 bg-cyan-600 rounded text-white text-sm"
        >
          Direct eth_requestAccounts
        </button>

        {isConnected && (
          <button
            onClick={() => disconnect()}
            className="px-4 py-2 bg-red-600 rounded text-white text-sm"
          >
            Disconnect
          </button>
        )}
      </div>

      <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
        <h2 className="text-white font-bold mb-2">Log:</h2>
        {log.map((entry, i) => (
          <p key={i} className="text-green-400 text-xs font-mono">{entry}</p>
        ))}
      </div>
    </div>
  );
}
