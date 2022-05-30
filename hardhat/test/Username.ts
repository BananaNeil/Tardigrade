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
  let diamondAddress:any
  let cawAddress:any
  
  let cawToken:any
  let usernameFacet:any
  before(async () => {
    accounts = await ethers.getSigners();
    const {diamond: diamondAddress, caw:cawAddress} = await deployDiamond()
    cawToken = await ethers.getContractAt('StandardERC20', cawAddress)
    usernameFacet = await ethers.getContractAt('UsernameFacet', diamondAddress, accounts[0])
    console.log(usernameFacet)

    //Mint and distribute Caw
  })

  it("burns caw to mint NFT", async () => {
    // Do something with the accounts
    const oneCaw = ethers.utils.parseEther('1')
    console.log(oneCaw)
    const approve = await cawToken.connect(accounts[1]).approve(diamondAddress, ethers.utils.parseEther('1000000000000'))
    const createUser = await usernameFacet.createUser('joemcgee')
    
  });
});
