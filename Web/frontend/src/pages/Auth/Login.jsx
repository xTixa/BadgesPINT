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
      <div className="relative flex-1 flex flex-col justify-center px-8 py-12 bg-[#191970] text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#191970] via-[#0f1b5b] to-[#000428] opacity-95"></div>
        <div className="relative z-10 max-w-md mx-auto text-center md:text-left">
          <h1 className="text-4xl font-extrabold mb-4 tracking-tight">
            Bem-vindo de volta!
          </h1>
          <p className="text-blue-100 text-lg mb-10">
            Entra na tua jornada de aprendizagem e continua a conquistar badges.
          </p>
          <p className="italic text-sm text-blue-200">
            “O conhecimento é a tua melhor credencial.”
          </p>
        </div>

        <svg
          className="absolute bottom-0 left-0 w-full opacity-10"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
        >
          <path
            fill="currentColor"
            d="M0,224L60,213.3C120,203,240,181,360,154.7C480,128,600,96,720,112C840,128,960,192,1080,208C1200,224,1320,192,1380,176L1440,160V320H0Z"
          />
        </svg>
      </div>

      {/* FORMULÁRIO */}
      <div className="flex-1 flex items-center justify-center bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#191970] to-blue-500"></div>

        <form
          onSubmit={handleLogin}
          className="relative z-10 w-full max-w-sm bg-white/90 shadow-xl rounded-2xl px-10 py-12 mx-6 border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-[#191970] mb-8 text-center">
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
              } focus:outline-none focus:ring-2 focus:ring-[#191970] transition-all`}
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
                } focus:outline-none focus:ring-2 focus:ring-[#191970] transition-all pr-16`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 my-auto px-2 text-sm font-medium text-[#191970] hover:text-[#101050]"
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
                className="h-4 w-4 rounded border-gray-300 text-[#191970] focus:ring-[#191970]"
              />
              Guardar dados da sessão
            </label>
            <button
              type="button"
              onClick={() => navigate("/recover")}
              className="text-[#191970] hover:underline font-medium"
            >
              Esqueceste-te da password?
            </button>
          </div>

          {/* BOTÃO */}
          <button
            type="submit"
            className="w-full py-3 rounded-lg font-semibold text-white 
            bg-[#191970] hover:bg-[#101050] transition-colors shadow-md hover:shadow-lg"
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
              className="w-full py-3 rounded-lg font-semibold text-[#191970] border border-[#191970] hover:bg-[#191970] hover:text-white transition-colors"
            >
              Criar Conta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
