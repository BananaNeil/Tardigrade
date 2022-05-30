import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme'

import { Web3ReactProvider, Web3ReactHooks  } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import { hooks as metaMaskHooks, metaMask } from './connectors/metaMask'

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";


const connectors: [MetaMask, Web3ReactHooks][] = [
  [metaMask, metaMaskHooks]
]

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Web3ReactProvider connectors={connectors}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<App />} />
            </Routes>
          </BrowserRouter>
      </ThemeProvider>
    </Web3ReactProvider>
  </React.StrictMode>
)
