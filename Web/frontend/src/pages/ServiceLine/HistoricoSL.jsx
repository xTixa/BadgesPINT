import { useEffect, useMemo, useState } from "react";
import api from "/src/api";
import EmptyState from "/src/components/ui/EmptyState";
import ServiceLineLayout, { ServiceLineStatCard, slActionClass, slPrimaryActionClass } from "./ServiceLineLayout";

const STATUS_LABEL = {
  obtido: { label: "Obtido", cls: "bg-emerald-100 text-emerald-700" },
  pendente: { label: "Pendente", cls: "bg-amber-100 text-amber-700" },
  rejeitado: { label: "Rejeitado", cls: "bg-rose-100 text-rose-700" },
};

const WORKFLOW_LABEL = {
  open: "Aberto",
  submitted: "Submetido",
  em_validacao: "Em Validação (SL)",
  fechado: "Fechado",
};

function ProcessoDetail({ pedido, onClose }) {
  const steps = [
    {
      label: "Candidatura submetida",
      date: pedido.submitted_at,
      actor: pedido.user?.name,
      comment: null,
      done: Boolean(pedido.submitted_at),
      icon: "bi-send-fill",
      color: "text-blue-600",
    },
    {
      label: "Validação Talent Manager",
      date: pedido.tm_validated_at,
      actor: null,
      comment: pedido.tm_comment,
      done: Boolean(pedido.tm_validated_at),
      icon: "bi-person-check-fill",
      color: "text-violet-600",
    },
    {
      label: pedido.status === "rejeitado" ? "Rejeitado pela Service Line" : "Aprovado pela Service Line",
      date: pedido.sl_validated_at,
      actor: null,
      comment: pedido.sl_comment,
      done: Boolean(pedido.sl_validated_at),
      icon: pedido.status === "rejeitado" ? "bi-x-circle-fill" : "bi-check-circle-fill",
      color: pedido.status === "rejeitado" ? "text-rose-600" : "text-emerald-600",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Processo de Candidatura
            </h3>
            <p className="text-sm text-slate-500">
              {pedido.badge?.name || pedido.badge?.description || `Badge #${pedido.badge_id}`}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <i className="bi bi-x-lg text-xl"></i>
          </button>
        </div>

        <div className="mb-4 flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
          <i className="bi bi-person-badge-fill text-[#0F62FE]"></i>
          <div>
            <div className="text-sm font-semibold text-slate-900">{pedido.user?.name}</div>
            <div className="text-xs text-slate-500">{pedido.user?.email}</div>
          </div>
          <span className={`ml-auto rounded-full px-2 py-1 text-xs font-semibold ${STATUS_LABEL[pedido.status]?.cls || "bg-slate-100 text-slate-700"}`}>
            {STATUS_LABEL[pedido.status]?.label || pedido.status}
          </span>
        </div>

        <ol className="relative border-l-2 border-slate-200 pl-6">
          {steps.map((step, idx) => (
            <li key={idx} className={`mb-5 ${idx === steps.length - 1 ? "" : ""}`}>
              <span className={`absolute -left-[11px] flex h-5 w-5 items-center justify-center rounded-full ${step.done ? "bg-white ring-2 ring-[#0F62FE]" : "bg-slate-200"}`}>
                <i className={`bi ${step.icon} text-xs ${step.done ? step.color : "text-slate-400"}`}></i>
              </span>
              <div className={`rounded-xl p-3 ${step.done ? "bg-slate-50" : "bg-slate-50/50 opacity-50"}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-800">{step.label}</span>
                  {step.date && (
                    <span className="text-xs text-slate-500">
                      {new Date(step.date).toLocaleDateString("pt-PT")}
                    </span>
                  )}
                </div>
                {step.actor && <div className="mt-1 text-xs text-slate-500">por {step.actor}</div>}
                {step.comment && (
                  <div className="mt-2 rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-600 italic">
                    "{step.comment}"
                  </div>
                )}
                {!step.done && <div className="mt-1 text-xs text-slate-400">Aguarda...</div>}
              </div>
            </li>
          ))}
        </ol>

        <button onClick={onClose} className={`mt-2 w-full ${slPrimaryActionClass}`}>
          Fechar
        </button>
      </div>
    </div>
  );
}

export default function HistoricoSL() {
  const [pedidos, setPedidos] = useState([]);
  const [filtro, setFiltro] = useState("todos");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/api/pedidos");
        if (mounted) setPedidos(res.data || []);
      } catch (err) {
        console.error("Erro ao carregar histórico SL:", err);
        if (mounted) setError("Não foi possível carregar o histórico.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    let list = pedidos;
    if (filtro === "obtido") list = list.filter((p) => p.status === "obtido");
    else if (filtro === "em_processo") list = list.filter((p) => p.status === "pendente" && p.workflow_status !== "fechado");
    else if (filtro === "rejeitado") list = list.filter((p) => p.status === "rejeitado");
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        `${p.user?.name || ""} ${p.badge?.description || ""} ${p.badge?.name || ""}`.toLowerCase().includes(q)
      );
    }
    return list;
  }, [pedidos, filtro, search]);

  const totals = useMemo(() => ({
    obtidos: pedidos.filter((p) => p.status === "obtido").length,
    emProcesso: pedidos.filter((p) => p.status === "pendente").length,
    rejeitados: pedidos.filter((p) => p.status === "rejeitado").length,
  }), [pedidos]);

  const downloadCertificado = async (badgeId, consultorId) => {
    try {
      const response = await api.post(`/api/sl/badges/${badgeId}/certificado`, { consultorId }, { responseType: "blob" });
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
      alert("Não foi possível gerar o certificado.");
    }
  };

  return (
    <ServiceLineLayout
      title="Histórico de Badges"
      subtitle="Consulta o histórico completo de badges obtidos e em processo da tua Service Line."
      heroStats={[
        { label: "Obtidos", value: totals.obtidos },
        { label: "Em Processo", value: totals.emProcesso },
        { label: "Rejeitados", value: totals.rejeitados },
      ]}
    >
      {selected && <ProcessoDetail pedido={selected} onClose={() => setSelected(null)} />}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <ServiceLineStatCard icon="bi-patch-check-fill" label="Badges Obtidos" value={totals.obtidos} />
        <ServiceLineStatCard icon="bi-hourglass-split" label="Em Processo" value={totals.emProcesso} />
        <ServiceLineStatCard icon="bi-x-circle-fill" label="Rejeitados" value={totals.rejeitados} />
      </div>

      <section className="mb-4 rounded-3xl bg-white p-4 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
        <div className="flex flex-wrap gap-2">
          {[
            { value: "todos", label: "Todos" },
            { value: "obtido", label: "Obtidos" },
            { value: "em_processo", label: "Em Processo" },
            { value: "rejeitado", label: "Rejeitados" },
          ].map((item) => (
            <button
              key={item.value}
              className={filtro === item.value ? slPrimaryActionClass : slActionClass}
              onClick={() => setFiltro(item.value)}
            >
              {item.label}
            </button>
          ))}
          <input
            className="ui-input ml-auto max-w-xs"
            placeholder="Pesquisar consultor ou badge..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      {loading ? (
        <EmptyState message="A carregar histórico..." icon="bi-hourglass-split" />
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : (
        <section className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
          <h5 className="mb-3 text-base font-bold text-slate-900">
            <i className="bi bi-clock-history mr-2 text-[#0F62FE]"></i>
            Processos de Candidatura ({filtered.length})
          </h5>
          {filtered.length === 0 ? (
            <EmptyState message="Sem registos para os filtros selecionados." icon="bi-inbox" />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Consultor</th>
                    <th className="px-3 py-2 text-left font-semibold">Badge</th>
                    <th className="px-3 py-2 text-left font-semibold">Estado</th>
                    <th className="px-3 py-2 text-left font-semibold">Workflow</th>
                    <th className="px-3 py-2 text-left font-semibold">Submetido</th>
                    <th className="px-3 py-2 text-left font-semibold">Concluído</th>
                    <th className="px-3 py-2 text-right font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                  {filtered.map((pedido) => (
                    <tr key={pedido.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2">
                        <div className="font-semibold text-slate-900">{pedido.user?.name}</div>
                        <div className="text-xs text-slate-500">{pedido.user?.email}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="font-medium text-slate-900">{pedido.badge?.name || pedido.badge?.description}</div>
                        <div className="text-xs text-slate-500">{pedido.badge?.level}</div>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${STATUS_LABEL[pedido.status]?.cls || "bg-slate-100 text-slate-700"}`}>
                          {STATUS_LABEL[pedido.status]?.label || pedido.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-600">
                        {WORKFLOW_LABEL[pedido.workflow_status] || pedido.workflow_status}
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-500">
                        {pedido.submitted_at ? new Date(pedido.submitted_at).toLocaleDateString("pt-PT") : "-"}
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-500">
                        {pedido.data_atribuicao ? new Date(pedido.data_atribuicao).toLocaleDateString("pt-PT") : "-"}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className={slActionClass}
                            onClick={() => setSelected(pedido)}
                            title="Ver processo completo"
                          >
                            <i className="bi bi-eye mr-1"></i>Processo
                          </button>
                          {pedido.status === "obtido" && (
                            <button
                              className={slActionClass}
                              onClick={() => downloadCertificado(pedido.badge_id, pedido.consultor_id)}
                              title="Download certificado"
                            >
                              <i className="bi bi-file-earmark-pdf mr-1"></i>PDF
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </ServiceLineLayout>
  );
}
