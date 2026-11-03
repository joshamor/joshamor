
import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  const sections = [
    {
      number: '01',
      title: 'Products',
      description: 'Create, edit and publish products in your store.',
      link: '/admin/products',
      action: 'Manage products',
    },
    {
      number: '02',
      title: 'Inventory',
      description: 'Manage stock levels across colours and sizes.',
      link: '/admin/inventory',
      action: 'Manage inventory',
    },
    {
      number: '03',
      title: 'Orders',
      description: 'View customer orders, manage fulfilment and add internal order notes.',
      link: '/admin/orders',
      action: 'Manage orders',
    },
  ]
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-12 border-b border-neutral-200 pb-8">
        <p className="mb-4 text-[9px] uppercase tracking-[0.2em] text-neutral-400">
          Overview
        </p>

        <h1 className="font-[var(--font-display)] text-3xl md:text-4xl">
          Welcome to your workspace.
        </h1>

        <p className="mt-4 max-w-xl text-sm leading-7 text-neutral-500">
          Manage the JOSH AMOR storefront, product catalogue and inventory
          from one place.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-px border border-neutral-200 bg-neutral-200 md:grid-cols-3">        {sections.map((section) => (
          <div
            key={section.number}
            className="flex min-h-[260px] flex-col bg-white p-7 md:p-9"
          >
            <p className="text-[9px] tracking-[0.16em] text-neutral-400">
              {section.number}
            </p>

            <h2 className="mt-8 font-[var(--font-display)] text-2xl">
              {section.title}
            </h2>

            <p className="mt-3 max-w-sm text-sm leading-7 text-neutral-500">
              {section.description}
            </p>

            <Link
              to={section.link}
              className="mt-auto inline-flex w-fit border-b border-[#151515] pb-2 pt-8 text-[9px] uppercase tracking-[0.16em] transition-opacity hover:opacity-50"
            >
              {section.action} ↗
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-12 border-t border-neutral-200 pt-6">
        <p className="text-[9px] uppercase tracking-[0.18em] text-neutral-400">
          JOSH AMOR — Tailored for power
        </p>
      </div>
    </div>
  )
}
