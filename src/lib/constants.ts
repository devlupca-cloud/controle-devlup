export const PROJECT_TYPES = {
  AVULSO: "Avulso",
  RECORRENTE: "Recorrente",
} as const;

export const PROJECT_STATUSES = {
  ATIVO: "Ativo",
  PAUSADO: "Pausado",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
} as const;

export const TASK_STATUSES = {
  TODO: "A Fazer",
  IN_PROGRESS: "Fazendo",
  DONE: "Feito",
} as const;

export const TASK_PRIORITIES = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  URGENT: "Urgente",
} as const;

export const PAYMENT_STATUSES = {
  PENDENTE: "Pendente",
  PAGO: "Pago",
  CANCELADO: "Cancelado",
} as const;

export const PRIORITY_COLORS = {
  LOW: "bg-blue-500/20 text-blue-400",
  MEDIUM: "bg-yellow-500/20 text-yellow-400",
  HIGH: "bg-orange-500/20 text-orange-400",
  URGENT: "bg-red-500/20 text-red-400",
} as const;

export const STATUS_COLORS = {
  ATIVO: "bg-green-500/20 text-green-400",
  PAUSADO: "bg-yellow-500/20 text-yellow-400",
  CONCLUIDO: "bg-blue-500/20 text-blue-400",
  CANCELADO: "bg-red-500/20 text-red-400",
} as const;

export const PAYMENT_STATUS_COLORS = {
  PENDENTE: "bg-yellow-500/20 text-yellow-400",
  PAGO: "bg-green-500/20 text-green-400",
  CANCELADO: "bg-red-500/20 text-red-400",
  VENCIDO: "bg-red-500/20 text-red-400",
} as const;
