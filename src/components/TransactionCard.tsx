import { TrashIcon } from "@heroicons/react/24/outline";
import { Transaction, PAYMENT_METHODS } from "@/types";

interface Props {
  transaction: Transaction;
  onDelete: (id: string) => void;
}

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function TransactionCard({ transaction: t, onDelete }: Props) {
  const isIncome = t.type === "income";
  const pm = PAYMENT_METHODS.find((p) => p.value === t.payment_method);

  return (
    <div className="flex items-center bg-card rounded-xl p-4 gap-3">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
        style={{ backgroundColor: (t.category?.color ?? "#6366f1") + "33" }}
      >
        {t.category?.icon ?? "💰"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold truncate">{t.title}</p>
        <p className="text-muted text-xs mt-0.5">
          {t.category?.name}
          {pm && <> · {pm.icon} {pm.label}</>}
          {" · "}{new Date(t.date + "T12:00:00").toLocaleDateString("pt-BR")}
        </p>
      </div>
      <span className={`font-bold text-base flex-shrink-0 ${isIncome ? "text-income" : "text-expense"}`}>
        {isIncome ? "+" : "-"}{fmt(t.amount)}
      </span>
      <button
        onClick={() => onDelete(t.id)}
        className="text-muted hover:text-expense transition-colors flex-shrink-0"
      >
        <TrashIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
