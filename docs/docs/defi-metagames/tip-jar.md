---
sidebar_position: 1
---

# Tip Jar
:::tip
Canonical Example, useful for arbitrarily many micropayments from arbitrarily many users all to one user, emptied monthly.
:::
Once a user has deposited relevent funds under their username, they can access a vast array of different micropayment chains.  They can leave a signature in a different users' Tip Jar for example, that is a claim to take from these deposited funds at or before the timelock expires. At this point the other user can claim their tips, consuming the signature chain and updating all of the state pending signature verification.  Now, It is completely in a tippers power to over-write the amount of signatures relative to what is their deposit box, leaving it a first come first serve on the consumer, but would you really want to be that person?

An open area of research is if a smart contract can program anti-greifing measures in, ideas like if attempts to withdraw from the box when its 0 conduces expiry points, but thats another time
