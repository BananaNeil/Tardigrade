pragma solidity ^0.8.0;

import {LibDiamond} from './LibDiamond.sol';


struct AppStorage {
  address caw;
  mapping(uint8 => uint256) usernameCostTable;
  mapping(string => bool) createdUsernames;
  uint256 nextNftId;
  mapping(uint256 => mapping(address => uint256)) nftBalances;
  mapping(address => mapping(address => bool)) operatorApprovals;
  string uri;
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
