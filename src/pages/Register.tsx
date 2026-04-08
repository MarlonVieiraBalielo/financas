import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

const schema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});
type FormData = z.infer<typeof schema>;

export function Register() {
  const signUp = useAuthStore((s) => s.signUp);
  const navigate = useNavigate();

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    const err = await signUp(data.email, data.password, data.name);
    if (err) setError("email", { message: err });
    else navigate("/login");
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-5xl">💰</span>
          <h1 className="text-white text-3xl font-bold mt-3">Criar conta</h1>
          <p className="text-muted mt-1">Comece a controlar suas finanças</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              {...register("name")}
              placeholder="Nome completo"
              className="w-full bg-card text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary placeholder:text-muted"
            />
            {errors.name && <p className="text-expense text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <input
              {...register("email")}
              type="email"
              placeholder="E-mail"
              className="w-full bg-card text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary placeholder:text-muted"
            />
            {errors.email && <p className="text-expense text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <input
              {...register("password")}
              type="password"
              placeholder="Senha (mín. 6 caracteres)"
              className="w-full bg-card text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary placeholder:text-muted"
            />
            {errors.password && <p className="text-expense text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-white rounded-xl py-3 font-bold hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {isSubmitting ? "Criando..." : "Criar conta"}
          </button>
        </form>

        <p className="text-center text-muted mt-5 text-sm">
          Já tem conta?{" "}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
