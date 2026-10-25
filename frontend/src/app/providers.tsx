import { type ReactNode } from 'react'
import { AppProvider } from '@/state/AppContext'

export function AppProviders({ children }: { children: ReactNode }) {
  return <AppProvider>{children}</AppProvider>
}
