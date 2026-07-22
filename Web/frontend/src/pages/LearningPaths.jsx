import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../api";

export default function LearningPaths() {
  const { t } = useTranslation();
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    api
      .get("/learning-paths")
      .then((res) => {
        setPaths(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setPaths([]);
        setError(t("learningPaths.errorLoading"));
        setLoading(false);
      });
  }, [t]);

  const stats = useMemo(
    () => [
      [t("learningPaths.stats.paths"), paths.length],
      [t("learningPaths.stats.step"), "1/4"],
      [t("learningPaths.stats.type"), t("learningPaths.stats.catalog")],
    ],
    [paths.length, t],
  );

  return (
    <div className="-mx-4 -my-8 min-h-screen bg-[#F6FAFF] px-4 py-8">
      <section className="px-0 pb-4">
        <div className="mx-auto w-full max-w-[1600px]">
          <div className="overflow-hidden rounded-2xl border border-[#C7E3FF] bg-[#EAF6FF] p-6 text-slate-950 shadow-[0_18px_45px_rgba(15,98,254,0.10)] lg:p-7">
            <nav className="mb-4 flex flex-wrap items-center gap-2 text-sm font-medium text-[#0B5CAB]">
              <Link to="/" className="hover:text-[#0F62FE]">{t("learningPaths.breadcrumbs.home")}</Link>
              <span className="text-slate-300">/</span>
              <span className="text-slate-600">{t("learningPaths.breadcrumbs.paths")}</span>
            </nav>

            <div className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-end">
              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#0F62FE]">
                  {t("learningPaths.eyebrow")}
                </p>
                <h1 className="max-w-5xl text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
                  {t("learningPaths.title")}
                </h1>
                <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-700">
                  {t("learningPaths.subtitle")}
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
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4"
          >
            <p className="text-sm font-semibold text-rose-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div
            role="status"
            aria-live="polite"
            className="rounded-2xl border border-[#DCEEFF] bg-white px-6 py-16 text-center shadow-sm"
          >
            <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-b-4 border-[#0F62FE]"></div>
            <p className="text-lg font-semibold text-slate-600">
              {t("learningPaths.loading")}
            </p>
          </div>
        ) : paths.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {paths.map((path, index) => (
              <article
                key={path.id}
                className="flex min-h-[220px] flex-col rounded-2xl border border-[#DCEEFF] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#8FCBFF] hover:shadow-[0_14px_35px_rgba(15,98,254,0.10)]"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF6FF] text-lg text-[#0F62FE]">
                    <i className="bi bi-diagram-3"></i>
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                    #{index + 1}
                  </span>
                </div>

                <h2 className="text-lg font-semibold text-slate-950">
                  {path.name}
                </h2>
                <p className="mt-3 flex-1 text-sm leading-6 text-slate-500">
                  {path.description || t("learningPaths.defaultDescription")}
                </p>

                <Link
                  to={`/learning-paths/${path.id}/service-lines`}
                  className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#0F62FE] px-5 text-sm font-semibold text-white transition hover:bg-[#0B55DD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F62FE]/35"
                >
                  {t("learningPaths.explore")}
                  <i className="bi bi-arrow-right"></i>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-[#DCEEFF] bg-white px-6 py-16 text-center shadow-sm">
            <i className="bi bi-folder2-open mb-4 block text-6xl text-slate-300"></i>
            <h2 className="text-xl font-semibold text-slate-950">
              {t("learningPaths.emptyTitle")}
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-slate-500">
              {t("learningPaths.emptyText")}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
