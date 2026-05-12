import { useEffect } from "react";
import { InputField } from "~/components/login/InputField";
import { LoginButton } from "~/components/login/LoginButton";
import { useAuthStore } from "~/store/auth-store";
import { useNavigate } from "@remix-run/react";
import { toast } from "sonner";

export default function LoginScreen() {
  const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    await login(email, password);
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — brand panel */}
      <div className="hidden lg:flex lg:w-[420px] shrink-0 flex-col justify-between bg-[#00216b] p-10">
        <div className="flex items-center gap-3">
          <img src="/logotype.svg" alt="Wundu" className="h-10 w-auto" />
          <div>
            <div className="text-white font-semibold text-[15px] tracking-tight leading-none">Wundu</div>
            <div className="text-white/40 font-mono text-[10px] uppercase tracking-widest mt-0.5">BackOffice</div>
          </div>
        </div>

        <div>
          <p className="text-white/20 text-[11px] font-mono uppercase tracking-widest mb-4">Sistema Administrativo</p>
          <h2 className="text-white text-[28px] font-semibold leading-snug tracking-tight">
            Gestão interna<br />centralizada.
          </h2>
          <p className="mt-4 text-white/50 text-[13px] leading-relaxed">
            Acesso restrito a administradores autorizados da plataforma Wundu.
          </p>
        </div>

        <p className="text-white/20 text-[11px]">© {new Date().getFullYear()} Wundu · Todos os direitos reservados</p>
      </div>

      {/* Right — form */}
      <div className="flex flex-1 items-center justify-center bg-[#f8fafc] px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <img src="/logotype.svg" alt="Wundu" className="h-7 w-auto" />
            <span className="text-[#00216b] font-semibold text-[15px]">Wundu</span>
            <span className="text-gray-400 font-mono text-[10px] uppercase tracking-wider">Admin</span>
          </div>

          <div className="mb-8">
            <h1 className="text-[22px] font-semibold tracking-tight text-gray-900">Entrar no BackOffice</h1>
            <p className="mt-1.5 text-[13px] text-gray-500">Introduza as suas credenciais para continuar.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <InputField
              id="email"
              label="Email corporativo"
              type="email"
              name="email"
              placeholder="seu@email.com"
              required
            />
            <InputField
              id="password"
              label="Senha"
              type="password"
              name="password"
              placeholder="••••••••"
              required
            />
            <div className="pt-1">
              <LoginButton isSubmitting={isLoading} />
            </div>
          </form>

          <p className="mt-8 text-center text-[12px] text-gray-400">
            Problemas no acesso?{" "}
            <a href="/suporte" className="text-[#003cc3] hover:text-[#00216b] transition-colors">
              Suporte técnico
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
