import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "/src/api";
import Sidebar from "../../layout/Sidebar";
import EmptyState from "../../components/ui/EmptyState";

export default function ConsultorSettingsPage() {
  const { t } = useTranslation();
  const [signature, setSignature] = useState(null);
  const [enabled, setEnabled] = useState(false);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const selectionKey = selected.join(",");

  const apply = (data) => {
    setSignature(data);
    setEnabled(Boolean(data.enabled));
    setSelected(data.selected_badge_ids || []);
  };
  useEffect(() => {
    api.get("/api/consultor/email-signature").then((res) => apply(res.data))
      .catch(() => setError(t("consultor.emailSignature.loadError")))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => {
    if (loading) return undefined;
    const timer = window.setTimeout(() => {
      const badgeIds = selectionKey ? selectionKey.split(",").map(Number) : [];
      api.post("/api/consultor/email-signature/preview", { badge_ids: badgeIds })
        .then((res) => setSignature(res.data))
        .catch(() => setError(t("consultor.emailSignature.previewError")));
    }, 180);
    return () => window.clearTimeout(timer);
  }, [loading, selectionKey, t]);

  const toggleBadge = (id) => setSelected((current) => current.includes(id)
    ? current.filter((item) => item !== id)
    : current.length < 6 ? [...current, id] : current);
  const save = async () => {
    try {
      setSaving(true); setError("");
      const res = await api.put("/api/consultor/email-signature", { enabled, badge_ids: selected });
      apply(res.data); setMessage(t("consultor.emailSignature.saved"));
      window.setTimeout(() => setMessage(""), 2500);
    } catch (err) { setError(err.response?.data?.message || t("consultor.emailSignature.saveError")); }
    finally { setSaving(false); }
  };
  const copy = async () => {
    try {
      if (window.ClipboardItem) {
        await navigator.clipboard.write([new ClipboardItem({ "text/html": new Blob([signature.html], { type: "text/html" }), "text/plain": new Blob([signature.plain_text], { type: "text/plain" }) })]);
      } else await navigator.clipboard.writeText(signature.html);
      setMessage(t("consultor.emailSignature.copied"));
    } catch { window.prompt(t("consultor.emailSignature.copyHtmlPrompt"), signature.html); }
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([signature.html], { type: "text/html;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "assinatura-badges.html"; link.click(); URL.revokeObjectURL(url);
  };

  return <div className="admin-shell"><Sidebar user={{ role: "consultant", name: "Consultant" }} /><main className="admin-main bg-gradient-to-b from-[#F8FBFF] to-[#EEF6FF]"><div className="space-y-6">
    <section className="rounded-3xl border border-[#CFE0FB] bg-[#EAF2FF] p-8 text-slate-900"><p className="text-sm text-slate-500">{t("consultor.common.consultantArea")}</p><h1 className="mt-1 text-3xl font-bold text-slate-900">{t("consultor.emailSignature.title")}</h1><p className="mt-2 text-slate-600">{t("consultor.emailSignature.subtitle")}</p></section>
    {loading ? <EmptyState message={t("consultor.emailSignature.loading")} icon="bi-hourglass-split" /> : error && !signature ? <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</div> : <>
      {(message || error) && <div className={`rounded-xl border p-3 text-sm ${error ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{error || message}</div>}
      <div className="grid gap-6 xl:grid-cols-2"><section className="rounded-3xl bg-white p-6 shadow-sm"><label className="mb-6 flex items-center justify-between rounded-2xl border border-slate-200 p-4"><div><div className="font-bold text-slate-900">{t("consultor.emailSignature.enableSignature")}</div><p className="text-sm text-slate-500">{t("consultor.emailSignature.enableSignatureHint")}</p></div><input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="h-5 w-5 accent-blue-600" /></label><div className="mb-3 flex items-center justify-between"><h2 className="font-bold">{t("consultor.emailSignature.badgesInSignature")}</h2><span className="text-xs text-slate-500">{selected.length}/6</span></div><div className="space-y-2">{signature.available_badges.map((badge) => <button type="button" key={badge.id} onClick={() => toggleBadge(Number(badge.id))} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left ${selected.includes(Number(badge.id)) ? "border-blue-500 bg-blue-50" : "border-slate-200"}`}>{badge.image_url ? <img src={badge.image_url} alt="" className="h-10 w-10 object-contain" /> : <i className="bi bi-patch-check-fill text-2xl text-blue-600" />}<span className="flex-1"><strong className="block text-sm">{badge.name}</strong><span className="text-xs text-slate-500">{badge.level}</span></span>{selected.includes(Number(badge.id)) && <i className="bi bi-check-circle-fill text-blue-600" />}</button>)}{!signature.available_badges.length && <EmptyState message={t("consultor.emailSignature.noBadgesObtained")} icon="bi-award" />}</div><button onClick={save} disabled={saving} className="mt-5 w-full rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white disabled:opacity-60">{saving ? t("consultor.emailSignature.saving") : t("consultor.emailSignature.saveSignature")}</button></section>
      <section className="rounded-3xl bg-white p-6 shadow-sm"><h2 className="mb-4 font-bold">{t("consultor.emailSignature.preview")}</h2><div className="min-h-56 rounded-2xl border border-slate-200 bg-white p-5" dangerouslySetInnerHTML={{ __html: signature.html }} /><div className="mt-5 flex flex-wrap gap-2"><button onClick={copy} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"><i className="bi bi-copy mr-2" />{t("consultor.emailSignature.copyToEmail")}</button><button onClick={download} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"><i className="bi bi-download mr-2" />{t("consultor.emailSignature.downloadHtml")}</button></div><p className="mt-4 text-xs text-slate-500">{t("consultor.emailSignature.afterCopyHint")}</p></section></div>
    </>}
  </div></main></div>;
}
