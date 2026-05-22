import { Activity, Menu, X } from 'lucide-react'
import { routes } from '../routes'
import type { RouteKey } from '../types'

type SidebarProps = {
  activeRoute: RouteKey
  isOpen: boolean
  onRouteChange: (route: RouteKey) => void
  onToggle: () => void
}

export function Sidebar({
  activeRoute,
  isOpen,
  onRouteChange,
  onToggle,
}: SidebarProps) {
  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        className="fixed left-4 top-4 z-50 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-soft lg:hidden"
        aria-label="Alternar navegação"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-950/30 backdrop-blur-sm lg:hidden"
          onClick={onToggle}
          aria-label="Fechar navegação"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white/95 px-5 py-6 shadow-soft backdrop-blur transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 px-1">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-red-200">
            <Activity size={23} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
              Sami
            </p>
            <h1 className="text-xl font-bold tracking-tight text-slate-950">
              Monitor
            </h1>
          </div>
        </div>

        <nav className="mt-9 space-y-2">
          {routes.map((route) => {
            const Icon = route.icon
            const isActive = route.key === activeRoute

            return (
              <button
                key={route.key}
                type="button"
                onClick={() => onRouteChange(route.key)}
                className={`group flex w-full items-start gap-3 rounded-2xl px-4 py-3 text-left transition ${
                  isActive
                    ? 'bg-primary text-white shadow-lg shadow-red-100'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                }`}
              >
                <Icon
                  size={20}
                  className={isActive ? 'mt-0.5 text-white' : 'mt-0.5 text-slate-400'}
                />
                <span>
                  <span className="block text-sm font-semibold">{route.label}</span>
                  <span
                    className={`mt-0.5 block text-xs ${
                      isActive ? 'text-white/80' : 'text-slate-400'
                    }`}
                  >
                    {route.description}
                  </span>
                </span>
              </button>
            )
          })}
        </nav>

        <div className="mt-auto rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Motor 7 Pilares</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Protótipo preparado para trocar a simulação local por uma API de
            avaliação.
          </p>
        </div>
      </aside>
    </>
  )
}
