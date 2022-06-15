pragma solidity ^0.8.0;

import {LibDiamond} from './LibDiamond.sol';

/*
   struct Account {
   uint256 cawDeposits;
   string username;
   mapping(address => mapping(uint256 => bool)) usedNonces;
   }
 */

// using for batch tip
struct Tip {
  uint256 senderNftId;
  uint256 amount;
  uint256 senderNonce;
}

struct TipChain {
  uint256 claimerNftId;
  uint256 deadline;
  Tip[] tips;
  bytes[] tipSigs;
}

struct Thing {
  uint256 id;
}

struct Things {
  Thing[] things;
}

struct AppStorage {
  address burn;
  address caw;
  // username nft associated state
  mapping(uint256 => uint256) usernameCostTable;
  // reverse map username <=> nftid
  mapping(string => uint256) usernameToNftId;
  mapping(uint256 => string) nftIdToUsername;
  mapping(uint256 => address) nftIdToAddress;
  uint256 nextNftId;
  mapping(uint256 => mapping(address => uint256)) nftIdBalances;
  mapping(address => mapping(address => bool)) operatorApprovals;
  string uri;
  // signature sends
  // nftid => nonce => true
  mapping(uint256 => uint256)  nftIdUsedNonces;
  mapping(uint256 => uint256) nftIdCawDeposits;
  // StakePool
  uint256 stakePoolCaw;
  uint256 stakePoolCawUSDC;

  bytes32 eip712DomainHash;

  bytes32 tipChainTypeHash;
  bytes32 tipTypeHash;

}

library LibAppStorage {
  function diamondStorage() internal pure returns (AppStorage storage ds) {
    assembly {
      ds.slot := 0
    }
  }

  function abs(int256 x) internal pure returns (uint256) {
    return uint256(x >= 0 ? x : -x);
  }
}

contract Modifiers {
  AppStorage internal s;

  modifier onlyOwner() {
    LibDiamond.enforceIsContractOwner();
    _;
  }

}
