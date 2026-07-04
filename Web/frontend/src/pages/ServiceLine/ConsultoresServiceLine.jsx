import { useEffect, useMemo, useState } from "react";
import api from "/src/api";
import EmptyState from "/src/components/ui/EmptyState";
import ServiceLineLayout, { ServiceLineStatCard, slActionClass } from "./ServiceLineLayout";
import SortableTh from "../../components/ui/SortableTh";
import { useSortableData } from "../../hooks/useSortableData";

export default function ConsultoresServiceLine() {
  const [consultores, setConsultores] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/api/sl/consultores");
        if (!mounted) return;
        const data = res.data || [];
        setConsultores(data);
        setSelected(data[0] || null);
      } catch (err) {
        console.error("Erro ao carregar consultores SL:", err);
        if (mounted) setError("Nao foi possivel carregar os consultores.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const filtrados = useMemo(
    () => consultores.filter((c) => `${c.name} ${c.email} ${c.area}`.toLowerCase().includes(search.toLowerCase())),
    [consultores, search],
  );

  const { sortedItems: ordenados, sortConfig, requestSort } = useSortableData(filtrados);

  const mediaPontos = consultores.length ? Math.round(consultores.reduce((acc, c) => acc + Number(c.points_total || 0), 0) / consultores.length) : 0;
  const mediaBadges = consultores.length ? Math.round(consultores.reduce((acc, c) => acc + Number(c.badges_obtidos || 0), 0) / consultores.length) : 0;

  const downloadCertificado = async (consultorId, badgeId) => {
    try {
      const response = await api.post(`/api/sl/badges/${badgeId}/certificado`, { consultorId }, { responseType: "blob" });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `certificado-badge-${badgeId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erro ao gerar certificado:", err);
      alert("Nao foi possivel gerar o certificado.");
    }
  };

  return (
    <ServiceLineLayout
      title="Consultores e Ranking"
      subtitle="Compara consultores da mesma Service Line por pontos, badges obtidos e progresso."
      heroStats={[
        { label: "Consultores", value: consultores.length },
        { label: "Média pontos", value: mediaPontos },
        { label: "Média badges", value: mediaBadges },
      ]}
    >
      {loading ? <EmptyState message="A carregar consultores..." icon="bi-hourglass-split" /> : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <ServiceLineStatCard icon="bi-people-fill" label="Total de Consultores" value={consultores.length} />
            <ServiceLineStatCard icon="bi-star-fill" label="Média de Pontos" value={mediaPontos} />
            <ServiceLineStatCard icon="bi-award-fill" label="Média de Badges" value={mediaBadges} />
            <ServiceLineStatCard icon="bi-trophy-fill" label="Top Ranking" value={consultores[0]?.name?.split(" ")[0] || "-"} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <section className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)] lg:col-span-8">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h5 className="m-0 text-base font-bold text-slate-900"><i className="bi bi-trophy mr-2 text-[#0F62FE]"></i>Ranking de Consultores</h5>
                <input className="ui-input max-w-xs" placeholder="Pesquisar consultor..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold">#</th>
                      <SortableTh label="Consultor" sortKey="name" accessor={(c) => c.name || ""} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                      <SortableTh label="Área" sortKey="area" accessor={(c) => c.area || ""} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                      <SortableTh label="Pontos" sortKey="points_total" accessor={(c) => Number(c.points_total || 0)} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                      <SortableTh label="Badges" sortKey="badges_obtidos" accessor={(c) => Number(c.badges_obtidos || 0)} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                      <SortableTh label="Progresso" sortKey="progresso" accessor={(c) => Number(c.progresso || 0)} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                      <th className="px-3 py-2 text-right font-semibold">Timeline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                    {ordenados.map((c) => (
                      <tr key={c.id}>
                        <td className="px-3 py-2 font-bold text-[#0F62FE]">{c.ranking}</td>
                        <td className="px-3 py-2"><div className="font-semibold text-slate-900">{c.name}</div><div className="text-xs text-slate-500">{c.email}</div></td>
                        <td className="px-3 py-2">{c.area || "-"}</td>
                        <td className="px-3 py-2">{c.points_total || 0}</td>
                        <td className="px-3 py-2">{c.badges_obtidos || 0}</td>
                        <td className="px-3 py-2">{c.progresso || 0}%</td>
                        <td className="px-3 py-2 text-right"><button className={slActionClass} onClick={() => setSelected(c)}>Ver</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)] lg:col-span-4">
              <h5 className="mb-3 text-base font-bold text-slate-900"><i className="bi bi-clock-history mr-2 text-[#0F62FE]"></i>Timeline</h5>
              <div className="mb-2 text-sm font-semibold text-slate-900">{selected?.name || "Seleciona um consultor"}</div>
              <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                {(selected?.timeline || []).map((item) => (
                  <li key={item.id} className="px-3 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{item.badge}</div>
                        <div className="text-xs text-slate-500">{item.status} · {item.data ? new Date(item.data).toLocaleDateString("pt-PT") : "-"}</div>
                      </div>
                      {item.status === "obtido" && <button className={slActionClass} onClick={() => downloadCertificado(selected.id, item.badge_id)}>PDF</button>}
                    </div>
                  </li>
                ))}
                {!selected?.timeline?.length && <li className="px-3 py-3 text-sm text-slate-500">Sem histórico para apresentar.</li>}
              </ul>
            </section>
          </div>
        </>
      )}
    </ServiceLineLayout>
  );
}
