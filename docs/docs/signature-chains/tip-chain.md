---
sidebar_position: 1
---

# Tip Chain
Many users can chain tips together to one other user.  
## Message
```
struct Tip {
  uint256 senderNftId;
  uint256 amount;
  uint256 senderNonce;
}
```

## Data Structure
```
struct TipChain {
  uint256 claimerNftId;
  uint256 deadline;
  Tip[] tips;
  bytes[] tipSigs;
}
```
## Consumption Incentive
