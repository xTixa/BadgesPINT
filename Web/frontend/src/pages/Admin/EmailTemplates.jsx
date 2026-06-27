import { useEffect, useMemo, useState } from "react";
import api from "/src/api";
import Sidebar from "../../layout/Sidebar";
import EmptyState from "../../components/ui/EmptyState";

const defaults = {
  password_reset: ["Redefinir password - Badges Softinsa", "<h2>Olá {{name}},</h2><p>Recebemos um pedido para redefinir a tua password.</p><p><a href=\"{{reset_url}}\">Criar nova password</a></p>"],
  temporary_password: ["Acesso à plataforma de Badges Softinsa", "<h2>Olá {{name}},</h2><p>A tua conta foi criada.</p><p><strong>Email:</strong> {{email}}<br><strong>Password temporária:</strong> {{temporary_password}}</p><p><a href=\"{{login_url}}\">Entrar na plataforma</a></p>"],
  badge_application: ["Candidatura recebida - {{badge_name}}", "<h2>Olá {{name}},</h2><p>Recebemos a tua candidatura ao badge <strong>{{badge_name}}</strong>.</p>"],
  sl_validation: ["Pedido de badge aguarda aprovação", "<h2>Olá {{name}},</h2><p>O pedido de <strong>{{badge_name}}</strong> submetido por {{consultant_name}} aguarda a tua aprovação.</p>"],
  badge_approved: ["Badge aprovado - {{badge_name}}", "<h2>Olá {{name}},</h2><p>O badge <strong>{{badge_name}}</strong> foi aprovado.</p><p><a href=\"{{dashboard_url}}\">Abrir dashboard</a></p>"],
  badge_rejected: ["Pedido rejeitado - {{badge_name}}", "<h2>Olá {{name}},</h2><p>O pedido para <strong>{{badge_name}}</strong> foi rejeitado.</p><p>{{comment}}</p><p><a href=\"{{dashboard_url}}\">Ver pedido</a></p>"],
  badge_returned: ["Pedido devolvido - {{badge_name}}", "<h2>Olá {{name}},</h2><p>O pedido para <strong>{{badge_name}}</strong> foi devolvido para retificação.</p><p>{{comment}}</p>"],
  goal_reminder: ["Lembrete de objetivo", "<h2>Olá {{name}},</h2><p>O objetivo <strong>{{goal_text}}</strong> termina em {{goal_deadline}}.</p><p><a href=\"{{dashboard_url}}\">Rever objetivo</a></p>"],
  sla_alert: ["Alerta de SLA - {{badge_name}}", "<h2>Olá {{name}},</h2><p>O pedido de {{badge_name}} por {{consultant_name}} ultrapassou {{hours_limit}} horas.</p><p>Estado: {{workflow_status}}</p>"],
};
const samples = { name: "Joana Silva", email: "joana.silva@softinsa.pt", badge_name: "Cloud Specialist", consultant_name: "Miguel Costa", comment: "Revê a evidência submetida.", dashboard_url: "#", reset_url: "#", login_url: "#", temporary_password: "••••••••", goal_text: "Conquistar 3 badges", goal_deadline: "30/09/2026", hours_limit: "48", workflow_status: "Em validação" };

