# Development
Some notes on how Cawdrivium works

## Getting started

Cawdrivium is developing with hardhats [ethers-waffle-typescript](https://hardhat.org/guides/typescript#typescript-support) for the smart contracts.
The front end is setup to utilize [web3-react](https://github.com/NoahZinsmeister/web3-react) with the [mui](https://mui.com/material-ui/getting-started/installation/) ui framework.
IPFS based message passing, and decentralized persistent storage is on the list, but not yet scoped out

## Hardhat development
`cd hardhat`
`npm install`

hardhat likes taking commands with npx

The development workflow centers on `npx hardhat test`
These tests are located in test/ folder.
They can be individually run for example, by `npx hardhat test ./test/Username.ts`

## How a test works
Every test begins with 2 things. collecting a bunch of accounts, and deploying the smart contracts to the local blockchain network (well, node simulator for hardhat)

  ```
    accounts = await ethers.getSigners();
    ;({diamond: diamondAddress, caw:cawAddress} = await deployDiamond())
  ```
If you are coming from web3.js ethers.js [signers](https://docs.ethers.io/v5/api/signer/#signers) are a bit different

The `deployDiamond()` function is found in the `./scripts/deploy.js` file.  This mocks out the Caw crypto, and the ServiceReciever it was deployed with, and than proceeds to deploy the [diamond multi-facet proxy](https://eips.ethereum.org/EIPS/eip-2535). Much of this code is boilerplate, The functions specific to Cawdrivium are found littered about in the facets/ folder, why the all the variables and app state are contained in the `./libraries/LibAppStorage.sol`  folder.  `./upgradeinitializers/DiamonInit.sol` functions as the defacto constructor() for Cawdrivium.

The message signing vertical slice is not yet set in stone. the [ethers._signTypedData](https://docs.ethers.io/v5/api/signer/#Signer-signTypedData) function is still experimental.  And with the added typescript constraint it is creating alot of extra gronk.  But generally message passing can be learnt from [EIP-712](https://eips.ethereum.org/EIPS/eip-712)


## Web
`npm install ganache --location=global`
`cp ./hardhat/.env.example ./hardhat/.env`
match mnemonic with metamask 
:::warning
ganache plaintexts your private keys and tmux script will bash history your mnemonic
:::
`ganache -i 1337 -m ${MEMNONIC}`
`cd hardhat && npx hardhat run ./scripts/deploy.js --network ganache`





