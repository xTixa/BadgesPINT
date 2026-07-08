import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import api from "/src/api";
import Sidebar from "../layout/Sidebar";

export default function CriarTicket() {
  const { t } = useTranslation();
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const sidebarUser = {
    role: storedUser.role || "consultant",
    name: storedUser.name || storedUser.nome || t("criarTicket.defaultUserName"),
  };

  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    categoria: "outro",
    prioridade: "media",
  });

  const categoriasOptions = [
    { value: "bug", label: `🐛 ${t("criarTicket.categories.bug")}` },
    { value: "feature", label: `✨ ${t("criarTicket.categories.feature")}` },
    { value: "duvida", label: `❓ ${t("criarTicket.categories.question")}` },
    { value: "outro", label: `📝 ${t("criarTicket.categories.other")}` },
  ];

  const prioridadeOptions = [
    { value: "baixa", label: `🟢 ${t("criarTicket.priorities.low")}` },
    { value: "media", label: `🟡 ${t("criarTicket.priorities.medium")}` },
    { value: "alta", label: `🔴 ${t("criarTicket.priorities.high")}` },
    { value: "critica", label: `🔴🔴 ${t("criarTicket.priorities.critical")}` },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErro("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro("");
    setSucesso(false);

    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        "/api/tickets",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setSucesso(true);
        setFormData({
          titulo: "",
          descricao: "",
          categoria: "outro",
          prioridade: "media",
        });
        setTimeout(() => setSucesso(false), 3000);
      }
    } catch (err) {
      setErro(err.response?.data?.message || t("criarTicket.errors.createFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-shell">
      <Sidebar user={sidebarUser} />

      <main className="admin-main px-4 py-4 sm:px-5 md:px-6">
      <div className="mb-8">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-800 sm:text-3xl">
          <i className="bi bi-ticket"></i>
          {t("criarTicket.title")}
        </h2>
        <p className="mt-1 text-sm text-slate-500 sm:text-base">
          {t("criarTicket.subtitle")}
        </p>
      </div>

      {sucesso && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700" role="alert">
          <i className="bi bi-check-circle mr-2"></i> {t("criarTicket.success")}
        </div>
      )}
      {erro && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
          <i className="bi bi-exclamation-circle mr-2"></i> {erro}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="titulo" className="mb-2 block text-sm font-semibold text-slate-800 sm:text-base">
              {t("criarTicket.form.titleLabel")} <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200 sm:text-base"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              placeholder={t("criarTicket.form.titlePlaceholder")}
              required
            />
            <small className="text-xs text-slate-500 sm:text-sm">
              {formData.titulo.length}/100
            </small>
          </div>

          <div className="mb-3">
            <label htmlFor="descricao" className="mb-2 block text-sm font-semibold text-slate-800 sm:text-base">
              {t("criarTicket.form.descriptionLabel")} <span style={{ color: "red" }}>*</span>
            </label>
            <textarea
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200 sm:text-base"
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              placeholder={t("criarTicket.form.descriptionPlaceholder")}
              rows={6}
              style={{ fontFamily: "inherit" }}
              required
            />
            <small className="text-xs text-slate-500 sm:text-sm">
              {formData.descricao.length}/5000
            </small>
          </div>

          <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="categoria" className="mb-2 block text-sm font-semibold text-slate-800 sm:text-base">
                {t("criarTicket.form.categoryLabel")}
              </label>
              <select
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200 sm:text-base"
                id="categoria"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
              >
                {categoriasOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="prioridade" className="mb-2 block text-sm font-semibold text-slate-800 sm:text-base">
                {t("criarTicket.form.priorityLabel")}
              </label>
              <select
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200 sm:text-base"
                id="prioridade"
                name="prioridade"
                value={formData.prioridade}
                onChange={handleChange}
              >
                {prioridadeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl border border-sky-700 bg-sky-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
                  {t("criarTicket.form.sending")}
                </>
              ) : (
                <>
                  <i className="bi bi-send"></i> {t("criarTicket.form.submit")}
                </>
              )}
            </button>
            <button
              type="reset"
              className="inline-flex items-center justify-center rounded-xl border border-slate-400 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:text-base"
              onClick={() => setFormData({ titulo: "", descricao: "", categoria: "outro", prioridade: "media" })}
            >
              <i className="bi bi-arrow-clockwise"></i> {t("criarTicket.form.clear")}
            </button>
          </div>
        </form>

        <div className="mt-8 rounded-xl border border-sky-200 bg-sky-50 p-4">
          <h5 className="mb-2 text-sm font-semibold text-slate-800 sm:text-base">
            <i className="bi bi-lightbulb"></i> {t("criarTicket.tips.title")}
          </h5>
          <ul className="mb-0 list-disc pl-5 text-xs text-slate-500 sm:text-sm">
            <li>{t("criarTicket.tips.item1")}</li>
            <li>{t("criarTicket.tips.item2")}</li>
            <li>{t("criarTicket.tips.item3")}</li>
            <li>{t("criarTicket.tips.item4")}</li>
          </ul>
        </div>
      </div>
      </main>
    </div>
  );
}
