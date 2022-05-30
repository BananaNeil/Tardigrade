import { ethers } from "hardhat";
import { Signer, BigNumber } from "ethers";

const {
  getSelectors,
  FacetCutAction,
  removeSelectors,
  findAddressPositionInFacets
} = require('../scripts/libraries/diamond.js')

const { deployDiamond } = require('../scripts/deploy.js')

const { assert } = require('chai')
describe("UsernameFacet", function () {
  let accounts: Signer[];
  let diamondAddress
  let usernameFacet:any
  before(async () => {
    accounts = await ethers.getSigners();
    diamondAddress = await deployDiamond()
    usernameFacet = await ethers.getContractAt('UsernameFacet', diamondAddress, accounts[0])
    console.log(usernameFacet)
  })

  it("burns caw to mint NFT", async () => {
    // Do something with the accounts
    const oneCaw = ethers.utils.parseEther('1')
    console.log(oneCaw)
    const createUser = await usernameFacet.createUser(oneCaw, 'joemcgee')
    
  });
});
