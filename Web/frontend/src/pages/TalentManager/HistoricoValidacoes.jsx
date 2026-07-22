import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "/src/api";
import SectionCard from "/src/components/ui/SectionCard";
import EmptyState from "/src/components/ui/EmptyState";
import TalentManagerLayout, { TalentStatCard } from "./TalentManagerLayout";
import AdminPagination from "/src/components/ui/AdminPagination";
import SortableTh from "/src/components/ui/SortableTh";
import { useClientPagination } from "/src/hooks/useClientPagination";
import { useSortableData } from "/src/hooks/useSortableData";

export default function HistoricoValidacoes() {
  const { t } = useTranslation();

  const normalizeEstado = (estado) => {
    if (estado === "aprovado")
      return t("talentManager.historico.status.approved");
    if (estado === "rejeitado")
      return t("talentManager.historico.status.rejected");
    return t("talentManager.historico.status.pending");
  };

  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroTexto, setFiltroTexto] = useState("");
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/api/tm/historico", {
          params: { status: filtroEstado },
        });
        if (mounted) setHistorico(res.data || []);
      } catch (err) {
        console.error("Erro ao carregar historico TM:", err);
        if (mounted) setError(t("talentManager.historico.errors.loadFailed"));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [filtroEstado, t]);

  const resultados = useMemo(() => {
    return historico.filter((item) => {
      const texto =
        `${item.consultor} ${item.badge} ${item.requisito}`.toLowerCase();
      return texto.includes(filtroTexto.toLowerCase());
    });
  }, [historico, filtroTexto]);

  const {
    sortedItems: resultadosOrdenados,
    sortConfig,
    requestSort,
  } = useSortableData(resultados);
  const {
    page,
    setPage,
    totalPages,
    totalItems,
    startItem,
    endItem,
    paginatedItems: resultadosPaginados,
  } = useClientPagination(
    resultadosOrdenados,
    15,
    `${filtroEstado}|${filtroTexto}`,
  );

  const totals = {
    todos: historico.length,
    aprovado: historico.filter((i) => i.estado === "aprovado").length,
    rejeitado: historico.filter((i) => i.estado === "rejeitado").length,
    pendente: historico.filter((i) => i.estado === "pendente").length,
  };

  const badgeClass = (estado) => {
    if (estado === "aprovado") return "bg-emerald-100 text-emerald-700";
    if (estado === "rejeitado") return "bg-rose-100 text-rose-700";
    return "bg-amber-100 text-amber-700";
  };

  return (
    <TalentManagerLayout
      title={t("talentManager.historico.title")}
      subtitle={t("talentManager.historico.subtitle")}
      heroStats={[
        {
          label: t("talentManager.historico.stats.total"),
          value: totals.todos,
          icon: "bi-clock-history",
        },
        {
          label: t("talentManager.historico.stats.approved"),
          value: totals.aprovado,
          icon: "bi-check-circle",
        },
        {
          label: t("talentManager.historico.stats.rejected"),
          value: totals.rejeitado,
          icon: "bi-x-circle",
        },
      ]}
    >
      <SectionCard
        className="mb-4"
        title={t("talentManager.historico.filters.title")}
        icon="bi-funnel-fill"
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="md:col-span-4">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {t("talentManager.historico.filters.search")}
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none"
              placeholder={t(
                "talentManager.historico.filters.searchPlaceholder",
              )}
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
            />
          </div>
          <div className="md:col-span-3">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {t("talentManager.historico.filters.status")}
            </label>
            <select
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="todos">
                {t("talentManager.historico.filters.all")}
              </option>
              <option value="aprovado">
                {t("talentManager.historico.status.approved")}
              </option>
              <option value="rejeitado">
                {t("talentManager.historico.status.rejected")}
              </option>
              <option value="pendente">
                {t("talentManager.historico.status.pending")}
              </option>
            </select>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title={t("talentManager.historico.recordsSection.title")}
        icon="bi-list-check"
      >
        {loading ? (
          <EmptyState
            message={t("talentManager.historico.loading")}
            icon="bi-hourglass-split"
          />
        ) : error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="admin-table">
                <thead>
                  <tr>
                    <SortableTh
                      label={t("talentManager.historico.table.consultant")}
                      sortKey="consultor"
                      accessor={(i) => i.consultor || ""}
                      sortConfig={sortConfig}
                      onSort={requestSort}
                      className="text-left font-semibold"
                    />
                    <SortableTh
                      label={t("talentManager.historico.table.badge")}
                      sortKey="badge"
                      accessor={(i) => i.badge || ""}
                      sortConfig={sortConfig}
                      onSort={requestSort}
                      className="text-left font-semibold"
                    />
                    <SortableTh
                      label={t("talentManager.historico.table.requirement")}
                      sortKey="requisito"
                      accessor={(i) => i.requisito || ""}
                      sortConfig={sortConfig}
                      onSort={requestSort}
                      className="text-left font-semibold"
                    />
                    <SortableTh
                      label={t("talentManager.historico.table.status")}
                      sortKey="estado"
                      accessor={(i) => i.estado || ""}
                      sortConfig={sortConfig}
                      onSort={requestSort}
                      className="text-left font-semibold"
                    />
                    <SortableTh
                      label={t("talentManager.historico.table.date")}
                      sortKey="data"
                      accessor={(i) =>
                        i.data ? new Date(i.data).getTime() : 0
                      }
                      sortConfig={sortConfig}
                      onSort={requestSort}
                      className="text-left font-semibold"
                    />
                    <SortableTh
                      label={t("talentManager.historico.table.validator")}
                      sortKey="validador"
                      accessor={(i) => i.validador || ""}
                      sortConfig={sortConfig}
                      onSort={requestSort}
                      className="text-left font-semibold"
                    />
                    <th className="px-3 py-2 text-left font-semibold">
                      {t("talentManager.historico.table.notes")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {resultadosPaginados.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2 font-semibold text-slate-900">
                        {item.consultor}
                      </td>
                      <td className="px-3 py-2">{item.badge}</td>
                      <td className="px-3 py-2">{item.requisito}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${badgeClass(item.estado)}`}
                        >
                          {normalizeEstado(item.estado)}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        {item.data
                          ? new Date(item.data).toLocaleDateString("pt-PT")
                          : "-"}
                      </td>
                      <td className="px-3 py-2">{item.validador || "-"}</td>
                      <td className="px-3 py-2 text-xs text-slate-500 sm:text-sm">
                        {item.observacoes || "-"}
                      </td>
                    </tr>
                  ))}
                  {!resultados.length && (
                    <tr>
                      <td colSpan="7" className="px-3 py-4">
                        <EmptyState
                          message={t(
                            "talentManager.historico.recordsSection.empty",
                          )}
                          icon="bi-search"
                        />
                      </td>
                    </tr>
                  )}
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
          </>
        )}
      </SectionCard>
    </TalentManagerLayout>
  );
}
