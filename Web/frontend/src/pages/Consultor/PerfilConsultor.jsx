import Sidebar from "../../layout/Sidebar";
import { useState, useEffect } from "react";
import api from "/src/api";

export default function PerfilConsultor() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [atividade] = useState([
    { id: 1, acao: "Conquistou o badge 'DevOps Intermédio'", data: "Há 2 dias" },
    { id: 2, acao: "Submeteu evidências para 'Outsystems Avançado'", data: "Há 5 dias" },
    { id: 3, acao: "Atualizou perfil profissional", data: "Há 1 semana" },
  ]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser({
          nome: response.data.name,
          cargo: getRoleLabel(response.data.role),
          email: response.data.email,
          localizacao: response.data.localizacao || "Não definida",
          imagem: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
          pontos: response.data.points_total || 0,
          badges: response.data.badges || 0,
          progresso: response.data.progresso || 0,
          competencias: ["React", "DevOps", "Outsystems", "SQL"], // TODO: buscar da BD
        });
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        alert("Erro ao carregar perfil. Verifique a autenticação.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const getRoleLabel = (role) => {
    const labels = {
      consultant: "Consultor",
      talent_manager: "Talent Manager",
      service_line_leader: "Service Line Leader",
      admin: "Administrador",
    };
    return labels[role] || role;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-[#16558C]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">Erro ao carregar perfil</div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "consultant", name: user.nome }} />

      <main className="admin-main">
        <div className="mb-5 flex flex-col gap-4 rounded-2xl bg-[#16558C] p-5 text-white shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <img
              src={user.imagem}
              alt="Foto de perfil"
              className="h-20 w-20 rounded-full border border-white object-cover sm:h-24 sm:w-24"
            />
            <div>
              <h3 className="mb-1 text-xl font-bold sm:text-2xl">{user.nome}</h3>
              <p className="m-0 text-sm text-white/80 sm:text-base">{user.cargo}</p>
            </div>
          </div>
          <div className="md:text-right">
            <button 
              className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100"
              onClick={() => window.location.href = "/editar-perfil"}
            >
              <i className="bi bi-pencil-square mr-2"></i>Editar Perfil
            </button>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white py-4 text-center shadow-sm">
            <i className="bi bi-star-fill mb-2 block text-2xl text-amber-500"></i>
            <h5 className="mb-1 text-xl font-semibold text-slate-900">{user.pontos}</h5>
            <p className="m-0 text-xs text-slate-500">Pontos Acumulados</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white py-4 text-center shadow-sm">
            <i className="bi bi-award-fill mb-2 block text-2xl text-emerald-600"></i>
            <h5 className="mb-1 text-xl font-semibold text-slate-900">{user.badges}</h5>
            <p className="m-0 text-xs text-slate-500">Badges Obtidos</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white py-4 text-center shadow-sm sm:col-span-2 lg:col-span-1">
            <i className="bi bi-graph-up-arrow mb-2 block text-2xl text-sky-600"></i>
            <h5 className="mb-1 text-xl font-semibold text-slate-900">{user.progresso}%</h5>
            <p className="m-0 text-xs text-slate-500">Progresso Global</p>
          </div>
        </div>

        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h5 className="mb-3 text-base font-bold text-slate-900">
            <i className="bi bi-person-lines-fill mr-2 text-sky-600"></i>
            Informacoes Pessoais
          </h5>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs text-slate-500">Email</p>
              <p className="text-sm font-semibold text-slate-900">{user.email}</p>
            </div>
            <div>
              <p className="mb-1 text-xs text-slate-500">Localizacao</p>
              <p className="text-sm font-semibold text-slate-900">{user.localizacao}</p>
            </div>
          </div>
        </div>

        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h5 className="mb-3 text-base font-bold text-slate-900">
            <i className="bi bi-lightbulb-fill mr-2 text-amber-500"></i>
            Competencias
          </h5>
          <div className="flex flex-wrap gap-2">
            {user.competencias.map((comp, i) => (
              <span key={i} className="rounded-full bg-sky-700 px-3 py-1 text-xs font-semibold text-white">
                {comp}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h5 className="mb-3 text-base font-bold text-slate-900">
            <i className="bi bi-clock-history mr-2 text-emerald-600"></i>
            Atividade Recente
          </h5>
          <ul className="m-0 list-none divide-y divide-slate-100 p-0">
            {atividade.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                <span className="text-sm text-slate-800">{a.acao}</span>
                <small className="text-xs text-slate-500">{a.data}</small>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}

