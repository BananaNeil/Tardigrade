const IPFS = require('ipfs')
const OrbitDB = require('orbit-db')
const { ethers } = require('ethers')
const fs = require('fs')
const Static = require('./static/Static.json')
import {
  encrypt,
  recoverPersonalSignature,
  recoverTypedSignature,
  TypedMessage,
  MessageTypes,
  SignTypedDataVersion
} from '@metamask/eth-sig-util';

//class OrbitalMeshnet
//class Tardigrade extends OrbitalMeshnet ? 

class Tardigrade {
  name:string;
  ipfs:any;
  orbitdb:any;
  provider:any;
  signer:any;
  diamondAddress:string;
  receiverPaysFacet:any;
  usernameFacet:any;
  tipChains:object[];
  domain:object;
  types: MessageTypes = {
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
      { name: 'tipSigs', type: 'bytes[]' },
    ],
    Tip: [
      { name: 'senderNftId', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
      { name: 'senderNonce', type: 'uint256' }
    ]
  }
  ethersTipType: object = {
    Tip: [
      { name: 'senderNftId', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
      { name: 'senderNonce', type: 'uint256' }
    ]
  }
  ethersTipchainType: object = {
    TipChain: [
      { name: 'claimerNftId', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
      { name: 'tips', type: 'Tip[]' },
      { name: 'tipSigs', type: 'bytes[]' },
    ],
    Tip: [
      { name: 'senderNftId', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
      { name: 'senderNonce', type: 'uint256' }
    ]
  }

  constructor(
    name:string,
    provider:object,
    diamondAddress:string,
    initialTipChains:object[]
  ) {
    return (async (): Promise<void> => {
      this.name = name
      this.diamondAddress = diamondAddress
      this.tipChains = initialTipChains ? initialTipChains : [{}]
      const ipfsOptions = { 
        repo : './ipfs',
        EXPERIMENTAL: {
          pubsub: true
        }
      }
      this.ipfs =  await IPFS.create(ipfsOptions)
      this.orbitdb = await OrbitDB.createInstance(this.ipfs)
      this.provider = provider
      this.signer = this.provider.getSigner()
      this.receiverPaysFacet = ethers.Contract(diamondAddress, Static.receiverPaysFacet.abi, this.signer)
      this.usernameFacet = ethers.Contract(diamondAddress, Static.usernameFacet.abi, this.signer)
      this.domain = {
        chainId: (await this.provider.getNetwork()).chainId,
        name: name,
        verifyingContract: diamondAddress,
        version: '1'
      }

    }).call(this);

  };

  async createTipChain(claimerNftId, post) {
    const url = `${this.name}.${claimerNftId}.${post}`;
    const db = await this.orbitdb.eventlog(url);
    const deadline =Math.floor(new Date().getTime() / 1000) // create a getter from smartcontract 4 this
    await db.add({
      claimerNftId: claimerNftId,
      deadline: deadline,
    })
    this.tipChains.push({url, db});
  }

  async loadTipChainByIPFSAddress(tipChainIPFSAddress) {};

  async loadTipChainByUrl(url) {};

  async appendTipChain(url, senderNftId, nonce, amount) {
    const db = await this.orbitdb.open(url)
    const tip = {
      senderNftId: senderNftId,
      amount: amount,
      senderNonce: nonce // probably can just fetch from chain
    }
    const tipSig = await this.signer._signTypedData(
      this.domain,
      this.ethersTipType,
      tip
    )
    await db.add({
      tip,
      tipSig
    })
  };

  async consumeTipChain() {};

  //async pinTipChains() {} does this exist in api?

}


