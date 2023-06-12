const {ethers, network} = require("hardhat")
const fs = require("fs")

const frontEndContractsFile = "../next-js-nftmp/constants/networkMapping.json"
const frontEndAbiFile ="../next-js-nftmp/constants/"


module.exports = async function(){
    if(process.env.UPDATE_FRONT_END){
        await updateContractAddress()
        await updateAbi()
       
    }
}
async function updateAbi(){
    const nftMarketplace = await ethers.getContract("NftMarketPlace")
    fs.writeFileSync(`${frontEndAbiFile}NftMarketplace.json`, nftMarketplace.interface.format(ethers.utils.FormatTypes.json))
    const basicNft = await ethers.getContract("BasicNft")
    fs.writeFileSync(
        `${frontEndAbiFile}BasicNft.json`,
        basicNft.interface.format(ethers.utils.FormatTypes.json)
    )

}



async function updateContractAddress(){
    const nftMarketPlaceContract = await ethers.getContract("NftMarketPlace")
    const chainId = network.config.chainId.toString()
    const currentAddress = JSON.parse(fs.readFileSync(frontEndContractsFile, "utf8"))

    if(chainId in currentAddress){

    if(!currentAddress[chainId]["NftMarketPlace"].includes(nftMarketPlaceContract.address)){
        currentAddress[chainId]["NftMarketPlace"].push(nftMarketPlaceContract.address)
    }
}
    else{
        currentAddress[chainId] = {NftMarketPlace : [nftMarketPlaceContract.address]}
    }
    fs.writeFileSync(frontEndContractsFile, JSON.stringify(currentAddress))
    


}
module.exports.tags = ["all", "frontend"]