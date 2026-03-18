import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
      setPassword(parsed.password || "");
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
      const res = await axios.post("http://localhost:4000/api/auth/login", {
        email,
        password
      });

      const { user, token, greeting, firstLogin } = res.data;

      // Guardar sessão
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      if (rememberMe) {
        localStorage.setItem("savedLogin", JSON.stringify({ email, password }));
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
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* ESQUERDA */}
      <div className="flex-1 flex flex-col justify-center px-8 py-12 bg-[#2AA4BF] text-[#F2F2F2]">
        <div className="max-w-md mx-auto text-center md:text-left">
          <h1 className="text-4xl font-extrabold mb-4 tracking-tight">
            Bem-vindo de volta!
          </h1>
          <p className="text-[#04C4D9] text-lg mb-10">
            Entra na tua jornada de aprendizagem e continua a conquistar badges.
          </p>
          <p className="italic text-sm text-slate-800">
            “O conhecimento é a tua melhor credencial.”
          </p>
        </div>
      </div>

      {/* FORMULÁRIO */}
      <div className="flex-1 flex items-center justify-center bg-[#F2F2F2]">

        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-2xl bg-white px-10 py-12 mx-6 border border-[#2AA4BF]"
        >
          <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">
            Iniciar Sessão
          </h2>

          {/* EMAIL */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${
                error ? "border-red-400" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-[#2AA4BF]`}
              placeholder="exemplo@dominio.com"
            />
          </div>

          {/* PASSWORD */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  error ? "border-red-400" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-[#2AA4BF] pr-16`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 my-auto px-2 text-sm font-medium text-slate-800 hover:text-[#04C4D9]"
                aria-label={showPassword ? "Ocultar password" : "Mostrar password"}
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
                className="h-4 w-4 rounded border-gray-300 text-slate-800 focus:ring-[#2AA4BF]"
              />
              Guardar dados da sessão
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
            className="w-full py-3 rounded-lg font-semibold text-white bg-[#2AA4BF] hover:bg-[#2AA4BF]"
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
              className="w-full py-3 rounded-lg font-semibold text-slate-800 border border-[#2AA4BF] hover:bg-[#2AA4BF] hover:text-white"
            >
              Criar Conta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
