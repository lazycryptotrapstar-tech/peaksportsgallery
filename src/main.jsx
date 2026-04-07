import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

// ── App mode — controlled by VITE_APP_MODE environment variable ───────────────
// demo     → demo.simplegenius.io — public, no auth, DemoApp
// playbook → playbook.simplegenius.io — auth-gated, full staff portal
const APP_MODE = import.meta.env.VITE_APP_MODE || 'demo'

async function bootstrap() {
  if (APP_MODE === 'playbook') {
    const { default: App } = await import('./App')
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode><App /></React.StrictMode>
    )
  } else {
    const { default: DemoApp } = await import('./demo/DemoApp')
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode><DemoApp /></React.StrictMode>
    )
  }
}

bootstrap()
