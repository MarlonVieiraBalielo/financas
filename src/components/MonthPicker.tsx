import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

interface Props {
  month: string;
  onChange: (month: string) => void;
}

export function MonthPicker({ month, onChange }: Props) {
  const [year, m] = month.split("-").map(Number);

  const shift = (dir: number) => {
    const d = new Date(year, m - 1 + dir);
    const ny = d.getFullYear();
    const nm = String(d.getMonth() + 1).padStart(2, "0");
    onChange(`${ny}-${nm}`);
  };

  const label = new Date(year, m - 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex items-center gap-3">
      <button onClick={() => shift(-1)} className="text-muted hover:text-primary transition-colors">
        <ChevronLeftIcon className="w-5 h-5" />
      </button>
      <span className="text-white font-semibold capitalize min-w-40 text-center">{label}</span>
      <button onClick={() => shift(1)} className="text-muted hover:text-primary transition-colors">
        <ChevronRightIcon className="w-5 h-5" />
      </button>
    </div>
  );
}
