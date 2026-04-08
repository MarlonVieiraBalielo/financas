import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useTransactionStore } from "@/stores/transactionStore";
import { AddModal } from "@/components/AddModal";
import { TransactionCard } from "@/components/TransactionCard";
import { MonthPicker } from "@/components/MonthPicker";
import { ExpenseChart } from "@/components/ExpenseChart";

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function Transactions() {
  const user = useAuthStore((s) => s.user);
  const { transactions, loadingTx, fetchTransactions, fetchCategories, deleteTransaction, getSummary } = useTransactionStore();
  const [month, setMonth] = useState(currentMonth);
  const [showAdd, setShowAdd] = useState(false);
  const [showChart, setShowChart] = useState(false);

  const load = () => {
    if (!user) return;
    fetchTransactions(user.id, month);
    fetchCategories(user.id);
  };

  useEffect(() => { load(); }, [month, user]);

  const summary = getSummary();

  const grouped = transactions.reduce<Record<string, typeof transactions>>((acc, t) => {
    if (!acc[t.date]) acc[t.date] = [];
    acc[t.date].push(t);
    return acc;
  }, {});

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-white text-2xl font-bold">Transações</h1>
          <MonthPicker month={month} onChange={setMonth} />
        </div>
        <button onClick={() => setShowAdd(true)}
          className="bg-primary text-white rounded-2xl px-5 py-3 font-bold hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-2">
          <span className="text-xl font-light">+</span> Adicionar
        </button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-card rounded-xl p-3 text-center">
          <p className="text-income text-xs font-semibold">💵 Receitas</p>
          <p className="text-white font-bold text-sm mt-0.5">{fmt(summary.income)}</p>
        </div>
        <div className="bg-card rounded-xl p-3 text-center">
          <p className="text-expense text-xs font-semibold">💸 Despesas</p>
          <p className="text-white font-bold text-sm mt-0.5">{fmt(summary.expense)}</p>
        </div>
        <div className="bg-card rounded-xl p-3 text-center">
          <p className="text-primary text-xs font-semibold">⚖️ Saldo</p>
          <p className={`font-bold text-sm mt-0.5 ${summary.balance >= 0 ? "text-white" : "text-expense"}`}>
            {fmt(summary.balance)}
          </p>
        </div>
      </div>

      {/* Gráfico expansível */}
      <button onClick={() => setShowChart(!showChart)}
        className="w-full bg-card rounded-2xl px-5 py-3 flex items-center justify-between mb-3 hover:bg-card/80 transition-colors">
        <span className="text-white font-semibold">📊 Ver gráfico por categoria</span>
        <span className="text-muted text-lg">{showChart ? "▲" : "▼"}</span>
      </button>
      {showChart && <ExpenseChart transactions={transactions} />}

      {/* Lista */}
      {loadingTx ? (
        <div className="flex justify-center py-10">
          <div className="w-7 h-7 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="bg-card rounded-2xl p-8 text-center">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-white font-semibold mb-1">Nenhum lançamento neste mês</p>
          <button onClick={() => setShowAdd(true)} className="text-primary font-semibold hover:underline mt-1">
            + Adicionar agora
          </button>
        </div>
      ) : (
        Object.entries(grouped).map(([date, items]) => (
          <div key={date} className="mb-4">
            <p className="text-muted text-xs font-semibold mb-2 px-1 capitalize">
              {new Date(date + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <div className="flex flex-col gap-2">
              {items.map((t) => (
                <TransactionCard key={t.id} transaction={t} onDelete={deleteTransaction} />
              ))}
            </div>
          </div>
        ))
      )}

      {showAdd && <AddModal onClose={() => setShowAdd(false)} onSuccess={load} />}
    </div>
  );
}
