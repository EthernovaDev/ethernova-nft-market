# Ethernova IPFS Storage Node

Ethernova uses a self-hosted IPFS network for decentralized NFT storage. Anyone can run a node to help store and serve NFT images and metadata.

## Why Run a Node?

- Help decentralize Ethernova's NFT storage
- NFT images stay available even if the main server goes down
- Strengthen the Ethernova ecosystem
- Your node automatically pins and serves content from other Ethernova nodes

## Quick Setup (5 minutes)

### 1. Install IPFS (Kubo)

```bash
# Linux (amd64)
wget https://dist.ipfs.tech/kubo/v0.32.1/kubo_v0.32.1_linux-amd64.tar.gz
tar -xzf kubo_v0.32.1_linux-amd64.tar.gz
cd kubo && sudo ./install.sh

# Verify
ipfs --version
```

For other platforms: https://docs.ipfs.tech/install/command-line/

### 2. Initialize the Node

```bash
ipfs init --profile server
```

### 3. Connect to the Ethernova Bootstrap Node

```bash
# Add the main Ethernova IPFS node as a bootstrap peer
ETHERNOVA_PEER="/ip4/207.180.230.125/tcp/4001/p2p/12D3KooWGpZaPF97jL1iDxc6LuSjSGg2LLBLnqsqnFr3o3crQWUo"
ipfs bootstrap add $ETHERNOVA_PEER
```

### 4. Start the Daemon

```bash
ipfs daemon
```

Or as a systemd service:

```bash
sudo cat > /etc/systemd/system/ipfs.service << 'EOF'
[Unit]
Description=IPFS Daemon - Ethernova Storage Node
After=network.target

[Service]
Type=simple
User=$USER
Environment=IPFS_PATH=$HOME/.ipfs
ExecStart=/usr/local/bin/ipfs daemon
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable ipfs
sudo systemctl start ipfs
```

### 5. Verify Connection

```bash
# Check you're connected to the Ethernova node
ipfs swarm peers | grep 12D3KooWGpZaPF97jL1iDxc6LuSjSGg2LLBLnqsqnFr3o3crQWUo

# Try fetching an Ethernova NFT
ipfs cat QmT8h6Nme9Udi2q4u4DqV2KPaibTFNVpnT98HNf1EKdXBA
```

## Optional: Run a Public Gateway

If you want to serve IPFS content over HTTP:

```bash
# Configure gateway port
ipfs config Addresses.Gateway /ip4/0.0.0.0/tcp/8080

# Restart daemon
sudo systemctl restart ipfs
```

Then point your nginx/reverse proxy to `localhost:8080`.

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `Addresses.API` | `/ip4/127.0.0.1/tcp/5001` | API endpoint (keep localhost!) |
| `Addresses.Gateway` | `/ip4/127.0.0.1/tcp/8080` | Gateway endpoint |
| `Datastore.StorageMax` | `10GB` | Max storage for pinned content |
| `Swarm.ConnMgr.HighWater` | `900` | Max connections |

Adjust storage based on your disk space:

```bash
ipfs config Datastore.StorageMax "50GB"
```

## How It Works

1. When an NFT is minted on Ethernova, the image is uploaded to the main IPFS node
2. The IPFS CID (content hash) is stored in the NFT metadata on-chain
3. Your node discovers and caches content from the Ethernova network
4. The more nodes running, the more resilient and fast the storage becomes

## Resources

- [IPFS Docs](https://docs.ipfs.tech/)
- [Ethernova Website](https://ethnova.net)
- [Ethernova Telegram](https://t.me/EthernovaChain)
