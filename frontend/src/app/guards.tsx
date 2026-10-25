import { Navigate, Outlet } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { useApp } from '@/state/AppContext'

export function ProtectedRoute() {
  const { session } = useApp()
  if (!session) return <Navigate to="/login" replace />
  return <AppShell />
}

export function AuthedOutlet() {
  return <Outlet />
}
