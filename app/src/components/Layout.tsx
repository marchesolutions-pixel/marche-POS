import { useEffect, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Bell, User, AlertTriangle } from 'lucide-react'
import { trpc } from '@/providers/trpc'
import { useAuth } from '@/hooks/useAuth'

export default function Layout() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)
  const { user, logout } = useAuth()
  const { data: kpi } = trpc.dashboard.kpi.useQuery()

  const lowStockCount = kpi?.lowStockCount ?? 0
  const alerts = [] as { title: string; description: string }[]

  if (lowStockCount > 0) {
    alerts.push({
      title: `${lowStockCount} low stock item${lowStockCount > 1 ? 's' : ''}`,
      description: 'Review inventory and reorder stock for low items.',
    })
  }

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as Node
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(target)
      ) {
        setShowNotifications(false)
      }
      if (userRef.current && !userRef.current.contains(target)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground dark:bg-slate-950 dark:text-slate-100">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="sticky top-0 z-20 border-b border-border bg-card/95 px-4 py-4 backdrop-blur-sm lg:px-6">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold">Marche POS</h1>
                <p className="text-sm text-muted-foreground">
                  Fast access to your dashboard, sales, inventory, and settings.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative" ref={notificationsRef}>
                  <button
                    type="button"
                    className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="System notifications"
                    onClick={() => setShowNotifications(prev => !prev)}
                  >
                    <Bell className="h-5 w-5" />
                    {lowStockCount > 0 ? (
                      <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                        {lowStockCount}
                      </span>
                    ) : (
                      <span className="absolute -top-1 -right-1 inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
                    )}
                  </button>
                  {showNotifications && (
                    <div className="absolute right-0 top-full mt-3 w-80 rounded-xl border border-border bg-card p-4 shadow-xl">
                      <div className="flex items-center justify-between pb-3">
                        <div>
                          <p className="text-sm font-semibold">System notifications</p>
                          <p className="text-xs text-muted-foreground">
                            Latest inventory and alert updates.
                          </p>
                        </div>
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary">
                          {alerts.length}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {alerts.length > 0 ? (
                          alerts.map((alert, index) => (
                            <div
                              key={index}
                              className="rounded-2xl border border-border bg-background p-3"
                            >
                              <div className="flex items-start gap-3">
                                <div className="rounded-full bg-rose-100 p-2 text-rose-600">
                                  <AlertTriangle className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold">{alert.title}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {alert.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-2xl border border-border bg-background p-4 text-sm text-muted-foreground">
                            No system notifications at the moment.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative" ref={userRef}>
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="User account"
                    onClick={() => setShowUserMenu(prev => !prev)}
                  >
                    <User className="h-5 w-5" />
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-3 w-64 rounded-xl border border-border bg-card p-4 shadow-xl">
                      <div className="flex items-center gap-3 border-b border-border pb-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{user?.name || 'Account'}</p>
                          <p className="text-xs text-muted-foreground">
                            {user?.email || 'No email available'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 space-y-3">
                        <button
                          type="button"
                          className="w-full rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
                          onClick={() => {
                            logout()
                          }}
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
