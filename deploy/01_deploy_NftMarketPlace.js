const {network} = require("hardhat")
const { verify } = require("../utils/verify")
const {developmentChains} = require("../helper-hardhat-config")


module.exports = async function({getNamedAccounts, deployments}){
    const {deployer} = await getNamedAccounts();
    const{deploy, log} = await deployments;

    args= [];

    const NftMarketPlace = await  deploy("NftMarketPlace", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1

    })
     if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API) {
         log("Verifying...")
         await verify(NftMarketPlace.address, args)
     }


}
module.exports.tags = ["all", "nftmarketplace"]