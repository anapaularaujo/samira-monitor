import { lazy, Suspense, useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { routes } from './routes'
import type { RouteKey, SupportTicket } from './types'
import { mockTickets } from './utils/mockData'

const Dashboard = lazy(() =>
  import('./pages/Dashboard').then((module) => ({ default: module.Dashboard })),
)
const Upload = lazy(() =>
  import('./pages/Upload').then((module) => ({ default: module.Upload })),
)
const AnaliseDetalhada = lazy(() =>
  import('./pages/AnaliseDetalhada').then((module) => ({
    default: module.AnaliseDetalhada,
  })),
)
const Relatorios = lazy(() =>
  import('./pages/Relatorios').then((module) => ({ default: module.Relatorios })),
)
const Configuracoes = lazy(() =>
  import('./pages/Configuracoes').then((module) => ({
    default: module.Configuracoes,
  })),
)

function App() {
  const [activeRoute, setActiveRoute] = useState<RouteKey>('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [tickets, setTickets] = useState<SupportTicket[]>(mockTickets)
  const [selectedTicketId, setSelectedTicketId] = useState(mockTickets[0]?.id)
  const [lastImportedFile, setLastImportedFile] = useState<string>()

  const activeRouteMeta = routes.find((route) => route.key === activeRoute)

  const handleRouteChange = (route: RouteKey) => {
    setActiveRoute(route)
    setIsSidebarOpen(false)
  }

  const handleUpload = (uploadedTickets: SupportTicket[], fileName: string) => {
    setTickets(uploadedTickets)
    setSelectedTicketId(uploadedTickets[0]?.id)
    setLastImportedFile(fileName)
    setActiveRoute('dashboard')
  }

  const renderPage = () => {
    switch (activeRoute) {
      case 'upload':
        return (
          <Upload onUpload={handleUpload} lastImportedFile={lastImportedFile} />
        )
      case 'analise-detalhada':
        return (
          <AnaliseDetalhada
            tickets={tickets}
            selectedTicketId={selectedTicketId}
            onSelectTicket={setSelectedTicketId}
          />
        )
      case 'relatorios':
        return <Relatorios tickets={tickets} />
      case 'configuracoes':
        return <Configuracoes />
      case 'dashboard':
      default:
        return (
          <Dashboard
            tickets={tickets}
            selectedTicketId={selectedTicketId}
            onSelectTicket={(ticketId) => {
              setSelectedTicketId(ticketId)
              setActiveRoute('analise-detalhada')
            }}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-slate-canvas text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar
          activeRoute={activeRoute}
          isOpen={isSidebarOpen}
          onRouteChange={handleRouteChange}
          onToggle={() => setIsSidebarOpen((current) => !current)}
        />

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-5 flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-soft backdrop-blur md:flex-row md:items-center md:justify-between">
              <div className="pl-14 lg:pl-0">
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">
                  {activeRouteMeta?.description}
                </p>
                <p className="mt-1 text-sm font-medium text-slate-600">
                  Protótipo Sami Monitor • {tickets.length} atendimentos em memória
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                <span className="rounded-full bg-red-50 px-3 py-1.5 text-primary">
                  Primary #ff5751
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1.5">
                  React + Tailwind + Recharts
                </span>
              </div>
            </div>

            <Suspense
              fallback={
                <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm font-semibold text-slate-500 shadow-soft">
                  Carregando módulo...
                </div>
              }
            >
              {renderPage()}
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
