import hre, { ethers } from "hardhat";
import { BigNumber, Signer } from "ethers";
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { signTypedData } from './utils/utils'
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
    const claimerDeposits1 = await receiverPaysFacet.getCawDepositsByNftId(claimerNftId)
    // sender deposits caw
    await receiverPaysFacet.connect(accounts[2]).depositCaw(senderNftId, thousandCaw)
    const senderDeposits1 = await receiverPaysFacet.getCawDepositsByNftId(senderNftId)
    const chainId = (await ethers.provider.getNetwork()).chainId
    const networkId = 1 // hardhat doesn't seem to want to observe networkId

    const domain =  {
      chainId: chainId,
      name: 'Cawdrivium',
      verifyingContract: diamondAddress,
      version: '1'
    }
    const deadline = Math.floor(new Date().getTime() / 1000) + 3600
    const message = {
      senderNftId: Number(senderNftId),
      claimerNftId: Number(claimerNftId),
      amount: hundredCaw.toString(),
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
    /*
    console.log(
      signTypedData(
        SigningKey(),
        domain,
        ethersTipType,
        message
      )
    )
   */
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
      hundredCaw.toString(),
    )


    const senderDeposits2 = await receiverPaysFacet.getCawDepositsByNftId(senderNftId)
    const claimerDeposits2 = await receiverPaysFacet.getCawDepositsByNftId(claimerNftId)
    //console.log(ethers.utils.formatEther(senderDeposits2))
    expect(claimerDeposits1.add(hundredCaw)).to.equal(claimerDeposits2)
    expect(senderDeposits1.sub(hundredCaw)).to.equal(senderDeposits2)

    /*

     */
  })


  it("", async () => {
    const thousandCaw = ethers.utils.parseEther('1000')
    const hundredCaw = ethers.utils.parseEther('100')

    //const acc5NftId = await usernameFacet.getNftIdByUsername('account5')
    //await receiverPaysFacet.connect(accounts[5]).depositCaw(acc5NftId, thousandCaw)
    //const acc5Deposits1 = await receiverPaysFacet.getCawDepositsByNftId(acc5NftId)

    //const acc4NftId = await usernameFacet.getNftIdByUsername('account4')
    //await receiverPaysFacet.connect(accounts[4]).depositCaw(acc4NftId, thousandCaw)
    //const acc4Deposits1 = await receiverPaysFacet.getCawDepositsByNftId(acc4NftId)

    const acc3NftId = await usernameFacet.getNftIdByUsername('account3')
    await receiverPaysFacet.connect(accounts[3]).depositCaw(acc3NftId, thousandCaw)
    const acc3Deposits1 = await receiverPaysFacet.getCawDepositsByNftId(acc3NftId)

    const acc2NftId = await usernameFacet.getNftIdByUsername('account2')
    await receiverPaysFacet.connect(accounts[2]).depositCaw(acc2NftId, thousandCaw)
    const acc2Deposits1 = await receiverPaysFacet.getCawDepositsByNftId(acc2NftId)

    const claimerNftId = await usernameFacet.getNftIdByUsername('account1')
    const claimerDeposits1 = await receiverPaysFacet.getCawDepositsByNftId(claimerNftId)

    const chainId = (await ethers.provider.getNetwork()).chainId
    const networkId = 1 // hardhat doesn't seem to want to observe networkId

    const domain =  {
      chainId: chainId,
      name: 'Cawdrivium',
      verifyingContract: diamondAddress,
      version: '1'
    }
    const deadline = Math.floor(new Date().getTime() / 1000) + 3600

    const types: MessageTypes = {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
      TipChain: [
        { name: 'claimerNftId', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
        { name: 'tips', type: 'Tip[]' },
        { name: 'tipsigs', type: 'bytes[]' },
        { name: 'iterator', type: 'uint256' }

      ],
      Tip: [
        { name: 'senderNftId', type: 'uint256' },
        { name: 'amount', type: 'uint256' },
      ]
    }

    const ethersTipChainType = { // Tried to be ergonomic by providing EIP712 domain
      TipChain: [
        { name: 'claimerNftId', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
        { name: 'tips', type: 'Tip[]' },
        { name: 'tipsigs', type: 'bytes[]' },
        { name: 'iterator', type: 'uint256' }
      ],
      Tip: [
        { name: 'senderNftId', type: 'uint256' },
        { name: 'amount', type: 'uint256' },
      ]
    }
    const ethersTipType = { // Tried to be ergonomic by providing EIP712 domain
      Tip: [
        { name: 'senderNftId', type: 'uint256' },
        { name: 'amount', type: 'uint256' },
      ]
    }
    // love to see an ipfs hash chain as these,
    //
    let message = {
      claimerNftId: Number(claimerNftId), // this nft can sweep funds
      deadline: deadline, // when the bus leaves, matched with lock on deposit box
      tips: <any[]>[],
      tipsigs: <string[]>[],
      iterator: 0
    }
    // account 3 leaves a tip in claimer tip jar,
    const acc3Tip = {
      senderNftId: Number(acc3NftId),
      amount: hundredCaw.toString()
    }
    message.tips.push(acc3Tip)
    message.iterator += 1

    const acc3TipSignature:string = await accounts[3]._signTypedData(
      domain,
      ethersTipType,
      acc3Tip
    )

    message.tipsigs.push(acc3TipSignature)


   // account 2 leaves a tip in the claimer tip jar 
    const acc2Tip = {
      senderNftId: Number(acc3NftId),
      amount: hundredCaw.toString()
    }
    message.tips.push(acc2Tip)
    message.iterator += 1

    const acc2TipSignature:string = await accounts[2]._signTypedData(
      domain,
      ethersTipType,
      acc2Tip
    )
    message.tipsigs.push(acc2TipSignature)
    console.log(message)

    const msgParams: TypedMessage<MessageTypes> = {
      domain,
      message,
      primaryType: 'TipChain',
      types
    }

   // claimer signing the package 
    const signature:string = await accounts[1]._signTypedData(
      domain,
      ethersTipChainType,
      message
    )
    console.log(ethersTipChainType)
    console.log(signature)

    const signatureSans0x = signature.substring(2)
    const r = '0x' + signatureSans0x.substring(0,64);
    const s = '0x' + signatureSans0x.substring(64,128);
    const v = parseInt(signatureSans0x.substring(128,130), 16)
    console.log('v: ', v)
    console.log('r: ', r)
    console.log('s: ', s)
    const recoverAddr = recoverTypedSignature({data: msgParams, signature, version: SignTypedDataVersion.V4 })
    console.log(recoverAddr)
    console.log('acc1',accounts[1].address)
    console.log('acc2',accounts[2].address)
    console.log('acc3',accounts[3].address)

    expect(recoverAddr).to.equal(accounts[1].address.toLowerCase())
    await receiverPaysFacet.connect(accounts[1]).claimPaymentBatch(
      v,
      r,
      s,
      Number(claimerNftId),
      deadline,
      message.tips,
      message.tipsigs,
      message.iterator
    )

    assert.fail('issues aligning abi encodes for nested structs, arbitrary tip length makes abi.encodepacked with a ... operator difficult, going to to research merkle tree methods, or add iterator to message, lets try that')
    /*
   */
  })

})
