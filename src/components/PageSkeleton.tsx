export function PageSkeleton() {
  return (
    <div role="status" aria-label="Loading" className="animate-pulse space-y-6">
      <div className="h-8 w-56 rounded-badge bg-card" />
      <div className="h-40 rounded-card bg-card" />
    </div>
  )
}
