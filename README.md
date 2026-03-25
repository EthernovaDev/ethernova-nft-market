# Ethernova NFT Marketplace

The first NFT marketplace on the Ethernova blockchain. Buy, sell, and trade unique digital assets powered by NOVA.

**Live:** https://nft.ethnova.net

## Tech Stack

- **Frontend:** Next.js 16 + TypeScript + Tailwind CSS
- **Wallet:** wagmi + viem (injected connector, no third-party services)
- **Smart Contracts:** Solidity 0.8.24 + OpenZeppelin
- **Storage:** Self-hosted IPFS node (images + metadata)
- **Database:** PostgreSQL (user profiles, collections)
- **Chain:** Ethernova (Chain ID: 121525)
- **Currency:** NOVA

## Architecture

```
Browser (MetaMask) ──> Next.js Frontend ──> Ethernova RPC
                            │
                            ├── /api/upload ──> IPFS Node (pin + store)
                            ├── /api/profile ──> PostgreSQL
                            ├── /api/price ──> Klingex API (NOVA/USDT)
                            └── /api/coingecko ──> Price feed for Explorer
```

## IPFS Setup

NFT images and metadata are stored on a self-hosted IPFS node. No dependency on Pinata, NFT.Storage, or any third-party pinning service.

### How it works

1. User uploads an image via the Mint page
2. Image is uploaded to the IPFS node via `/api/upload` → IPFS HTTP API (port 5001)
3. IPFS returns a CID (content hash)
4. Metadata JSON (name, description, image CID) is also uploaded to IPFS
5. The NFT is minted on-chain with `tokenURI = ipfs://<metadata-CID>`
6. Images are served via the public gateway: `https://ipfs.ethnova.net/ipfs/<CID>`

### IPFS Gateway

- **Public gateway:** https://ipfs.ethnova.net
- **IPFS API:** `127.0.0.1:5001` (localhost only)
- **IPFS Gateway port:** `127.0.0.1:8088` (proxied via nginx)
- **Nginx caching:** 24h cache on gateway responses for performance

### IPFS API Proxy

The marketplace frontend runs an API proxy at `/api/ipfs/[cid]` that fetches content from the local IPFS node. This allows the frontend to resolve `ipfs://` URIs without exposing the IPFS API.

### Explorer Integration

The Ethernova Explorer (Blockscout) resolves NFT images from the `tokenURI` on-chain. The IPFS gateway URL is configured in Blockscout via:

```
IPFS_GATEWAY_URL=https://ipfs.ethnova.net/ipfs
```

An `/ipfs/` proxy is also configured on the explorer's nginx to serve images from the same origin.

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── page.tsx              # Home - browse listings
│   │   ├── mint/                 # Mint new NFTs
│   │   ├── sell/                 # List NFTs for sale
│   │   ├── profile/              # User profile + owned NFTs
│   │   ├── profile/edit/         # Edit profile (avatar, bio, links)
│   │   ├── admin/                # Admin panel (verify users)
│   │   ├── nft/[collection]/[tokenId]/ # NFT detail page
│   │   └── api/
│   │       ├── upload/           # Upload files to IPFS
│   │       ├── ipfs/[cid]/       # IPFS content proxy
│   │       ├── profile/          # User profile CRUD
│   │       ├── price/            # NOVA/USD price
│   │       └── coingecko/        # CoinGecko-compatible price API
│   ├── components/               # Navbar, NFTCard, ConnectWallet, etc.
│   ├── consts/                   # Chain config, ABIs, contract addresses
│   └── lib/                      # wagmi config, DB, auth, IPFS helpers
├── contracts/
│   ├── contracts/
│   │   ├── EthernovaNFT.sol      # ERC721 NFT collection
│   │   └── NovaMarketplace.sol   # Marketplace contract (2.5% fee)
│   └── build/                    # Compiled ABIs + bytecode
└── public/                       # Static assets
```

## Getting Started

### Prerequisites

- Node.js 20+ (LTS)
- npm
- MetaMask or any injected wallet

### Installation

```bash
git clone https://github.com/EthernovaDev/ethernova-nft-market.git
cd ethernova-nft-market
npm install
```

### Environment Variables

```bash
# Required for profile features (PostgreSQL)
DATABASE_URL=postgresql://user:pass@localhost:5432/nftmarket
```

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

## Deployed Contracts

| Contract | Address |
|----------|---------|
| EthernovaNFT (ENFT) | `0x8f6671a37578e77e79e15959531da97baf42419f` |
| NovaMarketplace | `0xb21c06d94435839950f30649b17d2333bcb25c59` |

## Network Info

| Property | Value |
|----------|-------|
| Chain Name | Ethernova |
| Chain ID | 121525 |
| Currency | NOVA |
| RPC | https://rpc.ethnova.net |
| Explorer | https://explorer.ethnova.net |
| NFT Marketplace | https://nft.ethnova.net |
| IPFS Gateway | https://ipfs.ethnova.net |

## Smart Contracts

### EthernovaNFT (ERC721)
- Free mint (only gas cost)
- ERC721Enumerable for on-chain token listing
- ERC721URIStorage for IPFS metadata
- Owner-controlled mint price

### NovaMarketplace
- List NFTs for sale at any price in NOVA
- Buy listed NFTs
- Cancel listings
- 2.5% platform fee
- ReentrancyGuard protected

## Features

- Browse and search NFT listings
- Mint NFTs with image upload to IPFS
- Buy/sell NFTs with NOVA
- USD price display (via Klingex exchange)
- User profiles with avatar, bio, social links
- Admin verification system (blue check)
- Mobile responsive with hamburger menu
- MetaMask deep link for mobile browsers
- Self-hosted IPFS for decentralized storage
- NOVA price feed for Explorer

## Price Feed

The marketplace provides a CoinGecko-compatible API at `/api/coingecko` that serves the NOVA/USD price from Klingex exchange. This is used by the Ethernova Explorer to display NOVA prices.

## Decentralized Storage

### How NFT data is stored

All NFT images and metadata are stored on **IPFS** (InterPlanetary File System). When someone mints an NFT:

1. Image is uploaded to IPFS → returns a **CID** (content hash)
2. Metadata JSON is uploaded to IPFS → returns another CID
3. The on-chain `tokenURI` is set to `ipfs://<metadata-CID>`

