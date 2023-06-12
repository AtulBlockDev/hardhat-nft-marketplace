/** @type import('hardhat/config').HardhatUserConfig */
require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("hardhat-deploy");

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API = process.env.ETHERSCAN_API;
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;


module.exports = {
    solidity: {
        compilers: [
            {
                version: "0.8.9",
            },
            {
                version: "0.8.4",
            },
            {
                version: "0.8.0",
            },
            {
                version: "0.4.19",
            },
            {
                version: "0.6.12",
            },
            {
                version: "0.6.0",
            },
        ],
    },
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            blockConfirmations: 1,
        },
        localhost: {
            chainId: 31337,
            blockConfirmations: 1,
        },

        goerli: {
            url: GOERLI_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 5,
            blockConfirmations: 6,
        },
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 11155111,
            blockConfirmations: 6,
        },
    },

    namedAccounts: {
        deployer: {
            default: 0,
        },
        user: {
            default: 1
        }
    },
    etherscan: {
        apiKey: ETHERSCAN_API,
    },
}
