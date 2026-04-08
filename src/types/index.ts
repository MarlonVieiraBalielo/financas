export type TransactionType = "income" | "expense";
export type PaymentMethod = "pix" | "debito" | "credito" | "dinheiro" | "transferencia";

export const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: "pix", label: "Pix", icon: "⚡" },
  { value: "debito", label: "Débito", icon: "💳" },
  { value: "credito", label: "Crédito", icon: "💰" },
  { value: "dinheiro", label: "Dinheiro", icon: "💵" },
  { value: "transferencia", label: "Transferência", icon: "🏦" },
];

export const DEFAULT_CATEGORIES: Omit<Category, "id" | "user_id">[] = [
  // Despesas
  { name: "Casa", icon: "🏠", color: "#6366f1", type: "expense", is_default: true },
  { name: "Carro", icon: "🚗", color: "#f59e0b", type: "expense", is_default: true },
  { name: "Moto", icon: "🛵", color: "#f97316", type: "expense", is_default: true },
  { name: "Mercado", icon: "🛒", color: "#22c55e", type: "expense", is_default: true },
  { name: "Farmácia", icon: "💊", color: "#ec4899", type: "expense", is_default: true },
  { name: "Açougue", icon: "🍖", color: "#ef4444", type: "expense", is_default: true },
  { name: "Alimentação", icon: "🍔", color: "#f59e0b", type: "expense", is_default: true },
  { name: "Educação", icon: "📚", color: "#06b6d4", type: "expense", is_default: true },
  { name: "Lazer", icon: "🎮", color: "#8b5cf6", type: "expense", is_default: true },
  { name: "Roupas", icon: "👗", color: "#ec4899", type: "expense", is_default: true },
  { name: "Contas", icon: "💡", color: "#f59e0b", type: "expense", is_default: true },
  { name: "Saúde", icon: "🏋️", color: "#22c55e", type: "expense", is_default: true },
  { name: "Transporte", icon: "🚌", color: "#64748b", type: "expense", is_default: true },
  { name: "Pet", icon: "🐾", color: "#84cc16", type: "expense", is_default: true },
  { name: "Compras", icon: "🛍️", color: "#14b8a6", type: "expense", is_default: true },
  { name: "Serviços", icon: "🔧", color: "#94a3b8", type: "expense", is_default: true },
  // Receitas
  { name: "Salário", icon: "💰", color: "#22c55e", type: "income", is_default: true },
  { name: "Freelance", icon: "💼", color: "#06b6d4", type: "income", is_default: true },
  { name: "Investimento", icon: "📈", color: "#6366f1", type: "income", is_default: true },
  { name: "Presente", icon: "🎁", color: "#ec4899", type: "income", is_default: true },
  { name: "Outros", icon: "✨", color: "#94a3b8", type: "income", is_default: true },
];

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  user_id: string;
  is_default?: boolean;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string;
  category?: Category;
  installment_id?: string;
  title: string;
  amount: number;
  type: TransactionType;
  payment_method?: PaymentMethod;
  date: string;
  note?: string;
  created_at: string;
}

export interface Installment {
  id: string;
  user_id: string;
  category_id: string;
  category?: Category;
  title: string;
  total_amount: number;
  installment_amount: number;
  total_installments: number;
  paid_installments: number;
  payment_method: PaymentMethod;
  start_date: string;
  note?: string;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  salary: number;
}

export interface MonthSummary {
  income: number;
  expense: number;
  balance: number;
}
