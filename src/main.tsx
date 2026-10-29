import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App.tsx'
import SharePage from './SharePage.tsx'
import { shareIdFromPath } from './sharing'

const shareId = shareIdFromPath(window.location.pathname)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      {shareId ? <SharePage shareId={shareId} /> : <App />}
    </BrowserRouter>
  </StrictMode>,
)
