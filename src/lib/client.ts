import { http, createConfig } from "wagmi";
import { injected } from "wagmi/connectors";
import { ethernova } from "@/consts/chain";

export const wagmiConfig = createConfig({
  chains: [ethernova],
  connectors: [injected()],
  transports: {
    [ethernova.id]: http("https://rpc.ethnova.net"),
  },
  ssr: true,
});
