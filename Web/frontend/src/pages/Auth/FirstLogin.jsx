import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function FirstLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6)
      return setError("A password deve ter pelo menos 6 caracteres.");

    if (password !== confirm)
      return setError("As passwords não coincidem.");

    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      const res = await axios.post(
        "http://localhost:4000/api/auth/first-login",
        { newPassword: password },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Atualizar token e user
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      alert("Password atualizada com sucesso!");

      switch (res.data.user.role) {
        case "admin": navigate("/admin/dashboard"); break;
        case "talent_manager": navigate("/tm/dashboard"); break;
        case "service_line_leader": navigate("/sl/dashboard"); break;
        default: navigate("/dashboard");
      }

    } catch (error) {
      console.error(error);
      setError("Erro ao atualizar password.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* ESQUERDA */}
      <div className="relative flex-1 flex flex-col justify-center px-8 py-12 bg-[#191970] text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#191970] via-[#0f1b5b] to-[#000428] opacity-95"></div>

        <div className="relative z-10 max-w-md mx-auto text-center md:text-left">
          <h1 className="text-4xl font-extrabold mb-4 tracking-tight">
            Primeiro Login
          </h1>
          <p className="text-blue-100 text-lg mb-10">
            Cria uma nova password para entrar na plataforma.
          </p>
          <p className="italic text-sm text-blue-200">
            “A tua jornada começa com um passo.”
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

      {/* DIREITA */}
      <div className="flex-1 flex items-center justify-center bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#191970] to-blue-500"></div>

        <form
          onSubmit={handleSubmit}
          className="relative z-10 w-full max-w-sm bg-white/90 shadow-xl rounded-2xl px-10 py-12 mx-6 border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-[#191970] mb-8 text-center">
            Criar nova password
          </h2>

          {error && (
            <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
          )}

          {/* Password */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nova Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 
              focus:outline-none focus:ring-2 focus:ring-[#191970] transition-all"
            />
          </div>

          {/* Confirm */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Password
            </label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 
              focus:outline-none focus:ring-2 focus:ring-[#191970] transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg font-semibold text-white 
            bg-[#191970] hover:bg-[#101050] transition-colors shadow-md hover:shadow-lg"
          >
            Guardar Password
          </button>
        </form>
      </div>
    </div>
  );
}
