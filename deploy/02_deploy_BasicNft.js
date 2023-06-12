const { ethers, network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async function ({ deployments, getNamedAccounts }) {
    deployer = (await getNamedAccounts()).deployer
    const { deploy, log } = await deployments

    const args = []

    const basicNft = await deploy("BasicNft", {
        contract: "BasicNft",
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API) {
        await verify(basicNft.address, args)
    }
}
module.exports.tags = ["all", "basicNft", "main"]
