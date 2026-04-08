import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useTransactionStore } from "@/stores/transactionStore";
import { TransactionType } from "@/types";
import { TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/24/solid";

const ICONS = ["🏠", "🚗", "🛵", "🛒", "💊", "🍖", "🍔", "📚", "🎮", "✈️", "💰", "💼", "🏋️", "🎁", "👗", "💡", "🐾", "🛍️", "🔧", "📈", "🎵", "🎨", "⚽", "🏖️"];
const COLORS = ["#6366f1", "#22c55e", "#ef4444", "#f59e0b", "#06b6d4", "#ec4899", "#8b5cf6", "#14b8a6", "#f97316", "#84cc16", "#64748b", "#94a3b8"];

export function Categories() {
  const user = useAuthStore((s) => s.user);
  const { categories, fetchCategories, addCategory, deleteCategory } = useTransactionStore();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(ICONS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [type, setType] = useState<TransactionType>("expense");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TransactionType>("expense");

  useEffect(() => {
    if (user) fetchCategories(user.id);
  }, [user]);

  const handleAdd = async () => {
    if (!name.trim()) { setError("Digite um nome"); return; }
    const err = await addCategory({ name, icon, color, type, user_id: user!.id });
    if (err) { setError(err); return; }
    setName(""); setError(""); setShowForm(false);
    fetchCategories(user!.id);
  };

  const filtered = categories.filter((c) => c.type === activeTab);

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-2xl font-bold">Categorias</h1>
        <button onClick={() => setShowForm(true)}
          className="bg-primary text-white rounded-xl px-4 py-2 flex items-center gap-1.5 text-sm font-semibold hover:bg-primary/90 transition-colors">
          <PlusIcon className="w-4 h-4" /> Nova categoria
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {(["expense", "income"] as TransactionType[]).map((t) => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === t
                ? t === "income" ? "bg-income/20 text-income" : "bg-expense/20 text-expense"
                : "bg-card text-muted"
            }`}>
            {t === "income" ? "Receitas" : "Despesas"} ({categories.filter((c) => c.type === t).length})
          </button>
        ))}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-lg">Nova Categoria</h2>
              <button onClick={() => setShowForm(false)} className="text-muted hover:text-white">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {(["expense", "income"] as TransactionType[]).map((t) => (
                  <button key={t} onClick={() => setType(t)}
                    className={`py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                      type === t
                        ? t === "income" ? "bg-income text-white" : "bg-expense text-white"
                        : "bg-dark text-muted"
                    }`}>
                    {t === "income" ? "Receita" : "Despesa"}
                  </button>
                ))}
              </div>

              <input value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Nome da categoria"
                className="w-full bg-dark text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary placeholder:text-muted" />

              <div>
                <p className="text-muted text-sm mb-2">Ícone</p>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map((i) => (
                    <button key={i} onClick={() => setIcon(i)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-colors ${
                        icon === i ? "bg-primary" : "bg-dark hover:bg-dark/70"
                      }`}>
                      {i}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-muted text-sm mb-2">Cor</p>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c) => (
                    <button key={c} onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? "border-white scale-110" : "border-transparent"}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="bg-dark rounded-xl p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                  style={{ backgroundColor: color + "33" }}>{icon}</div>
                <div>
                  <p className="text-white font-semibold">{name || "Preview"}</p>
                  <p className="text-muted text-xs">{type === "income" ? "Receita" : "Despesa"}</p>
                </div>
              </div>

              {error && <p className="text-expense text-sm">{error}</p>}

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setShowForm(false)}
                  className="bg-dark text-white rounded-xl py-3 font-semibold hover:bg-dark/70 transition-colors">
                  Cancelar
                </button>
                <button onClick={handleAdd}
                  className="bg-primary text-white rounded-xl py-3 font-bold hover:bg-primary/90 transition-colors">
                  Criar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {filtered.map((cat) => (
          <div key={cat.id} className="flex items-center bg-card rounded-xl px-4 py-3 gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
              style={{ backgroundColor: cat.color + "33" }}>
              {cat.icon}
            </div>
            <span className="text-white flex-1 font-medium">{cat.name}</span>
            {cat.is_default && <span className="text-muted text-xs">padrão</span>}
            <button onClick={() => deleteCategory(cat.id)}
              className="text-muted hover:text-expense transition-colors flex-shrink-0">
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-card rounded-2xl p-8 text-center">
          <p className="text-muted">Nenhuma categoria nesta aba</p>
        </div>
      )}
    </div>
  );
}
