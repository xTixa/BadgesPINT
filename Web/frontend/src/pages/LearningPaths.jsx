import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import PublicBreadcrumbs from "../components/PublicBreadcrumbs";
import PublicJourneyStepper from "../components/PublicJourneyStepper";

export default function LearningPaths() {
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
        setError("Nao foi possivel carregar os percursos neste momento.");
        setLoading(false);
      });
  }, []);

  const stats = useMemo(
    () => [
      ["Percursos", paths.length],
      ["Etapa", "1/4"],
      ["Tipo", "Catalogo"],
    ],
    [paths.length],
  );

  return (
    <div className="min-h-screen bg-[#F2F2F2]">
      <section className="px-0 pb-4">
        <div className="mx-auto w-full max-w-[1600px]">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#0F62FE] via-[#16558C] to-[#00AEEF] p-6 text-white shadow-[0_12px_40px_rgba(15,98,254,0.18)] lg:p-7">
            <Link
              to="/"
              className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-white/85 transition hover:text-white"
            >
              <i className="bi bi-arrow-left"></i>
              Voltar ao inicio
            </Link>

            <div className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-end">
              <div>
                <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#BFEFFF]">
                  Percursos de aprendizagem
                </p>
                <h1 className="max-w-5xl text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                  Escolhe o percurso para evoluir nas competencias certas.
                </h1>
                <p className="mt-3 max-w-3xl text-base text-white/85">
                  Navega pelos percursos disponiveis e avanca para as linhas de
                  servico associadas a cada caminho de desenvolvimento.
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
          items={[{ label: "Inicio", to: "/" }, { label: "Percursos" }]}
        />
        <PublicJourneyStepper currentStep="paths" />

        <div className="mb-5 rounded-2xl border border-[#0F62FE]/10 bg-white p-4 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F62FE]/10 text-[#0F62FE]">
              <i className="bi bi-signpost-split"></i>
            </span>
            <div>
              <p className="text-sm font-extrabold text-slate-950">Passo 1</p>
              <p className="text-sm text-slate-500">
                Escolhe um percurso para veres as respetivas linhas de servico.
              </p>
            </div>
          </div>
        </div>

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
            className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm"
          >
            <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-b-4 border-[#0F62FE]"></div>
            <p className="text-lg font-semibold text-slate-600">
              A carregar percursos...
            </p>
          </div>
        ) : paths.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {paths.map((path, index) => (
              <article
                key={path.id}
                className="flex min-h-[220px] flex-col rounded-2xl border border-[#0F62FE]/10 bg-white p-5 shadow-[0_8px_30px_rgba(15,98,254,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_38px_rgba(15,98,254,0.12)]"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0F62FE]/10 text-lg text-[#0F62FE]">
                    <i className="bi bi-diagram-3"></i>
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500">
                    #{index + 1}
                  </span>
                </div>

                <h2 className="text-lg font-extrabold text-slate-950">
                  {path.name}
                </h2>
                <p className="mt-3 flex-1 text-sm leading-6 text-slate-500">
                  {path.description ||
                    "Percurso estruturado para desenvolver competencias essenciais e orientar a progressao por badges."}
                </p>

                <Link
                  to={`/learning-paths/${path.id}/service-lines`}
                  className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#0F62FE] px-5 text-sm font-bold text-white transition hover:bg-[#16558C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F62FE]/35"
                >
                  Explorar percurso
                  <i className="bi bi-arrow-right"></i>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <i className="bi bi-folder2-open mb-4 block text-6xl text-slate-300"></i>
            <h2 className="text-xl font-extrabold text-slate-950">
              Sem percursos disponiveis
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-slate-500">
              Ainda nao existem percursos publicados para consulta.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
