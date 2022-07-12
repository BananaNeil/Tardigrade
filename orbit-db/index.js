const IPFS = require('ipfs')
const OrbitDB = require('orbit-db')
const { ethers } = require('ethers')
const fs = require('fs')

class Tardigrade {
  ipfs;
  orbitdb;
  provider;
  signer;
  diamondAddress;
  receiverPaysFacet;
  
  constructor(provider, diamondAddress) {
    return (async () => {
      const ipfsOptions = { 
        repo : './ipfs',
        EXPERIMENTAL: {
          pubsub: true
        }
      }
      this.ipfs =  await IPFS.create(ipfsOptions)
      this.orbitdb = await OrbitDB.createInstance(ipfs)
      this.provider = provider
      this.signer = this.provider.getSigner()

    })();
  }
  async createTipChain() {}
  async loadTipChain(tipChainIPFSAddress) {}
  async appendTipChain(addressTo, nonce, amount) {}
  async consumeTipChain() {}

}