The `ipfs://` protocol is **universal** - any IPFS node in the world can serve this content. If our gateway (`ipfs.ethnova.net`) goes down, the content is still accessible via:

- `https://ipfs.io/ipfs/<CID>`
- `https://dweb.link/ipfs/<CID>`
- `https://cloudflare-ipfs.com/ipfs/<CID>`
- Any other IPFS gateway
- Directly via any IPFS node: `ipfs cat <CID>`

### Run your own IPFS node (help pin Ethernova NFTs)

Anyone can run an IPFS node to help keep Ethernova NFT data available. The more nodes that pin the content, the more decentralized and resilient it becomes.

#### Quick setup (Ubuntu/Debian)

```bash
# 1. Install IPFS
wget https://dist.ipfs.tech/kubo/v0.32.1/kubo_v0.32.1_linux-amd64.tar.gz
tar xzf kubo_v0.32.1_linux-amd64.tar.gz
sudo mv kubo/ipfs /usr/local/bin/
rm -rf kubo kubo_v0.32.1_linux-amd64.tar.gz

# 2. Initialize
export IPFS_PATH=/var/lib/ipfs
ipfs init --profile server

# 3. Start the daemon
ipfs daemon &

# 4. Connect to the Ethernova IPFS node (bootstrap)
ipfs swarm connect /dns4/ipfs.ethnova.net/tcp/4001/p2p/<PEER_ID>

# 5. Pin all Ethernova NFTs (they will be fetched from the network)
# Example: pin a specific NFT image
ipfs pin add QmSsTvXPUCgzmUgGCVTi2CbatnRXDcbm39fvJrknMDvbky
```

#### Run as a service

```bash
# Create systemd service
sudo tee /etc/systemd/system/ipfs.service > /dev/null << 'EOF'
[Unit]
Description=IPFS Daemon
After=network.target

[Service]
User=ipfs
Environment=IPFS_PATH=/var/lib/ipfs
ExecStart=/usr/local/bin/ipfs daemon --enable-gc
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable ipfs
sudo systemctl start ipfs
```

#### Optional: Run a public gateway

If you want to serve NFT images via your own gateway:

```bash
# IPFS gateway runs on port 8080 by default
# Set up nginx reverse proxy
server {
    listen 443 ssl;
    server_name ipfs.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        add_header Cache-Control "public, max-age=86400, immutable";
        add_header Access-Control-Allow-Origin "*";
    }
}
```

#### Docker

```bash
docker run -d \
  --name ipfs-node \
  -p 4001:4001 \
  -p 8080:8080 \
  -v ipfs-data:/data/ipfs \
  ipfs/kubo:latest
```

### Why this matters

- **No single point of failure** - if one node goes down, others still serve the content
- **Content-addressed** - the CID is a hash of the content, so it can't be tampered with
- **Permanent** - as long as at least one node pins the content, it's available forever
- **Censorship resistant** - no single entity can take down the content

## License

MIT
