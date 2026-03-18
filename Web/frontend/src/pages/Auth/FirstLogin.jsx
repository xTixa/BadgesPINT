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
      <div className="flex-1 flex flex-col justify-center px-8 py-12 bg-[#2AA4BF] text-white">

        <div className="max-w-md mx-auto text-center md:text-left">
          <h1 className="text-4xl font-extrabold mb-4 tracking-tight">
            Primeiro Login
          </h1>
          <p className="text-[#04C4D9] text-lg mb-10">
            Cria uma nova password para entrar na plataforma.
          </p>
          <p className="italic text-sm text-slate-800">
            “A tua jornada começa com um passo.”
          </p>
        </div>
      </div>

      {/* DIREITA */}
      <div className="flex-1 flex items-center justify-center bg-[#F2F2F2]">

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm bg-white rounded-2xl px-10 py-12 mx-6 border border-[#2AA4BF]"
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
              focus:outline-none focus:ring-2 focus:ring-[#2AA4BF]"
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
              focus:outline-none focus:ring-2 focus:ring-[#2AA4BF]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg font-semibold text-white 
            bg-[#2AA4BF] hover:bg-[#2AA4BF]"
          >
            Guardar Password
          </button>
        </form>
      </div>
    </div>
  );
}
