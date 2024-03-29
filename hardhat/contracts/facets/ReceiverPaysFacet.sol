pragma solidity 0.8.14;

import {
  LibAppStorage,
  AppStorage,
  Modifiers,
  Tip,
  TipChain,
  GroupTip,
  GroupTipChain, 
  GroupTip,
  Thing,
  Things
} from '../libraries/LibAppStorage.sol';

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import 'hardhat/console.sol';
contract ReceiverPaysFacet is Modifiers {

  function depositCaw(uint256 nftId, uint256 amount) external {
    // I think it will be wise to add a deposit_bucket idea, since the deadline will freeze 
    // withdraw ability users may want to partition off deposit sets
    // Probably should do erc-712 permits for the approvals too lol
    AppStorage storage s = LibAppStorage.diamondStorage();
    require(s.nftIdBalances[nftId][msg.sender] == 1, "ReceiverPaysFacet::must own nft to deposit into the nft wallet");
    IERC20(s.caw).transferFrom(msg.sender, address(this), amount);
    s.nftIdCawDeposits[nftId] += amount;
  }

  function withdrawCaw(uint256 nftId, uint256 amount) external {
    // With signature sends there is no way to prevent sending a tip through a signature and than withdrawing before the other user claims
    // To prevent this I theorize that a constant deadline time buffer, alongside an NFTWithdrawlLock() function
    // a user who is desiring to withdraw caw from their Username NFT will have to trigger the NFTWithdrawLock(), and wait till the dealine to begin withdrawing
    // If the Signature sends contain a constant time delay, 
    AppStorage storage s = LibAppStorage.diamondStorage();
    require(s.nftIdBalances[nftId][msg.sender] == 1, "ReceiverPaysFacet::must own nft to withdraw out of the nft wallet");
    uint256 nftIdDeposits = s.nftIdCawDeposits[nftId];
    require(nftIdDeposits >= amount, "ReceiverPaysFacet:: cannot withdraw more than put in");
    IERC20(s.caw).transferFrom(msg.sender, address(this), amount);
    s.nftIdCawDeposits[nftId] -= amount;
  }

  function getCawDepositsByNftId(uint256 nftId) external view returns (uint256) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.nftIdCawDeposits[nftId];
  }





  /*
  function claimPayment(uint256 nftid, uint256 amount, uint256 nonce, bytes memory signature) external {
    AppStorage storage s = LibAppStorage.diamondStorage();

    uint256 nft = s.nftIdBalances[nftid][msg.sender];
    address owner = s.nftIdToAddress[nftid];
    require(nft > 0, "ReceiverPayFacet::msg.sender must own nft to claim");

    require(!s.nftUsedNonces[nftid][nonce]);
    s.nftUsedNonces[nftid][nonce] = true;

    // this recreates the message that was signed on the client
    bytes32 message = prefixed(keccak256(abi.encodePacked(msg.sender, nftid, amount, nonce, this)));
    require(recoverSigner(message, signature) == owner);
    IERC20(s.caw).transfer(msg.sender, amount);
    //payable(msg.sender).transfer(amount);
}

*/

  /// destroy the contract and reclaim the leftover funds.
  /*mudgen — 16/03/2022
  I don't think it is a good idea to add selfdestruct to the source code of a facet.  Because that could be used to delete the diamond proxy contract (if a facet function with selfdestruct was added to a diamond). Or a facet could be deleted when its functions are still being used by a diamond.   Plus there is no more gas refund for deleting a contract,  so I'm not sure there is any benefit (other than a cleaner blockchain) to deleting a contract or face


  function shutdown() external onlyOwner  {
    // I wonder what happens with self destruct and diamonds
    selfdestruct(payable(address(0)));
  }a
  */

  /// signature methods.
  function splitSignature(bytes memory sig)
  internal
  pure
  returns (uint8 v, bytes32 r, bytes32 s)
  {
    require(sig.length == 65);

    assembly {
      // first 32 bytes, after the length prefix.
      r := mload(add(sig, 32))
      // second 32 bytes.
      s := mload(add(sig, 64))
      // final byte (first byte of the next 32 bytes).
      v := byte(0, mload(add(sig, 96)))
    }

    return (v, r, s);
  }

  function recoverSigner(bytes32 message, bytes memory sig)
  internal
  pure
  returns (address)
  {
    (uint8 v, bytes32 r, bytes32 s) = splitSignature(sig);

    return ecrecover(message, v, r, s);
  }

  /// builds a prefixed hash to mimic the behavior of eth_sign.
  function prefixed(bytes32 hash) internal pure returns (bytes32) {
    return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
  }


  /* Deadline is interesting constraint
  Thinking about providing a 1 day, 1 week, or even 1 month bus load time
  Thing is we want to prevent user withdraw before the deadline on it
  The question of course is why both evening tipping in the first place
  My thoughts rest on griefers, or spammers
   */

  function hashTipSigs(bytes[] memory tipSigs) internal returns (bytes32) {
    bytes memory packed;
    for (uint i =0; i < tipSigs.length ; i++) {
      packed = abi.encodePacked(packed, keccak256(tipSigs[i])); 
    }
    return keccak256(packed);
  }

  function hashTips(Tip[] memory tips) internal returns (bytes32) {
    AppStorage storage st = LibAppStorage.diamondStorage();
    bytes memory packed;
    for (uint i =0; i < tips.length ; i++) {
      bytes32 hashStruct = keccak256(
        abi.encode(
          st.tipTypeHash,
          tips[i].senderNftId,
          tips[i].amount,
          tips[i].senderNonce
      )
      );
      //type no supported in packed mode
      packed = abi.encodePacked(packed, hashStruct); 
    }
    return keccak256(packed);
  }

  function claimTipChain(
    uint8 v,
    bytes32 r,
    bytes32 s,
    TipChain memory tipChain
  ) external {
    AppStorage storage st = LibAppStorage.diamondStorage();
    // It will delightfully more efficient if users come together to make a big sig send that a user can claim in a single sweep
    require(st.nftIdBalances[tipChain.claimerNftId][msg.sender] > 0, "ReceiverPayFacet::msg.sender must own nft to claim");

    bytes32 hashStruct = keccak256(
      abi.encode(
        st.tipChainTypeHash,
        tipChain.claimerNftId,
        tipChain.deadline,
        hashTips(tipChain.tips),
        hashTipSigs(tipChain.tipSigs)
    )
    );
    bytes32 hash = keccak256(abi.encodePacked("\x19\x01", st.eip712DomainHash, hashStruct));
    //console.log(ecrecover(hash,v,r,s), 'ecrecover');
    //console.log(ECDSA.recover(hash, v, r, s));
    //console.log('^ ecdsa reover');
    //console.log(msg.sender, 'message.sender');
    require(ecrecover(hash, v, r, s) == msg.sender, "tip jar is self signed, tips are not");

    for (uint i=0;i < tipChain.tips.length; i++) {
      bytes32 hashStruct = keccak256(
        abi.encode(
          st.tipTypeHash,
          tipChain.tips[i].senderNftId,
          tipChain.tips[i].amount,
          tipChain.tips[i].senderNonce
        )
      );
      address signer = recoverSigner(
        keccak256(abi.encodePacked("\x19\x01", st.eip712DomainHash, hashStruct)),
        tipChain.tipSigs[i]
      );
      console.log('tip signer', signer);

      console.log(signer, 'tips loop');
      if (signer == st.nftIdToAddress[tipChain.tips[i].senderNftId]) {
        if (st.nftIdUsedNonces[tipChain.tips[i].senderNftId] <= tipChain.tips[i].senderNonce) {
        st.nftIdCawDeposits[tipChain.tips[i].senderNftId] -= tipChain.tips[i].amount;
        st.nftIdCawDeposits[tipChain.claimerNftId] += tipChain.tips[i].amount;
        st.nftIdUsedNonces[tipChain.tips[i].senderNftId]++;

        }
      } else {
        console.log('signature no in, handle faulty situation');
      }
    }
  }

  function hashGroupTips(GroupTip[] memory tips) internal returns (bytes32) {
    AppStorage storage st = LibAppStorage.diamondStorage();
    bytes memory packed;
    for (uint i =0; i < tips.length ; i++) {
      bytes32 hashStruct = keccak256(
        abi.encode(
          st.groupTipTypeHash,
          tips[i].senderNftId,
          tips[i].receiverNftId,
          tips[i].amount,
          tips[i].senderNonce,
          tips[i].receiverNonce
        )
      );
      //type no supported in packed mode
      packed = abi.encodePacked(packed, hashStruct); 
    }
    return keccak256(packed);
  }

  function harvestGroupTipChain(
    bytes memory signature,
    GroupTipChain memory groupTipChain
  ) external {
    AppStorage storage st = LibAppStorage.diamondStorage();
    
    bytes32 hashStruct = keccak256(
      abi.encode(
        st.groupTipChainTypeHash,
        groupTipChain.deadline,
        hashGroupTips(groupTipChain.tips),
        hashTipSigs(groupTipChain.tipSigs)
      )
    );
    bytes32 hash = keccak256(abi.encodePacked("\x19\x01", st.eip712DomainHash, hashStruct));
    (uint8 v, bytes32 r, bytes32 s) = splitSignature(signature);
    require(ecrecover(hash, v, r, s) == msg.sender, "harvest Group chain is signed by msg.sender");
  }

  /* 
  nice for understanding how the nested Array of structs worked
  function hashThings(Things memory things) internal returns (bytes32) {
    bytes memory packed;
    for (uint i =0; i < things.things.length ; i++) {
      bytes32 hashThing = keccak256(
        abi.encode(
          keccak256("Thing(uint256 id)"),
          things.things[i]
      )
      );
      packed = abi.encodePacked(packed, hashThing); 
    }
    return keccak256(packed);
  }

  function claimThings(
    uint8 v,
    bytes32 r,
    bytes32 s,
    Things memory things
  ) external {
    AppStorage storage st = LibAppStorage.diamondStorage();

    uint256 chainId;
    assembly {
      chainId := chainid()
    }

    // Yay, its abi.encodePacked(string of array :')))
    // reminder to consider warning in: https://docs.soliditylang.org/en/v0.8.14/abi-spec.html#non-standard-packed-mode
    bytes32 hashThings = keccak256(
      abi.encode(
        keccak256("Things(Thing[] things)Thing(uint256 id)"),
        hashThings(things)
    )
    );


    bytes32 hash = keccak256(abi.encodePacked("\x19\x01", st.eip712DomainHash, hashThings));
    address signer = ecrecover(hash, v, r, s);
    console.log('facet::', signer, msg.sender);
  }

  */

}
