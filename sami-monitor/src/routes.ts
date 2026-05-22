import {
  BarChart3,
  FileUp,
  LineChart,
  Settings,
  ShieldCheck,
} from 'lucide-react'
import type { RouteKey } from './types'

export type AppRoute = {
  key: RouteKey
  label: string
  description: string
  icon: typeof BarChart3
}

export const routes: AppRoute[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    description: 'Visão executiva da qualidade.',
    icon: BarChart3,
  },
  {
    key: 'upload',
    label: 'Upload',
    description: 'Importação CSV ou Excel.',
    icon: FileUp,
  },
  {
    key: 'analise-detalhada',
    label: 'Análise Detalhada',
    description: 'Auditoria por atendimento.',
    icon: ShieldCheck,
  },
  {
    key: 'relatorios',
    label: 'Relatórios',
    description: 'Indicadores por grupo e empresa.',
    icon: LineChart,
  },
  {
    key: 'configuracoes',
    label: 'Configurações',
    description: 'Critérios do motor de monitoria.',
    icon: Settings,
  },
]
