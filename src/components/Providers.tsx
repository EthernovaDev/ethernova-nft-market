"use client";

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { Toaster } from "react-hot-toast";
import { wagmiConfig } from "@/lib/client";
import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#8B5CF6",
            accentColorForeground: "white",
            borderRadius: "medium",
          })}
        >
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#1F2937",
                color: "#F9FAFB",
                border: "1px solid #374151",
              },
            }}
          />
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
