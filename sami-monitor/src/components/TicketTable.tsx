import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { SupportTicket } from '../types'
import { StatusBadge } from './StatusBadge'

type TicketTableProps = {
  tickets: SupportTicket[]
  selectedTicketId?: string
  onSelectTicket: (ticketId: string) => void
}

const pageSize = 5

export function TicketTable({
  tickets,
  selectedTicketId,
  onSelectTicket,
}: TicketTableProps) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)

  const filteredTickets = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return tickets

    return tickets.filter((ticket) =>
      [
        ticket.id,
        ticket.ticketRequester,
        ticket.ticketOwner,
        ticket.responsibleGroup,
        ticket.company,
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalized),
    )
  }, [query, tickets])

  const pageCount = Math.max(1, Math.ceil(filteredTickets.length / pageSize))
  const safePage = Math.min(page, pageCount - 1)
  const visibleTickets = filteredTickets.slice(
    safePage * pageSize,
    safePage * pageSize + pageSize,
  )

  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-soft">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Atendimentos analisados</h2>
          <p className="text-sm text-slate-500">
            Tabela escaneável com score, CSAT e pilares críticos.
          </p>
        </div>
        <label className="flex min-w-0 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 sm:w-72">
          <Search size={16} />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setPage(0)
            }}
            placeholder="Buscar ticket, grupo ou empresa"
            className="w-full bg-transparent text-slate-700 outline-none placeholder:text-slate-400"
          />
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Ticket</th>
              <th className="px-5 py-3 font-semibold">Responsável</th>
              <th className="px-5 py-3 font-semibold">Grupo</th>
              <th className="px-5 py-3 font-semibold">CSAT</th>
              <th className="px-5 py-3 font-semibold">Score</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleTickets.map((ticket) => (
              <tr
                key={ticket.id}
                onClick={() => onSelectTicket(ticket.id)}
                className={`cursor-pointer transition hover:bg-red-50/50 ${
                  ticket.id === selectedTicketId ? 'bg-red-50' : 'bg-white'
                }`}
              >
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-950">{ticket.id}</p>
                  <p className="text-xs text-slate-500">{ticket.ticketRequester}</p>
                </td>
                <td className="px-5 py-4 text-slate-600">{ticket.ticketOwner}</td>
                <td className="px-5 py-4 text-slate-600">
                  {ticket.responsibleGroup}
                </td>
                <td className="px-5 py-4 font-semibold text-slate-800">
                  {ticket.csat}/5
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${ticket.evaluation.overallScore}%` }}
                      />
                    </div>
                    <span className="font-semibold text-slate-900">
                      {ticket.evaluation.overallScore}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={ticket.evaluation.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 p-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Mostrando {visibleTickets.length} de {filteredTickets.length} registros
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(0, current - 1))}
            disabled={safePage === 0}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={16} /> Anterior
          </button>
          <span className="px-2 font-semibold text-slate-700">
            {safePage + 1}/{pageCount}
          </span>
          <button
            type="button"
            onClick={() =>
              setPage((current) => Math.min(pageCount - 1, current + 1))
            }
            disabled={safePage >= pageCount - 1}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Próxima <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  )
}
