import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../api";
import logo from "/src/assets/logo.png";

export default function TermosRgpd() {
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    api
      .get("/api/public/rgpd-text")
      .then((res) => {
        if (!active) return;
        setText(res.data?.rgpd_consent_text || "");
      })
      .catch((err) => {
        console.error("Erro ao carregar termos de RGPD:", err);
        if (active) setError(t("termosRgpd.loadError"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [t]);

  return (
    <div className="min-h-screen bg-[#F2F2F2] px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
        <img src={logo} alt="Softinsa" className="mb-6 h-8" />
        <h1 className="text-2xl font-extrabold text-slate-950">{t("termosRgpd.title")}</h1>
        <p className="mt-2 text-sm text-slate-500">{t("termosRgpd.subtitle")}</p>

        <div className="mt-6 border-t border-slate-100 pt-6">
          {loading ? (
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-[#0F62FE]"></div>
              {t("termosRgpd.loading")}
            </div>
          ) : error ? (
            <p className="text-sm font-semibold text-rose-600">{error}</p>
          ) : text ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{text}</p>
          ) : (
            <p className="text-sm text-slate-500">{t("termosRgpd.empty")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
