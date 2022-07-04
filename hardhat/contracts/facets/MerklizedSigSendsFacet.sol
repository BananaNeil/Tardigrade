pragma solidity 0.8.14;

import {
	LibAppStorage,
	AppStorage,
	Modifiers,
	MerkleTip,
	MerkleTipTree,
	MerkleTipTreeProof
} from '../libraries/LibAppStorage.sol';

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
//import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
//https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/cryptography/MerkleProof.sol
//https://github.com/OpenZeppelin/openzeppelin-contracts/blob/113443470cfa3e7480d789e8897f2fcceb637450/test/utils/cryptography/MerkleProof.test.js
//https://github.com/OpenZeppelin/openzeppelin-contracts/issues/3492

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
	/**
	 * @dev Returns true if a `leaf` can be proved to be a part of a Merkle tree
	 * defined by `root`. For this, a `proof` must be provided, containing
	 * sibling hashes on the branch from the leaf to the root of the tree. Each
	 * pair of leaves and each pair of pre-images are assumed to be sorted.
	 */
  /**
  * Leafs could be TipChains
  * user can consume their leaves 
  */
	function verify(
			bytes32[] memory proof,
			bytes32 root,
			bytes32 leaf
			) internal pure returns (bool) {
		return processProof(proof, leaf) == root;
	}

	/**
	* @dev Calldata version of {verify}
	*
		* _Available since v4.7._
	*/
	function verifyCalldata(
		bytes32[] calldata proof,
		bytes32 root,
		bytes32 leaf
	) internal pure returns (bool) {
		return processProofCalldata(proof, leaf) == root;
	}

	/**
	* @dev Returns the rebuilt hash obtained by traversing a Merkle tree up
	* from `leaf` using `proof`. A `proof` is valid if and only if the rebuilt
		* hash matches the root of the tree. When processing the proof, the pairs
	* of leafs & pre-images are assumed to be sorted.
		*
		* _Available since v4.4._
	*/
	function processProof(bytes32[] memory proof, bytes32 leaf) internal pure returns (bytes32) {
		bytes32 computedHash = leaf;
		for (uint256 i = 0; i < proof.length; i++) {
			computedHash = _hashPair(computedHash, proof[i]);
		}
		return computedHash;
	}

	/**
	* @dev Calldata version of {processProof}
	*
		* _Available since v4.7._
	*/
	function processProofCalldata(bytes32[] calldata proof, bytes32 leaf) internal pure returns (bytes32) {
		bytes32 computedHash = leaf;
		for (uint256 i = 0; i < proof.length; i++) {
			computedHash = _hashPair(computedHash, proof[i]);
		}
		return computedHash;
	}

	/**
	* @dev Returns true if the `leaves` can be proved to be a part of a Merkle tree defined by
	* `root`, according to `proof` and `proofFlags` as described in {processMultiProof}.
		*
			* _Available since v4.7._
		*/
	function multiProofVerify(
		bytes32[] memory proof,
		bool[] memory proofFlags,
		bytes32 root,
		bytes32[] memory leaves
	) internal pure returns (bool) {
		return processMultiProof(proof, proofFlags, leaves) == root;
	}

	/**
	* @dev Returns the root of a tree reconstructed from `leaves` and the sibling nodes in `proof`,
	* consuming from one or the other at each step according to the instructions given by
	* `proofFlags`.
		*
		* _Available since v4.7._
	*/
	function processMultiProof(
		bytes32[] memory proof,
		bool[] memory proofFlags,
		bytes32[] memory leaves
	) internal pure returns (bytes32 merkleRoot) {
		// This function rebuild the root hash by traversing the tree up from the leaves. The root is rebuilt by
		// consuming and producing values on a queue. The queue starts with the `leaves` array, then goes onto the
		// `hashes` array. At the end of the process, the last hash in the `hashes` array should contain the root of
		// the merkle tree.
		uint256 leavesLen = leaves.length;
		uint256 totalHashes = proofFlags.length;

		// Check proof validity.
		require(leavesLen + proof.length - 1 == totalHashes, "MerkleProof: invalid multiproof");

		// The xxxPos values are "pointers" to the next value to consume in each array. All accesses are done using
		// `xxx[xxxPos++]`, which return the current value and increment the pointer, thus mimicking a queue's "pop".
		bytes32[] memory hashes = new bytes32[](totalHashes);
		uint256 leafPos = 0;
		uint256 hashPos = 0;
		uint256 proofPos = 0;
		// At each step, we compute the next hash using two values:
		// - a value from the "main queue". If not all leaves have been consumed, we get the next leaf, otherwise we
		//   get the next hash.
		// - depending on the flag, either another value for the "main queue" (merging branches) or an element from the
		//   `proof` array.
		for (uint256 i = 0; i < totalHashes; i++) {
			bytes32 a = leafPos < leavesLen ? leaves[leafPos++] : hashes[hashPos++];
			bytes32 b = proofFlags[i] ? leafPos < leavesLen ? leaves[leafPos++] : hashes[hashPos++] : proof[proofPos++];
			hashes[i] = _hashPair(a, b);
		}

		if (totalHashes > 0) {
			return hashes[totalHashes - 1];
		} else if (leavesLen > 0) {
			return leaves[0];
		} else {
			return proof[0];
		}
	}

	function _hashPair(bytes32 a, bytes32 b) private pure returns (bytes32) {
		return a < b ? _efficientHash(a, b) : _efficientHash(b, a);
	}

	function _efficientHash(bytes32 a, bytes32 b) private pure returns (bytes32 value) {
		/// @solidity memory-safe-assembly
		assembly {
			mstore(0x00, a)
			mstore(0x20, b)
			value := keccak256(0x00, 0x40)
		}
	}

	function depositCawMerkle(uint256 amount) external {
	}

	function claimMerkleTipTree(
		MerkleTipTreeProof memory tipTreeProof
	) external {
		AppStorage storage st = LibAppStorage.diamondStorage();
		bool verified = multiProofVerify(
			tipTreeProof.proofs,
			tipTreeProof.proofFlags,
			tipTreeProof.root,
			tipTreeProof.leaves
		);

		require(verified, "Invalid multiproof");
	}



}
