import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { Installment } from "@/types";

interface InstallmentState {
  installments: Installment[];
  loading: boolean;
  fetchInstallments: (userId: string) => Promise<void>;
  addInstallment: (data: Omit<Installment, "id" | "created_at">) => Promise<string | null>;
  payInstallment: (id: string, currentPaid: number) => Promise<string | null>;
  deleteInstallment: (id: string) => Promise<void>;
  getTotalDebt: () => number;
  getMonthlyCommitment: () => number;
}

export const useInstallmentStore = create<InstallmentState>((set, get) => ({
  installments: [],
  loading: false,

  fetchInstallments: async (userId) => {
    set({ loading: true });
    const { data } = await supabase
      .from("installments")
      .select("*, category:categories(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    set({ installments: data ?? [], loading: false });
  },

  addInstallment: async (data) => {
    const { error } = await supabase.from("installments").insert(data);
    return error?.message ?? null;
  },

  payInstallment: async (id, currentPaid) => {
    const newPaid = currentPaid + 1;
    const { error } = await supabase
      .from("installments")
      .update({ paid_installments: newPaid })
      .eq("id", id);
    if (!error) {
      set((s) => ({
        installments: s.installments.map((i) =>
          i.id === id ? { ...i, paid_installments: newPaid } : i
        ),
      }));
    }
    return error?.message ?? null;
  },

  deleteInstallment: async (id) => {
    await supabase.from("installments").delete().eq("id", id);
    set((s) => ({ installments: s.installments.filter((i) => i.id !== id) }));
  },

  getTotalDebt: () => {
    return get().installments.reduce((acc, i) => {
      const remaining = i.total_installments - i.paid_installments;
      return acc + remaining * i.installment_amount;
    }, 0);
  },

  getMonthlyCommitment: () => {
    return get().installments
      .filter((i) => i.paid_installments < i.total_installments)
      .reduce((acc, i) => acc + i.installment_amount, 0);
  },
}));
