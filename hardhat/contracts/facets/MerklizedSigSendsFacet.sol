pragma solidity 0.8.14;

import {
  LibAppStorage,
  AppStorage,
  Modifiers,
  Tip
} from '../libraries/LibAppStorage.sol';

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
//https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/cryptography/MerkleProof.sol
//https://github.com/OpenZeppelin/openzeppelin-contracts/blob/113443470cfa3e7480d789e8897f2fcceb637450/test/utils/cryptography/MerkleProof.test.js

/*
* Theoretical Strategy
* DepositCaw under NftId 
* Tip() keccak are hashes
* MerkleTip() global object
* If MerkleRoot is true Withdraw from Base Contract
* else figure something out
* deadline passes ability to Consume merkleTipChain expires, users can withdraw whats remaining under their username
* by virtue of not having to modify account level state, just by pulling from a base contract, further efficiency may be possible
*/
contract MerklizedSigSendsFacet is Modifiers {

  function verify() external {}
}
