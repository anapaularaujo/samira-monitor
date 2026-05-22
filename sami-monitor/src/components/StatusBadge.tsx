import type { TicketStatus } from '../types'

const statusClassName: Record<TicketStatus, string> = {
  Excelente: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Atencao: 'bg-amber-50 text-amber-700 ring-amber-200',
  Critico: 'bg-red-50 text-red-700 ring-red-200',
}

export function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusClassName[status]}`}
    >
      {status === 'Atencao' ? 'Atenção' : status}
    </span>
  )
}
