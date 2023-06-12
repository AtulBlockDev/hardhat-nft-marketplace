const { getNamedAccounts, ethers } = require("hardhat")

async function mintAndList(){

   
    const PRICE = ethers.utils.parseEther("0.1")

    const {deployer} = await getNamedAccounts();
    const basicNft = await ethers.getContract("BasicNft", deployer)
    const NftMarketPlace = await ethers.getContract("NftMarketPlace", deployer)
    
    const tx = await basicNft.mintNft()
    const txResponse = await tx.wait(1)
    const tokenId = await txResponse.events[0].args.tokenId
    console.log(`Nft Minted... Transaction Hash: ${tx.hash}`)
    const approveTx = await basicNft.approve(NftMarketPlace.address, tokenId)
    const approveTxResponse = await approveTx.wait(1)
    console.log(`Approved For Marketplace! Trasanction Hash: ${approveTx.hash}......`)
    const listTx = await NftMarketPlace.listItem(basicNft.address, tokenId, PRICE);
    const listTxResponse = await listTx.wait(1);
    console.log(`ItemListed!..... Transaction Hash: ${listTx.hash}`)
    

}

mintAndList()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })