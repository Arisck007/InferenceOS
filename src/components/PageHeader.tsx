interface PageHeaderProps {
  title: string
  description: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="font-heading text-2xl font-semibold">{title}</h1>
      <p className="mt-1 text-secondary">{description}</p>
    </div>
  )
}
