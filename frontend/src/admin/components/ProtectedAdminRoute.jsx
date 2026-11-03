
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'

export default function ProtectedAdminRoute() {
  const { admin, loading } = useAdminAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
          Verifying access
        </p>
      </div>
    )
  }

  if (!admin) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  return <Outlet />
}
