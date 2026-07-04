import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "/src/api";
import SectionCard from "/src/components/ui/SectionCard";
import EmptyState from "/src/components/ui/EmptyState";
import TalentManagerLayout, { TalentStatCard } from "./TalentManagerLayout";
import SortableTh from "/src/components/ui/SortableTh";
import { useSortableData } from "/src/hooks/useSortableData";

const formatDate = (value) => (value ? new Date(value).toLocaleDateString("pt-PT") : "-");

export default function Equipa() {
  const [filtroNome, setFiltroNome] = useState("");
  const [consultores, setConsultores] = useState([]);
  const [catalogo, setCatalogo] = useState([]);
  const [selectedConsultor, setSelectedConsultor] = useState(null);
  const [signatureMessage, setSignatureMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const [equipaRes, catalogoRes] = await Promise.all([
          api.get("/api/tm/equipa"),
          api.get("/api/tm/catalogo"),
        ]);

        if (!mounted) return;
        const equipa = equipaRes.data || [];
        setConsultores(equipa);
        setCatalogo(catalogoRes.data || []);
        setSelectedConsultor(equipa[0] || null);
      } catch (err) {
        console.error("Erro ao carregar equipa TM:", err);
        if (mounted) setError("Nao foi possivel carregar os dados da equipa.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const filtrados = useMemo(
    () => consultores.filter((c) => String(c.name || "").toLowerCase().includes(filtroNome.toLowerCase())),
    [consultores, filtroNome]
  );

  const { sortedItems: consultoresOrdenados, sortConfig, requestSort } = useSortableData(filtrados);
  const { sortedItems: catalogoOrdenado, sortConfig: catalogoSortConfig, requestSort: requestCatalogoSort } = useSortableData(catalogo);

  const mediaPontos = consultores.length
    ? Math.round(consultores.reduce((acc, c) => acc + Number(c.points_total || 0), 0) / consultores.length)
    : 0;
  const mediaProgresso = consultores.length
    ? Math.round(consultores.reduce((acc, c) => acc + Number(c.progresso || 0), 0) / consultores.length)
    : 0;
  const expiracoes = consultores.flatMap((c) =>
    (c.badgesExpirando || []).map((badge) => ({ ...badge, consultor: c.name }))
  );

  const downloadCertificado = async (consultorId, badgeId) => {
    try {
      const response = await api.post(
        `/api/tm/badges/${badgeId}/certificado`,
        { consultorId },
        { responseType: "blob" }
      );
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
      alert("Nao foi possivel gerar o certificado.");
    }
  };

  const copiarAssinatura = async (item) => {
    if (!selectedConsultor) return;

    const assinatura = `
<div style="font-family:Arial,sans-serif;font-size:13px;color:#1f2937">
  <strong>${selectedConsultor.name}</strong><br/>
  <span>${selectedConsultor.area || selectedConsultor.service_line || "Softinsa Badges"}</span><br/>
  <span style="display:inline-block;margin-top:6px;padding:6px 10px;border:1px solid #0F62FE;border-radius:999px;color:#0F62FE;font-weight:700">
    Badge: ${item.badge}
  </span>
</div>`.trim();

    try {
      await navigator.clipboard.writeText(assinatura);
      setSignatureMessage("Assinatura copiada para a area de transferencia.");
      window.setTimeout(() => setSignatureMessage(""), 3000);
    } catch (err) {
      console.error("Erro ao copiar assinatura:", err);
      window.prompt("Copia a assinatura HTML:", assinatura);
    }
  };

  return (
    <TalentManagerLayout
      title="Equipa"
      subtitle="Consulta progresso, pontos, badges, requisitos e timeline profissional dos consultores."
      heroStats={[
        { label: "Consultores", value: consultores.length },
        { label: "Média pontos", value: mediaPontos },
        { label: "Progresso", value: `${mediaProgresso}%` },
      ]}
    >
        {loading ? (
          <EmptyState message="A carregar equipa..." icon="bi-hourglass-split" />
        ) : error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        ) : (
          <>
            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Total de Consultores", icon: "bi-people-fill", value: consultores.length, tone: "sky" },
                { label: "Media de Pontos", icon: "bi-star-fill", value: mediaPontos, tone: "amber" },
                { label: "Media de Progresso", icon: "bi-graph-up-arrow", value: `${mediaProgresso}%`, tone: "emerald" },
                { label: "Badges Disponiveis", icon: "bi-award-fill", value: catalogo.length, tone: "indigo" },
              ].map((card) => (
                <TalentStatCard key={card.label} label={card.label} icon={card.icon} value={card.value} />
              ))}
            </div>

            <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <SectionCard title="Consultores" icon="bi-person-lines-fill">
                  <div className="mb-3 flex w-full items-center overflow-hidden rounded-xl border border-slate-300 bg-white sm:w-[300px]">
                    <span className="px-3 text-slate-500"><i className="bi bi-search"></i></span>
                    <input
                      type="text"
                      className="w-full border-0 px-2 py-2 text-sm text-slate-800 outline-none"
                      placeholder="Procurar por nome..."
                      value={filtroNome}
                      onChange={(e) => setFiltroNome(e.target.value)}
                    />
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                      <thead className="bg-slate-100 text-slate-700">
                        <tr>
                          <SortableTh label="Consultor" sortKey="name" accessor={(c) => c.name || ""} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                          <SortableTh label="Email" sortKey="email" accessor={(c) => c.email || ""} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                          <SortableTh label="Area" sortKey="area" accessor={(c) => c.area || ""} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                          <SortableTh label="Pontos" sortKey="points_total" accessor={(c) => Number(c.points_total || 0)} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                          <SortableTh label="Obtidos" sortKey="badges_obtidos" accessor={(c) => Number(c.badges_obtidos || 0)} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                          <SortableTh label="Pendentes" sortKey="badges_pendentes" accessor={(c) => Number(c.badges_pendentes || 0)} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                          <SortableTh label="Progresso" sortKey="progresso" accessor={(c) => Number(c.progresso || 0)} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                          <th className="px-3 py-2 text-right font-semibold">Timeline</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                        {consultoresOrdenados.map((c) => (
                          <tr key={c.id}>
                            <td className="px-3 py-2 font-semibold text-slate-900">{c.name}</td>
                            <td className="px-3 py-2 text-slate-500">{c.email}</td>
                            <td className="px-3 py-2">{c.area || "-"}</td>
                            <td className="px-3 py-2">{c.points_total || 0}</td>
                            <td className="px-3 py-2">{c.badges_obtidos || 0}</td>
                            <td className="px-3 py-2">{c.badges_pendentes || 0}</td>
                            <td className="min-w-[160px] px-3 py-2">
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 flex-1 rounded-full bg-slate-200">
                                  <div className="h-1.5 rounded-full bg-[#16558C]" style={{ width: `${Number(c.progresso || 0)}%` }}></div>
                                </div>
                                <span className="text-xs text-slate-500">{c.progresso || 0}%</span>
                              </div>
                            </td>
                            <td className="px-3 py-2 text-right">
                              <button className="rounded-lg border border-slate-400 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50" onClick={() => setSelectedConsultor(c)}>
                                Ver
                              </button>
                            </td>
                          </tr>
                        ))}
                        {!filtrados.length && (
                          <tr>
                            <td colSpan="8" className="px-3 py-4">
                              <EmptyState message="Nenhum consultor encontrado." icon="bi-search" />
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </SectionCard>
              </div>

              <div className="lg:col-span-4">
                <SectionCard title="Badges próximos da expiração" icon="bi-calendar2-week" className="mb-3">
                  <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                    {expiracoes.slice(0, 6).map((b, idx) => (
                      <li key={`${b.consultor}-${b.badge}-${idx}`} className="flex items-center justify-between gap-3 px-3 py-3">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{b.badge}</div>
                          <div className="text-xs text-slate-500">{b.consultor} · {formatDate(b.expires_at)}</div>
                        </div>
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${Number(b.dias) <= 15 ? "bg-rose-100 text-rose-700" : Number(b.dias) <= 30 ? "bg-orange-100 text-orange-700" : "bg-amber-100 text-amber-700"}`}>{b.dias} dias</span>
                      </li>
                    ))}
                    {!expiracoes.length && <li className="px-3 py-3 text-sm text-slate-500">Sem expirações próximas.</li>}
                  </ul>
                  {expiracoes.length > 0 && (
                    <Link
                      to="/tm/expiracoes"
                      className="mt-2 flex items-center justify-center gap-1 rounded-xl border border-slate-200 py-2 text-xs font-semibold text-[#0F62FE] hover:bg-slate-50"
                    >
                      Ver todas ({expiracoes.length}) <i className="bi bi-arrow-right"></i>
                    </Link>
                  )}
                </SectionCard>

                <SectionCard title="Timeline profissional" icon="bi-clock-history">
                  <div className="mb-2 text-sm font-semibold text-slate-900">{selectedConsultor?.name || "Seleciona um consultor"}</div>
                  {signatureMessage && (
                    <div className="mb-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                      {signatureMessage}
                    </div>
                  )}
                  <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                    {(selectedConsultor?.timeline || []).map((item) => (
                      <li key={item.id} className="px-3 py-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{item.badge}</div>
                            <div className="text-xs text-slate-500">{item.status} · {item.workflow_status || "sem workflow"} · {formatDate(item.data)}</div>
                          </div>
                          {item.status === "obtido" && (
                            <div className="flex shrink-0 gap-1">
                              <button
                                className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                onClick={() => copiarAssinatura(item)}
                                title="Copiar assinatura de email"
                              >
                                <i className="bi bi-envelope-paper"></i>
                              </button>
                              <button
                                className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                onClick={() => downloadCertificado(selectedConsultor.id, item.badge_id)}
                                title="Download certificado PDF"
                              >
                                PDF
                              </button>
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                    {!selectedConsultor?.timeline?.length && <li className="px-3 py-3 text-sm text-slate-500">Sem histórico para apresentar.</li>}
                  </ul>
                </SectionCard>
              </div>
            </div>

            <SectionCard title="Catálogo de badges, requisitos e pontos" icon="bi-patch-check-fill">
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <SortableTh label="Badge" sortKey="name" accessor={(b) => b.name || b.description || ""} sortConfig={catalogoSortConfig} onSort={requestCatalogoSort} className="text-left font-semibold" />
                      <SortableTh label="Nivel" sortKey="level" accessor={(b) => b.level || ""} sortConfig={catalogoSortConfig} onSort={requestCatalogoSort} className="text-left font-semibold" />
                      <SortableTh label="Area" sortKey="area" accessor={(b) => b.area?.name || ""} sortConfig={catalogoSortConfig} onSort={requestCatalogoSort} className="text-left font-semibold" />
                      <SortableTh label="Pontos" sortKey="points" accessor={(b) => Number(b.points || 0)} sortConfig={catalogoSortConfig} onSort={requestCatalogoSort} className="text-left font-semibold" />
                      <th className="px-3 py-2 text-left font-semibold">Requisitos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                    {catalogoOrdenado.map((badge) => (
                      <tr key={badge.id}>
                        <td className="px-3 py-2">
                          <div className="font-semibold text-slate-900">{badge.name || badge.description || `Badge #${badge.id}`}</div>
                          <div className="text-xs text-slate-500">{badge.description}</div>
                        </td>
                        <td className="px-3 py-2">{badge.level}</td>
                        <td className="px-3 py-2">{badge.area?.name || "-"}</td>
                        <td className="px-3 py-2">{badge.points || 0}</td>
                        <td className="px-3 py-2">
                          {(badge.requirements || []).map((req) => (
                            <div key={req.id} className="mb-1">
                              <span className="font-semibold">{req.code}</span> {req.title}
                            </div>
                          ))}
                          {!badge.requirements?.length && <span className="text-slate-500">Sem requisitos registados.</span>}
                        </td>
                      </tr>
                    ))}
                    {!catalogo.length && (
                      <tr>
                        <td colSpan="5" className="px-3 py-4">
                          <EmptyState message="Sem badges disponíveis para esta área." icon="bi-award" />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </>
        )}
    </TalentManagerLayout>
  );
}
