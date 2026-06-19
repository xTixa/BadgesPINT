import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "/src/api";
import Sidebar from "../../layout/Sidebar";

const mockBadges = [
  {
    id: 1,
    name: "Excel Avançado",
    status: "obtido",
    area: "Data",
    pontos: 120,
    expiraEmDias: 45,
  },
  {
    id: 2,
    name: "Power BI",
    status: "pendente",
    area: "Data",
    pontos: 90,
    expiraEmDias: 20,
  },
  {
    id: 3,
    name: "Gestão de Projeto",
    status: "em progresso",
    area: "PMO",
    pontos: 100,
  },
];

const mockLPs = [
  {
    id: 1,
    nome: "Learning Path - Dados",
    passosConcluidos: 3,
    passosTotal: 6,
    percentagem: 50,
    status: "em progresso",
  },
  {
    id: 2,
    nome: "Cloud Foundations",
    passosConcluidos: 5,
    passosTotal: 5,
    percentagem: 100,
    status: "concluido",
  },
];

const mockRecomendados = [
  {
    id: 1,
    nome: "Badge SQL",
    motivo: "Completa o módulo de queries",
    pontos: 60,
  },
  { id: 2, nome: "Badge Agile", motivo: "Entrega sprint review", pontos: 40 },
];

const mockReminders = [
  {
    id: 1,
    titulo: "Submeter evidência",
    desc: "Envio até sexta para Badge Power BI",
    prazo: "Em 3 dias",
  },
  {
    id: 2,
    titulo: "Feedback do manager",
    desc: "Precisa aprovação para Badge Excel",
    prazo: "Pendente",
  },
];

const mockSpecialBadges = [
  { id: 1, nome: "Badge de Ouro", desc: "Top 3 na tua área", pontos: 250 },
  { id: 2, nome: "Badge Mentor", desc: "Acompanhou 3 colegas", pontos: 180 },
];

const mockExpiracao = [
  { id: 1, nome: "ISO Security", expiraEmDias: 12 },
  { id: 2, nome: "Kubernetes", expiraEmDias: 25 },
];

