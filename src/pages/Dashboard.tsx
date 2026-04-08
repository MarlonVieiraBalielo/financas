import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useTransactionStore } from "@/stores/transactionStore";
import { useInstallmentStore } from "@/stores/installmentStore";
import { useProfileStore } from "@/stores/profileStore";
import { AddModal } from "@/components/AddModal";
import { TransactionCard } from "@/components/TransactionCard";
import { MonthPicker } from "@/components/MonthPicker";
import { ExpenseChart } from "@/components/ExpenseChart";

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const { transactions, loadingTx, fetchTransactions, fetchCategories, deleteTransaction, getSummary } = useTransactionStore();
  const { fetchInstallments, getMonthlyCommitment, getTotalDebt } = useInstallmentStore();
  const { profile, fetchProfile, updateSalary } = useProfileStore();

  const [month, setMonth] = useState(currentMonth);
  const [showAdd, setShowAdd] = useState(false);
  const [editSalary, setEditSalary] = useState(false);
  const [salaryInput, setSalaryInput] = useState("");

  const load = () => {
    if (!user) return;
    fetchTransactions(user.id, month);
    fetchCategories(user.id);
    fetchInstallments(user.id);
    fetchProfile(user.id);
  };

  useEffect(() => { load(); }, [month, user]);

  const summary = getSummary();
  const name = (user?.user_metadata?.full_name as string)?.split(" ")[0] ?? "você";
  const salary = profile?.salary ?? 0;
  const commitment = getMonthlyCommitment();
  const totalDebt = getTotalDebt();
  const totalUsed = summary.expense + commitment;
  const pct = salary > 0 ? Math.min((totalUsed / salary) * 100, 100) : 0;

  const saveSalary = async () => {
    const val = parseFloat(salaryInput.replace(",", "."));
    if (!isNaN(val) && val >= 0) await updateSalary(user!.id, val);
    setEditSalary(false);
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-muted text-sm">Olá, {name}!</p>
          <MonthPicker month={month} onChange={setMonth} />
        </div>
        <button onClick={() => setShowAdd(true)}
          className="bg-primary text-white rounded-2xl px-5 py-3 font-bold text-base shadow-lg shadow-primary/30 hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-2">
          <span className="text-xl font-light">+</span> Adicionar
        </button>
      </div>

      {/* Saldo */}
      <div className="bg-card rounded-2xl p-5 mb-3">
        <p className="text-muted text-sm">Saldo do mês</p>
        <p className={`text-4xl font-bold mt-1 ${summary.balance >= 0 ? "text-white" : "text-expense"}`}>
          {loadingTx ? <span className="text-2xl text-muted">calculando...</span> : fmt(summary.balance)}
        </p>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-dark rounded-xl p-3">
            <p className="text-income text-xs font-semibold mb-1">💵 RECEITAS</p>
            <p className="text-white font-bold">{fmt(summary.income)}</p>
          </div>
          <div className="bg-dark rounded-xl p-3">
            <p className="text-expense text-xs font-semibold mb-1">💸 DESPESAS</p>
            <p className="text-white font-bold">{fmt(summary.expense)}</p>
          </div>
        </div>
      </div>

      {/* Salário */}
      <div className="bg-card rounded-2xl p-5 mb-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-white font-semibold">Meu salário</p>
          {!editSalary ? (
            <button
              onClick={() => { setSalaryInput(salary > 0 ? String(salary) : ""); setEditSalary(true); }}
              className="text-primary text-sm font-semibold hover:underline">
              {salary > 0 ? "✏️ Editar" : "➕ Definir"}
            </button>
          ) : (
            <button onClick={saveSalary} className="text-income text-sm font-semibold">✓ Salvar</button>
          )}
        </div>

        {editSalary ? (
          <input value={salaryInput} onChange={(e) => setSalaryInput(e.target.value)}
            placeholder="Ex: 3500,00" inputMode="decimal" autoFocus
            onKeyDown={(e) => e.key === "Enter" && saveSalary()}
            className="w-full bg-dark text-white text-xl font-bold rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary placeholder:text-muted/40" />
        ) : salary > 0 ? (
          <>
            <p className="text-income text-2xl font-bold">{fmt(salary)}</p>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted mb-1">
                <span>Gasto: {fmt(totalUsed)} ({pct.toFixed(0)}%)</span>
                <span className={pct > 90 ? "text-expense" : "text-income"}>
                  Livre: {fmt(Math.max(0, salary - totalUsed))}
                </span>
              </div>
              <div className="w-full bg-dark rounded-full h-3">
                <div className={`h-3 rounded-full transition-all ${pct > 90 ? "bg-expense" : pct > 70 ? "bg-yellow-500" : "bg-income"}`}
                  style={{ width: `${pct}%` }} />
              </div>
            </div>
          </>
        ) : (
          <p className="text-muted text-sm">Clique em "➕ Definir" para informar seu salário e acompanhar seus gastos</p>
        )}
      </div>

      {/* Parcelas */}
      {(commitment > 0 || totalDebt > 0) && (
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-card rounded-2xl p-4">
            <p className="text-yellow-400 text-xs font-semibold mb-1">💳 PARCELAS/MÊS</p>
            <p className="text-white font-bold text-lg">{fmt(commitment)}</p>
          </div>
          <div className="bg-card rounded-2xl p-4">
            <p className="text-expense text-xs font-semibold mb-1">📊 DÍVIDA TOTAL</p>
            <p className="text-white font-bold text-lg">{fmt(totalDebt)}</p>
          </div>
        </div>
      )}

      {/* Gráfico — sempre visível */}
      <ExpenseChart transactions={transactions} />

      {/* Transações */}
      <div>
        <p className="text-white font-semibold mb-3">Lançamentos do mês</p>
        {loadingTx ? (
          <div className="flex justify-center py-10">
            <div className="w-7 h-7 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="bg-card rounded-2xl p-8 text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-white font-semibold mb-1">Nenhum lançamento ainda</p>
            <p className="text-muted text-sm">Clique em <strong className="text-white">+ Adicionar</strong> para começar</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {transactions.map((t) => (
              <TransactionCard key={t.id} transaction={t} onDelete={deleteTransaction} />
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <AddModal onClose={() => setShowAdd(false)} onSuccess={() => fetchTransactions(user!.id, month)} />
      )}
    </div>
  );
}
