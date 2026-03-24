import { defineChain } from "thirdweb";

export const ethernova = defineChain({
  id: 121525,
  name: "Ethernova",
  nativeCurrency: {
    name: "Nova",
    symbol: "NOVA",
    decimals: 18,
  },
  rpc: "https://rpc.ethnova.net",
  blockExplorers: [
    {
      name: "Ethernova Explorer",
      url: "https://explorer.ethnova.net",
    },
  ],
});
