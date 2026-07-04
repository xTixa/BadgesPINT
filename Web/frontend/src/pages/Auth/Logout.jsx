import { useNavigate } from "react-router-dom";
import api from "/src/api";

export default function Logout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Tentar registar no backend, mas não bloquear UX
    api.post("/api/auth/logout").catch(() => {});

    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("greeting");

    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2F2F2] px-4">
      <div className="bg-white shadow-xl rounded-3xl p-10 max-w-md w-full text-center">

        <h2 className="text-2xl font-bold text-slate-800 mb-6">
          Pretende terminar a sua sessão?
        </h2>

        <p className="text-gray-600 mb-8">
          Se terminar a sessão, terá de voltar a fazer login para aceder à plataforma.
        </p>

        <div className="flex flex-col gap-4">

          {/* BOTÃO TERMINAR */}
          <button
            onClick={handleLogout}
            className="w-full py-3 rounded-lg text-white font-semibold bg-red-600 hover:bg-red-700 transition"
          >
            Terminar Sessão
          </button>

          {/* BOTÃO CANCELAR */}
          <button
            onClick={() => navigate(-1)}
            className="w-full py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Cancelar
          </button>

        </div>
      </div>
    </div>
  );
}
