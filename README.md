# Ethernova NFT Marketplace

The first NFT marketplace on the Ethernova blockchain. Buy, sell, and trade unique digital assets powered by NOVA.

## Tech Stack

- **Frontend:** Next.js 16 + TypeScript + Tailwind CSS
- **Wallet:** RainbowKit + wagmi + viem (100% free, no third-party dependencies)
- **Smart Contracts:** Solidity 0.8.24 + OpenZeppelin + Hardhat
- **Chain:** Ethernova (Chain ID: 121525)
- **Currency:** NOVA

## Project Structure

```
├── src/                  # Next.js frontend
│   ├── app/              # Pages (home, sell, profile, NFT detail)
│   ├── components/       # Navbar, NFTCard, Footer, Providers
│   ├── consts/           # Chain config, ABIs, contract addresses
│   └── lib/              # wagmi config
├── contracts/            # Hardhat project
│   ├── contracts/        # Solidity contracts
│   │   ├── EthernovaNFT.sol       # ERC721 NFT collection
│   │   └── NovaMarketplace.sol    # Marketplace contract
│   └── scripts/          # Deploy scripts
```

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm
- A free [WalletConnect](https://cloud.walletconnect.com) project ID

### Installation

```bash
git clone https://github.com/EthernovaDev/ethernova-nft-market.git
cd ethernova-nft-market
npm install
```

### Environment Variables

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Free WalletConnect project ID |

### Development

```bash
npm run dev
```

### Deploy Contracts

```bash
cd contracts
npm install
DEPLOYER_PRIVATE_KEY=your_key npx hardhat run scripts/deploy.js --network ethernova
```

Then update the addresses in `src/consts/addresses.ts`.

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

## Smart Contracts

### EthernovaNFT (ERC721)
- Mintable with configurable price
- ERC721Enumerable for on-chain token listing
- ERC721URIStorage for metadata
- Owner-controlled mint price

### NovaMarketplace
- List NFTs for sale at any price in NOVA
- Buy listed NFTs
- Cancel listings
- Configurable platform fee (default 2.5%)
- ReentrancyGuard protected

## Features

- Browse and search NFT listings
- Buy NFTs with NOVA
- List your NFTs for sale
- View your owned NFTs and active listings
- NFT detail pages with metadata
- Wallet connection via RainbowKit (MetaMask, WalletConnect, etc.)

## License

MIT
