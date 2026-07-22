import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "/src/api";
import EmptyState from "/src/components/ui/EmptyState";
import ServiceLineLayout, { slActionClass } from "./ServiceLineLayout";
import AdminPagination from "../../components/ui/AdminPagination";
import SortableTh from "../../components/ui/SortableTh";
import { useClientPagination } from "../../hooks/useClientPagination";
import { useSortableData } from "../../hooks/useSortableData";

export default function ConsultoresServiceLine() {
  const { t } = useTranslation();
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
        if (mounted) setError(t("serviceLine.consultores.errors.loadFailed"));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [t]);

  const filtrados = useMemo(
    () => consultores.filter((c) => `${c.name} ${c.email} ${c.area}`.toLowerCase().includes(search.toLowerCase())),
    [consultores, search],
  );

  const { sortedItems: ordenados, sortConfig, requestSort } = useSortableData(filtrados);
  const {
    page,
    setPage,
    totalPages,
    totalItems,
    startItem,
    endItem,
    paginatedItems: ordenadosPaginados,
  } = useClientPagination(ordenados, 15, search);

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
      alert(t("serviceLine.consultores.errors.certificateFailed"));
    }
  };

  return (
    <ServiceLineLayout
      title={t("serviceLine.consultores.title")}
      subtitle={t("serviceLine.consultores.subtitle")}
      heroStats={[
        { label: t("serviceLine.consultores.stats.consultants"), value: consultores.length, icon: "bi-people-fill" },
        { label: t("serviceLine.consultores.stats.avgPoints"), value: mediaPontos, icon: "bi-star-fill" },
        { label: t("serviceLine.consultores.stats.avgBadges"), value: mediaBadges, icon: "bi-award-fill" },
        { label: t("serviceLine.consultores.stats.topRanking"), value: consultores[0]?.name?.split(" ")[0] || "-", icon: "bi-trophy-fill" },
      ]}
    >
      {loading ? <EmptyState message={t("serviceLine.consultores.loading")} icon="bi-hourglass-split" /> : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-8">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h5 className="m-0 text-base font-semibold text-slate-900"><i className="bi bi-trophy mr-2 text-[#0F62FE]"></i>{t("serviceLine.consultores.rankingTitle")}</h5>
                <input className="ui-input max-w-xs" placeholder={t("serviceLine.consultores.searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold">#</th>
                      <SortableTh label={t("serviceLine.consultores.table.consultant")} sortKey="name" accessor={(c) => c.name || ""} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                      <SortableTh label={t("serviceLine.consultores.table.area")} sortKey="area" accessor={(c) => c.area || ""} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                      <SortableTh label={t("serviceLine.consultores.table.points")} sortKey="points_total" accessor={(c) => Number(c.points_total || 0)} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                      <SortableTh label={t("serviceLine.consultores.table.badges")} sortKey="badges_obtidos" accessor={(c) => Number(c.badges_obtidos || 0)} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                      <SortableTh label={t("serviceLine.consultores.table.progress")} sortKey="progresso" accessor={(c) => Number(c.progresso || 0)} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                      <th className="px-3 py-2 text-right font-semibold">{t("serviceLine.consultores.table.timeline")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordenadosPaginados.map((c) => (
                      <tr key={c.id}>
                        <td className="px-3 py-2 font-semibold text-[#0F62FE]">{c.ranking}</td>
                        <td className="px-3 py-2"><div className="font-semibold text-slate-900">{c.name}</div><div className="text-xs text-slate-500">{c.email}</div></td>
                        <td className="px-3 py-2">{c.area || "-"}</td>
                        <td className="px-3 py-2">{c.points_total || 0}</td>
                        <td className="px-3 py-2">{c.badges_obtidos || 0}</td>
                        <td className="px-3 py-2">{c.progresso || 0}%</td>
                        <td className="px-3 py-2 text-right"><button className={slActionClass} onClick={() => setSelected(c)}>{t("serviceLine.consultores.view")}</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <AdminPagination
                page={page}
                totalPages={totalPages}
                totalItems={totalItems}
                startItem={startItem}
                endItem={endItem}
                onPageChange={setPage}
              />
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-4">
              <h5 className="mb-3 text-base font-semibold text-slate-900"><i className="bi bi-clock-history mr-2 text-[#0F62FE]"></i>{t("serviceLine.consultores.timeline")}</h5>
              <div className="mb-2 text-sm font-semibold text-slate-900">{selected?.name || t("serviceLine.consultores.selectConsultant")}</div>
              <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                {(selected?.timeline || []).map((item) => (
                  <li key={item.id} className="px-3 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{item.badge}</div>
                        <div className="text-xs text-slate-500">{item.status} Ã‚Â· {item.data ? new Date(item.data).toLocaleDateString("pt-PT") : "-"}</div>
                      </div>
                      {item.status === "obtido" && <button className={slActionClass} onClick={() => downloadCertificado(selected.id, item.badge_id)}>PDF</button>}
                    </div>
                  </li>
                ))}
                {!selected?.timeline?.length && <li className="px-3 py-3 text-sm text-slate-500">{t("serviceLine.consultores.noHistory")}</li>}
              </ul>
            </section>
          </div>
        </>
      )}
    </ServiceLineLayout>
  );
}
