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

function* idMaker() {
  var index = 0;
  while (true)
    yield index++;
}

describe("UsernameFacet", function () {
  let genId = idMaker()
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
        await cawToken.transfer(account.address,  ethers.utils.parseEther('1000000000000'))
      })
    )
  })

  it("burns caw to mint Username NFT", async () => {
    console.log('===================================')
    const joe = accounts[1]
    const nftId = genId.next().value
    // Do something with the accounts
    const millionCaw = ethers.utils.parseEther('1000000')
    const approve = await cawToken.connect(joe).approve(diamondAddress, millionCaw)

    const username = 'joemcgee'
    const usernameCost = await usernameFacet.connect(joe).getUsernameCost(username.length)
    const joeBalance1 = await cawToken.balanceOf(joe.address)

    const createUser = await usernameFacet.connect(joe).createUser(username)

    const joeBalance2 = await cawToken.balanceOf(joe.address)

    expect(joeBalance1.sub(joeBalance2)).to.equal(usernameCost)

    const usernameNft = await usernameFacet.balanceOf(joe.address, nftId)
    expect(usernameNft).to.equal(1)
    
    const nftIdFromUsername = await usernameFacet.getNftIdByUsername(username)
    expect(nftIdFromUsername).to.equal(nftId)

    const usernameFromNftId = await usernameFacet.getUsernameByNftId(nftId)
    expect(usernameFromNftId).to.equal(username)
  });

  it("usernames longer than 8 are priced as 8", async () => {
    const millionCaw = ethers.utils.parseEther('1000000')
    const mary = accounts[2]
    const nftId = genId.next().value
    const approve = await cawToken.connect(mary).approve(diamondAddress, millionCaw)

    const username = 'averylongnameforausername'
    const usernameCost = await usernameFacet.connect(mary).getUsernameCost(username.length)
    const longNameBalance1 = await cawToken.balanceOf(mary.address)

    const createUser = await usernameFacet.connect(mary).createUser(username)

    const longNameBalance2 = await cawToken.balanceOf(mary.address)
    expect(longNameBalance1.sub(longNameBalance2)).to.equal(usernameCost)

    const usernameNft = await usernameFacet.balanceOf(mary.address, nftId)
    expect(usernameNft).to.equal(1)
    
    const nftIdFromUsername = await usernameFacet.getNftIdByUsername(username)
    expect(nftIdFromUsername).to.equal(nftId)

    const usernameFromNftId = await usernameFacet.getUsernameByNftId(nftId)
    expect(usernameFromNftId).to.equal(username)
  })

  it("length 2 username", async () => {
    const approveCaw = ethers.utils.parseEther('240000000000')
    const ai = accounts[3]
    const nftId = genId.next().value
    const approve = await cawToken.connect(ai).approve(diamondAddress, approveCaw)

    const username = 'ai'
    const usernameCost = await usernameFacet.connect(ai).getUsernameCost(username.length)
    const longNameBalance1 = await cawToken.balanceOf(ai.address)

    const createUser = await usernameFacet.connect(ai).createUser(username)

    const longNameBalance2 = await cawToken.balanceOf(ai.address)
    expect(longNameBalance1.sub(longNameBalance2)).to.equal(usernameCost)

    const usernameNft = await usernameFacet.balanceOf(ai.address, nftId)
    expect(usernameNft).to.equal(1)
    
    const nftIdFromUsername = await usernameFacet.getNftIdByUsername(username)
    expect(nftIdFromUsername).to.equal(nftId)

    const usernameFromNftId = await usernameFacet.getUsernameByNftId(nftId)
    expect(usernameFromNftId).to.equal(username)
  })
  it("length 1 username", async () => {
    const trillionCaw = ethers.utils.parseEther('1000000000000')
    const ai = accounts[4]
    const nftId = genId.next().value
    const approve = await cawToken.connect(ai).approve(diamondAddress, trillionCaw)

    const username = 'a'
    const usernameCost = await usernameFacet.connect(ai).getUsernameCost(username.length)
    console.log('cost', usernameCost)
    const longNameBalance1 = await cawToken.balanceOf(ai.address)

    const createUser = await usernameFacet.connect(ai).createUser(username)

    const longNameBalance2 = await cawToken.balanceOf(ai.address)
    expect(longNameBalance1.sub(longNameBalance2)).to.equal(usernameCost)

    const usernameNft = await usernameFacet.balanceOf(ai.address, nftId)
    expect(usernameNft).to.equal(1)
    
    const nftIdFromUsername = await usernameFacet.getNftIdByUsername(username)
    expect(nftIdFromUsername).to.equal(nftId)

    const usernameFromNftId = await usernameFacet.getUsernameByNftId(nftId)
    expect(usernameFromNftId).to.equal(username)
  })
});
