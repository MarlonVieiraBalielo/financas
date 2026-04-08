import { Transaction } from "@/types";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface Props {
  transactions: Transaction[];
}

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function ExpenseChart({ transactions }: Props) {
  const chartData = transactions
    .filter((t) => t.type === "expense")
    .reduce<{ name: string; valor: number; color: string }[]>((acc, t) => {
      const key = t.category?.name ?? "Outros";
      const existing = acc.find((x) => x.name === key);
      if (existing) existing.valor += t.amount;
      else acc.push({ name: key, valor: t.amount, color: t.category?.color ?? "#6366f1" });
      return acc;
    }, [])
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 7);

  return (
    <div className="bg-card rounded-2xl p-5 mb-3">
      <p className="text-white font-semibold mb-1">Onde o dinheiro foi</p>
      <p className="text-muted text-xs mb-4">Despesas por categoria no mês</p>

      {chartData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <span className="text-4xl mb-2">📊</span>
          <p className="text-muted text-sm">O gráfico aparecerá aqui<br />quando houver despesas no mês</p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                formatter={(v: number) => fmt(v)}
                contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: 8 }}
                labelStyle={{ color: "#fff" }}
                itemStyle={{ color: "#aaa" }}
              />
              <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Legenda */}
          <div className="mt-3 flex flex-col gap-1.5">
            {chartData.map((item) => {
              const total = chartData.reduce((s, x) => s + x.valor, 0);
              const pct = total > 0 ? ((item.valor / total) * 100).toFixed(0) : 0;
              return (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-muted">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted text-xs">{pct}%</span>
                    <span className="text-white font-medium">{fmt(item.valor)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
