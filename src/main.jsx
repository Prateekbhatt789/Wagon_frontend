import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SpeedContextProvider } from './components/context/speedContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SpeedContextProvider>
      <App />
    </SpeedContextProvider>
  </StrictMode>,
)
