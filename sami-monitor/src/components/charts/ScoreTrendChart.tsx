import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { SupportTicket } from '../../types'

type ScoreTrendChartProps = {
  tickets: SupportTicket[]
}

export function ScoreTrendChart({ tickets }: ScoreTrendChartProps) {
  const data = tickets.map((ticket) => ({
    ticket: ticket.id.replace('SAM-', '#'),
    score: ticket.evaluation.overallScore,
    csat: ticket.csat * 20,
  }))

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ left: -18, right: 8, top: 8 }}>
          <defs>
            <linearGradient id="scoreGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#ff5751" stopOpacity={0.28} />
              <stop offset="95%" stopColor="#ff5751" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="ticket" tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              borderRadius: 16,
              border: '1px solid #e2e8f0',
              boxShadow: '0 20px 40px -30px rgba(15, 23, 42, 0.45)',
            }}
          />
          <Area
            type="monotone"
            dataKey="score"
            name="Score geral"
            stroke="#ff5751"
            strokeWidth={3}
            fill="url(#scoreGradient)"
          />
          <Area
            type="monotone"
            dataKey="csat"
            name="CSAT normalizado"
            stroke="#2563eb"
            strokeWidth={2}
            fill="transparent"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
