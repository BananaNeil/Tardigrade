pragma solidity ^0.8.0;

import {LibDiamond} from './LibDiamond.sol';


struct AppStorage {
  address burn;
  address caw;
  // username nft associated state
  mapping(uint256 => uint256) usernameCostTable;

  mapping(string => uint256) usernameToNftId;
  mapping(uint256 => string) nftIdToUsername;
  uint256 nextNftId;
  mapping(uint256 => mapping(address => uint256)) nftBalances;

  mapping(address => mapping(address => bool)) operatorApprovals;

  string uri;
  // signature sends
  // nftid => nonce => true
  mapping(uint256 => mapping(uint256 => bool)) nftUsedNonces;
  mapping(uint256 => uint256) nftIdCawDeposits;

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
