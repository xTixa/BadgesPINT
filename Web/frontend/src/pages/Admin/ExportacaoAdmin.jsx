import Sidebar from "../../layout/Sidebar";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import api from "/src/api";
import { useSidebar } from "../../context/SidebarContext";

export default function ExportacaoAdmin() {
  const { t } = useTranslation();
  const { collapsed } = useSidebar();
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
      console.error("Erro na exportação:", err);
      setError(
        err.response?.data?.message ||
          t("admin.exportacao.errors.exportFailed"),
      );
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

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar user={{ role: "admin", name: "Admin" }} />

      <main
        className={`w-full px-4 pb-6 pt-4 transition-all sm:px-5 md:px-6 lg:pt-6 ${
          collapsed ? "lg:ml-[80px]" : "lg:ml-[250px]"
        }`}
      >
        {/* HERO */}
        <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F62FE] to-[#00AEEF] p-8 text-white shadow-[0_12px_40px_rgba(15,98,254,0.20)]">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10"></div>

          <div className="relative z-10">
            <h1 className="text-3xl font-bold">{t("admin.exportacao.title")}</h1>

            <p className="mt-2 text-white/80">
              {t("admin.exportacao.subtitle")}
            </p>
          </div>
        </div>

        {/* STATS */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl bg-white p-5 text-center shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
            <i className="bi bi-people-fill text-2xl text-[#0F62FE]"></i>
            <h3 className="mt-2 text-3xl font-bold text-slate-900">248</h3>
            <p className="text-sm text-slate-500">{t("admin.exportacao.stats.users")}</p>
          </div>

          <div className="rounded-3xl bg-white p-5 text-center shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
            <i className="bi bi-award-fill text-2xl text-amber-500"></i>
            <h3 className="mt-2 text-3xl font-bold text-slate-900">87</h3>
            <p className="text-sm text-slate-500">{t("admin.exportacao.stats.badges")}</p>
          </div>

          <div className="rounded-3xl bg-white p-5 text-center shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
            <i className="bi bi-hourglass-split text-2xl text-emerald-600"></i>
            <h3 className="mt-2 text-3xl font-bold text-slate-900">14</h3>
            <p className="text-sm text-slate-500">{t("admin.exportacao.stats.requests")}</p>
          </div>

          <div className="rounded-3xl bg-white p-5 text-center shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
            <i className="bi bi-file-earmark-arrow-down text-2xl text-purple-600"></i>
            <h3 className="mt-2 text-3xl font-bold text-slate-900">36</h3>
            <p className="text-sm text-slate-500">{t("admin.exportacao.stats.exports")}</p>
          </div>
        </div>

        {/* FORMATO */}
        <section className="mb-6 rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
          <h2 className="mb-4 text-xl font-bold text-slate-900">
            {t("admin.exportacao.formatHeading")}
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setFormat("excel")}
              className={`rounded-2xl border p-5 text-left transition ${
                format === "excel"
                  ? "border-[#0F62FE] bg-[#0F62FE]/5 ring-2 ring-[#0F62FE]"
                  : "border-slate-200 hover:border-[#0F62FE]/40"
              }`}
            >
              <i className="bi bi-file-earmark-excel text-2xl text-emerald-600"></i>

              <h3 className="mt-3 font-semibold text-slate-900">
                Excel (.xlsx)
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {t("admin.exportacao.excelDesc")}
              </p>
            </button>

            <button
              type="button"
              onClick={() => setFormat("pdf")}
              className={`rounded-2xl border p-5 text-left transition ${
                format === "pdf"
                  ? "border-[#0F62FE] bg-[#0F62FE]/5 ring-2 ring-[#0F62FE]"
                  : "border-slate-200 hover:border-[#0F62FE]/40"
              }`}
            >
              <i className="bi bi-file-earmark-pdf text-2xl text-rose-600"></i>

              <h3 className="mt-3 font-semibold text-slate-900">PDF (.pdf)</h3>

              <p className="mt-1 text-sm text-slate-500">
                {t("admin.exportacao.pdfDesc")}
              </p>
            </button>
          </div>
        </section>

        {/* ÂMBITO */}
        <section className="mb-6">
          <h2 className="mb-4 text-xl font-bold text-slate-900">
            {t("admin.exportacao.dataToExport")}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
              <button
                key={card.value}
                type="button"
                onClick={() => setScope(card.value)}
                className={`rounded-3xl bg-white p-5 text-left transition ${
                  scope === card.value
                    ? "ring-2 ring-[#0F62FE] shadow-lg"
                    : "shadow-[0_8px_30px_rgba(15,98,254,0.08)] hover:shadow-lg"
                }`}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F62FE]/10">
                  <i className={`bi ${card.icon} text-xl text-[#0F62FE]`}></i>
                </div>

                <h3 className="font-semibold text-slate-900">{card.title}</h3>

                <p className="mt-1 text-sm text-slate-500">{card.desc}</p>
              </button>
            ))}
          </div>
        </section>

        {/* PERÍODO */}
        <section className="mb-6 rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
          <h2 className="mb-4 text-xl font-bold text-slate-900">{t("admin.exportacao.periodHeading")}</h2>

          <select
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-[#0F62FE] focus:outline-none focus:ring-4 focus:ring-[#0F62FE]/10"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="ultima-semana">{t("admin.exportacao.periods.lastWeek")}</option>
            <option value="ultimo-mes">{t("admin.exportacao.periods.lastMonth")}</option>
            <option value="ultimo-trimestre">{t("admin.exportacao.periods.lastQuarter")}</option>
            <option value="ano-atual">{t("admin.exportacao.periods.currentYear")}</option>
          </select>

          {error && (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
              {error}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleExport}
              disabled={loading}
              className="rounded-2xl bg-gradient-to-r from-[#0F62FE] to-[#00AEEF] px-8 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.02] disabled:opacity-50"
            >
              {loading ? t("admin.exportacao.generating") : t("admin.exportacao.exportButton")}
            </button>
          </div>
        </section>

        {lastExport && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
            <i className="bi bi-check-circle-fill mr-2"></i>
            {t("admin.exportacao.exportSuccess")}
          </div>
        )}
      </main>
    </div>
  );
}
