import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

export const clientSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  company: z.string().optional(),
  document: z.string().optional(),
  notes: z.string().optional(),
});

export const projectSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  clientId: z.string().min(1, "Cliente obrigatório"),
  type: z.enum(["AVULSO", "RECORRENTE"]),
  status: z.enum(["COTACAO", "NEGOCIACAO", "ATIVO", "PAUSADO", "CONCLUIDO", "CANCELADO"]).default("COTACAO"),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  totalValue: z.string().optional(),
});

export const taskSchema = z.object({
  title: z.string().min(1, "Título obrigatório"),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).default("TODO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
});

export const credentialSchema = z.object({
  platform: z.string().min(1, "Plataforma obrigatória"),
  url: z.string().optional(),
  username: z.string().min(1, "Usuário obrigatório"),
  password: z.string().min(1, "Senha obrigatória"),
  notes: z.string().optional(),
});

export const noteSchema = z.object({
  title: z.string().min(1, "Título obrigatório"),
  content: z.string().default(""),
});

export const installmentGenerateSchema = z.object({
  totalValue: z.number().positive("Valor deve ser positivo"),
  numberOfInstallments: z.number().int().min(1).max(48),
  startDate: z.string().min(1, "Data inicial obrigatória"),
});

export const recurringChargeSchema = z.object({
  description: z.string().min(1, "Descrição obrigatória"),
  value: z.string().min(1, "Valor obrigatório"),
  referenceMonth: z.string().min(1, "Mês de referência obrigatório"),
  dueDate: z.string().min(1, "Data de vencimento obrigatória"),
});

export const expenseSchema = z.object({
  description: z.string().min(1, "Descrição obrigatória"),
  value: z.string().min(1, "Valor obrigatório"),
  date: z.string().min(1, "Data obrigatória"),
  dueDate: z.string().optional(),
  status: z.enum(["PENDENTE", "PAGO"]).default("PENDENTE"),
  categoryId: z.string().min(1, "Categoria obrigatória"),
  projectId: z.string().optional(),
  notes: z.string().optional(),
});

export const expenseCategorySchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
});
