import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { PillarScore } from '../../types'

type PillarChartProps = {
  data: PillarScore[]
}

export function PillarChart({ data }: PillarChartProps) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer>
        <RadarChart data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey="label"
            tick={{ fill: '#64748b', fontSize: 11 }}
          />
          <Tooltip
            formatter={(value) => [`${value}/100`, 'Nota']}
            contentStyle={{
              borderRadius: 16,
              border: '1px solid #e2e8f0',
              boxShadow: '0 20px 40px -30px rgba(15, 23, 42, 0.45)',
            }}
          />
          <Radar
            name="Nota"
            dataKey="score"
            stroke="#ff5751"
            fill="#ff5751"
            fillOpacity={0.22}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
