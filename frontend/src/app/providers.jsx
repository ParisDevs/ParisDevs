
import { AppViewModelProvider } from '@/viewmodels/AppViewModel'

export function AppProviders({ children }) {
  return <AppViewModelProvider>{children}</AppViewModelProvider>
}
