import Sidebar from "../../layout/Sidebar";
import { useState } from "react";
import api from "/src/api";
import { useSidebar } from "../../context/SidebarContext";

export default function ExportacaoAdmin() {
  const { collapsed } = useSidebar();
  const [format, setFormat] = useState("excel");
  const [scope, setScope] = useState("todos");
  const [loading, setLoading] = useState(false);
  const [lastExport, setLastExport] = useState(null);
  const [dateRange, setDateRange] = useState("ultimo-mes");
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);

  const getDateRange = () => {
    const end = new Date();
    let start = new Date();

    switch (dateRange) {
      case "ultima-semana":
        start.setDate(start.getDate() - 7);
        break;
      case "ultimo-mes":
        start.setMonth(start.getMonth() - 1);
        break;
      case "ultimo-trimestre":
        start.setMonth(start.getMonth() - 3);
        break;
      case "ano-atual":
        start = new Date(new Date().getFullYear(), 0, 1);
        break;
      default:
        start.setMonth(start.getMonth() - 1);
    }

    return { start, end };
  };

  const getScopeLabel = (value) => {
    switch (value) {
      case "todos":
        return "Todos os dados";
      case "users":
        return "Utilizadores";
      case "badges":
        return "Badges";
      case "pedidos":
        return "Pedidos";
      default:
        return "—";
    }
  };

  const getRangeLabel = (value) => {
    switch (value) {
      case "ultima-semana":
        return "Última semana";
      case "ultimo-mes":
        return "Último mês";
      case "ultimo-trimestre":
        return "Último trimestre";
      case "ano-atual":
        return "Ano atual";
      default:
        return "—";
    }
  };

  const handleExport = async () => {
    if (!scope) {
      setError("Por favor, selecione um Âmbito de exportação.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const { start, end } = getDateRange();

      const endpoint = format === "excel" 
        ? "/api/admin/export/excel"
        : "/api/admin/export/pdf";

      const response = await api.post(
        endpoint,
        {
          scope,
          startDate: start.toISOString(),
          endDate: end.toISOString()
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob"
        }
      );

      // Criar download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `export-${scope}-${new Date().getTime()}.${format === "excel" ? "xlsx" : "pdf"}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      setLastExport({
        formato: format,
        abrangencia: scope,
        data: new Date().toLocaleString("pt-PT"),
        ficheiro: `export-${scope}-${new Date().getTime()}.${format === "excel" ? "xlsx" : "pdf"}`
      });

    } catch (err) {
      console.error("Erro na exportação:", err);
      setError(err.response?.data?.message || "Erro ao exportar dados. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { title: "Tudo", desc: "Todos os dados disponíveis", icon: "bi-database-fill", value: "todos" },
    { title: "Utilizadores", desc: "Dados completos e perfis", icon: "bi-people-fill", value: "users" },
    { title: "Badges", desc: "Catálogo e requisitos", icon: "bi-award-fill", value: "badges" },
    { title: "Pedidos", desc: "Fluxos de aprovação", icon: "bi-hourglass-split", value: "pedidos" },
  ];

  const { start: previewStart, end: previewEnd } = getDateRange();
  const previewFile = `export-${scope}-${new Date().getTime()}.${format === "excel" ? "xlsx" : "pdf"}`;

  const fetchPreview = async () => {
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const token = localStorage.getItem("token");
      const { start, end } = getDateRange();

      const response = await api.post(
        "/api/admin/export/preview",
        {
          scope,
          startDate: start.toISOString(),
          endDate: end.toISOString()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPreview(response.data);
    } catch (err) {
      console.error("Erro na pré-visualização:", err);
      setPreviewError("Não foi possível obter a pré-visualização.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const renderTable = (columns, rows) => (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-100 text-slate-700">
          <tr>
            {columns.map((c, idx) => (
              <th key={idx} className="px-3 py-2 text-left font-semibold">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
          {rows.map((r, idx) => (
            <tr key={idx}>
              {r.map((cell, i) => (
                <td key={i} className="px-3 py-2">{cell}</td>
              ))}
            </tr>
          ))}
          {!rows.length && (
            <tr>
              <td colSpan={columns.length} className="px-3 py-4 text-slate-500">
                Sem dados para este período.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar user={{ role: "admin", name: "Admin" }} />

      <main
        className={`w-full px-4 pb-6 pt-4 transition-all sm:px-5 md:px-6 lg:pt-6 ${collapsed ? "lg:ml-[80px]" : "lg:ml-[250px]"}`}
      >
        <div className="mb-5">
          <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900 sm:text-2xl">
            <i className="bi bi-file-earmark-arrow-down text-emerald-600" />
            Exportação de Dados
          </h3>
          <p className="mt-1 text-sm text-slate-500">Gerar relatórios para Excel ou PDF com um clique.</p>
        </div>

        <section className="mb-4 rounded-2xl bg-white p-4 shadow-sm sm:p-5">
          <h6 className="mb-1 text-sm font-semibold text-slate-900 sm:text-base">Passo 1 · Escolhe o formato</h6>
          <p className="mb-3 text-xs text-slate-500 sm:text-sm">Excel para análise, PDF para relatório pronto a partilhar.</p>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:max-w-md">
            <button
              type="button"
              onClick={() => setFormat("excel")}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                format === "excel"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                  : "border-slate-300 bg-white text-slate-700 hover:border-emerald-400"
              }`}
            >
              Excel
            </button>
            <button
              type="button"
              onClick={() => setFormat("pdf")}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                format === "pdf"
                  ? "border-rose-600 bg-rose-50 text-rose-700"
                  : "border-slate-300 bg-white text-slate-700 hover:border-rose-400"
              }`}
            >
              PDF
            </button>
          </div>
        </section>

        <section className="mb-4">
          <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h6 className="text-sm font-semibold text-slate-900 sm:text-base">Passo 2 · O que queres exportar?</h6>
            <span className="text-xs text-slate-500 sm:text-sm">Âmbito atual: {getScopeLabel(scope)}</span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
              <button
                key={card.value}
                type="button"
                className={`rounded-2xl bg-white p-4 text-left shadow-sm transition hover:shadow-md ${
                  scope === card.value ? "ring-2 ring-emerald-500" : "ring-1 ring-slate-200"
                }`}
                onClick={() => setScope(card.value)}
              >
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <i className={`bi ${card.icon}`}></i>
                  </div>
                  <h6 className="m-0 text-sm font-semibold text-slate-900">{card.title}</h6>
                </div>
                <p className="m-0 text-xs text-slate-500 sm:text-sm">{card.desc}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="mb-4 rounded-2xl bg-white p-4 shadow-sm sm:p-5">
          <h6 className="mb-3 text-sm font-semibold text-slate-900 sm:text-base">Passo 3 · Intervalo temporal</h6>

          <div className="mb-3 rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm text-slate-700">
            <div className="mb-1 flex items-center gap-2 font-semibold text-sky-900">
              <i className="bi bi-info-circle"></i>
              Resumo
            </div>
            <div className="text-xs sm:text-sm">
              Formato: <strong>{format.toUpperCase()}</strong> · Âmbito: <strong>{getScopeLabel(scope)}</strong> · Período: <strong>{getRangeLabel(dateRange)}</strong>
            </div>
            <div className="mt-1 text-xs text-slate-500 sm:text-sm">
              Datas: {previewStart.toLocaleDateString("pt-PT")} → {previewEnd.toLocaleDateString("pt-PT")}
            </div>
            <div className="text-xs text-slate-500 sm:text-sm">Ficheiro: {previewFile}</div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Intervalo temporal</label>
              <select
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none ring-emerald-500 focus:ring-2"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="ultima-semana">Última semana</option>
                <option value="ultimo-mes">Último mês</option>
                <option value="ultimo-trimestre">Último trimestre</option>
                <option value="ano-atual">Ano atual</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              <i className="bi bi-exclamation-triangle mr-2"></i>
              {error}
            </div>
          )}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
            <button
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              onClick={() => {
                setLastExport(null);
                setError(null);
              }}
            >
              Limpar histórico
            </button>

            <button
              className="rounded-xl border border-sky-300 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={fetchPreview}
              disabled={previewLoading}
            >
              {previewLoading ? "A carregar..." : "Ver pré-visualização"}
            </button>

            <button
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
              onClick={handleExport}
            >
              {loading ? "A gerar..." : "Exportar"}
            </button>
          </div>
        </section>

        {lastExport && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            <i className="bi bi-check-circle-fill mr-2"></i>
            Exportação pronta ({lastExport.formato.toUpperCase()}) | Âmbito: {lastExport.abrangencia} | Ficheiro: {lastExport.ficheiro} | {lastExport.data}
          </div>
        )}

        {previewError && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            <i className="bi bi-exclamation-triangle mr-2"></i>
            {previewError}
          </div>
        )}

        {preview && (
          <section className="mb-4 rounded-2xl bg-white p-4 shadow-sm sm:p-5">
            <h6 className="mb-3 text-sm font-semibold text-slate-900 sm:text-base">Pré-visualização (amostra)</h6>

            {preview.sections ? (
              <div className="space-y-4">
                {preview.sections.map((section, idx) => (
                  <div key={idx}>
                    <div className="mb-2 text-sm font-semibold text-slate-800">{section.title}</div>
                    {renderTable(section.columns, section.rows)}
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="mb-2 text-sm font-semibold text-slate-800">{preview.title || getScopeLabel(scope)}</div>
                {renderTable(preview.columns || [], preview.rows || [])}
              </>
            )}
          </section>
        )}
      </main>
    </div>
  );
}


