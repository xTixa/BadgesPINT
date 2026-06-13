import Sidebar from "../../layout/Sidebar";
import { useState, useEffect } from "react";
import api from "/src/api";

export default function PerfilConsultor() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [atividade] = useState([
    {
      id: 1,
      acao: "Conquistou o badge 'DevOps Intermédio'",
      data: "Há 2 dias",
    },
    {
      id: 2,
      acao: "Submeteu evidências para 'Outsystems Avançado'",
      data: "Há 5 dias",
    },
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
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-[#0F62FE]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Erro ao carregar perfil
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "consultant", name: user.nome }} />

      <main className="admin-main bg-gradient-to-b from-[#F8FBFF] to-[#EEF6FF]">
        <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F62FE] to-[#00AEEF] p-8 text-white shadow-[0_12px_40px_rgba(15,98,254,0.20)]">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10"></div>

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <img
                src={user.imagem}
                alt="Foto de perfil"
                className="h-24 w-24 rounded-3xl border-4 border-white/20 object-cover"
              />

              <div>
                <h1 className="text-3xl font-bold">{user.nome}</h1>

                <p className="mt-1 text-white/80">{user.cargo}</p>

                <p className="mt-2 text-sm text-white/70">{user.email}</p>
              </div>
            </div>

            <button
              className=" rounded-2xl bg-white px-5 py-3 font-semibold text-[#0F62FE] transition hover:scale-105 "
              onClick={() => (window.location.href = "/editar-perfil")}
            >
              <i className="bi bi-pencil-square mr-2"></i>
              Editar Perfil
            </button>
          </div>
        </div>
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: "bi-star-fill",
              label: "Pontos Acumulados",
              valor: user.pontos,
            },
            {
              icon: "bi-award-fill",
              label: "Badges Obtidos",
              valor: user.badges,
            },
            {
              icon: "bi-graph-up-arrow",
              label: "Progresso Global",
              valor: `${user.progresso}%`,
            },
          ].map((card, idx) => (
            <div
              key={idx}
              className=" rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F62FE]/10">
                <i className={`bi ${card.icon} text-xl text-[#0F62FE]`} />
              </div>

              <h3 className="text-3xl font-bold text-slate-900">
                {card.valor}
              </h3>

              <p className="mt-1 text-sm text-slate-500">{card.label}</p>
            </div>
          ))}
        </div>
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              Informações Pessoais
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="font-medium text-slate-900">{user.email}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Localização</p>
                <p className="font-medium text-slate-900">{user.localizacao}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Cargo</p>
                <p className="font-medium text-slate-900">{user.cargo}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              Competências
            </h2>

            <div className="flex flex-wrap gap-2">
              {user.competencias.map((comp, i) => (
                <span
                  key={i}
                  className=" rounded-full bg-[#0F62FE]/10 px-4 py-2 text-sm font-medium text-[#0F62FE]"
                >
                  {comp}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h5 className="mb-3 text-base font-bold text-slate-900">
            <i className="bi bi-clock-history mr-2 text-emerald-600"></i>
            Atividade Recente
          </h5>
          <ul className="space-y-4">
            {atividade.map((a) => (
              <li key={a.id} className="flex gap-4">
                <div className="mt-1 h-3 w-3 rounded-full bg-[#0F62FE]"></div>

                <div className="flex-1">
                  <p className="font-medium text-slate-900">{a.acao}</p>

                  <p className="text-sm text-slate-500">{a.data}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
