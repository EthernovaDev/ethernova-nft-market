import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { ethernova } from "@/consts/chain";

export const wagmiConfig = getDefaultConfig({
  appName: "Ethernova NFT Marketplace",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "placeholder",
  chains: [ethernova],
  ssr: true,
});
