import Sidebar from "../../layout/Sidebar";
import { useMemo, useState } from "react";

export default function Equipa() {
  const [filtroNome, setFiltroNome] = useState("");
  const [consultores] = useState(sampleConsultores);

  const filtrados = useMemo(
    () => consultores.filter((c) => c.nome.toLowerCase().includes(filtroNome.toLowerCase())),
    [consultores, filtroNome]
  );

  const mediaPontos = Math.round(consultores.reduce((acc, c) => acc + c.pontos, 0) / consultores.length);
  const mediaProgresso = Math.round(consultores.reduce((acc, c) => acc + c.progresso, 0) / consultores.length);

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "talentManager", name: "Talent Manager" }} />

      <main className="admin-main">
        <div className="mb-4 rounded-2xl bg-[#013440] p-4 text-white shadow-sm">
          <h3 className="mb-1 text-xl font-bold sm:text-2xl">Equipa</h3>
          <p className="m-0 text-sm text-white/80 sm:text-base">Progresso, requisitos e timeline de evoluÃ§Ã£o por consultor.</p>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[{ label: "Total de Consultores", icon: "bi-people-fill", valor: consultores.length, cor: "text-sky-600" }, { label: "MÃ©dia de Pontos", icon: "bi-star-fill", valor: mediaPontos, cor: "text-amber-500" }, { label: "MÃ©dia de Progresso", icon: "bi-graph-up-arrow", valor: `${mediaProgresso}%`, cor: "text-emerald-600" }].map((card) => (
            <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-2">
                <i className={`bi ${card.icon} text-2xl ${card.cor}`}></i>
                <h6 className="m-0 text-sm text-slate-600">{card.label}</h6>
              </div>
              <h3 className="m-0 text-2xl font-bold text-slate-900">{card.valor}</h3>
            </div>
          ))}
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h5 className="m-0 text-base font-bold text-slate-900"><i className="bi bi-person-lines-fill mr-2 text-sky-600"></i>Consultores</h5>
                <div className="flex w-full items-center overflow-hidden rounded-xl border border-slate-300 bg-white sm:w-[260px]">
                  <span className="px-3 text-slate-500"><i className="bi bi-search"></i></span>
                    <input
                      type="text"
                    className="w-full border-0 px-2 py-2 text-sm text-slate-800 outline-none"
                      placeholder="Procurar por nome..."
                      value={filtroNome}
                      onChange={(e) => setFiltroNome(e.target.value)}
                    />
                  </div>
                </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-100 text-slate-700">
                      <tr>
                      <th className="px-3 py-2 text-left font-semibold">Consultor</th>
                      <th className="px-3 py-2 text-left font-semibold">FunÃ§Ã£o</th>
                      <th className="px-3 py-2 text-left font-semibold">Service Line</th>
                      <th className="px-3 py-2 text-left font-semibold">Pontos</th>
                      <th className="px-3 py-2 text-left font-semibold">Badges</th>
                      <th className="px-3 py-2 text-left font-semibold">ExpiraÃ§Ã£o</th>
                      <th className="px-3 py-2 text-left font-semibold">Progresso</th>
                      <th className="px-3 py-2 text-right font-semibold">Timeline</th>
                      </tr>
                    </thead>
                  <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                      {filtrados.map((c) => (
                        <tr key={c.id}>
                        <td className="px-3 py-2 font-semibold text-slate-900">{c.nome}</td>
                        <td className="px-3 py-2 text-slate-500">{c.cargo}</td>
                        <td className="px-3 py-2">{c.serviceLine}</td>
                        <td className="px-3 py-2">{c.pontos}</td>
                        <td className="px-3 py-2">{c.badges}</td>
                        <td className="px-3 py-2">
                            {c.expirando ? (
                            <span className="inline-flex rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">{c.expirando} dias</span>
                            ) : (
                            <span className="inline-flex rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">OK</span>
                            )}
                          </td>
                        <td className="min-w-[160px] px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 flex-1 rounded-full bg-slate-200">
                              <div className="h-1.5 rounded-full bg-[#013440]" style={{ width: `${c.progresso}%` }}></div>
                              </div>
                            <span className="text-xs text-slate-500">{c.progresso}%</span>
                            </div>
                          </td>
                        <td className="px-3 py-2 text-right">
                          <button className="rounded-lg border border-slate-400 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50" onClick={() => alert("Timeline profissional (mock)")}>Ver timeline</button>
                          </td>
                        </tr>
                      ))}
                      {!filtrados.length && (
                        <tr>
                        <td colSpan="8" className="px-3 py-4 text-center text-sm text-slate-500">Nenhum consultor encontrado com esse filtro.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="mb-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h6 className="mb-2 text-sm font-bold text-slate-900 sm:text-base"><i className="bi bi-fire mr-2 text-rose-600"></i>Badges prÃ³ximos da expiraÃ§Ã£o</h6>
              <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                  {consultores
                    .flatMap((c) => c.badgesExpirando)
                    .slice(0, 4)
                    .map((b, idx) => (
                    <li key={idx} className="flex items-center justify-between gap-3 px-3 py-3">
                        <div>
                        <div className="text-sm font-semibold text-slate-900">{b.nome}</div>
                        <div className="text-xs text-slate-500">{b.consultor}</div>
                        </div>
                      <span className="inline-flex rounded-full bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700">{b.expiraEmDias} dias</span>
                      </li>
                    ))}
                  {!consultores.some((c) => c.badgesExpirando.length) && (
                  <li className="px-3 py-3 text-sm text-slate-500">Sem expiraÃ§Ãµes prÃ³ximas.</li>
                  )}
                </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h6 className="mb-2 text-sm font-bold text-slate-900 sm:text-base"><i className="bi bi-patch-check-fill mr-2 text-emerald-600"></i>Requisitos por badge</h6>
              <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                  {requisitos.map((r) => (
                  <li key={r.id} className="px-3 py-3">
                    <div className="text-sm font-semibold text-slate-900">{r.badge}</div>
                    <div className="text-xs text-slate-500">{r.requisito}</div>
                    </li>
                  ))}
                </ul>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h6 className="mb-3 text-sm font-bold text-slate-900 sm:text-base"><i className="bi bi-stars mr-2 text-amber-500"></i>Sistema de pontos e conquistas especiais</h6>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm text-sky-700">Cada badge atribui pontos; badges de conquistas especiais valem pontos extra e aparecem no perfil.</div>
            </div>
            <div className="flex flex-col gap-2">
                {conquistas.map((c) => (
                <div key={c.id} className="flex items-center gap-2">
                    <i className={`${c.icon} text-warning`}></i>
                    <div>
                    <div className="text-sm font-semibold text-slate-900">{c.nome}</div>
                    <div className="text-xs text-slate-500">{c.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
        </div>
      </main>
    </div>
  );
}

const sampleConsultores = [
  {
    id: 1,
    nome: "PatrÃ­cia Almeida",
    cargo: "Consultora JÃºnior",
    serviceLine: "Outsystems",
    pontos: 820,
    progresso: 75,
    badges: 4,
    expirando: 15,
    badgesExpirando: [{ consultor: "PatrÃ­cia", nome: "Outsystems AvanÃ§ado", expiraEmDias: 15 }],
  },
  {
    id: 2,
    nome: "JoÃ£o Silva",
    cargo: "Consultor",
    serviceLine: "DevOps",
    pontos: 960,
    progresso: 88,
    badges: 6,
    expirando: 0,
    badgesExpirando: [],
  },
  {
    id: 3,
    nome: "Ana Costa",
    cargo: "Consultora",
    serviceLine: "Cloud",
    pontos: 540,
    progresso: 52,
    badges: 3,
    expirando: 22,
    badgesExpirando: [{ consultor: "Ana", nome: "Azure Fundamentals", expiraEmDias: 22 }],
  },
];

const requisitos = [
  { id: 1, badge: "DevOps IntermÃ©dio", requisito: "Pipeline CI/CD + MonitorizaÃ§Ã£o" },
  { id: 2, badge: "React Advanced", requisito: "Projetos com hooks e testes" },
  { id: 3, badge: "Azure Fundamentals", requisito: "CertificaÃ§Ã£o AZ-900" },
];

const conquistas = [
  { id: 1, nome: "Badge Elite", desc: "Badges concluÃ­dos sem rejeiÃ§Ãµes", icon: "bi-trophy-fill" },
  { id: 2, nome: "Ponto Extra", desc: "Cumpriu prazos antes do SLA", icon: "bi-lightning-fill" },
];


