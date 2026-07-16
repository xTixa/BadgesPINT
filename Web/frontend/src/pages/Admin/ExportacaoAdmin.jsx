import Sidebar from "../../layout/Sidebar";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import api from "/src/api";
import AdminPageTitle from "../../components/ui/AdminPageTitle";

export default function ExportacaoAdmin() {
  const { t } = useTranslation();
  const [format, setFormat] = useState("excel");
  const [scope, setScope] = useState("todos");
  const [loading, setLoading] = useState(false);
  const [lastExport, setLastExport] = useState(null);
  const [dateRange, setDateRange] = useState("ultimo-mes");
  const [error, setError] = useState(null);

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

  const handleExport = async () => {
    if (!scope) {
      setError(t("admin.exportacao.errors.selectScope"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const { start, end } = getDateRange();

      const endpoint =
        format === "excel"
          ? "/api/admin/export/excel"
          : "/api/admin/export/pdf";

      const response = await api.post(
        endpoint,
        {
          scope,
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        },
      );

      // Criar download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `export-${scope}-${new Date().getTime()}.${format === "excel" ? "xlsx" : "pdf"}`,
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      setLastExport({
        formato: format,
        abrangencia: scope,
        data: new Date().toLocaleString("pt-PT"),
        ficheiro: `export-${scope}-${new Date().getTime()}.${format === "excel" ? "xlsx" : "pdf"}`,
      });
    } catch (err) {
      console.error("Erro na exportaÃ¯Â¿Â½Ã¯Â¿Â½o:", err);
      let message = t("admin.exportacao.errors.exportFailed");
      const errData = err.response?.data;
      if (errData instanceof Blob) {
        try {
          const parsed = JSON.parse(await errData.text());
          message = parsed.message || message;
        } catch {
          // resposta nÃ¯Â¿Â½o Ã¯Â¿Â½ JSON, mantÃ¯Â¿Â½m a mensagem genÃ¯Â¿Â½rica
        }
      } else if (errData?.message) {
        message = errData.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: t("admin.exportacao.cards.all.title"),
      desc: t("admin.exportacao.cards.all.desc"),
      icon: "bi-database-fill",
      value: "todos",
    },
    {
      title: t("admin.exportacao.cards.users.title"),
      desc: t("admin.exportacao.cards.users.desc"),
      icon: "bi-people-fill",
      value: "users",
    },
    {
      title: t("admin.exportacao.cards.badges.title"),
      desc: t("admin.exportacao.cards.badges.desc"),
      icon: "bi-award-fill",
      value: "badges",
    },
    {
      title: t("admin.exportacao.cards.requests.title"),
      desc: t("admin.exportacao.cards.requests.desc"),
      icon: "bi-hourglass-split",
      value: "pedidos",
    },
  ];

  const selectedScope = cards.find((card) => card.value === scope);

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "admin", name: "Admin" }} />

      <main className="admin-main bg-[#F6F8FA]">
        <div className="w-full">
          <AdminPageTitle title={t("admin.exportacao.title")} subtitle={t("admin.exportacao.subtitle")} />

          <div className="grid gap-5 lg:grid-cols-12">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-7">
              <div className="mb-5 flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0F62FE]/10 text-xl text-[#0F62FE]">
                  <i className="bi bi-database-check"></i>
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{t("admin.exportacao.dataToExport")}</h2>
                  <p className="mt-1 text-sm text-slate-500">Seleciona o conjunto de dados que pretendes descarregar.</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {cards.map((card) => {
                  const selected = scope === card.value;
                  return (
                    <button
                      key={card.value}
                      type="button"
                      onClick={() => setScope(card.value)}
                      aria-pressed={selected}
                      className={`group flex min-h-28 items-start gap-4 rounded-2xl border p-4 text-left transition ${
                        selected
                          ? "border-[#CFE0FB] bg-[#EAF2FF]"
                          : "border-slate-200 bg-white hover:-translate-y-0.5 hover:bg-[#F8FBFF]"
                      }`}
                    >
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${selected ? "bg-white text-[#0F62FE]" : "bg-slate-100 text-slate-500 group-hover:text-[#0F62FE]"}`}>
                        <i className={`bi ${card.icon}`}></i>
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 font-semibold text-slate-900">
                          {card.title}
                          {selected && <i className="bi bi-check-circle-fill text-[#0F62FE]"></i>}
                        </span>
                        <span className="mt-1 block text-sm leading-5 text-slate-500">{card.desc}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-5">
              <div className="mb-5 flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-xl text-emerald-600">
                  <i className="bi bi-file-earmark-arrow-down"></i>
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Configurar exportaÃƒÂ§ÃƒÂ£o</h2>
                  <p className="mt-1 text-sm text-slate-500">Escolhe o formato e o periodo do relatorio.</p>
                </div>
              </div>

              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">{t("admin.exportacao.formatHeading")}</label>
              <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5">
                {[
                  { value: "excel", label: "Excel", icon: "bi-file-earmark-excel", tone: "text-emerald-600" },
                  { value: "pdf", label: "PDF", icon: "bi-file-earmark-pdf", tone: "text-rose-600" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormat(option.value)}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${format === option.value ? "border-slate-200 bg-white text-slate-900" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                  >
                    <i className={`bi ${option.icon} ${option.tone}`}></i>{option.label}
                  </button>
                ))}
              </div>

              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">{t("admin.exportacao.periodHeading")}</label>
              <select className="ui-input mb-5" value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                <option value="ultima-semana">{t("admin.exportacao.periods.lastWeek")}</option>
                <option value="ultimo-mes">{t("admin.exportacao.periods.lastMonth")}</option>
                <option value="ultimo-trimestre">{t("admin.exportacao.periods.lastQuarter")}</option>
                <option value="ano-atual">{t("admin.exportacao.periods.currentYear")}</option>
              </select>

              <div className="mb-5 rounded-2xl border border-slate-200 bg-[#F8FBFF] p-4 text-sm">
                <div className="flex justify-between gap-4 py-1"><span className="text-slate-500">Dados</span><strong className="text-right text-slate-800">{selectedScope?.title}</strong></div>
                <div className="flex justify-between gap-4 py-1"><span className="text-slate-500">Formato</span><strong className="uppercase text-slate-800">{format}</strong></div>
              </div>

              {error && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</div>}

              <button onClick={handleExport} disabled={loading} className="ui-btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-60">
                <i className={`bi ${loading ? "bi-arrow-repeat animate-spin" : "bi-download"}`}></i>
                {loading ? t("admin.exportacao.generating") : t("admin.exportacao.exportButton")}
              </button>
            </section>
          </div>

          {lastExport && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-800">
              <div className="flex items-center gap-3">
                <i className="bi bi-check-circle-fill text-xl"></i>
                <div><strong className="block">{t("admin.exportacao.exportSuccess")}</strong><span className="text-sm text-emerald-700">{lastExport.ficheiro}</span></div>
              </div>
              <span className="text-sm font-medium text-emerald-700">{lastExport.data}</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
