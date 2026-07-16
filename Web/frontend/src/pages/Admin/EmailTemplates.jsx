import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "/src/api";
import Sidebar from "../../layout/Sidebar";
import EmptyState from "../../components/ui/EmptyState";
import AdminPageTitle from "../../components/ui/AdminPageTitle";

const defaults = {
  password_reset: ["Redefinir password - Badges Softinsa", "<h2>OlÃƒÂ¡ {{name}},</h2><p>Recebemos um pedido para redefinir a tua password.</p><p><a href=\"{{reset_url}}\">Criar nova password</a></p>"],
  temporary_password: ["Acesso ÃƒÂ  plataforma de Badges Softinsa", "<h2>OlÃƒÂ¡ {{name}},</h2><p>A tua conta foi criada.</p><p><strong>Email:</strong> {{email}}<br><strong>Password temporÃƒÂ¡ria:</strong> {{temporary_password}}</p><p><a href=\"{{login_url}}\">Entrar na plataforma</a></p>"],
  badge_application: ["Candidatura recebida - {{badge_name}}", "<h2>OlÃƒÂ¡ {{name}},</h2><p>Recebemos a tua candidatura ao badge <strong>{{badge_name}}</strong>.</p>"],
  sl_validation: ["Pedido de badge aguarda aprovaÃƒÂ§ÃƒÂ£o", "<h2>OlÃƒÂ¡ {{name}},</h2><p>O pedido de <strong>{{badge_name}}</strong> submetido por {{consultant_name}} aguarda a tua aprovaÃƒÂ§ÃƒÂ£o.</p>"],
  badge_approved: ["Badge aprovado - {{badge_name}}", "<h2>OlÃƒÂ¡ {{name}},</h2><p>O badge <strong>{{badge_name}}</strong> foi aprovado.</p><p><a href=\"{{dashboard_url}}\">Abrir dashboard</a></p>"],
  badge_rejected: ["Pedido rejeitado - {{badge_name}}", "<h2>OlÃƒÂ¡ {{name}},</h2><p>O pedido para <strong>{{badge_name}}</strong> foi rejeitado.</p><p>{{comment}}</p><p><a href=\"{{dashboard_url}}\">Ver pedido</a></p>"],
  badge_returned: ["Pedido devolvido - {{badge_name}}", "<h2>OlÃƒÂ¡ {{name}},</h2><p>O pedido para <strong>{{badge_name}}</strong> foi devolvido para retificaÃƒÂ§ÃƒÂ£o.</p><p>{{comment}}</p>"],
  goal_reminder: ["Lembrete de objetivo", "<h2>OlÃƒÂ¡ {{name}},</h2><p>O objetivo <strong>{{goal_text}}</strong> termina em {{goal_deadline}}.</p><p><a href=\"{{dashboard_url}}\">Rever objetivo</a></p>"],
  sla_alert: ["Alerta de SLA - {{badge_name}}", "<h2>OlÃƒÂ¡ {{name}},</h2><p>O pedido de {{badge_name}} por {{consultant_name}} ultrapassou {{hours_limit}} horas.</p><p>Estado: {{workflow_status}}</p>"],
};
const samples = { name: "Joana Silva", email: "joana.silva@softinsa.pt", badge_name: "Cloud Specialist", consultant_name: "Miguel Costa", comment: "RevÃƒÂª a evidÃƒÂªncia submetida.", dashboard_url: "#", reset_url: "#", login_url: "#", temporary_password: "Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢", goal_text: "Conquistar 3 badges", goal_deadline: "30/09/2026", hours_limit: "48", workflow_status: "Em validaÃƒÂ§ÃƒÂ£o" };

