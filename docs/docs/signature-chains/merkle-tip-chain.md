# Merkle Tip Chain
## Message
```
struct MerkleTip {
  uint256 senderNftId;
  uint256 amount;
}
```

## Data Structure
```
struct MerkleTipTree {
  uint256 receiverNftId;
  uint256 receiverNonce;
  uint256 deadline;
  MerkleTip[] tips;
  bytes[] tipSigs;
}
struct MerkleTipTreeProof {
  MerkleTipTree merkleTipTree;
  bytes32[] proofs;
  bool[] proofFlags;
  bytes32[] leaves;
  bytes32 root;
}
```
## Consumption Incentive
