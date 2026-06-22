import api from "/src/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthShell from "./AuthShell";

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

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      if (rememberMe) {
        localStorage.setItem("savedLogin", JSON.stringify({ email }));
      } else {
        localStorage.removeItem("savedLogin");
      }

      if (greeting) {
        localStorage.setItem("greeting", greeting);
      }

      if (firstLogin) {
        return navigate("/first-login");
      }

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
      setError("Credenciais invalidas. Verifica email e password.");
    }
  };

  return (
    <AuthShell
      title="Iniciar sessao"
      description="Insere os teus dados para entrar na plataforma."
      asideTitle="Bem-vindo ao portal de badges"
      asideText="Acompanha a tua evolucao, consulta conquistas e gere pedidos numa experiencia mais limpa e direta."
      asideNote={{
        label: "Credenciais de teste",
        text: "Usa uma destas contas para validar a plataforma:",
        items: [
          "Admin: admin@example.com | Password123",
          "Talent Manager: natalia.neves@softinsa.pt | qwerty",
          "Service Line Leader: monica@yopmail.com | qwerty123",
          "Consultant: guilherme@softinsa.pt | Password123",
        ],
      }}
    >
      <form onSubmit={handleLogin}>
        {error && <p className="auth-message auth-message-error">{error}</p>}

        <div className="auth-field">
          <label>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
            placeholder="exemplo@dominio.com"
          />
        </div>

        <div className="auth-field">
          <div className="mb-2 flex items-center justify-between gap-3">
            <label className="auth-label m-0">Password</label>
            <button
              type="button"
              onClick={() => navigate("/recover")}
              className="auth-link"
            >
              Recuperar password
            </button>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input pr-12"
              placeholder="********"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-3 my-auto inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-[#0F62FE]"
              aria-label={showPassword ? "Ocultar password" : "Mostrar password"}
            >
              <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
            </button>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between gap-4 text-sm">
          <label className="flex items-center gap-2 text-slate-700">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-slate-800 focus:ring-[#0F62FE]"
            />
            Lembrar email neste dispositivo
          </label>
        </div>

        <button type="submit" className="auth-primary-button">
          <i className="bi bi-box-arrow-in-right"></i>
          Entrar
        </button>

        <div className="mt-6 text-center">
          <p className="mb-3 text-sm text-slate-600">Ainda nao tens conta?</p>
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="auth-secondary-button"
          >
            Criar conta
          </button>
        </div>
      </form>
    </AuthShell>
  );
}
