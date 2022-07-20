// import { task  } from 'hardhat/config'
import '@nomiclabs/hardhat-waffle'
import '@typechain/hardhat'
import '@nomiclabs/hardhat-ethers'

import chai from "chai";
import { solidity } from "ethereum-waffle";
import 'hardhat-gas-reporter'
chai.use(solidity);
// This is a sample Hardhat task. To learn how to create your own go to
// // https://hardhat.org/guides/create-task.html
// task("accounts", "Prints the list of accounts", async (args, hre) => {
//   const accounts = await hre.ethers.getSigners();
//
//     for (const account of accounts) {
//         console.log(await account.address);
//           }
//           });
//
//     }
// })

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [
      { version: '0.8.14' },
      { version: '0.7.5' }
    ]
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    ganache: {
      chainId: 1337,
      url: 'http://127.0.0.1:8545',
    }
  },
  gasReporter: {
    enabled: false
  }
}
