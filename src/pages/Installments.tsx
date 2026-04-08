import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useInstallmentStore } from "@/stores/installmentStore";
import { useTransactionStore } from "@/stores/transactionStore";
import { PaymentMethod, PAYMENT_METHODS } from "@/types";
import { TrashIcon, XMarkIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/24/solid";

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function Installments() {
  const user = useAuthStore((s) => s.user);
  const { installments, loading, fetchInstallments, addInstallment, payInstallment, deleteInstallment, getTotalDebt, getMonthlyCommitment } =
    useInstallmentStore();
  const { categories, fetchCategories } = useTransactionStore();
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [totalInstallments, setTotalInstallments] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credito");
  const [categoryId, setCategoryId] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (user) {
      fetchInstallments(user.id);
      fetchCategories(user.id);
    }
  }, [user]);

  const installmentAmount =
    totalAmount && totalInstallments
      ? parseFloat(totalAmount.replace(",", ".")) / parseInt(totalInstallments)
      : 0;

  const handleAdd = async () => {
    if (!title.trim()) { setFormError("Digite o título"); return; }
    const total = parseFloat(totalAmount.replace(",", "."));
    const numInstallments = parseInt(totalInstallments);
    if (isNaN(total) || total <= 0) { setFormError("Valor total inválido"); return; }
    if (isNaN(numInstallments) || numInstallments <= 0) { setFormError("Número de parcelas inválido"); return; }
    if (!categoryId) { setFormError("Selecione uma categoria"); return; }

    const err = await addInstallment({
      user_id: user!.id,
      category_id: categoryId,
      title,
      total_amount: total,
      installment_amount: total / numInstallments,
      total_installments: numInstallments,
      paid_installments: 0,
      payment_method: paymentMethod,
      start_date: startDate,
      note,
    });

    if (err) { setFormError(err); return; }
    setTitle(""); setTotalAmount(""); setTotalInstallments("");
    setCategoryId(""); setNote(""); setFormError("");
    setShowForm(false);
  };

  const active = installments.filter((i) => i.paid_installments < i.total_installments);
  const finished = installments.filter((i) => i.paid_installments >= i.total_installments);
  const expenseCategories = categories.filter((c) => c.type === "expense");

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-2xl font-bold">Parcelamentos</h1>
        <button onClick={() => setShowForm(true)}
          className="bg-primary text-white rounded-xl px-4 py-2 flex items-center gap-1.5 text-sm font-semibold hover:bg-primary/90 transition-colors">
          <PlusIcon className="w-4 h-4" /> Novo
        </button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-card rounded-2xl p-4">
          <p className="text-expense text-xs font-semibold mb-1">DÍVIDA TOTAL</p>
          <p className="text-white font-bold text-xl">{fmt(getTotalDebt())}</p>
        </div>
        <div className="bg-card rounded-2xl p-4">
          <p className="text-yellow-400 text-xs font-semibold mb-1">COMPROMISSO MENSAL</p>
          <p className="text-white font-bold text-xl">{fmt(getMonthlyCommitment())}</p>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-lg">Novo Parcelamento</h2>
              <button onClick={() => setShowForm(false)} className="text-muted hover:text-white">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <input value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="Título (ex: Notebook, TV, Moto)"
                className="w-full bg-dark text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary placeholder:text-muted" />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted text-xs mb-1 block">Valor total</label>
                  <input value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)}
                    placeholder="Ex: 2400,00"
                    className="w-full bg-dark text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary placeholder:text-muted" />
                </div>
                <div>
                  <label className="text-muted text-xs mb-1 block">Nº de parcelas</label>
                  <input value={totalInstallments} onChange={(e) => setTotalInstallments(e.target.value)}
                    placeholder="Ex: 12" type="number" min="1"
                    className="w-full bg-dark text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary placeholder:text-muted" />
                </div>
              </div>

              {installmentAmount > 0 && (
                <div className="bg-dark rounded-xl px-4 py-3">
                  <p className="text-muted text-xs">Valor de cada parcela</p>
                  <p className="text-white font-bold text-lg">{fmt(installmentAmount)}</p>
                </div>
              )}

              <div>
                <label className="text-muted text-xs mb-1 block">Data da 1ª parcela</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-dark text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary" />
              </div>

              <div>
                <p className="text-muted text-sm mb-2">Forma de pagamento</p>
                <div className="flex flex-wrap gap-2">
                  {PAYMENT_METHODS.map((pm) => (
                    <button key={pm.value} type="button" onClick={() => setPaymentMethod(pm.value)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-colors ${
                        paymentMethod === pm.value ? "border-primary bg-primary/20 text-white" : "border-dark bg-dark text-muted"
                      }`}>
                      <span>{pm.icon}</span><span>{pm.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-muted text-sm mb-2">Categoria</p>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {expenseCategories.map((cat) => (
                    <button key={cat.id} type="button" onClick={() => setCategoryId(cat.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-colors ${
                        categoryId === cat.id ? "border-primary bg-primary/20 text-white" : "border-dark bg-dark text-muted"
                      }`}>
                      <span>{cat.icon}</span><span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <textarea value={note} onChange={(e) => setNote(e.target.value)}
                placeholder="Nota (opcional)" rows={2}
                className="w-full bg-dark text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary placeholder:text-muted resize-none" />

              {formError && <p className="text-expense text-sm">{formError}</p>}

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

      {/* Lista ativa */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-7 h-7 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {active.length === 0 && finished.length === 0 && (
            <div className="bg-card rounded-2xl p-8 text-center">
              <p className="text-muted">Nenhum parcelamento cadastrado</p>
            </div>
          )}

          {active.length > 0 && (
            <div className="mb-6">
              <h2 className="text-muted text-xs font-semibold uppercase tracking-wider mb-3">Em andamento</h2>
              <div className="flex flex-col gap-3">
                {active.map((inst) => {
                  const remaining = inst.total_installments - inst.paid_installments;
                  const progress = (inst.paid_installments / inst.total_installments) * 100;
                  const pm = PAYMENT_METHODS.find((p) => p.value === inst.payment_method);
                  return (
                    <div key={inst.id} className="bg-card rounded-2xl p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                            style={{ backgroundColor: (inst.category?.color ?? "#6366f1") + "33" }}>
                            {inst.category?.icon ?? "💳"}
                          </div>
                          <div>
                            <p className="text-white font-semibold">{inst.title}</p>
                            <p className="text-muted text-xs">{pm?.icon} {pm?.label}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => payInstallment(inst.id, inst.paid_installments)}
                            className="text-income hover:text-income/70 transition-colors" title="Marcar parcela como paga">
                            <CheckCircleIcon className="w-5 h-5" />
                          </button>
                          <button onClick={() => deleteInstallment(inst.id)}
                            className="text-muted hover:text-expense transition-colors">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                        <div className="bg-dark rounded-lg py-2">
                          <p className="text-muted text-xs">Por mês</p>
                          <p className="text-white font-bold text-sm">{fmt(inst.installment_amount)}</p>
                        </div>
                        <div className="bg-dark rounded-lg py-2">
                          <p className="text-muted text-xs">Restantes</p>
                          <p className="text-expense font-bold text-sm">{remaining}x</p>
                        </div>
                        <div className="bg-dark rounded-lg py-2">
                          <p className="text-muted text-xs">Falta pagar</p>
                          <p className="text-expense font-bold text-sm">{fmt(remaining * inst.installment_amount)}</p>
                        </div>
                      </div>

                      <div className="w-full bg-dark rounded-full h-2">
                        <div className="h-2 rounded-full bg-primary transition-all"
                          style={{ width: `${progress}%` }} />
                      </div>
                      <p className="text-muted text-xs mt-1 text-right">
                        {inst.paid_installments}/{inst.total_installments} parcelas pagas
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {finished.length > 0 && (
            <div>
              <h2 className="text-muted text-xs font-semibold uppercase tracking-wider mb-3">Concluídos</h2>
              <div className="flex flex-col gap-2">
                {finished.map((inst) => (
                  <div key={inst.id} className="bg-card/50 rounded-xl px-4 py-3 flex items-center gap-3">
                    <span className="text-income text-lg">✅</span>
                    <div className="flex-1">
                      <p className="text-muted font-semibold line-through">{inst.title}</p>
                      <p className="text-muted text-xs">{fmt(inst.total_amount)} · {inst.total_installments}x</p>
                    </div>
                    <button onClick={() => deleteInstallment(inst.id)}
                      className="text-muted hover:text-expense transition-colors">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
