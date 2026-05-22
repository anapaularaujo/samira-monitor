import type {
  CsvTicketRow,
  PillarKey,
  PillarScore,
  SupportTicket,
  TicketEvaluation,
  TicketStatus,
} from '../types'

export const requiredColumns = [
  'ID do Ticket',
  'Solicitante do Ticket',
  'ID Externo da Organização',
  'Grupo Responsável',
  'Responsável pelo Ticket',
  'Data/Hora Início',
  'Data/Hora Fim',
  'Data/Hora 1ª Resposta',
  'CSAT',
  'Tabulação de contato - membro (motivação 1)',
  'Tabulação de contato - membro 2 (Motivação 2)',
  'Histórico da Conversa',
  'Solicitante',
  'Empresa',
] as const

export const pillarMetadata: Record<
  PillarKey,
  { label: string; description: string }
> = {
  technical: {
    label: 'Aspectos Técnicos',
    description: 'Produtos, sistemas e precisão das informações.',
  },
  regulatory: {
    label: 'Conformidade Regulatória',
    description: 'ANS, LGPD, CDC e aderência a políticas internas.',
  },
  serviceQuality: {
    label: 'Qualidade do Atendimento',
    description: 'Empatia, escuta ativa e acolhimento.',
  },
  operationalEfficiency: {
    label: 'Eficiência Operacional',
    description: 'TMA, primeira resposta e resolução no primeiro contato.',
  },
  communication: {
    label: 'Comunicação',
    description: 'Clareza, organização e tom de voz.',
  },
  conflictManagement: {
    label: 'Gestão de Conflitos',
    description: 'Descalonamento, calma e condução de objeções.',
  },
  commercial: {
    label: 'Aspectos Comerciais',
    description: 'Retenção, orientação de plano e oportunidades comerciais.',
  },
}

export const rawMockRows: CsvTicketRow[] = [
  {
    'ID do Ticket': 'SAM-10428',
    'Solicitante do Ticket': 'Marina Almeida',
    'ID Externo da Organização': 'ORG-8831',
    'Grupo Responsável': 'Cuidado Coordenado',
    'Responsável pelo Ticket': 'Luiza Nogueira',
    'Data/Hora Início': '2026-05-19 08:12',
    'Data/Hora Fim': '2026-05-19 08:42',
    'Data/Hora 1ª Resposta': '2026-05-19 08:16',
    CSAT: 5,
    'Tabulação de contato - membro (motivação 1)': 'Rede credenciada',
    'Tabulação de contato - membro 2 (Motivação 2)': 'Consulta eletiva',
    'Histórico da Conversa':
      'Membro solicitou confirmação de cobertura e recebeu orientação clara sobre rede credenciada, prazos e próximos passos.',
    Solicitante: 'Marina Almeida',
    Empresa: 'Sami Saúde',
  },
  {
    'ID do Ticket': 'SAM-10431',
    'Solicitante do Ticket': 'Rafael Costa',
    'ID Externo da Organização': 'ORG-7742',
    'Grupo Responsável': 'Autorização',
    'Responsável pelo Ticket': 'Bruno Vieira',
    'Data/Hora Início': '2026-05-19 09:04',
    'Data/Hora Fim': '2026-05-19 10:18',
    'Data/Hora 1ª Resposta': '2026-05-19 09:27',
    CSAT: 3,
    'Tabulação de contato - membro (motivação 1)': 'Autorização de exame',
    'Tabulação de contato - membro 2 (Motivação 2)': 'Prazo ANS',
    'Histórico da Conversa':
      'Membro questionou atraso em exame. Atendimento informou prazo, mas deixou dúvidas sobre documentação e canal de retorno.',
    Solicitante: 'Rafael Costa',
    Empresa: 'Clínica Vitta',
  },
  {
    'ID do Ticket': 'SAM-10437',
    'Solicitante do Ticket': 'Patrícia Lima',
    'ID Externo da Organização': 'ORG-9019',
    'Grupo Responsável': 'Financeiro',
    'Responsável pelo Ticket': 'Camila Rocha',
    'Data/Hora Início': '2026-05-19 11:22',
    'Data/Hora Fim': '2026-05-19 11:58',
    'Data/Hora 1ª Resposta': '2026-05-19 11:25',
    CSAT: 4,
    'Tabulação de contato - membro (motivação 1)': 'Boleto',
    'Tabulação de contato - membro 2 (Motivação 2)': 'Reembolso',
    'Histórico da Conversa':
      'Solicitante recebeu segunda via, explicação sobre reembolso e confirmação dos dados de contato com linguagem objetiva.',
    Solicitante: 'Patrícia Lima',
    Empresa: 'Sami Saúde',
  },
  {
    'ID do Ticket': 'SAM-10444',
    'Solicitante do Ticket': 'João Henrique',
    'ID Externo da Organização': 'ORG-6410',
    'Grupo Responsável': 'Ouvidoria',
    'Responsável pelo Ticket': 'Felipe Santos',
    'Data/Hora Início': '2026-05-19 13:05',
    'Data/Hora Fim': '2026-05-19 14:36',
    'Data/Hora 1ª Resposta': '2026-05-19 13:51',
    CSAT: 2,
    'Tabulação de contato - membro (motivação 1)': 'Reclamação',
    'Tabulação de contato - membro 2 (Motivação 2)': 'Atendimento anterior',
    'Histórico da Conversa':
      'Membro relatou frustração com histórico de contatos. Houve acolhimento inicial, porém sem registro completo do plano de ação.',
    Solicitante: 'João Henrique',
    Empresa: 'Global Tech',
  },
  {
    'ID do Ticket': 'SAM-10452',
    'Solicitante do Ticket': 'Bianca Martins',
    'ID Externo da Organização': 'ORG-2298',
    'Grupo Responsável': 'Relacionamento',
    'Responsável pelo Ticket': 'Renata Alves',
    'Data/Hora Início': '2026-05-20 08:48',
    'Data/Hora Fim': '2026-05-20 09:09',
    'Data/Hora 1ª Resposta': '2026-05-20 08:50',
    CSAT: 5,
    'Tabulação de contato - membro (motivação 1)': 'Upgrade de plano',
    'Tabulação de contato - membro 2 (Motivação 2)': 'Rede premium',
    'Histórico da Conversa':
      'Atendimento identificou necessidade de cobertura, explicou trade-offs do plano e encaminhou proposta sem pressão comercial.',
    Solicitante: 'Bianca Martins',
    Empresa: 'Studio Norte',
  },
  {
    'ID do Ticket': 'SAM-10463',
    'Solicitante do Ticket': 'Eduardo Freitas',
    'ID Externo da Organização': 'ORG-5520',
    'Grupo Responsável': 'Cuidado Coordenado',
    'Responsável pelo Ticket': 'Diego Moura',
    'Data/Hora Início': '2026-05-20 10:31',
    'Data/Hora Fim': '2026-05-20 11:04',
    'Data/Hora 1ª Resposta': '2026-05-20 10:39',
    CSAT: 4,
    'Tabulação de contato - membro (motivação 1)': 'Pronto atendimento',
    'Tabulação de contato - membro 2 (Motivação 2)': 'Orientação clínica',
    'Histórico da Conversa':
      'Membro buscou orientação sobre fluxo de pronto atendimento. Resposta foi empática e reforçou sinais de alerta.',
    Solicitante: 'Eduardo Freitas',
    Empresa: 'Sami Saúde',
  },
]

