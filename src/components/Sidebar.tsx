import { NavLink } from 'react-router-dom'
import { navigation } from '../app/navigation'

export function Sidebar() {
  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col bg-sidebar px-4 py-5">
      <p className="font-heading text-lg font-semibold">InferenceOS</p>
      <p className="mb-6 text-xs text-secondary">From data to decisions</p>
      <nav aria-label="Main" className="space-y-5">
        {navigation.map((group) => (
          <div key={group.title}>
            <h2 className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-secondary">
              {group.title}
            </h2>
            <ul>
              {group.items.map(({ path, label, icon: Icon }) => (
                <li key={path}>
                  <NavLink
                    to={path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-control px-3 py-2 hover:bg-hover ${
                        isActive ? 'bg-hover font-semibold [&>svg]:text-brand' : ''
                      }`
                    }
                  >
                    <Icon size={18} aria-hidden />
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
