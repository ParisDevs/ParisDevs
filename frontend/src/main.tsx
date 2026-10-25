import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/app/App'
import { AppProviders } from '@/app/providers'
import './styles/tokens.css'

try {
  const stored = JSON.parse(localStorage.getItem('pd.config') || '{}') as { theme?: string }
  if (stored.theme === 'dark') document.documentElement.dataset.theme = 'dark'
} catch {
  /* noop */
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
)
