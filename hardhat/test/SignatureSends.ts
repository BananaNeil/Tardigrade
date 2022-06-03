import hre, { ethers } from "hardhat";
import { BigNumber, Signer } from "ethers";
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
const { expect,assert } = require('chai')
import {
  encrypt,
  recoverPersonalSignature,
  recoverTypedSignature,
  TypedMessage,
  MessageTypes,
  SignTypedDataVersion
} from '@metamask/eth-sig-util';
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



describe("ReceiverPaysFacet", async () => {
  let genId = idMaker()
  let accounts: SignerWithAddress[]
  let diamondAddress: string
  let cawAddress: string
  let cawToken:any
  let usernameFacet:any
  let receiverPaysFacet:any
  before(async () => {
    accounts = await ethers.getSigners();
    ;({diamond: diamondAddress, caw:cawAddress} = await deployDiamond())
    cawToken = await ethers.getContractAt('StandardERC20', cawAddress)
    usernameFacet = await ethers.getContractAt('UsernameFacet', diamondAddress, accounts[0])
    receiverPaysFacet = await ethers.getContractAt('ReceiverPaysFacet', diamondAddress, accounts[0])
    const trillionCaw = ethers.utils.parseEther('1000000000000')
    const billionCaw = ethers.utils.parseEther('1000000000')
    await Promise.all(
      accounts.map(async (account, i) => {
        await cawToken.transfer(account.address,  trillionCaw)
        await cawToken.connect(account).approve(diamondAddress, billionCaw)
        const username = `account${i}`
        await usernameFacet.connect(account).createUser(username)
      })
    )
  })

  it("allows a user to deposit CAW into their nftid", async () => {
    const thousandCaw = ethers.utils.parseEther('1000')
    const nftid = await usernameFacet.getNftIdByUsername('account1')
    await receiverPaysFacet.connect(accounts[1]).depositCaw(nftid, thousandCaw )
    const nftidBalance = await receiverPaysFacet.getCawDepositsByNftId(nftid)
    expect(nftidBalance).to.equal(thousandCaw)
  })
  it("a user cannot deposit into an nft they do not own", async () => {
    const thousandCaw = ethers.utils.parseEther('1000')
    const nftid = await usernameFacet.getNftIdByUsername('account1')
    try {
      await receiverPaysFacet.connect(accounts[2]).depositCaw(nftid, thousandCaw)
      assert.fail('failed to prevent deposit ')
    } catch (e:any) {
      assert.include(e.message, 'ReceiverPaysFacet::must own nft')
    }
  })
  it("another user deposits caw and sig sends a tip", async () => {
    const thousandCaw = ethers.utils.parseEther('1000')
    const hundredCaw = ethers.utils.parseEther('100')
    const senderNftId = await usernameFacet.getNftIdByUsername('account2')
    const claimerNftId = await usernameFacet.getNftIdByUsername('account1')
    await receiverPaysFacet.connect(accounts[2]).depositCaw(senderNftId, thousandCaw)
    const chainId = (await ethers.provider.getNetwork()).chainId
    const networkId = 1 // hardhat doesn't seem to want to observe networkId

    const domain =  {
      chainId: chainId,
      name: 'Cawdrivium',
      verifyingContract: diamondAddress,
      version: '1'
    }
    console.log(Number(senderNftId))
    const deadline = Math.floor(new Date().getTime() / 1000) + 3600
    const message = {
      senderNftId: Number(senderNftId),
      claimerNftId: Number(claimerNftId),
      amount: Number(ethers.utils.formatEther(hundredCaw)),
      deadline: deadline
    }

    const types: MessageTypes = {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
      Tip: [
        { name: 'senderNftId', type: 'uint256' },
        { name: 'claimerNftId', type: 'uint256' },
        { name: 'amount', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },

      ]
    }

    const ethersTipType = {
      Tip: [
        { name: 'senderNftId', type: 'uint256' },
        { name: 'claimerNftId', type: 'uint256' },
        { name: 'amount', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
      ]
    }

    const msgParams: TypedMessage<MessageTypes> = {
      domain,
      message,
      primaryType: 'Tip',
      types
    }


    const signature:string = await accounts[2]._signTypedData(
      domain,
      ethersTipType,
      message
    )
    console.log(signature)
    const signatureSans0x = signature.substring(2)
    console.log(signature)
    console.log('sender', accounts[2].address)
    const r = '0x' + signatureSans0x.substring(0,64);
    const s = '0x' + signatureSans0x.substring(64,128);
    const v = parseInt(signatureSans0x.substring(128,130), 16)
    console.log('v: ', v)
    console.log('r: ', r)
    console.log('s: ', s)
    const recoverAddr = recoverTypedSignature({data: msgParams, signature, version: SignTypedDataVersion.V4 })
    console.log(recoverAddr)
    console.log(accounts[2].address)
    
    expect(recoverAddr).to.equal(accounts[2].address.toLowerCase())

    await receiverPaysFacet.connect(accounts[1]).claimPayment(
      v,
      r,
      s,
      Number(claimerNftId),
      Number(senderNftId),
      deadline,
      Number(ethers.utils.formatEther(hundredCaw)),
    )

    /*

     */
  })
})
