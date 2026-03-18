import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Sidebar from "../../layout/Sidebar";

const mockBadges = [
  { id: 1, name: "Excel Avançado", status: "obtido", area: "Data", pontos: 120, expiraEmDias: 45 },
  { id: 2, name: "Power BI", status: "pendente", area: "Data", pontos: 90, expiraEmDias: 20 },
  { id: 3, name: "Gestão de Projeto", status: "em progresso", area: "PMO", pontos: 100 },
];

const mockLPs = [
  { id: 1, nome: "Learning Path - Dados", passosConcluidos: 3, passosTotal: 6, percentagem: 50, status: "em progresso" },
  { id: 2, nome: "Cloud Foundations", passosConcluidos: 5, passosTotal: 5, percentagem: 100, status: "concluido" },
];

const mockRecomendados = [
  { id: 1, nome: "Badge SQL", motivo: "Completa o módulo de queries", pontos: 60 },
  { id: 2, nome: "Badge Agile", motivo: "Entrega sprint review", pontos: 40 },
];

const mockReminders = [
  { id: 1, titulo: "Submeter evidência", desc: "Envio até sexta para Badge Power BI", prazo: "Em 3 dias" },
  { id: 2, titulo: "Feedback do manager", desc: "Precisa aprovação para Badge Excel", prazo: "Pendente" },
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

  const handleDownloadCertificate = async (badgeId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Sem token. Faz login novamente.");
      const response = await axios.post(
        `http://localhost:4000/api/consultor/badges/${badgeId}/certificado`,
        {},
        { headers: { Authorization: `Bearer ${token}` }, responseType: "blob" }
      );
      const file = new Blob([response.data], { type: "application/pdf" });
      window.open(URL.createObjectURL(file), "_blank");
    } catch (err) {
      console.error("Erro ao gerar certificado:", err);
      alert("Não foi possível gerar o certificado.");
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!storedUser || !token) return;

    const loadData = async () => {
      try {
        const parsedUser = JSON.parse(storedUser);
        const userRes = await axios.get("http://localhost:4000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userRes.data);

        const [badgeRes, lpRes, recRes, expRes, progressRes] = await Promise.all([
          axios.get(`http://localhost:4000/api/consultor/${parsedUser.id}/badges`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: mockBadges })),
          axios.get(`http://localhost:4000/api/consultor/${parsedUser.id}/learning-paths`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: mockLPs })),
          axios.get(`http://localhost:4000/api/consultor/${parsedUser.id}/recomendados`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: mockRecomendados })),
          axios.get(`http://localhost:4000/api/consultor/${parsedUser.id}/badges-expirar`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: mockExpiracao })),
          axios.get(`http://localhost:4000/api/consultor/${parsedUser.id}/badges-progress`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })),
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
        const obtidos = (badgeRes.data || mockBadges).filter((b) => b.status === "obtido").length;
        setProgresso(total > 0 ? Math.round((obtidos / total) * 100) : 0);
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
      }
    };

    loadData();
  }, []);

  const pontosPorBadge = useMemo(() => badges.reduce((acc, b) => acc + (b.pontos || 0), 0), [badges]);

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

      <main className="admin-main">
        {/* Header de boas-vindas */}
        <div className="mb-4 rounded-2xl bg-[#2AA4BF] p-5 text-white shadow-sm">
        <h3 className="mb-1 text-xl font-bold sm:text-2xl">
          {greeting}, {user.name.split(" ")[0]}!
        </h3>
        <p className="m-0 text-sm text-white/80 sm:text-base">
          Continua a tua jornada e conquista novos badges.
        </p>
        </div>

        {/* KPI cards */}
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { icon: "bi-graph-up-arrow", cor: "text-primary", label: "Progresso Global", valor: `${progresso}%` },
          { icon: "bi-star-fill", cor: "text-warning", label: "Pontos Totais", valor: user.points_total || pontosPorBadge },
          { icon: "bi-award-fill", cor: "text-success", label: "Badges Obtidos", valor: badges.filter((b) => b.status === "obtido").length },
          { icon: "bi-flag", cor: "text-info", label: "LPs em progresso", valor: learningPaths.filter((lp) => lp.status === "em progresso").length },
          { icon: "bi-fire", cor: "text-danger", label: "Badges a expirar", valor: alertsExpiracao.length },
        ].map((card, idx) => (
          <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <i className={`bi ${card.icon} text-2xl ${card.cor}`}></i>
              <h6 className="m-0 text-sm text-slate-600">{card.label}</h6>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{card.valor}</h3>
          </div>
        ))}
        </div>

        {/* Badges + Recomendações */}
        <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h4 className="text-lg font-bold text-slate-900">Próximos Badges</h4>
            <Link to="/badges" className="text-sm font-semibold text-slate-800 no-underline">
              Ver catálogo <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {badges.map((b) => (
              <div key={b.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center gap-2">
                  <i className="bi bi-patch-check-fill text-xl" style={{ color: "#2AA4BF" }}></i>
                  <h6 className="m-0 text-sm font-semibold text-slate-900">{b.name}</h6>
                </div>
                <p className={`mb-2 text-sm font-semibold ${b.status === "obtido" ? "text-emerald-600" : b.status === "pendente" ? "text-amber-600" : "text-slate-500"}`}>
                  {b.status}
                </p>
                <div className="mb-2 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">{b.area || "Qualquer área"}</span>
                  <span className="rounded-full bg-sky-700 px-2 py-1 text-white">{b.pontos || 0} pts</span>
                  {b.expiraEmDias && <span className="rounded-full bg-rose-600 px-2 py-1 text-white">Expira em {b.expiraEmDias}d</span>}
                </div>
                {progressByBadge[b.id] && (
                  <div className="mt-2">
                    <div className="mb-1 text-xs text-slate-500">
                      Progresso requisitos: {progressByBadge[b.id].approved}/{progressByBadge[b.id].total}
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-200">
                      <div
                        className="h-1.5 rounded-full bg-[#2AA4BF]"
                        style={{
                          width: progressByBadge[b.id].total
                            ? `${Math.round((progressByBadge[b.id].approved / progressByBadge[b.id].total) * 100)}%`
                            : "0%",
                        }}
                      ></div>
                    </div>
                  </div>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="rounded-lg border border-sky-600 px-3 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-50" onClick={() => alert("Notificação enviada (mock)")}>
                    Ativar notificações
                  </button>
                  {b.status === "obtido" && (
                    <button className="rounded-lg border border-emerald-600 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50" onClick={() => handleDownloadCertificate(b.id)}>
                      Download Certificado
                    </button>
                  )}
                  <button className="rounded-lg border border-cyan-600 px-3 py-1 text-xs font-semibold text-cyan-700 hover:bg-cyan-50" onClick={() => alert("Partilhado no LinkedIn (mock)")}>
                    Partilhar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h5 className="mb-3 text-base font-bold text-slate-900">
              <i className="bi bi-lightbulb mr-2 text-amber-500"></i>Recomendações
            </h5>
            <ul className="m-0 list-none divide-y divide-slate-100 p-0">
              {recomendados.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{r.nome}</div>
                    <div className="text-xs text-slate-500">Próximo nível: {r.motivo}</div>
                  </div>
                  <span className="rounded-full bg-sky-700 px-2 py-1 text-xs font-semibold text-white">{r.pontos} pts</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        </div>

        {/* Learning Paths + Alertas expiração */}
        <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h5 className="m-0 text-base font-bold text-slate-900">
                <i className="bi bi-diagram-3 mr-2 text-emerald-600"></i>Progresso em Learning Paths
              </h5>
              <Link to="/learning-paths" className="text-xs text-slate-800 sm:text-sm">Ver todos</Link>
            </div>
            <ul className="m-0 list-none divide-y divide-slate-100 p-0">
              {learningPaths.map((lp) => (
                <li key={lp.id} className="py-3">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{lp.nome}</div>
                      <div className="text-xs text-slate-500">{lp.passosConcluidos}/{lp.passosTotal} passos</div>
                    </div>
                    <span className="rounded-full bg-cyan-100 px-2 py-1 text-xs font-semibold text-cyan-700">{lp.percentagem}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-200">
                    <div className="h-1.5 rounded-full bg-[#2AA4BF]" style={{ width: `${lp.percentagem}%` }}></div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h5 className="mb-3 text-base font-bold text-slate-900">
              <i className="bi bi-fire mr-2 text-rose-600"></i>Alertas de Expiração
            </h5>
            <ul className="m-0 list-none divide-y divide-slate-100 p-0">
              {alertsExpiracao.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{a.nome}</div>
                    <div className="text-xs text-slate-500">Expira em {a.expiraEmDias} dias</div>
                  </div>
                  <button className="rounded-lg border border-rose-600 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50" onClick={() => alert("Lembrete enviado (mock)")}>
                    Lembrar-me
                  </button>
                </li>
              ))}
              {!alertsExpiracao.length && <li className="py-3 text-sm text-slate-500">Sem expirações próximas.</li>}
            </ul>
          </div>
        </div>
        </div>

        {/* Notificações + Conquistas */}
        <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h5 className="mb-3 text-base font-bold text-slate-900">
              <i className="bi bi-bell-fill mr-2 text-sky-600"></i>Notificações e Lembretes
            </h5>
            <ul className="m-0 list-none divide-y divide-slate-100 p-0">
              {reminders.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{r.titulo}</div>
                    <div className="text-xs text-slate-500">{r.desc}</div>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">{r.prazo}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h5 className="mb-3 text-base font-bold text-slate-900">
              <i className="bi bi-stars mr-2 text-amber-500"></i>Conquistas Especiais
            </h5>
            <ul className="m-0 list-none divide-y divide-slate-100 p-0">
              {specials.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{s.nome}</div>
                    <div className="text-xs text-slate-500">{s.desc}</div>
                  </div>
                  <span className="rounded-full bg-sky-700 px-2 py-1 text-xs font-semibold text-white">{s.pontos} pts</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        </div>

        {/* Partilha */}
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h5 className="mb-3 text-base font-bold text-slate-900">
          <i className="bi bi-share mr-2 text-cyan-600"></i>Partilha e Assinatura
        </h5>
        <div className="flex flex-wrap gap-2">
          <button className="rounded-lg border border-cyan-600 px-3 py-2 text-xs font-semibold text-cyan-700 hover:bg-cyan-50 sm:text-sm" onClick={() => alert("Partilhado no LinkedIn (mock)")}>Partilhar no LinkedIn</button>
          <button className="rounded-lg border border-sky-600 px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-50 sm:text-sm" onClick={() => alert("Badge copiado para assinatura (mock)")}>Copiar badge para assinatura</button>
          <button className="rounded-lg border border-slate-500 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 sm:text-sm" onClick={() => alert("Template de email aplicado (mock)")}>Aplicar template de email</button>
          <button className="rounded-lg border border-emerald-600 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 sm:text-sm" onClick={() => alert("Página pública aberta (mock)")}>Ver galeria pública</button>
        </div>
        </div>
      </main>
    </div>
  );
}