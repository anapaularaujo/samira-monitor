import type { LucideIcon } from 'lucide-react'

type MetricCardProps = {
  title: string
  value: string
  helper: string
  icon: LucideIcon
  trend?: string
}

export function MetricCard({
  title,
  value,
  helper,
  icon: Icon,
  trend,
}: MetricCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-primary">
          <Icon size={22} />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 text-sm">
        <span className="text-slate-500">{helper}</span>
        {trend && (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            {trend}
          </span>
        )}
      </div>
    </article>
  )
}
