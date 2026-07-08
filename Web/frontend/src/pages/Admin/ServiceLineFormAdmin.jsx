import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Sidebar from "../../layout/Sidebar";
import api from "/src/api";

export default function ServiceLineFormAdmin() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isNovo = id === "novo";

  const learningPathIdFromQuery = searchParams.get("learning_path_id") || "";

  const [form, setForm] = useState({
    name: "",
    description: "",
    learning_path_id: learningPathIdFromQuery,
  });
  const [learningPaths, setLearningPaths] = useState([]);
  const [loading, setLoading] = useState(!isNovo);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get("/learning-paths").then(({ data }) => setLearningPaths(data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (isNovo) return;

    api
      .get(`/api/service-lines/${id}`)
      .then(({ data }) => {
        setForm({
          name: data.name || "",
          description: data.description || "",
          learning_path_id: data.learning_path_id || "",
        });
      })
      .catch(() => {
        setError(t("admin.serviceLineForm.errorLoading"));
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNovo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (isNovo) {
        await api.post("/api/service-lines", form);
      } else {
        await api.put(`/api/service-lines/${id}`, form);
      }
      navigate("/admin/gestao-learning-paths");
    } catch (err) {
      setError(err.response?.data?.error || t("admin.serviceLineForm.errorSaving"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "admin", name: "Admin" }} />

      <main className="admin-main bg-gradient-to-b from-[#F8FBFF] to-[#EEF6FF]">
        <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F62FE] via-[#16558C] to-[#00AEEF] p-8 text-white shadow-[0_12px_40px_rgba(15,98,254,0.20)]">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10"></div>
          <div className="relative z-10">
            <p className="mb-2 text-sm font-medium text-white/80">{t("admin.common.adminPanel")}</p>
            <h1 className="text-3xl font-bold text-white">
              {isNovo ? t("admin.serviceLineForm.createTitle") : t("admin.serviceLineForm.editTitle")}
            </h1>
            <p className="mt-2 max-w-2xl text-white/85">{t("admin.serviceLineForm.subtitle")}</p>
          </div>
        </section>

        <div className="rounded-3xl border border-[#0F62FE]/10 bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
          {loading ? (
            <p className="py-10 text-center text-sm text-slate-500">{t("admin.common.loading")}</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t("admin.serviceLineForm.learningPathLabel")}
                </label>
                <select
                  name="learning_path_id"
                  value={form.learning_path_id}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/20"
                >
                  <option value="" disabled>
                    {t("admin.serviceLineForm.selectLearningPath")}
                  </option>
                  {learningPaths.map((lp) => (
                    <option key={lp.id} value={lp.id}>
                      {lp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t("admin.serviceLineForm.nameLabel")}
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t("admin.serviceLineForm.descriptionLabel")}
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => navigate("/admin/gestao-learning-paths")}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  {t("admin.common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#0F62FE] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0F52D4] disabled:opacity-60"
                >
                  {saving ? t("admin.common.saving") : t("admin.common.save")}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
