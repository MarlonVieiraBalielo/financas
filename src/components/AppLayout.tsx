import { Outlet, NavLink } from "react-router-dom";
import { Footer } from "./Footer";

const nav = [
  { to: "/", emoji: "🏠", label: "Início" },
  { to: "/transacoes", emoji: "💸", label: "Transações" },
  { to: "/parcelas", emoji: "💳", label: "Parcelas" },
  { to: "/categorias", emoji: "🏷️", label: "Categorias" },
  { to: "/perfil", emoji: "👤", label: "Perfil" },
];

export function AppLayout() {
  return (
    <div className="flex h-screen bg-dark overflow-hidden">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-52 bg-card border-r border-white/5 p-5 flex-shrink-0">
        <p className="text-primary font-bold text-xl mb-8">💰 Finanças</p>
        <nav className="flex flex-col gap-1 flex-1">
          {nav.map(({ to, emoji, label }) => (
            <NavLink key={to} to={to} end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? "bg-primary/20 text-primary" : "text-muted hover:text-white hover:bg-white/5"
                }`
              }>
              <span className="text-lg">{emoji}</span>{label}
            </NavLink>
          ))}
        </nav>
        <a
          href="https://linkedin.com/in/marlon-balielo"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted text-xs hover:text-primary transition-colors mt-4 pt-4 border-t border-white/5 text-center"
        >
          Desenvolvido por<br />
          <span className="text-primary font-semibold">Marlon Balielo</span>
        </a>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <Outlet />
        </main>

        {/* Rodapé desktop dentro do main */}
        <Footer />

        {/* Bottom nav mobile */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 flex bg-card border-t border-white/5 z-40">
          {nav.map(({ to, emoji, label }) => (
            <NavLink key={to} to={to} end={to === "/"}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-2.5 gap-0.5 text-xs transition-colors ${
                  isActive ? "text-primary" : "text-muted"
                }`
              }>
              <span className="text-xl">{emoji}</span>
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
