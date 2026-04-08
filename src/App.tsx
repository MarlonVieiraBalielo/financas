import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { Dashboard } from "@/pages/Dashboard";
import { Transactions } from "@/pages/Transactions";
import { Installments } from "@/pages/Installments";
import { Categories } from "@/pages/Categories";
import { Profile } from "@/pages/Profile";
import { AppLayout } from "@/components/AppLayout";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuthStore();
  if (loading) return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  return session ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuthStore();
  if (loading) return null;
  return !session ? <>{children}</> : <Navigate to="/" replace />;
}

export default function App() {
  const setSession = useAuthStore((s) => s.setSession);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transacoes" element={<Transactions />} />
          <Route path="/parcelas" element={<Installments />} />
          <Route path="/categorias" element={<Categories />} />
          <Route path="/perfil" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
