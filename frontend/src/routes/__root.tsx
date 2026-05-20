import { createRootRoute, Outlet, useRouterState } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Navbar } from '../components/layout/Navbar'

function RootComponent() {
  const routerState = useRouterState()
  const isDashboardLayout = routerState.location.pathname.startsWith('/admin') || routerState.location.pathname.startsWith('/student')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {!isDashboardLayout && <Navbar />}
      
      <main className="flex-grow">
        <Outlet />
      </main>

      {!isDashboardLayout && (
        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-500">
              &copy; {new Date().getFullYear()} StudentHub. All rights reserved.
            </p>
          </div>
        </footer>
      )}
      
      <TanStackRouterDevtools />
    </div>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})