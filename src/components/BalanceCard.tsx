import { MonthSummary } from "@/types";
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from "@heroicons/react/24/solid";

interface Props {
  summary: MonthSummary;
  month: string;
}

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function BalanceCard({ summary, month }: Props) {
  const [year, m] = month.split("-");
  const label = new Date(+year, +m - 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-card rounded-2xl p-6">
      <p className="text-muted text-sm capitalize">{label}</p>
      <p className="text-white text-4xl font-bold mt-1">{fmt(summary.balance)}</p>
      <div className="grid grid-cols-2 gap-3 mt-5">
        <div className="bg-dark rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <ArrowTrendingUpIcon className="w-4 h-4 text-income" />
            <span className="text-income text-xs font-semibold">RECEITAS</span>
          </div>
          <p className="text-white font-bold text-lg">{fmt(summary.income)}</p>
        </div>
        <div className="bg-dark rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <ArrowTrendingDownIcon className="w-4 h-4 text-expense" />
            <span className="text-expense text-xs font-semibold">DESPESAS</span>
          </div>
          <p className="text-white font-bold text-lg">{fmt(summary.expense)}</p>
        </div>
      </div>
    </div>
  );
}
