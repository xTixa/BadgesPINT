import Sidebar from "../../layout/Sidebar";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

export default function ValidarEvidencias() {
  const [filtro, setFiltro] = useState("pendente");
  const [notificacoesAtivas, setNotificacoesAtivas] = useState({ email: true, push: true });
  const [evidencias, setEvidencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const filtradas = useMemo(
    () => evidencias.filter((e) => (filtro === "todas" ? true : e.status === filtro)),
    [evidencias, filtro]
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get("http://localhost:4000/api/tm/evidencias", {
          headers: { Authorization: `Bearer ${token}` },
          params: { status: filtro }
        });
        setEvidencias(res.data || []);
      } catch (err) {
        console.error("Erro ao carregar evidÃªncias:", err);
        setError("NÃ£o foi possÃ­vel carregar evidÃªncias.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [filtro]);

  const aprovar = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:4000/api/tm/evidencias/${id}/aprovar`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvidencias((prev) => prev.map((e) => (e.id === id ? { ...e, status: "aprovado" } : e)));
    } catch (err) {
      console.error("Erro ao aprovar evidÃªncia:", err);
      alert("Erro ao aprovar evidÃªncia.");
    }
  };

  const rejeitar = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:4000/api/tm/evidencias/${id}/rejeitar`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvidencias((prev) => prev.map((e) => (e.id === id ? { ...e, status: "rejeitado" } : e)));
    } catch (err) {
      console.error("Erro ao rejeitar evidÃªncia:", err);
      alert("Erro ao rejeitar evidÃªncia.");
    }
  };

  const statusBadgeClass = (status) => {
    if (status === "aprovado") return "bg-emerald-100 text-emerald-700";
    if (status === "rejeitado") return "bg-rose-100 text-rose-700";
    return "bg-amber-100 text-amber-700";
  };

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "talentManager", name: "Talent Manager" }} />

      <main className="admin-main">
        <div className="mb-4 rounded-2xl bg-[#013440] p-4 text-white shadow-sm">
          <h3 className="mb-1 text-xl font-bold sm:text-2xl">Validar EvidÃªncias</h3>
          <p className="m-0 text-sm text-white/80 sm:text-base">Aprova/Rejeita evidÃªncias, envia notificaÃ§Ãµes e acompanha status em tempo real.</p>
        </div>

        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
              {[
                { id: "todas", label: "Todas", color: "secondary" },
                { id: "pendente", label: "Pendentes", color: "warning" },
                { id: "aprovado", label: "Aprovadas", color: "success" },
                { id: "rejeitado", label: "Rejeitadas", color: "danger" },
              ].map((b) => (
                <button
                  key={b.id}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition sm:text-sm ${
                    filtro === b.id
                      ? b.color === "warning"
                        ? "bg-amber-500 text-white"
                        : b.color === "success"
                          ? "bg-emerald-600 text-white"
                          : b.color === "danger"
                            ? "bg-rose-600 text-white"
                            : "bg-slate-600 text-white"
                      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                  onClick={() => setFiltro(b.id)}
                >
                  {b.label}
                </button>
              ))}
          </div>

          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input className="h-4 w-4 rounded border-slate-300 text-sky-700 focus:ring-sky-400" type="checkbox" checked={notificacoesAtivas.email} onChange={(e) => setNotificacoesAtivas({ ...notificacoesAtivas, email: e.target.checked })} />
              Email
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input className="h-4 w-4 rounded border-slate-300 text-sky-700 focus:ring-sky-400" type="checkbox" checked={notificacoesAtivas.push} onChange={(e) => setNotificacoesAtivas({ ...notificacoesAtivas, push: e.target.checked })} />
              Push/Teams
            </label>
            </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h5 className="mb-3 text-base font-bold text-slate-900">
            <i className="bi bi-folder-check mr-2 text-sky-600"></i>
              EvidÃªncias
            </h5>

          {loading ? (
            <div className="py-6 text-center"><div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-sky-700 border-r-transparent"></div></div>
          ) : error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
          ) : filtradas.length === 0 ? (
            <p className="text-sm text-slate-500">NÃ£o existem evidÃªncias neste estado.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Consultor</th>
                    <th className="px-3 py-2 text-left font-semibold">Badge</th>
                    <th className="px-3 py-2 text-left font-semibold">Requisito</th>
                    <th className="px-3 py-2 text-left font-semibold">Data</th>
                    <th className="px-3 py-2 text-left font-semibold">Ficheiro</th>
                    <th className="px-3 py-2 text-left font-semibold">Estado</th>
                    <th className="px-3 py-2 text-left font-semibold">HistÃ³rico</th>
                    <th className="px-3 py-2 text-right font-semibold">AÃ§Ãµes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                  {filtradas.map((e) => (
                    <tr key={e.id}>
                      <td className="px-3 py-2">{e.consultor?.name}</td>
                      <td className="px-3 py-2">{e.badge?.name || e.badge?.description}</td>
                      <td className="px-3 py-2">{e.requirement?.title || e.requirement?.code}</td>
                      <td className="px-3 py-2">{new Date(e.created_at).toLocaleDateString("pt-PT")}</td>
                      <td className="px-3 py-2"><a href={e.evidence_url} target="_blank" rel="noreferrer" className="font-semibold text-sky-700 underline">ver</a></td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusBadgeClass(e.status)}`}>
                          {e.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-500 sm:text-sm">â€”</td>
                      <td className="px-3 py-2 text-right">
                        <button className="mr-2 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700" onClick={() => aprovar(e.id)}>
                          <i className="bi bi-check-circle mr-1"></i>Aprovar
                        </button>
                        <button className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-700" onClick={() => rejeitar(e.id)}>
                          <i className="bi bi-x-circle mr-1"></i>Rejeitar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}



