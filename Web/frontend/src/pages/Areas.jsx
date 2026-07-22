import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../api";

const areaIcons = [
  "bi-hdd-network",
  "bi-terminal",
  "bi-bar-chart-line",
  "bi-gear",
  "bi-file-earmark-search",
  "bi-mortarboard",
];

export default function Areas() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [serviceLineName, setServiceLineName] = useState("");

  useEffect(() => {
    let active = true;

    const loadAreas = async () => {
      try {
        setLoading(true);
        setError("");

        if (!id) {
          const response = await api.get("/api/areas");
          if (!active) return;
          setAreas(Array.isArray(response.data) ? response.data : []);
          setServiceLineName("");
          return;
        }

        const response = await api.get(`/service-lines/${id}/areas`);
        if (!active) return;
        setAreas(Array.isArray(response.data) ? response.data : []);

        try {
          const pathsResponse = await api.get("/learning-paths");
          const paths = Array.isArray(pathsResponse.data) ? pathsResponse.data : [];
          const firstPath = paths[0];
          if (!firstPath) return;

          const serviceLinesResponse = await api.get(`/learning-paths/${firstPath.id}/service-lines`);
          const serviceLines = Array.isArray(serviceLinesResponse.data)
            ? serviceLinesResponse.data
            : [];
          const serviceLine = serviceLines.find((item) => Number(item.id) === Number(id));
          if (active && serviceLine) setServiceLineName(serviceLine.name);
        } catch (lookupError) {
          console.error(lookupError);
        }
      } catch (err) {
        console.error(err);
        if (!active) return;
        setAreas([]);
        setError(t("areas.errorLoading"));
      } finally {
        if (active) setLoading(false);
      }
    };

    loadAreas();

    return () => {
      active = false;
    };
  }, [id, t]);

  const stats = useMemo(
    () => [
      [t("areas.stats.areas"), areas.length],
      [t("areas.stats.levels"), "5"],
      [t("areas.stats.step"), id ? "3/4" : t("areas.stats.catalog")],
    ],
    [areas.length, id, t],
  );

  return (
    <div className="-mx-4 -my-8 min-h-screen bg-[#F6FAFF] px-4 py-8">
      <section className="px-0 pb-4">
        <div className="mx-auto w-full max-w-[1600px]">
          <div className="overflow-hidden rounded-2xl border border-[#C7E3FF] bg-[#EAF6FF] p-6 text-slate-950 shadow-[0_18px_45px_rgba(15,98,254,0.10)] lg:p-7">
            <nav className="mb-4 flex flex-wrap items-center gap-2 text-sm font-medium text-[#0B5CAB]">
              <Link to="/" className="hover:text-[#0F62FE]">{t("areas.breadcrumbs.home")}</Link>
              {id ? (
                <>
                  <span className="text-slate-300">/</span>
                  <Link to="/learning-paths" className="hover:text-[#0F62FE]">{t("areas.breadcrumbs.paths")}</Link>
                  <span className="text-slate-300">/</span>
                  <span className="text-slate-600">{serviceLineName || t("areas.breadcrumbs.serviceLines")}</span>
                </>
              ) : (
                <>
                  <span className="text-slate-300">/</span>
                  <span className="text-slate-600">{t("areas.breadcrumbs.areas")}</span>
                </>
              )}
            </nav>

            <div className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-end">
              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#0F62FE]">
                  {t("areas.eyebrow")}
                </p>
                <h1 className="max-w-5xl text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
                  {serviceLineName || t("areas.titleDefault")}
                </h1>
                <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-700">
                  {t("areas.subtitle")}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 xs:grid-cols-3">
                {stats.map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-[#C7E3FF] bg-white/80 px-3 py-3 text-center shadow-sm">
                    <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
                    <p className="mt-1 text-xl font-semibold text-[#0B5CAB]">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-[1600px] px-0 py-4">
        {error && (
          <div role="alert" className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <p className="text-sm font-semibold text-rose-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div role="status" aria-live="polite" className="rounded-2xl border border-[#DCEEFF] bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-b-4 border-[#0F62FE]"></div>
            <p className="text-lg font-semibold text-slate-600">{t("areas.loading")}</p>
          </div>
        ) : areas.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {areas.map((area, index) => (
              <article
                key={area.id}
                className="flex min-h-[220px] flex-col rounded-2xl border border-[#DCEEFF] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#8FCBFF] hover:shadow-[0_14px_35px_rgba(15,98,254,0.10)]"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF6FF] text-lg text-[#0F62FE]">
                    <i className={`bi ${areaIcons[index % areaIcons.length]}`}></i>
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                    {t("areas.levelsBadge")}
                  </span>
                </div>

                <h2 className="text-lg font-semibold text-slate-950">{area.name}</h2>
                <p className="mt-3 flex-1 text-sm leading-6 text-slate-500">
                  {t("areas.cardText")}
                </p>

                <Link
                  to={`/areas/${area.id}/badges`}
                  className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#0F62FE] px-5 text-sm font-semibold text-white transition hover:bg-[#0B55DD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F62FE]/35"
                >
                  {t("areas.viewBadges")}
                  <i className="bi bi-arrow-right"></i>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-[#DCEEFF] bg-white px-6 py-16 text-center shadow-sm">
            <i className="bi bi-grid mb-4 block text-6xl text-slate-300"></i>
            <h2 className="text-xl font-semibold text-slate-950">{t("areas.emptyTitle")}</h2>
            <p className="mx-auto mt-2 max-w-xl text-slate-500">
              {t("areas.emptyText")}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