export default function Configuracoes() {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState([]);
  const [selectedKey, setSelectedKey] = useState("");
  const [draft, setDraft] = useState({ subject: "", html_body: "", text_body: "", enabled: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const selected = templates.find((item) => item.key === selectedKey);
  const load = () => api.get("/api/admin/email/templates").then((res) => { setTemplates(res.data); setSelectedKey((key) => key || res.data[0]?.key || ""); }).finally(() => setLoading(false));
  useEffect(() => { load().catch(() => setMessage(t("admin.emailTemplates.errors.loadFailed"))); }, [t]);
  useEffect(() => {
    if (!selected) return;
    const fallback = defaults[selected.key] || ["Badges Softinsa", "<p>OlÃƒÂ¡ {{name}},</p>"];
    setDraft({ subject: selected.subject || fallback[0], html_body: selected.html_body || fallback[1], text_body: selected.text_body || "", enabled: selected.customized ? selected.enabled : true });
  }, [selected]);
  const preview = useMemo(() => draft.html_body.replace(/{{\s*([a-z0-9_]+)\s*}}/gi, (_, key) => samples[key] || `{{${key}}}`), [draft.html_body]);
  const save = async () => { try { setSaving(true); await api.put(`/api/admin/email/templates/${selectedKey}`, draft); setMessage(t("admin.emailTemplates.success.saved")); await load(); } catch (err) { setMessage(err.response?.data?.message || t("admin.emailTemplates.errors.saveFailed")); } finally { setSaving(false); } };
  const reset = async () => { if (!window.confirm(t("admin.emailTemplates.confirmReset"))) return; await api.delete(`/api/admin/email/templates/${selectedKey}`); setMessage(t("admin.emailTemplates.success.reset")); await load(); };

  return <div className="admin-shell"><Sidebar user={{ role: "admin", name: "Admin" }} /><main className="admin-main bg-[#F6F8FA]"><div className="w-full space-y-6">
    <AdminPageTitle title={t("admin.emailTemplates.title")} subtitle={t("admin.emailTemplates.subtitle")} />
    {message && <div className="rounded-xl border border-[#CFE0FB] bg-[#EAF2FF] p-3 text-sm text-[#0F62FE]">{message}</div>}
    {loading ? <EmptyState message={t("admin.emailTemplates.loading")} icon="bi-hourglass-split" /> : <div className="grid gap-5 lg:grid-cols-12"><aside className="space-y-2 lg:col-span-3">{templates.map((item) => <button key={item.key} onClick={() => setSelectedKey(item.key)} className={`w-full rounded-2xl border p-4 text-left transition ${item.key === selectedKey ? "border-[#CFE0FB] bg-[#EAF2FF]" : "border-slate-200 bg-white hover:bg-[#F8FBFF]"}`}><strong className="block text-sm text-slate-900">{item.name}</strong><span className={`text-xs ${item.customized ? "text-emerald-600" : "text-slate-500"}`}>{item.customized ? t("admin.emailTemplates.customized") : t("admin.emailTemplates.defaultLabel")}</span></button>)}</aside>
      {selected && <div className="space-y-5 lg:col-span-9"><section className="rounded-3xl border border-slate-200 bg-white p-6"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-xl font-semibold">{selected.name}</h2><p className="text-sm text-slate-500">{t("admin.emailTemplates.variables")}: {selected.variables.map((item) => `{{${item}}}`).join(", ")}</p></div><label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={draft.enabled} onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })} className="accent-[#0F62FE]" />{t("admin.emailTemplates.active")}</label></div><label className="mb-2 block text-sm font-semibold">{t("admin.emailTemplates.subject")}</label><input value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} className="ui-input mb-5 w-full" /><label className="mb-2 block text-sm font-semibold">{t("admin.emailTemplates.htmlContent")}</label><textarea rows="12" value={draft.html_body} onChange={(e) => setDraft({ ...draft, html_body: e.target.value })} className="ui-input w-full font-mono text-sm" /><label className="mb-2 mt-5 block text-sm font-semibold">{t("admin.emailTemplates.plainTextVersion")}</label><textarea rows="4" value={draft.text_body} onChange={(e) => setDraft({ ...draft, text_body: e.target.value })} className="ui-input w-full" /><div className="mt-5 flex gap-2"><button onClick={save} disabled={saving} className="rounded-xl border border-[#0F62FE] bg-[#0F62FE] px-5 py-2.5 font-semibold text-white transition hover:bg-[#16558C] disabled:opacity-60">{saving ? t("admin.emailTemplates.saving") : t("admin.emailTemplates.saveTemplate")}</button><button onClick={reset} className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 font-semibold text-slate-700 hover:bg-slate-50">{t("admin.emailTemplates.resetDefault")}</button></div></section><section className="rounded-3xl border border-slate-200 bg-white p-6"><h2 className="mb-2 font-semibold">{t("admin.emailTemplates.preview")}</h2><p className="mb-4 text-sm text-slate-500"><strong>{t("admin.emailTemplates.subject")}:</strong> {draft.subject.replace(/{{\s*([a-z0-9_]+)\s*}}/gi, (_, key) => samples[key] || `{{${key}}}`)}</p><div className="rounded-2xl border border-slate-200 bg-[#F8FBFF] p-5" dangerouslySetInnerHTML={{ __html: preview }} /></section></div>}
    </div>}
  </div></main></div>;
}
