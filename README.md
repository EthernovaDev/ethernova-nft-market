# Ethernova NFT Marketplace

The first NFT marketplace on the Ethernova blockchain. Buy, sell, and trade unique digital assets powered by NOVA.

## Tech Stack

- **Frontend:** Next.js 16 + TypeScript + Tailwind CSS
- **Web3:** Thirdweb SDK v5
- **Chain:** Ethernova (Chain ID: 121525)
- **Currency:** NOVA

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A [thirdweb](https://thirdweb.com) account (free) for the client ID

### Installation

```bash
git clone https://github.com/EthernovaDev/ethernova-nft-market.git
cd ethernova-nft-market
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` | Your thirdweb client ID |

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

## Network Info

| Property | Value |
|----------|-------|
| Chain Name | Ethernova |
| Chain ID | 121525 |
| Currency | NOVA |
| RPC | https://rpc.ethnova.net |
| Explorer | https://explorer.ethnova.net |

## Features

- Browse and search NFT listings
- Buy NFTs with NOVA
- List your NFTs for sale
- View your owned NFTs and active listings
- NFT detail pages with attributes
- Wallet connection via thirdweb

## License

MIT
