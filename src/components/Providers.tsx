"use client";

import { ThirdwebProvider } from "thirdweb/react";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThirdwebProvider>
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
    </ThirdwebProvider>
  );
}
