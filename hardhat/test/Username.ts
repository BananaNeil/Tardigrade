import { ethers } from "hardhat";
import { BigNumber, Signer } from "ethers";
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
const { expect } = require('chai')

const burnAddress ='0x000000000000000000000000000000000000dEaD'

const {
  getSelectors,
  FacetCutAction,
  removeSelectors,
  findAddressPositionInFacets
} = require('../scripts/libraries/diamond.js')

const { deployDiamond } = require('../scripts/deploy.js')

describe("UsernameFacet", function () {
  let accounts: SignerWithAddress[]
  let diamondAddress: string
  let cawAddress: string

  let cawToken:any
  let usernameFacet:any
  before(async () => {
    accounts = await ethers.getSigners();
    ;({diamond: diamondAddress, caw:cawAddress} = await deployDiamond())
    cawToken = await ethers.getContractAt('StandardERC20', cawAddress)
    usernameFacet = await ethers.getContractAt('UsernameFacet', diamondAddress, accounts[0])

    //Mint and distribute Caw
    Promise.all(
      accounts.map(async (account) => {
        await cawToken.transfer(account.address,  ethers.utils.parseEther('1000000000'))
      })
    )
  })

  it("burns caw to mint NFT", async () => {
    console.log('===================================')
    // Do something with the accounts
    const millionCaw = ethers.utils.parseEther('1000000')
    const approve = await cawToken.connect(accounts[1]).approve(diamondAddress, millionCaw)

    const username = 'joemcgee'
    const usernameCost = await usernameFacet.connect(accounts[1]).getUsernameCost(username.length)
    const joeBalance1 = await cawToken.balanceOf(accounts[1].address)

    const createUser = await usernameFacet.connect(accounts[1]).createUser(username)

    const joeBalance2 = await cawToken.balanceOf(accounts[1].address)

    console.log(joeBalance1.sub(joeBalance2))
    console.log('usernameCost', usernameCost)
    expect(joeBalance1.sub(joeBalance2)).to.equal(usernameCost)

  });
});
