pragma solidity 0.8.14;

import { LibAppStorage, AppStorage, Modifiers } from '../libraries/LibAppStorage.sol';
import 'hardhat/console.sol';
contract CawFacet {
  // protocol owned liquidity fees fund sci-hub

  function followNftId(uint256 nftId) external {

  }

  function caw(
    uint8 v,
    bytes32 r,
    bytes32 s,
    string memory text,
    uint256 nftId
  ) external {
    AppStorage storage st = LibAppStorage.diamondStorage();
    require(st.nftBalances[nftId][msg.sender] > 0, "CawFacet::must caw from onesown NFT");
    require(st.nftIdCawDeposits[nftId] >= 5000, 'CawFacet::Insufficient Caw');
    uint256 chainId;
    assembly {
      chainId := chainid()
    }
    bytes32 eip712DomainHash = keccak256(
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

    bytes32 hashStruct = keccak256(
      abi.encode(
        keccak256("Caw(string text,uint256 nftId)"),
        text,
        nftId
      )
    );

    bytes32 hash = keccak256(abi.encodePacked("\x19\x01", eip712DomainHash, hashStruct));
    address signer = ecrecover(hash, v,r,s);
    console.log('signer', signer);
    //require(signer == msg.sender, "signer is not owner of this nft");
    // Ideally I'd want a way to chain multiple Caw Sigs together, and when the volume gets
    // large enough a pancakeswap like harvest() function can be executed by a user
    // which compensates them in CAW for vacuuming the signatures with gas
    // Harvester idea, collate a chain of caws in a batch, and expose a pancake swap style harvest function that can credit caw for spending gas
    st.nftIdCawDeposits[nftId] -= 5000;
    st.stakePoolCaw += 100;


  }

  function likeCaw(

  ) external {

  }

  function reCaw(

  ) external {

  }
}
