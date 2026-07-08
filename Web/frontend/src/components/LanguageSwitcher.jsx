import { useLanguage } from "../context/LanguageContext";

const LANGUAGES = [
  { code: "pt", label: "PT" },
  { code: "en", label: "EN" },
];

export default function LanguageSwitcher({ className = "" }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={`flex items-center gap-1 rounded-xl border border-[#0F62FE]/20 bg-white p-1 text-xs font-bold shadow-sm ${className}`}
      role="group"
      aria-label="Idioma / Language"
    >
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => setLanguage(code)}
          aria-pressed={language === code}
          className={`rounded-lg px-2.5 py-1.5 transition ${
            language === code
              ? "bg-[#0F62FE] text-white"
              : "text-slate-600 hover:bg-[#0F62FE]/10 hover:text-[#0F62FE]"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
