import { http, createConfig } from "wagmi";
import { injected, metaMask } from "wagmi/connectors";
import { ethernova } from "@/consts/chain";

export const wagmiConfig = createConfig({
  chains: [ethernova],
  connectors: [
    injected({ shimDisconnect: true }),
    metaMask(),
  ],
  transports: {
    [ethernova.id]: http("https://rpc.ethnova.net"),
  },
  ssr: true,
});
