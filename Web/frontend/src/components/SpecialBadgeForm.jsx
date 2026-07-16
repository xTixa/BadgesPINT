import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "/src/api";

export default function SpecialBadgeForm({ Layout, layoutProps = {}, catalogPath }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    description: "",
    area_id: "",
    level: "Junior",
    points: 100,
    image_url: "",
    special_deadline: ""
  });
  const [requirements, setRequirements] = useState([
    { title: "", code: "A1", description: "", image_url: "" }
  ]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/api/areas").then((res) => setAreas(res.data || [])).catch(() => setAreas([]));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const updateRequirement = (index, field, value) => {
    setRequirements((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  };

  const addRequirement = () => {
    setRequirements((prev) => [...prev, { title: "", code: `A${prev.length + 1}`, description: "", image_url: "" }]);
  };

  const removeRequirement = (index) => {
    setRequirements((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.special_deadline || new Date(form.special_deadline) <= new Date()) {
      setError(t("specialBadgeForm.deadlineRequired"));
      return;
    }

    const payload = {
      ...form,
      area_id: Number(form.area_id),
      points: Number(form.points),
      special_deadline: new Date(form.special_deadline).toISOString(),
      requirements
    };

    try {
      setLoading(true);
      await api.post("/api/special-badges", payload);
      navigate(catalogPath, { state: { specialBadgeCreated: true } });
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || t("specialBadgeForm.saveFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title={t("specialBadgeForm.title")} subtitle={t("specialBadgeForm.subtitle")} {...layoutProps}>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>
          )}

          <div className="mb-3">
            <label className="mb-1 block text-sm font-semibold text-slate-700">{t("admin.badgeForm.badgeNameLabel")}</label>
            <input
              type="text"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
              name="description"
              value={form.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">{t("admin.badgeForm.areaLabel")}</label>
              <select
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                name="area_id"
                value={form.area_id}
                onChange={handleChange}
                required
              >
                <option value="">{t("admin.badgeForm.selectArea")}</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">{t("admin.badgeForm.levelLabel")}</label>
              <select
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                name="level"
                value={form.level}
                onChange={handleChange}
              >
                <option value="Junior">Junior</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Senior">Senior</option>
                <option value="Especialista">Especialista</option>
                <option value="Lider">Lider</option>
              </select>
            </div>
          </div>

          <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">{t("admin.badgeForm.pointsLabel")}</label>
              <input
                type="number"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                name="points"
                value={form.points}
                onChange={handleChange}
                min="0"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">{t("admin.badgeForm.imageUrlLabel")}</label>
              <input
                type="text"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                name="image_url"
                value={form.image_url}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="mb-3 rounded-2xl border-2 border-amber-200 bg-amber-50 p-4">
            <label className="mb-1 block text-sm font-semibold text-amber-900">{t("specialBadgeForm.deadlineLabel")}</label>
            <input
              type="datetime-local"
              className="w-full max-w-xs rounded-xl border border-amber-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
              name="special_deadline"
              value={form.special_deadline}
              onChange={handleChange}
              required
            />
            <p className="mt-1 text-xs text-amber-800">{t("specialBadgeForm.deadlineHint")}</p>
          </div>

          <div className="mt-2 border-t border-slate-200 pt-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h6 className="m-0 text-sm font-semibold text-slate-900 sm:text-base">{t("admin.badgeForm.levelRequirements")}</h6>
              <button type="button" className="rounded-lg border border-sky-600 px-3 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-50" onClick={addRequirement}>
                <i className="bi bi-plus-circle mr-1"></i>
                {t("admin.badgeForm.addRequirement")}
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {requirements.map((req, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                    <div className="md:col-span-4">
                      <label className="mb-1 block text-sm font-semibold text-slate-700">{t("admin.badgeForm.requirementTitleLabel")}</label>
                      <input
                        type="text"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                        value={req.title}
                        onChange={(e) => updateRequirement(idx, "title", e.target.value)}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-sm font-semibold text-slate-700">{t("admin.badgeForm.requirementCodeLabel")}</label>
                      <input
                        type="text"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                        value={req.code}
                        onChange={(e) => updateRequirement(idx, "code", e.target.value)}
                        required
                      />
                    </div>
                    <div className="md:col-span-6">
                      <label className="mb-1 block text-sm font-semibold text-slate-700">{t("admin.badgeForm.imageUrlLabel")}</label>
                      <input
                        type="text"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                        value={req.image_url}
                        onChange={(e) => updateRequirement(idx, "image_url", e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="md:col-span-12">
                      <label className="mb-1 block text-sm font-semibold text-slate-700">{t("admin.badgeForm.requirementDescriptionLabel")}</label>
                      <textarea
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                        rows="2"
                        value={req.description}
                        onChange={(e) => updateRequirement(idx, "description", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      className="rounded-lg border border-rose-500 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                      onClick={() => removeRequirement(idx)}
                      disabled={requirements.length === 1}
                    >
                      {t("admin.common.remove")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              onClick={() => navigate(catalogPath)}
            >
              {t("admin.common.cancel")}
            </button>
            <button
              type="submit"
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
              disabled={loading}
            >
              {loading ? t("specialBadgeForm.creating") : t("specialBadgeForm.createButton")}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
