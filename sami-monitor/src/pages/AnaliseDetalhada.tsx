import {
  ClipboardCheck,
  MessageSquareQuote,
  Target,
  ThumbsUp,
  Timer,
  UserRound,
} from 'lucide-react'
import { PillarChart } from '../components/charts/PillarChart'
import { StatusBadge } from '../components/StatusBadge'
import type { SupportTicket } from '../types'

type AnaliseDetalhadaProps = {
  tickets: SupportTicket[]
  selectedTicketId?: string
  onSelectTicket: (ticketId: string) => void
}

export function AnaliseDetalhada({
  tickets,
  selectedTicketId,
  onSelectTicket,
}: AnaliseDetalhadaProps) {
  const selectedTicket =
    tickets.find((ticket) => ticket.id === selectedTicketId) ?? tickets[0]

  if (!selectedTicket) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-500 shadow-soft">
        Nenhum atendimento disponível para análise.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
            Auditoria individual
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Análise detalhada
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Pontuação geral, pilares, não conformidades e plano de ação.
          </p>
        </div>
        <select
          value={selectedTicket.id}
          onChange={(event) => onSelectTicket(event.target.value)}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm outline-none"
        >
          {tickets.map((ticket) => (
            <option key={ticket.id} value={ticket.id}>
              {ticket.id} - {ticket.ticketOwner}
            </option>
          ))}
        </select>
      </header>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">
                {selectedTicket.id}
              </p>
              <h3 className="mt-1 text-2xl font-bold text-slate-950">
                {selectedTicket.motivationPrimary}
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                {selectedTicket.company} • {selectedTicket.responsibleGroup}
              </p>
            </div>
            <StatusBadge status={selectedTicket.evaluation.status} />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Score geral
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-950">
                {selectedTicket.evaluation.overallScore}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                CSAT
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-950">
                {selectedTicket.csat}/5
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                1ª resposta
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-950">
                {selectedTicket.firstResponseMinutes}m
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <MessageSquareQuote size={18} className="text-red-200" />
              Histórico da conversa
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {selectedTicket.conversationHistory}
            </p>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <h3 className="text-lg font-bold text-slate-950">Radar do atendimento</h3>
          <PillarChart data={selectedTicket.evaluation.pillarScores} />
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <InsightList
          icon={ThumbsUp}
          title="Pontos positivos"
          items={selectedTicket.evaluation.positives}
        />
        <InsightList
          icon={ClipboardCheck}
          title="Não conformidades"
          items={selectedTicket.evaluation.nonConformities}
        />
        <InsightList
          icon={Target}
          title="Plano de ação"
          items={selectedTicket.evaluation.actionPlan}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
            <UserRound size={18} className="text-primary" />
            Feedback do atendente
          </div>
          <p className="mt-3 text-lg font-semibold leading-7 text-slate-950">
            {selectedTicket.evaluation.attendantFeedback}
          </p>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
            <Timer size={18} className="text-primary" />
            Tempos operacionais
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Info label="Início" value={selectedTicket.startedAt} />
            <Info label="Fim" value={selectedTicket.endedAt} />
            <Info label="Duração total" value={`${selectedTicket.durationMinutes} min`} />
          </div>
        </article>
      </section>
    </div>
  )
}

function InsightList({
  icon: Icon,
  title,
  items,
}: {
  icon: typeof ThumbsUp
  title: string
  items: string[]
}) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
      <div className="flex items-center gap-2 text-lg font-bold text-slate-950">
        <Icon size={20} className="text-primary" />
        {title}
      </div>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
            {item}
          </li>
        ))}
      </ul>
    </article>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  )
}
