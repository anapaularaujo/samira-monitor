import { Clock3, ShieldCheck, SmilePlus, TriangleAlert } from 'lucide-react'
import { useMemo } from 'react'
import { MetricCard } from '../components/MetricCard'
import { TicketTable } from '../components/TicketTable'
import { PillarChart } from '../components/charts/PillarChart'
import { ScoreTrendChart } from '../components/charts/ScoreTrendChart'
import { pillarMetadata } from '../utils/mockData'
import type { PillarKey, PillarScore, SupportTicket } from '../types'

type DashboardProps = {
  tickets: SupportTicket[]
  selectedTicketId?: string
  onSelectTicket: (ticketId: string) => void
}

const average = (values: number[]) =>
  values.length
    ? Math.round(values.reduce((total, value) => total + value, 0) / values.length)
    : 0

export function Dashboard({
  tickets,
  selectedTicketId,
  onSelectTicket,
}: DashboardProps) {
  const metrics = useMemo(() => {
    const averageScore = average(
      tickets.map((ticket) => ticket.evaluation.overallScore),
    )
    const averageCsat = tickets.length
      ? (
          tickets.reduce((total, ticket) => total + ticket.csat, 0) / tickets.length
        ).toFixed(1)
      : '0.0'
    const criticalCount = tickets.filter(
      (ticket) => ticket.evaluation.status === 'Critico',
    ).length
    const averageFirstResponse = average(
      tickets.map((ticket) => ticket.firstResponseMinutes),
    )

    return {
      averageScore,
      averageCsat,
      criticalCount,
      averageFirstResponse,
    }
  }, [tickets])

  const averagePillars = useMemo<PillarScore[]>(() => {
    const pillarKeys = Object.keys(pillarMetadata) as PillarKey[]

    return pillarKeys.map((key) => {
      const metadata = pillarMetadata[key]
      return {
        key,
        label: metadata.label,
        description: metadata.description,
        score: average(
          tickets.map(
            (ticket) =>
              ticket.evaluation.pillarScores.find((pillar) => pillar.key === key)
                ?.score ?? 0,
          ),
        ),
      }
    })
  }, [tickets])

  const weakestPillar = [...averagePillars].sort((a, b) => a.score - b.score)[0]

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-5 rounded-3xl bg-slate-950 p-6 text-white shadow-soft md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-red-200">
            Qualidade em planos de saúde
          </p>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
            Monitoria inteligente para atendimentos Sami
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Visualize scores, riscos regulatórios, eficiência e oportunidades de
            coaching por atendimento importado.
          </p>
        </div>
        <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-300">
            Pilar mais sensível
          </p>
          <p className="mt-1 text-lg font-semibold">
            {weakestPillar?.label ?? 'Sem dados'} ({weakestPillar?.score ?? 0})
          </p>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Score médio"
          value={`${metrics.averageScore}/100`}
          helper={`${tickets.length} atendimentos monitorados`}
          icon={ShieldCheck}
          trend="+8 pts vs. meta"
        />
        <MetricCard
          title="CSAT médio"
          value={`${metrics.averageCsat}/5`}
          helper="Percepção do membro"
          icon={SmilePlus}
        />
        <MetricCard
          title="Riscos críticos"
          value={String(metrics.criticalCount)}
          helper="Casos abaixo de 70 pontos"
          icon={TriangleAlert}
        />
        <MetricCard
          title="1ª resposta"
          value={`${metrics.averageFirstResponse} min`}
          helper="Tempo médio até contato"
          icon={Clock3}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-950">Tendência de score</h2>
            <p className="text-sm text-slate-500">
              Comparativo entre pontuação geral e CSAT normalizado.
            </p>
          </div>
          <ScoreTrendChart tickets={tickets} />
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-950">Média por pilar</h2>
            <p className="text-sm text-slate-500">
              Radar dos 7 pilares de qualidade simulados.
            </p>
          </div>
          <PillarChart data={averagePillars} />
        </article>
      </section>

      <TicketTable
        tickets={tickets}
        selectedTicketId={selectedTicketId}
        onSelectTicket={onSelectTicket}
      />
    </div>
  )
}
