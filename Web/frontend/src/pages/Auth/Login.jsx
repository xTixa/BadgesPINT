import api from "/src/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "/src/assets/logo.png";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedLogin = localStorage.getItem("savedLogin");
    if (!savedLogin) return;
    try {
      const parsed = JSON.parse(savedLogin);
      setEmail(parsed.email || "");
      setRememberMe(true);
    } catch (error) {
      console.error("Erro ao ler dados guardados", error);
      localStorage.removeItem("savedLogin");
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/api/auth/login", {
        email,
        password,
      });

      const { user, token, greeting, firstLogin } = res.data;

      // Guardar sessão
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      if (rememberMe) {
        localStorage.setItem("savedLogin", JSON.stringify({ email }));
      } else {
        localStorage.removeItem("savedLogin");
      }

      // Guardar saudação
      if (greeting) {
        localStorage.setItem("greeting", greeting);
      }

      // Se for primeiro login → vai mudar password
      if (firstLogin) {
        return navigate("/first-login");
      }

      // Redirecionar por role
      switch (user.role) {
        case "admin":
          navigate("/admin/dashboard");
          break;
        case "talent_manager":
          navigate("/tm/dashboard");
          break;
        case "service_line_leader":
          navigate("/sl/dashboard");
          break;
        case "consultant":
          navigate("/dashboard");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      console.error(err);
      setError("Credenciais inválidas. Verifica email e password.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-100">
      {/* ESQUERDA */}
      <div className="relative flex-1 flex flex-col justify-center overflow-hidden px-8 py-14 md:py-16 bg-gradient-to-br from-[#0F62FE] via-[#0F62FE] to-[#00AEEF] text-[#F2F2F2]">
        <div className="pointer-events-none absolute -top-20 -left-20 h-56 w-56 rounded-full bg-white/10 blur-2xl"></div>
        <div className="pointer-events-none absolute bottom-8 right-0 h-40 w-40 rounded-full bg-cyan-300/20 blur-2xl"></div>
        <div className="relative max-w-md mx-auto text-center md:text-left">
          <img
            src={logo}
            alt="Softinsa"
            className="h-16 md:h-20 w-auto mb-8 mx-auto md:mx-0 drop-shadow-[0_5px_14px_rgba(0,0,0,0.28)]"
          />
          <h1 className="text-4xl font-extrabold mb-3 tracking-tight">
            Bem-vindo de volta!
          </h1>
          <p className="text-[#BFEFFF] text-lg mb-8">
            Credenciais de teste:
            <br />
            admin: admin@example.com / Password123
            <br />
            tm: tm@soft.pt / qwerty
            <br />
            consultant: guilherme@softinsa.pt / Password123
          </p>
          <p className="italic text-sm text-white/80">
            “O conhecimento é a tua melhor credencial.”
          </p>
        </div>
      </div>

      {/* FORMULÁRIO */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-white via-[#F8FBFF] to-[#EEF6FF]">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-3xl bg-white px-10 py-10 md:py-12 mx-6 border border-[#0F62FE]/30 shadow-[0_20px_50px_rgba(15,98,254,0.12)]"
        >
          <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">
            Iniciar Sessão
          </h2>

          {/* EMAIL */}
          <div className="mb-6">
            <label className="block text-[15px] font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus:border-[#0F62FE] focus:bg-white focus:ring-4 focus:ring-[#0F62FE]/10"
              placeholder="exemplo@dominio.com"
            />
          </div>

          {/* PASSWORD */}
          <div className="mb-8">
            <label className="block text-[15px] font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus:border-[#0F62FE] focus:bg-white focus:ring-4 focus:ring-[#0F62FE]/10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 my-auto px-2 text-sm font-medium text-slate-800 hover:text-[#00AEEF]"
                aria-label={
                  showPassword ? "Ocultar password" : "Mostrar password"
                }
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6 text-sm">
            <label className="flex items-center gap-2 text-gray-700">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-slate-800 focus:ring-[#0F62FE]"
              />
              Guardar email neste dispositivo
            </label>
            <button
              type="button"
              onClick={() => navigate("/recover")}
              className="text-slate-800 hover:underline font-medium"
            >
              Esqueceste-te da password?
            </button>
          </div>

          {/* BOTÃO */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#0F62FE] to-[#00AEEF] hover:scale-[1.01] transition-all duration-200"
          >
            Entrar
          </button>

          {error && (
            <p className="mt-4 text-sm text-red-600 text-center font-medium">
              {error}
            </p>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">Ainda não tens conta?</p>
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="w-full py-3 rounded-lg font-semibold text-slate-800 border border-[#0F62FE]/20 text-[#0F62FE] hover:bg-[#0F62FE] hover:text-white"
            >
              Criar Conta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
