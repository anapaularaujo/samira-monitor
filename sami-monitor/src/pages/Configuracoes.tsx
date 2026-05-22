import { Cpu, Gauge, Palette, Shield } from 'lucide-react'
import { pillarMetadata } from '../utils/mockData'

const settings = [
  {
    icon: Gauge,
    title: 'Faixas de score',
    description:
      'Excelente a partir de 85, Atenção de 70 a 84 e Crítico abaixo de 70.',
  },
  {
    icon: Shield,
    title: 'Critérios regulatórios',
    description:
      'Marcadores para ANS, LGPD, CDC, prazos e tratamento de dados sensíveis.',
  },
  {
    icon: Cpu,
    title: 'Modo de avaliação',
    description:
      'Simulação determinística local preparada para substituição por API.',
  },
  {
    icon: Palette,
    title: 'Identidade visual',
    description:
      'Cor primária configurável via --color-primary e tailwind.config.ts.',
  },
]

export function Configuracoes() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
          Configurações
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Motor de monitoria
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          Definições iniciais do protótipo para score, visual e critérios dos
          pilares de qualidade.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {settings.map((setting) => {
          const Icon = setting.icon
          return (
            <article
              key={setting.title}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-primary">
                <Icon size={22} />
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-950">
                {setting.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {setting.description}
              </p>
            </article>
          )
        })}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <h3 className="text-lg font-bold text-slate-950">Pilares monitorados</h3>
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {Object.values(pillarMetadata).map((pillar, index) => (
            <div
              key={pillar.label}
              className="flex gap-3 rounded-2xl bg-slate-50 p-4"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white font-bold text-primary shadow-sm">
                {index + 1}
              </span>
              <div>
                <p className="font-semibold text-slate-900">{pillar.label}</p>
                <p className="mt-1 text-sm text-slate-500">{pillar.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
