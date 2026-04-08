import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useTransactionStore } from "@/stores/transactionStore";
import { TransactionType, PaymentMethod, PAYMENT_METHODS } from "@/types";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export function AddModal({ onClose, onSuccess }: Props) {
  const user = useAuthStore((s) => s.user);
  const { categories, addTransaction } = useTransactionStore();

  const [step, setStep] = useState<"type" | "form">("type");
  const [type, setType] = useState<TransactionType>("expense");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [categoryId, setCategoryId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = categories.filter((c) => c.type === type);

  const handleSave = async () => {
    setError("");
    if (!title.trim()) { setError("Digite uma descrição"); return; }

    const rawAmount = amount.replace(/\./g, "").replace(",", ".");
    const val = parseFloat(rawAmount);
    if (isNaN(val) || val <= 0) { setError("Digite um valor válido (ex: 150,00)"); return; }
    if (!categoryId) { setError("Selecione uma categoria"); return; }
    if (!date) { setError("Selecione a data"); return; }

    setSaving(true);

    const payload: Record<string, unknown> = {
      user_id: user!.id,
      category_id: categoryId,
      title: title.trim(),
      amount: val,
      type,
      date,
    };

    if (type === "expense") payload.payment_method = paymentMethod;
    if (note.trim()) payload.note = note.trim();

    const err = await addTransaction(payload as never);
    setSaving(false);

    if (err) {
      setError("Erro ao salvar: " + err);
      return;
    }

    onSuccess();
    onClose();
  };

  // Passo 1: escolher tipo
  if (step === "type") {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-end md:items-center justify-center z-50">
        <div className="bg-card w-full md:max-w-sm rounded-t-3xl md:rounded-2xl p-6">
          <p className="text-white text-xl font-bold text-center mb-2">O que deseja registrar?</p>
          <p className="text-muted text-sm text-center mb-6">Escolha o tipo do lançamento</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => { setType("expense"); setStep("form"); }}
              className="bg-expense/10 border-2 border-expense/30 text-white rounded-2xl py-5 text-lg font-semibold hover:bg-expense/20 transition-colors flex items-center justify-center gap-3"
            >
              <span className="text-3xl">💸</span>
              <div className="text-left">
                <p className="font-bold">Despesa</p>
                <p className="text-muted text-sm font-normal">Gasto, conta, compra...</p>
              </div>
            </button>
            <button
              onClick={() => { setType("income"); setStep("form"); }}
              className="bg-income/10 border-2 border-income/30 text-white rounded-2xl py-5 text-lg font-semibold hover:bg-income/20 transition-colors flex items-center justify-center gap-3"
            >
              <span className="text-3xl">💵</span>
              <div className="text-left">
                <p className="font-bold">Receita</p>
                <p className="text-muted text-sm font-normal">Salário, freelance, presente...</p>
              </div>
            </button>
          </div>
          <button onClick={onClose} className="w-full text-muted mt-5 py-2 text-sm hover:text-white transition-colors">
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  // Passo 2: formulário
  return (
    <div className="fixed inset-0 bg-black/70 flex items-end md:items-center justify-center z-50">
      <div className="bg-card w-full md:max-w-md rounded-t-3xl md:rounded-2xl p-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => setStep("type")} className="text-muted hover:text-white text-2xl leading-none">←</button>
          <p className="text-white text-lg font-bold flex items-center gap-2">
            {type === "expense" ? "💸 Nova despesa" : "💵 Nova receita"}
          </p>
        </div>

        <div className="space-y-5">
          {/* Descrição */}
          <div>
            <label className="text-muted text-sm block mb-1.5">Descrição *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === "expense" ? "Ex: Conta de luz, Mercado..." : "Ex: Salário de abril..."}
              className="w-full bg-dark text-white text-base rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-primary placeholder:text-muted/40 border border-white/5"
              autoFocus
            />
          </div>

          {/* Valor */}
          <div>
            <label className="text-muted text-sm block mb-1.5">Valor em R$ *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-bold">R$</span>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                inputMode="decimal"
                className="w-full bg-dark text-white text-2xl font-bold rounded-xl pl-12 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-primary placeholder:text-muted/30 border border-white/5"
              />
            </div>
          </div>

          {/* Data */}
          <div>
            <label className="text-muted text-sm block mb-1.5">Data *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-dark text-white rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-primary border border-white/5"
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="text-muted text-sm block mb-2">
              Categoria * {categoryId === "" && <span className="text-expense text-xs">(obrigatório)</span>}
            </label>
            {filtered.length === 0 ? (
              <p className="text-muted text-sm bg-dark rounded-xl p-3">
                Nenhuma categoria disponível. Crie em Categorias.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto pr-1">
                {filtered.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
                      categoryId === cat.id
                        ? "border-primary bg-primary/20 text-white"
                        : "border-white/10 bg-dark text-muted hover:text-white hover:border-white/30"
                    }`}
                  >
                    <span className="text-base">{cat.icon}</span>
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Forma de pagamento */}
          {type === "expense" && (
            <div>
              <label className="text-muted text-sm block mb-2">Forma de pagamento</label>
              <div className="grid grid-cols-3 gap-2">
                {PAYMENT_METHODS.map((pm) => (
                  <button
                    key={pm.value}
                    onClick={() => setPaymentMethod(pm.value)}
                    className={`flex flex-col items-center py-2.5 rounded-xl text-xs font-medium border transition-colors ${
                      paymentMethod === pm.value
                        ? "border-primary bg-primary/20 text-white"
                        : "border-white/10 bg-dark text-muted hover:text-white"
                    }`}
                  >
                    <span className="text-xl mb-0.5">{pm.icon}</span>
                    {pm.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Nota */}
          <div>
            <label className="text-muted text-sm block mb-1.5">
              Observação <span className="text-muted/50">(opcional)</span>
            </label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Algum detalhe..."
              className="w-full bg-dark text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary placeholder:text-muted/40 border border-white/5"
            />
          </div>

          {/* Erro */}
          {error && (
            <div className="bg-expense/20 border border-expense/40 rounded-xl px-4 py-3">
              <p className="text-expense text-sm">⚠️ {error}</p>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-1 pb-2">
            <button
              onClick={onClose}
              className="flex-1 bg-dark text-muted rounded-xl py-3.5 font-semibold hover:text-white transition-colors border border-white/5"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex-1 rounded-xl py-3.5 font-bold text-white transition-colors disabled:opacity-50 ${
                type === "expense"
                  ? "bg-expense hover:bg-expense/80"
                  : "bg-income hover:bg-income/80"
              }`}
            >
              {saving ? "Salvando..." : "✓ Salvar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
