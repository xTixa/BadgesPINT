import { useEffect, useState } from "react";
import api from "/src/api";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthShell from "./AuthShell";

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome: "",
    email: "",
    area_id: "",
    rgpd: false,
  });

  const [areas, setAreas] = useState([]);
  const [loadingAreas, setLoadingAreas] = useState(true);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchAreas() {
      try {
        const res = await api.get("/api/areas");
        if (active) setAreas(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Erro ao carregar areas:", err);
        if (active) setErro(t("auth.register.errors.loadAreasFailed"));
      } finally {
        if (active) setLoadingAreas(false);
      }
    }

    fetchAreas();
    return () => {
      active = false;
    };
  }, [t]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro("");
    setMensagem("");

    try {
      if (!form.area_id) {
        setErro(t("auth.register.errors.areaRequired"));
        setLoading(false);
        return;
      }

      const res = await api.post("/api/users/register", {
        nome: form.nome,
        email: form.email,
        area_id: Number(form.area_id),
        rgpdAccepted: form.rgpd,
      });

      const passwordNote = res.data?.temporaryPassword
        ? ` ${t("auth.register.temporaryPassword", { password: res.data.temporaryPassword })}`
        : "";
      setMensagem(
        `${res.data?.message || t("auth.register.success")}${passwordNote}`,
      );

      setTimeout(() => navigate("/login"), 4000);
    } catch (err) {
      setErro(err.response?.data?.message || t("auth.register.errors.createFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={t("auth.register.title")}
      description={t("auth.register.description")}
      asideTitle={t("auth.register.asideTitle")}
      asideText={t("auth.register.asideText")}
      asideNote={{
        label: t("auth.register.asideNote.label"),
        text: t("auth.register.asideNote.text"),
      }}
      wide
    >
      <form onSubmit={handleSubmit}>
        {erro && <p className="auth-message auth-message-error">{erro}</p>}
        {mensagem && (
          <p className="auth-message auth-message-success">{mensagem}</p>
        )}

        <div className="grid gap-x-4 sm:grid-cols-2">
          <div className="auth-field">
            <label>{t("auth.register.nameLabel")}</label>
            <input
              type="text"
              name="nome"
              required
              className="auth-input"
              value={form.nome}
              onChange={handleChange}
              placeholder={t("auth.register.namePlaceholder")}
            />
          </div>

          <div className="auth-field">
            <label>{t("auth.register.emailLabel")}</label>
            <input
              type="email"
              name="email"
              required
              className="auth-input"
              value={form.email}
              onChange={handleChange}
              placeholder={t("auth.register.emailPlaceholder")}
            />
          </div>
        </div>

        <div className="auth-field">
          <label>{t("auth.register.areaLabel")}</label>
          <select
            name="area_id"
            required
            className="auth-input"
            value={form.area_id}
            onChange={handleChange}
            disabled={loadingAreas}
          >
            <option value="">{loadingAreas ? t("auth.register.loadingAreas") : t("auth.register.selectPlaceholder")}</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <input
            id="rgpd"
            name="rgpd"
            type="checkbox"
            required
            className="mt-1 h-4 w-4 rounded border-gray-300 text-[#0F62FE] focus:ring-[#0F62FE]"
            checked={form.rgpd}
            onChange={(e) => setForm({ ...form, rgpd: e.target.checked })}
          />
          <label htmlFor="rgpd" className="text-sm leading-6 text-slate-700">
            {t("auth.register.rgpdLabel")}
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || loadingAreas || areas.length === 0}
          className="auth-primary-button"
        >
          <i className="bi bi-person-plus"></i>
          {loading ? t("auth.register.creating") : t("auth.register.submit")}
        </button>
      </form>
    </AuthShell>
  );
}
