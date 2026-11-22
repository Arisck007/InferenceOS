import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { PageSkeleton } from './PageSkeleton'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

export function AppLayout() {
  return (
    <div className="flex min-h-screen min-w-[1280px]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 p-8">
          <Suspense fallback={<PageSkeleton />}>
            <Outlet />
          </Suspense>
        </main>
        <footer className="border-t border-line px-8 py-4 text-xs text-secondary">
          InferenceOS is a planning and tracking tool, not investment advice.
        </footer>
      </div>
    </div>
  )
}
