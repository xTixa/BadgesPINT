import { useLanguage } from "../context/LanguageContext";
import FlagIcon from "./ui/FlagIcon";

const LANGUAGES = [
  { code: "pt", name: "Português" },
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
];

export default function LanguageSwitcher({ className = "" }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={`flex items-center gap-1 rounded-xl border border-[#0F62FE]/20 bg-white p-1 text-xs font-bold shadow-sm ${className}`}
      role="group"
      aria-label="Idioma / Language"
    >
      {LANGUAGES.map(({ code, name }) => (
        <button
          key={code}
          type="button"
          onClick={() => setLanguage(code)}
          aria-pressed={language === code}
          aria-label={name}
          title={name}
          className={`flex items-center justify-center rounded-lg p-1.5 transition ${
            language === code
              ? "bg-[#0F62FE]/10 ring-2 ring-[#0F62FE]"
              : "opacity-60 hover:opacity-100"
          }`}
        >
          <FlagIcon code={code} />
        </button>
      ))}
    </div>
  );
}
