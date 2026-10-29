import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { AppShell } from '@/views/layouts/AppShell'
import { useAppViewModel } from '@/viewmodels/AppViewModel'
import { RouteErrorBoundary } from './RouteErrorBoundary'

export function ProtectedRoute() {
  const { usuario, token } = useAppViewModel()
  if (!usuario || !token) return <Navigate to="/login" replace />
  return <AppShell />
}

export function AuthedOutlet() {
  const location = useLocation()
  return (
    <RouteErrorBoundary resetKey={location.pathname}>
      <Outlet />
    </RouteErrorBoundary>
  )
}
