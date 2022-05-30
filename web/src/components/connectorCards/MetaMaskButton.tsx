import type { Web3ReactHooks  } from '@web3-react/core'
import type { MetaMask  } from '@web3-react/metamask'


import { useEffect  } from 'react'
import { hooks, metaMask } from '../../connectors/metaMask'
const { useChainId, useAccounts, useError, useIsActivating, useIsActive, useProvider, useENSNames  } = hooks

import truncateEthAddress from 'truncate-eth-address'

export default function MetaMaskButton() {
  const chainId = useChainId()
  const accounts = useAccounts()
  const error = useError()
  const isActivating = useIsActivating()

  const isActive = useIsActive()

  const provider = useProvider()
  const ENSNames = useENSNames(provider)

  useEffect(() => {
        void metaMask.connectEagerly()
  }, [])
  return (
    <>
      <button onClick={() => {
        metaMask.activate(1)
      }}> {!isActive ?'Connect Wallet':truncateEthAddress(accounts[0])}</button>
    </>
  )
}
