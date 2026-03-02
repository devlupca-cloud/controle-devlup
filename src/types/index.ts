import type { Client, Project, Task, Credential, Note, Installment, RecurringCharge, Expense, ExpenseCategory, User } from "@prisma/client";

export type ProjectWithClient = Project & {
  client: Client;
};

export type ProjectWithRelations = Project & {
  client: Client;
  tasks: Task[];
  credentials: Credential[];
  notes: Note[];
  installments: Installment[];
  recurringCharges: RecurringCharge[];
  expenses: (Expense & { category: ExpenseCategory })[];
};

export type TaskWithAssignee = Task & {
  assignee: User | null;
};

export type ExpenseWithCategory = Expense & {
  category: ExpenseCategory;
};

export type ExpenseWithRelations = Expense & {
  category: ExpenseCategory;
  project: Project | null;
};

export type ClientWithProjects = Client & {
  projects: Project[];
};

export type PaymentStatus = "PENDENTE" | "PAGO" | "CANCELADO" | "VENCIDO";

export type DashboardData = {
  monthlyRevenue: number;
  monthlyExpenses: number;
  monthlyProfit: number;
  pendingInstallments: number;
  overdueInstallments: number;
  partnerSplit: number;
  revenueVsExpense: { month: string; receita: number; despesa: number }[];
  revenueComposition: { name: string; value: number }[];
  profitEvolution: { month: string; lucro: number }[];
  upcomingPayments: (Installment | RecurringCharge)[];
};
