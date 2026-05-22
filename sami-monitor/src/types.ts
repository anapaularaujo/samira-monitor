export type RouteKey =
  | 'dashboard'
  | 'upload'
  | 'analise-detalhada'
  | 'relatorios'
  | 'configuracoes'

export type PillarKey =
  | 'technical'
  | 'regulatory'
  | 'serviceQuality'
  | 'operationalEfficiency'
  | 'communication'
  | 'conflictManagement'
  | 'commercial'

export type TicketStatus = 'Excelente' | 'Atencao' | 'Critico'

export type CsvTicketRow = {
  'ID do Ticket': string
  'Solicitante do Ticket': string
  'ID Externo da Organização': string
  'Grupo Responsável': string
  'Responsável pelo Ticket': string
  'Data/Hora Início': string
  'Data/Hora Fim': string
  'Data/Hora 1ª Resposta': string
  CSAT: string | number
  'Tabulação de contato - membro (motivação 1)': string
  'Tabulação de contato - membro 2 (Motivação 2)': string
  'Histórico da Conversa': string
  Solicitante: string
  Empresa: string
}

export type PillarScore = {
  key: PillarKey
  label: string
  score: number
  description: string
}

export type TicketEvaluation = {
  overallScore: number
  status: TicketStatus
  pillarScores: PillarScore[]
  positives: string[]
  nonConformities: string[]
  actionPlan: string[]
  attendantFeedback: string
}

export type SupportTicket = {
  id: string
  ticketRequester: string
  organizationExternalId: string
  responsibleGroup: string
  ticketOwner: string
  startedAt: string
  endedAt: string
  firstResponseAt: string
  csat: number
  motivationPrimary: string
  motivationSecondary: string
  conversationHistory: string
  requester: string
  company: string
  durationMinutes: number
  firstResponseMinutes: number
  evaluation: TicketEvaluation
}

export type UploadResult = {
  rows: SupportTicket[]
  fileName: string
}