export default function Configuracoes() {
  const [templates, setTemplates] = useState([]);
  const [selectedKey, setSelectedKey] = useState("");
  const [draft, setDraft] = useState({ subject: "", html_body: "", text_body: "", enabled: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const selected = templates.find((item) => item.key === selectedKey);
  const load = () => api.get("/api/admin/email/templates").then((res) => { setTemplates(res.data); setSelectedKey((key) => key || res.data[0]?.key || ""); }).finally(() => setLoading(false));
  useEffect(() => { load().catch(() => setMessage("Não foi possível carregar os templates.")); }, []);
  useEffect(() => {
    if (!selected) return;
    const fallback = defaults[selected.key] || ["Badges Softinsa", "<p>Olá {{name}},</p>"];
    setDraft({ subject: selected.subject || fallback[0], html_body: selected.html_body || fallback[1], text_body: selected.text_body || "", enabled: selected.customized ? selected.enabled : true });
  }, [selected]);
  const preview = useMemo(() => draft.html_body.replace(/{{\s*([a-z0-9_]+)\s*}}/gi, (_, key) => samples[key] || `{{${key}}}`), [draft.html_body]);
  const save = async () => { try { setSaving(true); await api.put(`/api/admin/email/templates/${selectedKey}`, draft); setMessage("Template guardado e ativo nos próximos emails."); await load(); } catch (err) { setMessage(err.response?.data?.message || "Erro ao guardar template."); } finally { setSaving(false); } };
  const reset = async () => { if (!window.confirm("Repor este template para o conteúdo padrão?")) return; await api.delete(`/api/admin/email/templates/${selectedKey}`); setMessage("Template reposto."); await load(); };

  return <div className="admin-shell"><Sidebar user={{ role: "admin", name: "Admin" }} /><main className="admin-main"><div className="mx-auto max-w-7xl space-y-6">
    <section className="rounded-3xl bg-gradient-to-r from-[#0F62FE] to-[#00AEEF] p-8 text-white shadow-lg"><p className="text-sm text-white/80">Configurações do sistema</p><h1 className="mt-1 text-3xl font-bold">Templates de Email</h1><p className="mt-2 text-white/80">Personaliza assunto e conteúdo das mensagens automáticas.</p></section>
    {message && <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">{message}</div>}
    {loading ? <EmptyState message="A carregar templates..." icon="bi-hourglass-split" /> : <div className="grid gap-5 lg:grid-cols-12"><aside className="space-y-2 lg:col-span-3">{templates.map((item) => <button key={item.key} onClick={() => setSelectedKey(item.key)} className={`w-full rounded-2xl border p-4 text-left ${item.key === selectedKey ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"}`}><strong className="block text-sm text-slate-900">{item.name}</strong><span className={`text-xs ${item.customized ? "text-emerald-600" : "text-slate-500"}`}>{item.customized ? "Personalizado" : "Padrão"}</span></button>)}</aside>
      {selected && <div className="space-y-5 lg:col-span-9"><section className="rounded-3xl bg-white p-6 shadow-sm"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-xl font-bold">{selected.name}</h2><p className="text-sm text-slate-500">Variáveis: {selected.variables.map((item) => `{{${item}}}`).join(", ")}</p></div><label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={draft.enabled} onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })} className="accent-blue-600" />Ativo</label></div><label className="mb-2 block text-sm font-semibold">Assunto</label><input value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} className="ui-input mb-5 w-full" /><label className="mb-2 block text-sm font-semibold">Conteúdo HTML</label><textarea rows="12" value={draft.html_body} onChange={(e) => setDraft({ ...draft, html_body: e.target.value })} className="ui-input w-full font-mono text-sm" /><label className="mb-2 mt-5 block text-sm font-semibold">Versão em texto simples (opcional)</label><textarea rows="4" value={draft.text_body} onChange={(e) => setDraft({ ...draft, text_body: e.target.value })} className="ui-input w-full" /><div className="mt-5 flex gap-2"><button onClick={save} disabled={saving} className="rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white disabled:opacity-60">{saving ? "A guardar..." : "Guardar template"}</button><button onClick={reset} className="rounded-xl border border-slate-300 px-5 py-2.5 font-semibold text-slate-700">Repor padrão</button></div></section><section className="rounded-3xl bg-white p-6 shadow-sm"><h2 className="mb-2 font-bold">Pré-visualização</h2><p className="mb-4 text-sm text-slate-500"><strong>Assunto:</strong> {draft.subject.replace(/{{\s*([a-z0-9_]+)\s*}}/gi, (_, key) => samples[key] || `{{${key}}}`)}</p><div className="rounded-2xl border border-slate-200 p-5" dangerouslySetInnerHTML={{ __html: preview }} /></section></div>}
    </div>}
  </div></main></div>;
}
