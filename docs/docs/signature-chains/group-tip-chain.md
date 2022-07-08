---
sidebar_position: 2
---
# Group Tip Chain

Many users can chain tips together for many other users

## Message
```
struct GroupTip {
  uint256 senderNftId;
  uint256 receiverNftId;
  uint256 amount;
  uint256 senderNonce;
  uint256 receiverNonce;
}
```

## Data Structure
```
struct GroupTipChain {
  uint256 deadline;
  GroupTip[] tips;
  bytes[] tipSigs;
}
```
## Consumption Incentive
