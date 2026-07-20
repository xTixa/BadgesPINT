import { useLanguage } from "../context/LanguageContext";

const LANGUAGES = [
  { code: "pt", label: "PT", flag: "🇵🇹", name: "Português" },
  { code: "en", label: "EN", flag: "🇬🇧", name: "English" },
  { code: "es", label: "ES", flag: "🇪🇸", name: "Español" },
];

export default function LanguageSwitcher({ className = "" }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={`flex items-center gap-1 rounded-xl border border-[#0F62FE]/20 bg-white p-1 text-xs font-bold shadow-sm ${className}`}
      role="group"
      aria-label="Idioma / Language"
    >
      {LANGUAGES.map(({ code, flag, name }) => (
        <button
          key={code}
          type="button"
          onClick={() => setLanguage(code)}
          aria-pressed={language === code}
          aria-label={name}
          title={name}
          className={`rounded-lg px-2.5 py-1.5 text-base leading-none transition ${
            language === code
              ? "bg-[#0F62FE]/10 ring-2 ring-[#0F62FE]"
              : "opacity-60 hover:opacity-100"
          }`}
        >
          <span aria-hidden="true">{flag}</span>
        </button>
      ))}
    </div>
  );
}