const pillarOrder: PillarKey[] = [
  'technical',
  'regulatory',
  'serviceQuality',
  'operationalEfficiency',
  'communication',
  'conflictManagement',
  'commercial',
]

const parseDate = (value: string) => {
  const normalized = value.includes('T') ? value : value.replace(' ', 'T')
  return new Date(normalized)
}

const minutesBetween = (start: string, end: string) => {
  const diff = parseDate(end).getTime() - parseDate(start).getTime()
  return Number.isFinite(diff) ? Math.max(0, Math.round(diff / 60000)) : 0
}

const clampScore = (score: number) => Math.max(0, Math.min(100, Math.round(score)))

const getStatus = (score: number): TicketStatus => {
  if (score >= 85) return 'Excelente'
  if (score >= 70) return 'Atencao'
  return 'Critico'
}

const deterministicVariance = (seed: string, index: number) => {
  const charTotal = seed
    .split('')
    .reduce((total, char) => total + char.charCodeAt(0), 0)

  return (charTotal + index * 13) % 11
}

export const simulateEvaluation = (
  row: CsvTicketRow,
  durationMinutes: number,
  firstResponseMinutes: number,
  index: number,
): TicketEvaluation => {
  const csat = Number(row.CSAT) || 0
  const base = 58 + csat * 7
  const responsePenalty = firstResponseMinutes > 15 ? 8 : firstResponseMinutes > 8 ? 4 : 0
  const durationPenalty = durationMinutes > 75 ? 8 : durationMinutes > 45 ? 4 : 0
  const variance = deterministicVariance(row['ID do Ticket'], index)
  const hasConflict = /reclama|frustra|atraso|ouvidoria/i.test(
    `${row['Tabulação de contato - membro (motivação 1)']} ${row['Histórico da Conversa']}`,
  )
  const hasCommercialSignal = /upgrade|plano|reten|premium/i.test(
    `${row['Tabulação de contato - membro (motivação 1)']} ${row['Histórico da Conversa']}`,
  )

  const values: Record<PillarKey, number> = {
    technical: base + variance - durationPenalty,
    regulatory:
      base +
      4 -
      (/ans|lgpd|cdc|prazo/i.test(row['Histórico da Conversa']) ? 0 : 3),
    serviceQuality: base + (csat >= 4 ? 8 : -6) + variance / 2,
    operationalEfficiency: base + 6 - responsePenalty - durationPenalty,
    communication:
      base +
      (/clara|objetiva|explicou|orienta/i.test(row['Histórico da Conversa'])
        ? 8
        : -4),
    conflictManagement: base + (hasConflict ? -8 : 5) + (csat >= 4 ? 4 : 0),
    commercial: base + (hasCommercialSignal ? 8 : 1) - (csat <= 2 ? 4 : 0),
  }

  const pillarScores: PillarScore[] = pillarOrder.map((key) => ({
    key,
    label: pillarMetadata[key].label,
    description: pillarMetadata[key].description,
    score: clampScore(values[key]),
  }))

  const overallScore = clampScore(
    pillarScores.reduce((total, pillar) => total + pillar.score, 0) /
      pillarScores.length,
  )

  const nonConformities = [
    firstResponseMinutes > 15
      ? 'Primeira resposta acima do alvo operacional de 15 minutos.'
      : '',
    durationMinutes > 60
      ? 'Tempo total elevado para a complexidade registrada.'
      : '',
    overallScore < 75
      ? 'Evidencias insuficientes de fechamento com plano de ação claro.'
      : '',
    csat <= 3 ? 'CSAT indica risco de experiência negativa do membro.' : '',
  ].filter(Boolean)

  return {
    overallScore,
    status: getStatus(overallScore),
    pillarScores,
    positives: [
      csat >= 4
        ? 'Boa percepção do membro registrada no CSAT.'
        : 'Registro do contexto do membro permite identificar oportunidade de recuperação.',
      firstResponseMinutes <= 8
        ? 'Primeira resposta dentro do alvo de agilidade.'
        : 'Atendimento manteve rastreabilidade do fluxo de resposta.',
      /clara|objetiva|explicou|orienta/i.test(row['Histórico da Conversa'])
        ? 'Comunicação com orientação objetiva e próximos passos.'
        : 'Histórico contém elementos suficientes para auditoria de qualidade.',
    ],
    nonConformities:
      nonConformities.length > 0
        ? nonConformities
        : ['Nenhuma não conformidade crítica simulada para este atendimento.'],
    actionPlan: [
      'Reforçar checklist de encerramento com resumo, prazo e canal de retorno.',
      'Validar aderência regulatória para contatos com prazo ANS ou dados sensíveis.',
      overallScore < 75
        ? 'Realizar calibração individual com foco em empatia e descalonamento.'
        : 'Compartilhar boas práticas do atendimento em rodada de qualidade.',
    ],
    attendantFeedback:
      overallScore >= 85
        ? 'Atendimento consistente, com boa condução e clareza para o membro.'
        : overallScore >= 70
          ? 'Atendimento adequado, com pontos de melhoria em fechamento e precisão.'
          : 'Atendimento exige acompanhamento próximo e revisão dos critérios críticos.',
  }
}

