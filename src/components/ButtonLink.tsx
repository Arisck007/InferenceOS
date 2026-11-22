import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function ButtonLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="rounded-control bg-brand-hover px-4 py-2 font-semibold text-white hover:bg-brand-hover/90"
    >
      {children}
    </Link>
  )
}
