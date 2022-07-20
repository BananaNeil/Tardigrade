import IPFS from 'ipfs'
const OrbitDB = require('orbit-db')
const { ethers } = require('ethers')
const fs = require('fs')
const Static = require('../static/Static.json')
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

interface User {
  db: object;
  dbUrl: string;
  profile: UserProfile;
}
interface UserProfile {
  username: string;
  nftId: string;
  address: string;
  isSigner: boolean;
  internalNonce: number;
}

class Tardigrade {
  name:string;
  ipfs:any;
  orbitdb:any;
  provider:any;
  signer:any;
  diamondAddress:string;
  receiverPaysFacet:any;
  usernameFacet:any;
  user: User;
  tipChains:object[] = [];
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
  ethersTipChainType: object = {
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
    ipfs: any,
    orbitdb: any,
    chainId: string,
  ) {
    this.name = name
    this.diamondAddress = diamondAddress
    this.ipfs = ipfs
    this.orbitdb = orbitdb
    this.provider = provider
    this.signer = this.provider.getSigner()
    this.receiverPaysFacet = ethers.Contract(diamondAddress, Static.receiverPaysFacet.abi, this.signer)
    this.usernameFacet = ethers.Contract(diamondAddress, Static.usernameFacet.abi, this.signer)
    this.domain = {
      chainId: chainId,
      name: name,
      verifyingContract: diamondAddress,
      version: '1'
    }
  };

  public static async build(
    name: string,
    provider: any,
    diamondAddress: string,
    username?: string
  ): Promise<Tardigrade> {
      const ipfsOptions = { 
        repo : './ipfs',
        EXPERIMENTAL: {
          pubsub: true
        }
      }
      const ipfs =  await IPFS.create(ipfsOptions)
      const orbitdb = await OrbitDB.createInstance(ipfs)
      const chainId = (await provider.getNetwork()).chainId

    return new Tardigrade(name, provider, diamondAddress,ipfs, orbitdb, chainId )
  }

  async createUser(username:string) {
    try {
      const createUser = await this.usernameFacet.connect(this.signer).createUser(username)
      await this.setUserContext(username)
    } catch (e) { 
      console.error(e)
    }
  }

  async setUserContext(username:string) {
    // userdb keyvalue?
    let nftIdFromUsername;
    let addressFromNftId;
    try {
      nftIdFromUsername = await this.usernameFacet.getNftIdByUsername(username)
      addressFromNftId = await this.usernameFacet.getAddressByNftId(nftIdFromUsername)
    } catch (e) {
      console.log('likely username do not exist on blockchain')
      console.error(e)
    }
    const userUrl = `${username}.${nftIdFromUsername}.${addressFromNftId}`

    const userDb = await this.orbitdb.open(userUrl, {create: true, type: 'keyvalue'})
    const user = await userDb.get('profile')
    // Nft nonces are internally tracked on signatures for security
    // If a user goes on etherscan, for example, and increments their nonce, it would break his signatures
    const nonceContract = await this.usernameFacet.getLastUsedNonce(nftIdFromUsername);
    if (user) {
      user.nonce = user.nonce >= nonceContract ? user.nonce : nonceContract;
      await userDb.put('profile', user)
    } else {
      const profile: UserProfile = {
        username: username,
        nftId: nftIdFromUsername,
        address: addressFromNftId,
        isSigner: (addressFromNftId === this.signer.address ? true: false),
        internalNonce: user.nonce >= nonceContract ? user.nonce : nonceContract,
      }
      await userDb.put('profile', profile)
      this.user = {
        dbUrl: userUrl,
        db: userDb,
        profile: profile
      }
      
    }
    
  }

  async createTipChain() {
    const deadline =Math.floor(new Date().getTime() / 1000) // create a getter from smartcontract 4 this
    const url = `${this.user.profile.username}.${this.user.profile.nftId}.${deadline}`;
    const db = await this.orbitdb.eventlog(url);
    await db.add({
      claimerNftId: this.user.profile.nftId,
      deadline: deadline,
    })
    this.tipChains.push({url, db});
  }

  async loadTipChainByIPFSAddress(tipChainIPFSAddress:string) {};

  async loadTipChainByUrl(url:string) {};

  async getAndUpdateNonce() {
    const userDb = await this.orbitdb.open(this.user.dbUrl)
    const nonceContract = await this.usernameFacet.getLastUsedNonce(this.user.profile.nftId);
    const lastUsedNonce = userDb > nonceContract ? userDb : nonceContract
    if (nonceContract > userDb) {
      //Interaction with contract independent of Tardigrade client, re update
      await this.user.db
    } else {

    }
  }
  async appendTipChain(
    url:string,
    senderNftId:number,
    nonce:number,
    amount:number) {
    const db = await this.orbitdb.open(url)
    const tip = {
      senderNftId: this.user.profile.nftId,
      amount: amount,
      senderNonce: this.user.profile.internalNonce + 1 // Track with orbit db
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

  async consumeTipChain(url:string) {
    const db = await this.orbitdb.open(url)
    const all = db.iterator({ limit: -1  })
      .collect()
      .map((e:any) => e.payload.value)
    
    const message = {
      claimerNftId: all[0].claimerNftId,
      deadline: all[0].deadline,
      tips: all.map((e:any) => e.tip),
      tipSigs: all.map((e:any) => e.tipSigs)
    }

    const signature:string = await this.signer._signTypedData(
      this.domain,
      this.ethersTipChainType,
      message
    )
    const signatureSans0x = signature.substring(2)
    const r = '0x' + signatureSans0x.substring(0,64);
    const s = '0x' + signatureSans0x.substring(64,128);
    const v = parseInt(signatureSans0x.substring(128,130), 16)
    await this.receiverPaysFacet.connect(this.signer).claimTipChain(v,r,s, message)
  };

  //async pinTipChains() {} does this exist in api?

}

module.exports = Tardigrade
