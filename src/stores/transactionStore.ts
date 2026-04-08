import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { Transaction, Category, MonthSummary, DEFAULT_CATEGORIES } from "@/types";

let seedingInProgress = false;
const initializedUsers = new Set<string>();

function monthRange(month: string) {
  const [year, m] = month.split("-").map(Number);
  const start = `${month}-01`;
  // Primeiro dia do mês seguinte - 1 dia = último dia do mês atual
  const lastDay = new Date(year, m, 0).getDate();
  const end = `${month}-${String(lastDay).padStart(2, "0")}`;
  return { start, end };
}

interface TransactionState {
  transactions: Transaction[];
  categories: Category[];
  loadingTx: boolean;
  txError: string | null;
  fetchTransactions: (userId: string, month: string) => Promise<void>;
  fetchCategories: (userId: string) => Promise<void>;
  addTransaction: (data: Omit<Transaction, "id" | "created_at">) => Promise<string | null>;
  deleteTransaction: (id: string) => Promise<void>;
  addCategory: (data: Omit<Category, "id">) => Promise<string | null>;
  deleteCategory: (id: string) => Promise<void>;
  getSummary: () => MonthSummary;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  categories: [],
  loadingTx: false,
  txError: null,

  fetchTransactions: async (userId, month) => {
    set({ loadingTx: true, txError: null });
    const { start, end } = monthRange(month);

    const { data, error } = await supabase
      .from("transactions")
      .select("*, category:categories(*)")
      .eq("user_id", userId)
      .gte("date", start)
      .lte("date", end)
      .order("date", { ascending: false });

    if (error) {
      console.error("fetchTransactions erro:", error);
      set({ loadingTx: false, txError: error.message });
      return;
    }

    set({ transactions: data ?? [], loadingTx: false });
  },

  fetchCategories: async (userId) => {
    if (initializedUsers.has(userId)) {
      const { data } = await supabase
        .from("categories").select("*").eq("user_id", userId).order("name");
      set({ categories: data ?? [] });
      return;
    }
    if (seedingInProgress) return;
    seedingInProgress = true;

    const { data } = await supabase
      .from("categories").select("*").eq("user_id", userId).order("name");

    if (!data || data.length === 0) {
      const defaults = DEFAULT_CATEGORIES.map((c) => ({ ...c, user_id: userId }));
      await supabase.from("categories").insert(defaults);
      const { data: seeded } = await supabase
        .from("categories").select("*").eq("user_id", userId).order("name");
      set({ categories: seeded ?? [] });
    } else {
      set({ categories: data });
    }

    initializedUsers.add(userId);
    seedingInProgress = false;
  },

  addTransaction: async (data) => {
    // Remove campos undefined para evitar erros no insert
    const clean = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined)
    );
    const { error } = await supabase.from("transactions").insert(clean);
    if (error) console.error("addTransaction erro:", error);
    return error?.message ?? null;
  },

  deleteTransaction: async (id) => {
    await supabase.from("transactions").delete().eq("id", id);
    set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) }));
  },

  addCategory: async (data) => {
    const { error } = await supabase.from("categories").insert(data);
    return error?.message ?? null;
  },

  deleteCategory: async (id) => {
    await supabase.from("categories").delete().eq("id", id);
    set((s) => ({ categories: s.categories.filter((c) => c.id !== id) }));
  },

  getSummary: () => {
    const { transactions } = get();
    return transactions.reduce(
      (acc, t) => {
        if (t.type === "income") acc.income += t.amount;
        else acc.expense += t.amount;
        acc.balance = acc.income - acc.expense;
        return acc;
      },
      { income: 0, expense: 0, balance: 0 }
    );
  },
}));
