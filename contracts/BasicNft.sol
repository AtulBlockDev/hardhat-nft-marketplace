pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BasicNft is ERC721{


    event ItemMinted(uint256 indexed tokenId, address indexed minter);

    uint256 private s_token_counter;

     string public constant TOKEN_URI =
        "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json";



    constructor() ERC721("Doggie", "DOG"){
        s_token_counter = 0;

    }

    function mintNft() public returns(uint256){
        _safeMint(msg.sender, s_token_counter);
        emit ItemMinted(s_token_counter, msg.sender);
        s_token_counter += 1;
        return s_token_counter;
    }
    function tokenURI(uint256) public view override returns (string memory){
        return TOKEN_URI;
    } 

    function getTokenCounter() public view returns(uint256){
        return s_token_counter;
    }
}