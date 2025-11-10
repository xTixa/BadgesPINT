import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    // 🔹 Lógica de autenticação virá depois
    console.log("Login:", email, password);
    navigate("/"); // Redireciona após login
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* 🔹 Secção esquerda - fundo azul e mensagem */}
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
        {/* Efeito decorativo */}
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

      {/* 🔹 Secção direita - formulário branco */}
      <div className="flex-1 flex items-center justify-center bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#191970] to-blue-500"></div>

        <form
          onSubmit={handleLogin}
          className="relative z-10 w-full max-w-sm bg-white/90 shadow-xl rounded-2xl px-10 py-12 mx-6 border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-[#191970] mb-8 text-center">
            Iniciar Sessão
          </h2>

          {/* Email */}
          <div className="mb-6">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#191970] focus:border-transparent transition-all"
              placeholder="exemplo@dominio.com"
            />
          </div>

          {/* Password */}
          <div className="mb-8">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#191970] focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>

          {/* Botão */}
          <button
            type="submit"
            className="w-full py-3 rounded-lg font-semibold text-white bg-[#191970] hover:bg-[#101050] transition-colors shadow-md hover:shadow-lg"
          >
            Entrar
          </button>

          <p className="mt-6 text-center text-sm text-gray-500">
            Não tens conta?{" "}
            <span className="text-[#191970] font-medium hover:underline cursor-pointer">
              Regista-te
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
