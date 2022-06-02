pragma solidity 0.8.14;

import { LibAppStorage, AppStorage, Modifiers } from '../libraries/LibAppStorage.sol';
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ReceiverPaysFacet is Modifiers {

  function depositCaw(uint256 nftId, uint256 amount) external {
    AppStorage storage s = LibAppStorage.diamondStorage();
    require(s.nftBalances[nftId][msg.sender] == 1, "ReceiverPaysFacet::must own nft to deposit into the nft wallet");
    IERC20(s.caw).transferFrom(msg.sender, address(this), amount);
    s.nftIdCawDeposits[nftId] += amount;
  }
  function withdrawCaw(uint256 nftId, uint256 amount) external {
    AppStorage storage s = LibAppStorage.diamondStorage();
    require(s.nftBalances[nftId][msg.sender] == 1, "ReceiverPaysFacet::must own nft to withdraw out of the nft wallet");
    uint256 nftIdDeposits = s.nftIdCawDeposits[nftId];
    require(nftIdDeposits >= amount, "ReceiverPaysFacet:: cannot withdraw more than put in");
    IERC20(s.caw).transferFrom(msg.sender, address(this), amount);
    s.nftIdCawDeposits[nftId] -= amount;
  }

  function getCawDepositsByNftId(uint256 nftId) external view returns (uint256) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.nftIdCawDeposits[nftId];
  }

  function claimPayment(uint256 nftid, uint256 amount, uint256 nonce, bytes memory signature) external {
    AppStorage storage s = LibAppStorage.diamondStorage();

    uint256 nft = s.nftBalances[nftid][msg.sender];
    require(nft > 0, "ReceiverPayFacet::msg.sender must own nft to claim");

    require(!s.nftUsedNonces[nftid][nonce]);
    s.nftUsedNonces[nftid][nonce] = true;

    // this recreates the message that was signed on the client
    bytes32 message = prefixed(keccak256(abi.encodePacked(msg.sender, nftid, amount, nonce, this)));
    require(recoverSigner(message, signature) == msg.sender);
    IERC20(s.caw).transfer(msg.sender, amount);
    //payable(msg.sender).transfer(amount);
  }

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
}


