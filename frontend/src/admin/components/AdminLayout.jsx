
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'

const navItems = [
  { label: 'Overview', path: '/admin' },
  { label: 'Products', path: '/admin/products' },
  { label: 'Inventory', path: '/admin/inventory' },
   { label: 'Orders', path: '/admin/orders' },
]

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      await logout()
      navigate('/admin/login', { replace: true })
    } catch {
      navigate('/admin/login', { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f8f6] text-[#151515] md:grid md:grid-cols-[240px_1fr]">
      <aside className="flex flex-col border-b border-neutral-200 bg-white md:min-h-screen md:border-b-0 md:border-r">
        <div className="border-b border-neutral-200 px-7 py-7">
          <a
            href="/"
            className="font-[var(--font-display)] text-lg tracking-[0.12em]"
          >
            JOSH AMOR
          </a>

          <p className="mt-2 text-[9px] uppercase tracking-[0.2em] text-neutral-400">
            Administration
          </p>
        </div>

        <nav className="flex gap-2 overflow-x-auto p-4 md:flex-1 md:flex-col md:gap-1 md:p-5">
          <p className="hidden px-3 pb-3 pt-2 text-[9px] uppercase tracking-[0.18em] text-neutral-400 md:block">
            Workspace
          </p>

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `whitespace-nowrap px-3 py-3 text-[10px] uppercase tracking-[0.13em] transition-colors ${
                  isActive
                    ? 'bg-[#151515] text-white'
                    : 'text-neutral-500 hover:bg-neutral-100 hover:text-[#151515]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden border-t border-neutral-200 p-5 md:block">
          <p className="truncate text-xs text-neutral-700">
            {admin?.email || 'Administrator'}
          </p>

          <button
            onClick={handleLogout}
            className="mt-4 text-[9px] uppercase tracking-[0.16em] text-neutral-500 transition-colors hover:text-black"
          >
            Sign out ↗
          </button>
        </div>

        <div className="border-t border-neutral-200 p-4 md:hidden">
          <button
            onClick={handleLogout}
            className="text-[9px] uppercase tracking-[0.16em] text-neutral-500"
          >
            Sign out ↗
          </button>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="flex min-h-[76px] items-center justify-between border-b border-neutral-200 bg-white px-6 md:px-10">
          <p className="text-[9px] uppercase tracking-[0.18em] text-neutral-400">
            Store management
          </p>

          <p className="text-xs text-neutral-500">
            {admin?.role || 'Administrator'}
          </p>
        </header>

        <main className="px-6 py-8 md:px-10 md:py-12">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