export default function DashboardConsultor() {
  const [user, setUser] = useState(null);
  const [badges, setBadges] = useState([]);
  const [progresso, setProgresso] = useState(0);
  const [greeting, setGreeting] = useState("");
  const [learningPaths, setLearningPaths] = useState([]);
  const [reminders, setReminders] = useState(mockReminders);
  const [recomendados, setRecomendados] = useState(mockRecomendados);
  const [specials, setSpecials] = useState(mockSpecialBadges);
  const [alertsExpiracao, setAlertsExpiracao] = useState([]);
  const [progressByBadge, setProgressByBadge] = useState({});

  useEffect(() => {
    const msg = localStorage.getItem("greeting");
    if (msg) setGreeting(msg);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!storedUser || !token) return;

    const loadData = async () => {
      try {
        const parsedUser = JSON.parse(storedUser);
        const userRes = await api.get("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userRes.data);

        const [badgeRes, lpRes, recRes, expRes, progressRes] =
          await Promise.all([
            api
              .get(`/api/consultor/${parsedUser.id}/badges`, {
                headers: { Authorization: `Bearer ${token}` },
              })
              .catch(() => ({ data: mockBadges })),
            api
              .get(`/api/consultor/${parsedUser.id}/learning-paths`, {
                headers: { Authorization: `Bearer ${token}` },
              })
              .catch(() => ({ data: mockLPs })),
            api
              .get(`/api/consultor/${parsedUser.id}/recomendados`, {
                headers: { Authorization: `Bearer ${token}` },
              })
              .catch(() => ({ data: mockRecomendados })),
            api
              .get(`/api/consultor/${parsedUser.id}/badges-expirar`, {
                headers: { Authorization: `Bearer ${token}` },
              })
              .catch(() => ({ data: mockExpiracao })),
            api
              .get(`/api/consultor/${parsedUser.id}/badges-progress`, {
                headers: { Authorization: `Bearer ${token}` },
              })
              .catch(() => ({ data: [] })),
          ]);

        setBadges(badgeRes.data || mockBadges);
        setLearningPaths(lpRes.data || mockLPs);
        setRecomendados(recRes.data || mockRecomendados);
        setAlertsExpiracao(expRes.data || mockExpiracao);

        const progressMap = {};
        (progressRes.data || []).forEach((p) => {
          progressMap[p.badge_id] = { total: p.total, approved: p.approved };
        });
        setProgressByBadge(progressMap);

        const total = (badgeRes.data || mockBadges).length;
        const obtidos = (badgeRes.data || mockBadges).filter(
          (b) => b.status === "obtido",
        ).length;
        setProgresso(total > 0 ? Math.round((obtidos / total) * 100) : 0);
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
      }
    };

    loadData();
  }, []);

  const pontosPorBadge = useMemo(
    () => badges.reduce((acc, b) => acc + (b.pontos || 0), 0),
    [badges],
  );
  const panelClass =
    "h-full rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]";
  const secondaryActionClass =
    "rounded-lg border border-[#16558C]/35 px-3 py-1.5 text-xs font-semibold text-[#16558C] transition hover:bg-[#16558C]/10";
  const secondaryActionClassLarge =
    "rounded-lg border border-[#16558C]/35 px-3 py-2 text-xs font-semibold text-[#16558C] transition hover:bg-[#16558C]/10 sm:text-sm";

  if (!user) {
    return (
      <div className="admin-shell">
        <Sidebar user={{ role: "consultant", name: "Consultant" }} />

        <main className="admin-main">
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
              A carregar...
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "consultant", name: user.name }} />

      <main className="admin-main bg-gradient-to-b from-[#F8FBFF] to-[#EEF6FF]">
        <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F62FE] via-[#0F62FE] to-[#00AEEF] p-8 text-white shadow-[0_12px_40px_rgba(15,98,254,0.20)]">
          {/* decoração */}
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10"></div>
          <div className="absolute right-24 bottom-0 h-24 w-24 rounded-full bg-white/5"></div>

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-medium text-white/80">
                Dashboard Pessoal
              </p>

              <h1 className="mb-2 text-3xl font-bold">
                {greeting}, {user.name.split(" ")[0]}
              </h1>

              <p className="max-w-xl text-white/85">
                Continua a desenvolver as tuas competências e acompanha o teu
                progresso em tempo real.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold">{progresso}%</div>
                <div className="text-xs text-white/80">Progresso</div>
              </div>

              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold">
                  {badges.filter((b) => b.status === "obtido").length}
                </div>
                <div className="text-xs text-white/80">Badges</div>
              </div>

              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold">
                  {user.points_total || pontosPorBadge}
                </div>
                <div className="text-xs text-white/80">Pontos</div>
              </div>
            </div>
          </div>
        </div>

        {/* KPI cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            {
              icon: "bi-graph-up-arrow",
              label: "Progresso Global",
              valor: `${progresso}%`,
            },
            {
              icon: "bi-star-fill",
              label: "Pontos Totais",
              valor: user.points_total || pontosPorBadge,
            },
            {
              icon: "bi-award-fill",
              label: "Badges Obtidos",
              valor: badges.filter((b) => b.status === "obtido").length,
            },
            {
              icon: "bi-flag",
              label: "LPs em progresso",
              valor: learningPaths.filter((lp) => lp.status === "em progresso")
                .length,
            },
            {
              icon: "bi-fire",
              label: "Badges a expirar",
              valor: alertsExpiracao.length,
            },
          ].map((card, idx) => (
            <div
              key={idx}
              className=" rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(15,98,254,0.12)]"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F62FE]/10">
                  <i className={`bi ${card.icon} text-xl text-[#0F62FE]`}></i>
                </div>
              </div>

              <h3 className="text-3xl font-bold text-slate-900">
                {card.valor}
              </h3>

              <p className="mt-1 text-sm font-medium text-slate-500">
                {card.label}
              </p>
            </div>
          ))}
        </div>

        {/* Learning Paths + Alertas expiração */}
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className={panelClass}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h5 className="m-0 text-base font-bold text-slate-900">
                  <i className="bi bi-diagram-3 mr-2 text-emerald-600"></i>
                  Progresso em Learning Paths
                </h5>
                <Link
                  to="/learning-paths"
                  className="text-xs text-slate-800 sm:text-sm"
                >
                  Ver todos
                </Link>
              </div>
              <ul className="m-0 list-none divide-y divide-slate-100 p-0">
                {learningPaths.map((lp) => (
                  <li key={lp.id} className="py-3">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          {lp.nome}
                        </div>
                        <div className="text-xs text-slate-500">
                          {lp.passosConcluidos}/{lp.passosTotal} passos
                        </div>
                      </div>
                      <span className="rounded-full bg-cyan-100 px-2 py-1 text-xs font-semibold text-cyan-700">
                        {lp.percentagem}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-200">
                      <div
                        className="h-1.5 rounded-full bg-[#16558C]"
                        style={{ width: `${lp.percentagem}%` }}
                      ></div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className={panelClass}>
              <h5 className="mb-3 text-base font-bold text-slate-900">
                <i className="bi bi-fire mr-2 text-rose-600"></i>Alertas de
                Expiração
              </h5>
              <ul className="m-0 list-none divide-y divide-slate-100 p-0">
                {alertsExpiracao.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {a.nome}
                      </div>
                      <div className="text-xs text-slate-500">
                        Expira em {a.expiraEmDias} dias
                      </div>
                    </div>
                    <button
                      className={secondaryActionClass}
                      onClick={() => alert("Lembrete enviado (mock)")}
                    >
                      Lembrar-me
                    </button>
                  </li>
                ))}
                {!alertsExpiracao.length && (
                  <li className="py-3 text-sm text-slate-500">
                    Sem expirações próximas.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Notificações + Conquistas */}
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className={panelClass}>
              <h5 className="mb-3 text-base font-bold text-slate-900">
                <i className="bi bi-stars mr-2 text-amber-500"></i>Conquistas
                Especiais
              </h5>
              <ul className="m-0 list-none divide-y divide-slate-100 p-0">
                {specials.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {s.nome}
                      </div>
                      <div className="text-xs text-slate-500">{s.desc}</div>
                    </div>
                    <span className="rounded-full bg-sky-700 px-2 py-1 text-xs font-semibold text-white">
                      {s.pontos} pts
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Partilha */}
        <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
          <h5 className="mb-3 text-base font-bold text-slate-900">
            <i className="bi bi-share mr-2 text-cyan-600"></i>Partilha e
            Assinatura
          </h5>
          <div className="flex flex-wrap gap-2">
            <button
              className={secondaryActionClassLarge}
              onClick={() => {
                const publicUrl = `${window.location.origin}/badges`;
                window.open(
                  `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicUrl)}`,
                  "_blank",
                  "noopener,noreferrer"
                );
              }}
            >
              Partilhar no LinkedIn
            </button>
            <button
              className={secondaryActionClassLarge}
              onClick={() => alert("Badge copiado para assinatura (mock)")}
            >
              Copiar badge para assinatura
            </button>
            <button
              className={secondaryActionClassLarge}
              onClick={() => alert("Template de email aplicado (mock)")}
            >
              Aplicar template de email
            </button>
            <button
              className={secondaryActionClassLarge}
              onClick={() => alert("Página pública aberta (mock)")}
            >
              Ver galeria pública
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
