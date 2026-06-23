import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api";
import PublicBreadcrumbs from "../components/PublicBreadcrumbs";
import PublicJourneyStepper from "../components/PublicJourneyStepper";

const areaIcons = [
  "bi-hdd-network",
  "bi-terminal",
  "bi-bar-chart-line",
  "bi-gear",
  "bi-file-earmark-search",
  "bi-mortarboard",
];

export default function Areas() {
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
        setError("Nao foi possivel carregar as areas neste momento.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadAreas();

    return () => {
      active = false;
    };
  }, [id]);

  const stats = useMemo(
    () => [
      ["Areas", areas.length],
      ["Niveis", "5"],
      ["Etapa", id ? "3/4" : "Catalogo"],
    ],
    [areas.length, id],
  );

  return (
    <div className="min-h-screen bg-[#F2F2F2]">
      <section className="px-0 pb-4">
        <div className="mx-auto w-full max-w-[1600px]">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#0F62FE] via-[#16558C] to-[#00AEEF] p-6 text-white shadow-[0_12px_40px_rgba(15,98,254,0.18)] lg:p-7">
            <Link
              to="/learning-paths"
              className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-white/85 transition hover:text-white"
            >
              <i className="bi bi-arrow-left"></i>
              Voltar aos percursos
            </Link>

            <div className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-end">
              <div>
                <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#BFEFFF]">
                  Areas de competencia
                </p>
                <h1 className="max-w-5xl text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                  {serviceLineName || "Explora areas tecnicas e badges associados."}
                </h1>
                <p className="mt-3 max-w-3xl text-base text-white/85">
                  Escolhe uma area para consultar badges, niveis de especializacao
                  e requisitos de candidatura.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {stats.map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-white px-3 py-3 text-center">
                    <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
                    <p className="mt-1 text-xl font-extrabold text-slate-950">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-[1600px] px-0 py-4">
        <PublicBreadcrumbs
          items={
            id
              ? [
                  { label: "Inicio", to: "/" },
                  { label: "Percursos", to: "/learning-paths" },
                  { label: "Linhas de Servico", to: "/learning-paths" },
                  { label: "Areas" },
                ]
              : [{ label: "Inicio", to: "/" }, { label: "Areas" }]
          }
        />
        <PublicJourneyStepper currentStep="areas" />

        <div className="mb-5 rounded-2xl border border-[#0F62FE]/10 bg-white p-4 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F62FE]/10 text-[#0F62FE]">
              <i className="bi bi-grid"></i>
            </span>
            <div>
              <p className="text-sm font-extrabold text-slate-950">{id ? "Passo 3" : "Catalogo"}</p>
              <p className="text-sm text-slate-500">
                Escolhe uma area para veres os badges disponiveis.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div role="alert" className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <p className="text-sm font-semibold text-rose-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div role="status" aria-live="polite" className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-b-4 border-[#0F62FE]"></div>
            <p className="text-lg font-semibold text-slate-600">A carregar areas...</p>
          </div>
        ) : areas.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {areas.map((area, index) => (
              <article
                key={area.id}
                className="flex min-h-[220px] flex-col rounded-2xl border border-[#0F62FE]/10 bg-white p-5 shadow-[0_8px_30px_rgba(15,98,254,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_38px_rgba(15,98,254,0.12)]"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0F62FE]/10 text-lg text-[#0F62FE]">
                    <i className={`bi ${areaIcons[index % areaIcons.length]}`}></i>
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500">
                    5 niveis
                  </span>
                </div>

                <h2 className="text-lg font-extrabold text-slate-950">{area.name}</h2>
                <p className="mt-3 flex-1 text-sm leading-6 text-slate-500">
                  Consulta os badges desta area e acompanha a progressao por nivel
                  de especializacao.
                </p>

                <Link
                  to={`/areas/${area.id}/badges`}
                  className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#0F62FE] px-5 text-sm font-bold text-white transition hover:bg-[#16558C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F62FE]/35"
                >
                  Ver badges
                  <i className="bi bi-arrow-right"></i>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <i className="bi bi-grid mb-4 block text-6xl text-slate-300"></i>
            <h2 className="text-xl font-extrabold text-slate-950">Sem areas disponiveis</h2>
            <p className="mx-auto mt-2 max-w-xl text-slate-500">
              Ainda nao existem areas publicadas para consulta.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
