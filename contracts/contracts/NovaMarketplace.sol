// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NovaMarketplace is Ownable, ReentrancyGuard {
    struct Listing {
        uint256 listingId;
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price;
        bool isActive;
    }

    uint256 public listingCount;
    uint256 public platformFeeBps; // basis points (e.g., 250 = 2.5%)
    mapping(uint256 => Listing) public listings;

    event NFTListed(
        uint256 indexed listingId,
        address indexed seller,
        address nftContract,
        uint256 tokenId,
        uint256 price
    );
    event NFTSold(
        uint256 indexed listingId,
        address indexed buyer,
        address indexed seller,
        uint256 price
    );
    event ListingCancelled(uint256 indexed listingId);

    constructor(uint256 _platformFeeBps) {
        require(_platformFeeBps <= 1000, "Fee too high"); // max 10%
        platformFeeBps = _platformFeeBps;
    }

    function listNFT(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) external {
        require(price > 0, "Price must be > 0");

        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not the owner");
        require(
            nft.isApprovedForAll(msg.sender, address(this)) ||
                nft.getApproved(tokenId) == address(this),
            "Marketplace not approved"
        );

        uint256 listingId = listingCount++;
        listings[listingId] = Listing({
            listingId: listingId,
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            price: price,
            isActive: true
        });

        emit NFTListed(listingId, msg.sender, nftContract, tokenId, price);
    }

    function buyNFT(uint256 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Listing not active");
        require(msg.value >= listing.price, "Insufficient payment");

        listing.isActive = false;

        // Calculate platform fee
        uint256 fee = (listing.price * platformFeeBps) / 10000;
        uint256 sellerProceeds = listing.price - fee;

        // Transfer NFT to buyer
        IERC721(listing.nftContract).safeTransferFrom(
            listing.seller,
            msg.sender,
            listing.tokenId
        );

        // Pay seller
        (bool success, ) = listing.seller.call{value: sellerProceeds}("");
        require(success, "Payment to seller failed");

        // Refund excess payment
        if (msg.value > listing.price) {
            (bool refunded, ) = msg.sender.call{value: msg.value - listing.price}("");
            require(refunded, "Refund failed");
        }

        emit NFTSold(listingId, msg.sender, listing.seller, listing.price);
    }

    function cancelListing(uint256 listingId) external {
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Listing not active");
        require(listing.seller == msg.sender, "Not the seller");

        listing.isActive = false;
        emit ListingCancelled(listingId);
    }

    function getActiveListings() external view returns (Listing[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < listingCount; i++) {
            if (listings[i].isActive) activeCount++;
        }

        Listing[] memory active = new Listing[](activeCount);
        uint256 idx = 0;
        for (uint256 i = 0; i < listingCount; i++) {
            if (listings[i].isActive) {
                active[idx++] = listings[i];
            }
        }
        return active;
    }

    function getListing(uint256 listingId) external view returns (Listing memory) {
        return listings[listingId];
    }

    function setPlatformFee(uint256 _platformFeeBps) external onlyOwner {
        require(_platformFeeBps <= 1000, "Fee too high");
        platformFeeBps = _platformFeeBps;
    }

    function withdrawFees() external onlyOwner {
        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        require(success, "Withdraw failed");
    }
}
