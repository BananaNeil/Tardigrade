// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/******************************************************************************\
 * Author: Nick Mudge <nick@perfectabstractions.com> (https://twitter.com/mudgen)
 * EIP-2535 Diamonds: https://eips.ethereum.org/EIPS/eip-2535
 *
 * Implementation of a diamond.
/******************************************************************************/

import {LibDiamond} from "../libraries/LibDiamond.sol";
import { AppStorage } from "../libraries/LibAppStorage.sol";
import { IDiamondLoupe } from "../interfaces/IDiamondLoupe.sol";
import { IDiamondCut } from "../interfaces/IDiamondCut.sol";
import { IERC173 } from "../interfaces/IERC173.sol";
import { IERC165 } from "../interfaces/IERC165.sol";

// It is expected that this contract is customized if you want to deploy your diamond
// with data from a deployment script. Use the init function to initialize state variables
// of your diamond. Add parameters to the init funciton if you need to.

contract DiamondInit {    
  AppStorage internal s;
  // You can add parameters to this function in order to pass in 
  // data to set your own state variables
  function init(
    uint256[8] calldata usernameCostTable,
    string calldata uri,
    address caw
  ) external {
    // adding ERC165 data
    LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
    ds.supportedInterfaces[type(IERC165).interfaceId] = true;
    ds.supportedInterfaces[type(IDiamondCut).interfaceId] = true;
    ds.supportedInterfaces[type(IDiamondLoupe).interfaceId] = true;
    ds.supportedInterfaces[type(IERC173).interfaceId] = true;

    // add your own state variables 
    // EIP-2535 specifies that the `diamondCut` function takes two optional 
    // arguments: address _init and bytes calldata _calldata
    // These arguments are used to execute an arbitrary function using delegatecall
    // in order to set state variables in the diamond during deployment or an upgrade
    // More info here: https://eips.ethereum.org/EIPS/eip-2535#diamond-interface 

    s.uri = uri;
    for (uint256 i = 0; i < usernameCostTable.length; i++) {
      s.usernameCostTable[i] = usernameCostTable[i];
    }
    s.caw = caw;
    //https://etherscan.io/address/0x000000000000000000000000000000000000dead
    s.burn = 0x000000000000000000000000000000000000dEaD; //zero address was prevent Transfer in ERC20Standard token

    uint256 chainId;
    assembly {
      chainId := chainid()
    }

    s.eip712DomainHash = keccak256(
      abi.encode(
        keccak256(
          "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
        ),
        keccak256(bytes("Cawdrivium")),
        keccak256(bytes("1")),
        chainId,
        address(this)
      )
    );

    s.tipChainTypeHash = keccak256("TipChain(uint256 claimerNftId,uint256 deadline,Tip[] tips,bytes[] tipSigs)Tip(uint256 senderNftId,uint256 amount,uint256 senderNonce)");
    s.tipTypeHash = keccak256("Tip(uint256 senderNftId,uint256 amount,uint256 senderNonce)");

    s.groupTipChainTypeHash = keccak256("GroupTipChain(uint256 deadline,GroupTip[] tips,bytes[] tipSigs)GroupTip(uint256 senderNftId,uint256 receiverNftId,uint256 amount,uint256 senderNonce,uint256 receiverNonce)");
    s.groupTipTypeHash = keccak256("GroupTip(uint256 senderNftId,uint256 receiverNftId,uint256 amount,uint256 senderNonce,uint256 receiverNonce)");
    
    s.merkleTipTypeHash = keccak256("MerkleTip(uint256 senderNftId,uint256 amount)");
    s.merkleTipTreeTypeHash = keccak256('MerkleTipTree(uint256 receiverNftId,uint256 receiverNonce,uint256 deadline,MerkleTip[] tips,bytes[] tipSigs)MerkleTip(uint256 senderNftId,uint256 amount)');
    s.merkleTipTreeProofTypeHash = keccak256('MerkleTipTreeProof(MerkleTipTree merkleTipTree,bytes32[] proofs,bool[] proofFlags,bytes32[] leaves,bytes32 root)MerkleTipTree(uint256 receiverNftId,uint256 receiverNonce,uint256 deadline,MerkleTip[] tips,bytes[] tipSigs)MerkleTip(uint256 senderNftId,uint256 amount)');
  
  
  }


}
