// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
 //error
error NftMarketPlace_PriceMustBeAboveZero();
error NftMarketPlace_NotApprovedForMarketPlace();
error NftMarketPlace_AlreadyListed(address nftAddress,
uint256  tokenId);
error NftMarketPlace_NotListed(address nftAddress,uint256 tokenId);
error NftMarketPlace_NotOwner();
error NftMarketPlace_NoProceeds();
error NftMarketPlace_PriceNotMet(address nftAddress, uint256 tokenId, uint256 price);
contract NftMarketPlace{

    //events

    event ItemListed(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256  price);

        event ItemBought(
            address indexed buyer,
            address indexed nftAddress,
            uint256 indexed tokenId,
            uint256 price
            
        );
        event nftMarketPlace_ItemRemoved(
            address indexed seller,
            address indexed nftAddress,
            uint256 indexed tokenId


        );
        event ItemUpdated
        (address indexed seller, 
        address indexed nftAddress, 
        uint indexed tokenId, 
        uint256 newPrice);
        //struct

    struct Listing{
        uint256 price;
        address seller;
    }
    //mappings
    mapping(address => mapping(uint256 => Listing))
    private s_listings; 
    mapping(address => uint256) private s_proceeds;

   // modifiers
   modifier notListed(address nftAddress, uint256 tokenId, address owner){
    Listing memory listing = s_listings[nftAddress][tokenId];
    if(listing.price > 0){
        revert NftMarketPlace_AlreadyListed(nftAddress, tokenId);
    }
    _;
    
   }
   modifier isOwner(
        address nftAddress, 
        uint256 tokenId, 
        address spender){
            IERC721 nft = IERC721(nftAddress);
            address owner = nft.ownerOf(tokenId);
            if(spender != owner){
                revert NftMarketPlace_NotOwner();
            }
            _;
        }

        modifier isListed(address nftAddress, uint256 tokenId){
    Listing memory listing = s_listings[nftAddress][tokenId];
    if(listing.price <= 0){
        revert NftMarketPlace_NotListed(nftAddress, tokenId);
    }
    _;
    
   }
    //MainFunctions

    //listing the item

    function listItem(
        address nftAddress,
        uint256 tokenId,
        uint256 price) 
        external notListed(nftAddress, tokenId, msg.sender)
        isOwner(nftAddress, tokenId, msg.sender){

        if(price <= 0){
            revert NftMarketPlace_PriceMustBeAboveZero();

            //owner can give the contract approval to sell 
            //their NFT, for the marketplace contract to get approval,
            // we have to use IERC20 interface from openzeppelin
        }
        IERC721 nft = IERC721(nftAddress);
        if(nft.getApproved(tokenId) != address(this)){
            revert NftMarketPlace_NotApprovedForMarketPlace();
        }
        s_listings[nftAddress][tokenId] = Listing(price, msg.sender);
        emit ItemListed(msg.sender, nftAddress, tokenId, price );

    }
    //buying the item
    function buyitem(address nftAddress, uint256 tokenId) 
    external isListed (nftAddress, tokenId) payable{
        Listing memory listedItem = s_listings[nftAddress][tokenId];
        if(msg.value < listedItem.price){
            revert NftMarketPlace_PriceNotMet(nftAddress, tokenId, listedItem.price);
        }
        //updating the Nftowner's balance....
        s_proceeds[listedItem.seller] += msg.value;

        delete(s_listings[nftAddress][tokenId]);
        IERC721(nftAddress).safeTransferFrom(listedItem.seller,
        msg.sender, tokenId);

        emit ItemBought( msg.sender, nftAddress, tokenId, listedItem.price);


        

    }

    function cancelListing(address nftAddress, uint256 tokenId) 
    external 
    isListed(nftAddress, tokenId) isOwner(nftAddress, tokenId, msg.sender){
        delete(s_listings[nftAddress][tokenId]);
        emit nftMarketPlace_ItemRemoved(msg.sender, nftAddress, tokenId);
    }
    function updateListing(address nftAddress, uint256 tokenId, uint256 newPrice) external isListed(nftAddress, tokenId)
     isOwner(nftAddress, tokenId, msg.sender){
        s_listings[nftAddress][tokenId].price = newPrice;
        emit ItemUpdated(msg.sender, nftAddress, tokenId, newPrice);
    }

    function withdrawProceeds() external{
        uint256 proceeds = s_proceeds[msg.sender];
        if(proceeds<=0){
            revert NftMarketPlace_NoProceeds();
        }
        s_proceeds[msg.sender] = 0;

        (bool success,) = payable(msg.sender).call{value: proceeds}("");
        require(success, "Transfer failed");
    }
    


    //getter functions

    
    function getListing(address nftAddress, uint256 tokenId)
        external
        view
        returns (Listing memory)
    {
        return s_listings[nftAddress][tokenId];
    }

    function getProceeds(address seller) external view returns (uint256) {
        return s_proceeds[seller];
    }
}
//steps to do
//1: listItem: List Nfts on the marketplace
// 2: buyItem: Buy the NFTs
// 3:canceltem: Cancel a listing
// 4: updateListing: Update Price
// 5:withdrawProceeds: Withdraw payment for my bought NFTs
