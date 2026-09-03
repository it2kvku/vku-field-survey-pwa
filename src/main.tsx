import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return
  if (!import.meta.env.PROD) return

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('Service Worker registration failed', error)
    })
  })
}

const root = document.getElementById('root')
if (!root) throw new Error('Root container #root was not found.')

registerServiceWorker()

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
)