export const mapRowToTicket = (
  row: CsvTicketRow,
  index: number,
): SupportTicket => {
  const durationMinutes = minutesBetween(
    row['Data/Hora Início'],
    row['Data/Hora Fim'],
  )
  const firstResponseMinutes = minutesBetween(
    row['Data/Hora Início'],
    row['Data/Hora 1ª Resposta'],
  )

  return {
    id: String(row['ID do Ticket']),
    ticketRequester: String(row['Solicitante do Ticket']),
    organizationExternalId: String(row['ID Externo da Organização']),
    responsibleGroup: String(row['Grupo Responsável']),
    ticketOwner: String(row['Responsável pelo Ticket']),
    startedAt: String(row['Data/Hora Início']),
    endedAt: String(row['Data/Hora Fim']),
    firstResponseAt: String(row['Data/Hora 1ª Resposta']),
    csat: Number(row.CSAT) || 0,
    motivationPrimary: String(
      row['Tabulação de contato - membro (motivação 1)'],
    ),
    motivationSecondary: String(
      row['Tabulação de contato - membro 2 (Motivação 2)'],
    ),
    conversationHistory: String(row['Histórico da Conversa']),
    requester: String(row.Solicitante),
    company: String(row.Empresa),
    durationMinutes,
    firstResponseMinutes,
    evaluation: simulateEvaluation(row, durationMinutes, firstResponseMinutes, index),
  }
}

export const mockTickets = rawMockRows.map(mapRowToTicket)
