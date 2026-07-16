import Sidebar from "../../layout/Sidebar";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "/src/api";
import AdminPageTitle from "../../components/ui/AdminPageTitle";

function toDatetimeLocalValue(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function BadgeFormAdmin() {
  const { t } = useTranslation();
  const { id } = useParams(); // "novo" ou um id numÃ©rico
  const navigate = useNavigate();

  const isNovo = id === "novo";

  // Estado do formulÃ¡rio
  const [form, setForm] = useState({
    description: "",
    area_id: "",
    level: "Junior",
    points: 100,
    expiry_days: "",
    image_url: "",
    special_deadline: ""
  });

  const [requirements, setRequirements] = useState([
    { title: "", code: "A1", description: "", image_url: "" }
  ]);

  const [learningOutcomes, setLearningOutcomes] = useState([""]);

  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState("");

  // SimulaÃ§Ã£o de carga de dados quando Ã© ediÃ§Ã£o
  useEffect(() => {
    const token = localStorage.getItem("token");

    const loadAreas = async () => {
      try {
        const res = await api.get("/api/areas");
        setAreas(res.data || []);
      } catch (err) {
        console.error("Erro ao carregar Ã¡reas:", err);
      }
    };

    const loadBadge = async () => {
      if (isNovo) return;
      try {
        const res = await api.get(`/api/admin/badges/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const badge = res.data;
        setForm({
          description: badge.description || "",
          area_id: badge.area_id || "",
          level: badge.level || "Junior",
          points: badge.points || 0,
          expiry_days: badge.expiry_days || "",
          image_url: badge.image_url || "",
          special_deadline: toDatetimeLocalValue(badge.special_deadline)
        });

        const reqs = (badge.requirements || []).map((r, idx) => ({
          title: r.title || "",
          code: r.code || `A${idx + 1}`,
          description: r.description || "",
          image_url: r.image_url || ""
        }));
        setRequirements(reqs.length ? reqs : [{ title: "", code: "A1", description: "", image_url: "" }]);

        const outcomes = Array.isArray(badge.learning_outcomes) ? badge.learning_outcomes.filter(Boolean) : [];
        setLearningOutcomes(outcomes.length ? outcomes : [""]);
      } catch (err) {
        console.error("Erro ao carregar badge:", err);
      }
    };

    loadAreas();
    loadBadge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNovo, id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) return alert(t("admin.badgeForm.errors.noToken"));

    const payload = {
      ...form,
      area_id: Number(form.area_id),
      points: Number(form.points),
      expiry_days: form.expiry_days ? Number(form.expiry_days) : null,
      special_deadline: form.special_deadline ? new Date(form.special_deadline).toISOString() : null,
      learning_outcomes: learningOutcomes.map((o) => o.trim()).filter(Boolean),
      requirements
    };

    try {
      setLoading(true);
      if (isNovo) {
        await api.post("/api/admin/badges", payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await api.put(`/api/admin/badges/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      navigate("/admin/gestao-badges");
    } catch (err) {
      console.error("Erro ao guardar badge:", err);
      alert(err.response?.data?.error || err.response?.data?.message || t("admin.badgeForm.errors.saveFailed"));
    } finally {
      setLoading(false);
    }

    if (isNovo) {
      // POST /admin/badges
      console.log("Criar badge:", form);
    } else {
      // PUT /admin/badges/:id
      console.log("Atualizar badge:", id, form);
    }

  };

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleBadgeImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError(t("admin.badgeForm.errors.selectImageFile"));
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setImageError(t("admin.badgeForm.errors.imageTooLarge"));
      return;
    }

    try {
      setImageUploading(true);
      setImageError("");
      const image = await readFileAsDataUrl(file);
      const res = await api.post("/api/admin/badges/upload-image", {
        image,
        folder: "badges",
      });
      setForm((prev) => ({ ...prev, image_url: res.data.url }));
    } catch (err) {
      console.error("Erro ao enviar imagem:", err);
      setImageError(err.response?.data?.error || t("admin.badgeForm.errors.uploadFailed"));
    } finally {
      setImageUploading(false);
      event.target.value = "";
    }
  };

  const updateRequirement = (index, field, value) => {
    setRequirements((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  };

  const addRequirement = () => {
    setRequirements((prev) => [
      ...prev,
      { title: "", code: `A${prev.length + 1}`, description: "", image_url: "" }
    ]);
  };

  const removeRequirement = (index) => {
    setRequirements((prev) => prev.filter((_, i) => i !== index));
  };

  const updateLearningOutcome = (index, value) => {
    setLearningOutcomes((prev) => prev.map((o, i) => (i === index ? value : o)));
  };

  const addLearningOutcome = () => {
    setLearningOutcomes((prev) => [...prev, ""]);
  };

  const removeLearningOutcome = (index) => {
    setLearningOutcomes((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "admin", name: "Admin" }} />

      <main className="admin-main bg-[#F6F8FA]">
        <AdminPageTitle title={isNovo ? t("admin.badgeForm.createTitle") : t("admin.badgeForm.editTitle")} />

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <form onSubmit={handleSubmit}>
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

            <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-3">
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
                <label className="mb-1 block text-sm font-semibold text-slate-700">{t("admin.badgeForm.expiryLabel")}</label>
                <input
                  type="number"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                  name="expiry_days"
                  value={form.expiry_days}
                  onChange={handleChange}
                  min="0"
                  placeholder={t("admin.badgeForm.optionalPlaceholder")}
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

            <div className="mb-3">
              <label className="mb-1 block text-sm font-semibold text-slate-700">{t("admin.badgeForm.specialDeadlineLabel")}</label>
              <input
                type="datetime-local"
                className="w-full max-w-xs rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                name="special_deadline"
                value={form.special_deadline}
                onChange={handleChange}
              />
              <p className="mt-1 text-xs text-slate-500">{t("admin.badgeForm.specialDeadlineHint")}</p>
            </div>

            <div className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-[96px_minmax(0,1fr)]">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  {form.image_url ? (
                    <img src={form.image_url} alt={t("admin.badgeForm.imagePreviewAlt")} className="h-full w-full object-cover" />
                  ) : (
                    <i className="bi bi-image text-3xl text-slate-300"></i>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    {t("admin.badgeForm.uploadImageLabel")}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBadgeImageUpload}
                    disabled={imageUploading}
                    className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-sky-600 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-sky-700 disabled:opacity-60"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    {t("admin.badgeForm.uploadHint")}
                  </p>
                  {imageUploading && <p className="mt-2 text-sm text-sky-700">{t("admin.badgeForm.uploadingImage")}</p>}
                  {imageError && <p className="mt-2 text-sm text-rose-600">{imageError}</p>}
                </div>
              </div>
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

            <div className="mt-4 border-t border-slate-200 pt-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <h6 className="m-0 text-sm font-semibold text-slate-900 sm:text-base">{t("admin.badgeForm.certifiedSkills")}</h6>
                  <p className="mt-1 text-xs text-slate-500">{t("admin.badgeForm.certifiedSkillsHint")}</p>
                </div>
                <button type="button" className="rounded-lg border border-sky-600 px-3 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-50" onClick={addLearningOutcome}>
                  <i className="bi bi-plus-circle mr-1"></i>
                  {t("admin.badgeForm.addSkill")}
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {learningOutcomes.map((outcome, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                      value={outcome}
                      onChange={(e) => updateLearningOutcome(idx, e.target.value)}
                      placeholder={t("admin.badgeForm.skillPlaceholder")}
                    />
                    <button
                      type="button"
                      className="shrink-0 rounded-lg border border-rose-500 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                      onClick={() => removeLearningOutcome(idx)}
                      disabled={learningOutcomes.length === 1}
                    >
                      {t("admin.common.remove")}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => navigate("/admin/badges")}
              >
                {t("admin.common.cancel")}
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#16558C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#16558C]"
                disabled={loading}
              >
                {loading ? t("admin.common.saving") : t("admin.common.save")}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}


