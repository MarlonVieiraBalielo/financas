import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useProfileStore } from "@/stores/profileStore";
import { useInstallmentStore } from "@/stores/installmentStore";
import { useTransactionStore } from "@/stores/transactionStore";
import { useNavigate } from "react-router-dom";
import { ArrowRightStartOnRectangleIcon, PencilIcon, CheckIcon } from "@heroicons/react/24/outline";

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function Profile() {
  const { user, signOut } = useAuthStore();
  const { profile, fetchProfile, updateSalary } = useProfileStore();
  const { getTotalDebt, getMonthlyCommitment } = useInstallmentStore();
  const { categories } = useTransactionStore();
  const navigate = useNavigate();

  const [editingSalary, setEditingSalary] = useState(false);
  const [salaryInput, setSalaryInput] = useState("");

  const name = (user?.user_metadata?.full_name as string) ?? "Usuário";
  const email = user?.email ?? "";
  const initials = name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();

  useEffect(() => {
    if (user) fetchProfile(user.id);
  }, [user]);

  const handleSaveSalary = async () => {
    const value = parseFloat(salaryInput.replace(",", "."));
    if (isNaN(value) || value < 0) return;
    await updateSalary(user!.id, value);
    setEditingSalary(false);
  };

  const handleSignOut = async () => {
    if (!confirm("Deseja sair da conta?")) return;
    await signOut();
    navigate("/login");
  };

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto">
      <h1 className="text-white text-2xl font-bold mb-6">Perfil</h1>

      {/* Avatar */}
      <div className="bg-card rounded-2xl p-6 flex flex-col items-center mb-4">
        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-3">
          <span className="text-white text-2xl font-bold">{initials}</span>
        </div>
        <p className="text-white text-lg font-bold">{name}</p>
        <p className="text-muted text-sm mt-1">{email}</p>
      </div>

      {/* Salário base */}
      <div className="bg-card rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between mb-1">
          <p className="text-white font-semibold">Salário base</p>
          {!editingSalary ? (
            <button onClick={() => { setSalaryInput(String(profile?.salary ?? 0)); setEditingSalary(true); }}
              className="text-muted hover:text-primary transition-colors">
              <PencilIcon className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSaveSalary} className="text-income hover:text-income/70 transition-colors">
              <CheckIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {editingSalary ? (
          <input value={salaryInput} onChange={(e) => setSalaryInput(e.target.value)}
            placeholder="Ex: 3500,00"
            className="w-full bg-dark text-white rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary placeholder:text-muted mt-2"
            autoFocus />
        ) : (
          <p className="text-income text-2xl font-bold">
            {profile?.salary ? fmt(profile.salary) : <span className="text-muted text-base">Não definido — clique no lápis</span>}
          </p>
        )}

        {profile?.salary && profile.salary > 0 && (
          <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-2 gap-3">
            <div>
              <p className="text-muted text-xs">Parcelas/mês</p>
              <p className="text-yellow-400 font-semibold">{fmt(getMonthlyCommitment())}</p>
            </div>
            <div>
              <p className="text-muted text-xs">Disponível após parcelas</p>
              <p className="text-income font-semibold">{fmt(Math.max(0, profile.salary - getMonthlyCommitment()))}</p>
            </div>
          </div>
        )}
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-card rounded-2xl p-4 text-center">
          <p className="text-muted text-xs mb-1">Categorias criadas</p>
          <p className="text-white font-bold text-2xl">{categories.length}</p>
        </div>
        <div className="bg-card rounded-2xl p-4 text-center">
          <p className="text-muted text-xs mb-1">Dívida total</p>
          <p className="text-expense font-bold text-xl">{fmt(getTotalDebt())}</p>
        </div>
      </div>

      <button onClick={handleSignOut}
        className="w-full flex items-center justify-center gap-2 bg-expense/10 text-expense rounded-2xl py-4 font-bold hover:bg-expense/20 transition-colors">
        <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
        Sair da conta
      </button>
    </div>
  );
}
