"use client";

import { useState, useEffect, useRef } from "react";
import { useAccount, useSignMessage } from "wagmi";
import toast from "react-hot-toast";

type Profile = {
  address: string;
  username: string;
  bio: string;
  avatar_url: string;
  website: string;
  twitter: string;
  discord: string;
  telegram: string;
  is_verified: boolean;
};

export default function EditProfilePage() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    username: "",
    bio: "",
    avatar_url: "",
    website: "",
    twitter: "",
    discord: "",
    telegram: "",
  });

  useEffect(() => {
    if (!address) return;
    fetch(`/api/profile?address=${address}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.profile) {
          setForm({
            username: data.profile.username || "",
            bio: data.profile.bio || "",
            avatar_url: data.profile.avatar_url || "",
            website: data.profile.website || "",
            twitter: data.profile.twitter || "",
            discord: data.profile.discord || "",
            telegram: data.profile.telegram || "",
          });
          if (data.profile.avatar_url) setAvatarPreview(data.profile.avatar_url);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [address]);

  function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    if (!address) return;
    setSaving(true);

    try {
      // Get auth message and sign
      const authRes = await fetch("/api/auth");
      const { message } = await authRes.json();
      const signature = await signMessageAsync({ message });

      // Upload avatar if new file
      let avatarUrl = form.avatar_url;
      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok) {
          avatarUrl = `https://ipfs.ethnova.net/ipfs/${uploadData.cid}`;
        }
      }

      // Save profile
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          signature,
          ...form,
          avatar_url: avatarUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to save");
      } else {
        toast.success("Profile saved!");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed";
      if (msg.includes("rejected") || msg.includes("denied")) {
        toast.error("Signature rejected");
      } else {
        toast.error("Failed to save profile");
      }
    }
    setSaving(false);
  }

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Edit Profile</h1>
        <p className="text-gray-500">Connect your wallet to edit your profile.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-800 rounded w-1/2" />
          <div className="h-32 bg-gray-800 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">Edit Profile</h1>
      <p className="text-gray-400 mb-8">
        Customize your profile on Ethernova NFT Marketplace
      </p>

      <div className="space-y-6 bg-gray-900/50 rounded-2xl border border-gray-800 p-8">
        {/* Avatar */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Avatar</label>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarSelect} className="hidden" />
          <div className="flex items-center gap-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 rounded-full overflow-hidden bg-gray-800 border-2 border-gray-700 hover:border-purple-500 cursor-pointer transition-colors flex items-center justify-center"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-500 text-2xl">+</span>
              )}
            </div>
            <p className="text-gray-500 text-sm">Click to upload avatar</p>
          </div>
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
          <input
            type="text"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder="satoshi"
            maxLength={50}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="Tell the world about yourself..."
            rows={3}
            maxLength={500}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
          />
        </div>

        {/* Social Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Website</label>
            <input
              type="text"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              placeholder="https://mysite.com"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Twitter / X</label>
            <input
              type="text"
              value={form.twitter}
              onChange={(e) => setForm({ ...form, twitter: e.target.value })}
              placeholder="@username"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Discord</label>
            <input
              type="text"
              value={form.discord}
              onChange={(e) => setForm({ ...form, discord: e.target.value })}
              placeholder="username#1234"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Telegram</label>
            <input
              type="text"
              value={form.telegram}
              onChange={(e) => setForm({ ...form, telegram: e.target.value })}
              placeholder="@username"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? "Signing & Saving..." : "Save Profile"}
        </button>

        <p className="text-gray-600 text-xs text-center">
          You will be asked to sign a message with your wallet to verify ownership. No gas required.
        </p>
      </div>
    </div>
  );
}
