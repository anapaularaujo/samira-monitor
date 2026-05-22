import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { SupportTicket } from '../types'
import { StatusBadge } from '../components/StatusBadge'

type RelatoriosProps = {
  tickets: SupportTicket[]
}

const average = (values: number[]) =>
  values.length
    ? Math.round(values.reduce((total, value) => total + value, 0) / values.length)
    : 0

export function Relatorios({ tickets }: RelatoriosProps) {
  const groups = Object.values(
    tickets.reduce<
      Record<string, { group: string; tickets: SupportTicket[]; score: number }>
    >((accumulator, ticket) => {
      const current = accumulator[ticket.responsibleGroup] ?? {
        group: ticket.responsibleGroup,
        tickets: [],
        score: 0,
      }
      current.tickets.push(ticket)
      current.score = average(
        current.tickets.map((item) => item.evaluation.overallScore),
      )
      accumulator[ticket.responsibleGroup] = current
      return accumulator
    }, {}),
  ).sort((a, b) => b.score - a.score)

  const companies = Object.values(
    tickets.reduce<Record<string, { company: string; total: number; critical: number }>>(
      (accumulator, ticket) => {
        const current = accumulator[ticket.company] ?? {
          company: ticket.company,
          total: 0,
          critical: 0,
        }
        current.total += 1
        if (ticket.evaluation.status === 'Critico') current.critical += 1
        accumulator[ticket.company] = current
        return accumulator
      },
      {},
    ),
  )

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
          Relatórios
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Performance por grupo e empresa
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Recortes para priorizar calibração, coaching e auditorias de qualidade.
        </p>
      </header>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <h3 className="text-lg font-bold text-slate-950">
            Score médio por grupo responsável
          </h3>
          <div className="mt-4 h-80">
            <ResponsiveContainer>
              <BarChart data={groups} margin={{ left: -18, right: 8, top: 8 }}>
                <CartesianGrid
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                  vertical={false}
                />
                <XAxis dataKey="group" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 16,
                    border: '1px solid #e2e8f0',
                  }}
                />
                <Bar dataKey="score" name="Score médio" fill="#ff5751" radius={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <h3 className="text-lg font-bold text-slate-950">Risco por empresa</h3>
          <div className="mt-5 space-y-3">
            {companies.map((company) => (
              <div
                key={company.company}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900">{company.company}</p>
                  <span className="text-sm font-semibold text-slate-500">
                    {company.total} tickets
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  {company.critical} casos críticos simulados
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-soft">
        <div className="border-b border-slate-100 p-5">
          <h3 className="text-lg font-bold text-slate-950">
            Ranking de atendimentos
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Ticket</th>
                <th className="px-5 py-3">Empresa</th>
                <th className="px-5 py-3">Responsável</th>
                <th className="px-5 py-3">Score</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...tickets]
                .sort((a, b) => b.evaluation.overallScore - a.evaluation.overallScore)
                .map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="px-5 py-4 font-semibold text-slate-950">
                      {ticket.id}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{ticket.company}</td>
                    <td className="px-5 py-4 text-slate-600">
                      {ticket.ticketOwner}
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-950">
                      {ticket.evaluation.overallScore}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={ticket.evaluation.status} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
