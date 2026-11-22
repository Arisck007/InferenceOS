import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: LucideIcon
  message: string
  action?: ReactNode
}

export function EmptyState({ icon: Icon, message, action }: EmptyStateProps) {
  return (
    <section className="flex flex-col items-center gap-4 rounded-card border border-line bg-card px-6 py-16 text-center">
      <Icon size={32} aria-hidden className="text-secondary" />
      <p>{message}</p>
      {action}
    </section>
  )
}
