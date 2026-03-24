import { defineChain } from "viem";

export const ethernova = defineChain({
  id: 121525,
  name: "Ethernova",
  nativeCurrency: {
    name: "Nova",
    symbol: "NOVA",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.ethnova.net"],
    },
  },
  blockExplorers: {
    default: {
      name: "Ethernova Explorer",
      url: "https://explorer.ethnova.net",
    },
  },
});
