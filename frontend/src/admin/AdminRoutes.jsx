
import { Routes, Route, Navigate } from 'react-router-dom'

import { AdminAuthProvider } from './context/AdminAuthContext'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminLayout from './components/AdminLayout'
import ProtectedAdminRoute from './components/ProtectedAdminRoute'
import AdminOrders from './pages/AdminOrders'
import AdminOrderDetails from './pages/AdminOrderDetails'

import AdminInventory from "./pages/AdminInventory"
import AdminProducts from './pages/AdminProducts'
import AdminProductEditor from './pages/AdminProductEditor'
import BackToTopButton from '../components/BackToTopButton'

function AdminRouteContent() {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />

      <Route element={<ProtectedAdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products/new" element={<AdminProductEditor />} />
          <Route path="products/:id" element={<AdminProductEditor />} />
          <Route path="products" element={<AdminProducts />} />


          <Route path="inventory" element={<AdminInventory />} />
          <Route path="orders/:id" element={<AdminOrderDetails />} />
          <Route path="orders" element={<AdminOrders />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  )
}


export default function AdminRoutes() {
  return (
    <AdminAuthProvider>
      <BackToTopButton />
      <AdminRouteContent />
    </AdminAuthProvider>
  )
}
