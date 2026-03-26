import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "/src/api";
import logo from "/src/assets/logo.png";

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

      const res = await api.post(
        "/api/auth/first-login",
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
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-100">
      {/* ESQUERDA */}
      <div className="relative flex-1 flex flex-col justify-center overflow-hidden px-8 py-14 md:py-16 bg-gradient-to-br from-[#124878] via-[#16558C] to-[#1D6AA8] text-white">
        <div className="pointer-events-none absolute -top-20 -left-20 h-56 w-56 rounded-full bg-white/10 blur-2xl"></div>
        <div className="pointer-events-none absolute bottom-8 right-0 h-40 w-40 rounded-full bg-cyan-300/20 blur-2xl"></div>

        <div className="relative max-w-md mx-auto text-center md:text-left">
          <img
            src={logo}
            alt="Softinsa"
            className="h-16 md:h-20 w-auto mb-8 mx-auto md:mx-0 drop-shadow-[0_5px_14px_rgba(0,0,0,0.28)]"
          />
          <h1 className="text-4xl font-extrabold mb-3 tracking-tight">
            Primeiro Login
          </h1>
          <p className="text-[#04C4D9] text-lg mb-8">
            Cria uma nova password para entrar na plataforma.
          </p>
          <p className="italic text-sm text-slate-800">
            “A tua jornada começa com um passo.”
          </p>
        </div>
      </div>

      {/* DIREITA */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-[#F6F8FB] to-[#EEF2F7]">

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm bg-white rounded-2xl px-10 py-10 md:py-12 mx-6 border border-[#16558C]/30 shadow-[0_14px_35px_rgba(15,23,42,0.12)]"
        >
          <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">
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
              focus:outline-none focus:ring-2 focus:ring-[#16558C]/40"
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
              focus:outline-none focus:ring-2 focus:ring-[#16558C]/40"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-[#16558C] to-[#2B6EA8] hover:shadow-md"
          >
            Guardar Password
          </button>
        </form>
      </div>
    </div>
  );
}
