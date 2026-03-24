"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { isAdmin } from "@/consts/admin";
import toast from "react-hot-toast";

type Profile = {
  address: string;
  username: string;
  bio: string;
  avatar_url: string;
  is_verified: boolean;
  created_at: string;
};

type Collection = {
  id: number;
  contract_address: string;
  name: string;
  owner_address: string;
  is_verified: boolean;
  created_at: string;
};

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [tab, setTab] = useState<"profiles" | "collections">("profiles");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  const admin = isConnected && address && isAdmin(address);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin?type=${tab}`);
      const data = await res.json();
      if (tab === "profiles") setProfiles(data.profiles || []);
      else setCollections(data.collections || []);
    } catch {
      // ignore
    }
    setLoading(false);
  }, [tab]);

  useEffect(() => {
    if (admin) fetchData();
  }, [admin, fetchData]);

  async function handleVerify(targetAddress: string, targetType: string, currentlyVerified: boolean) {
    if (!address) return;
    try {
      const authRes = await fetch("/api/auth");
      const { message } = await authRes.json();
      const signature = await signMessageAsync({ message });

      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admin_address: address,
          signature,
          action: currentlyVerified ? "unverify" : "verify",
          target_address: targetAddress,
          target_type: targetType,
        }),
      });

      if (res.ok) {
        toast.success(currentlyVerified ? "Unverified" : "Verified!");
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed");
      }
    } catch {
      toast.error("Cancelled");
    }
  }

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Admin Panel</h1>
        <p className="text-gray-500">Connect your wallet.</p>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-gray-500">Your wallet is not authorized as admin.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
      <p className="text-gray-400 mb-8">Manage verifications for profiles and collections</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setTab("profiles")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "profiles"
              ? "bg-purple-600 text-white"
              : "bg-gray-800 text-gray-400 hover:text-white"
          }`}
        >
          Profiles ({profiles.length})
        </button>
        <button
          onClick={() => setTab("collections")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "collections"
              ? "bg-purple-600 text-white"
              : "bg-gray-800 text-gray-400 hover:text-white"
          }`}
        >
          Collections ({collections.length})
        </button>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : tab === "profiles" ? (
        <div className="space-y-3">
          {profiles.length === 0 && (
            <p className="text-gray-500 text-center py-8">No profiles yet</p>
          )}
          {profiles.map((p) => (
            <div
              key={p.address}
              className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-800"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800 shrink-0">
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-cyan-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">
                      {p.username || `${p.address.slice(0, 8)}...`}
                    </span>
                    {p.is_verified && (
                      <span className="text-blue-400 text-xs">Verified</span>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs">{p.address}</p>
                </div>
              </div>
              <button
                onClick={() => handleVerify(p.address, "profile", p.is_verified)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  p.is_verified
                    ? "bg-red-900/30 text-red-400 border border-red-800 hover:bg-red-900/50"
                    : "bg-blue-900/30 text-blue-400 border border-blue-800 hover:bg-blue-900/50"
                }`}
              >
                {p.is_verified ? "Remove Verify" : "Verify"}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {collections.length === 0 && (
            <p className="text-gray-500 text-center py-8">No collections yet</p>
          )}
          {collections.map((c) => (
            <div
              key={c.contract_address}
              className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-800"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{c.name}</span>
                  {c.is_verified && (
                    <span className="text-blue-400 text-xs">Verified</span>
                  )}
                </div>
                <p className="text-gray-500 text-xs">{c.contract_address}</p>
                <p className="text-gray-600 text-xs">Owner: {c.owner_address}</p>
              </div>
              <button
                onClick={() => handleVerify(c.contract_address, "collection", c.is_verified)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  c.is_verified
                    ? "bg-red-900/30 text-red-400 border border-red-800 hover:bg-red-900/50"
                    : "bg-blue-900/30 text-blue-400 border border-blue-800 hover:bg-blue-900/50"
                }`}
              >
                {c.is_verified ? "Remove Verify" : "Verify"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
