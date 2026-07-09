import logo from "/src/assets/logo.png";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../../components/LanguageSwitcher";

const particles = Array.from({ length: 14 }, (_, index) => index);

export default function AuthShell({
  eyebrow,
  title,
  description,
  asideTitle,
  asideText,
  asideNote,
  children,
  wide = false,
}) {
  const { t } = useTranslation();
  return (
    <main className="auth-screen">
      <div className="auth-grid"></div>
      <div className="auth-particles" aria-hidden="true">
        {particles.map((particle) => (
          <span key={particle} style={{ "--i": particle }}></span>
        ))}
      </div>

      <section className={`auth-card ${wide ? "auth-card-wide" : ""}`}>
        <LanguageSwitcher className="absolute right-4 top-4 z-20" />

        <aside className="auth-aside">
          <span className="auth-eyebrow">{eyebrow || t("auth.shell.eyebrow")}</span>
          <div>
            <h1>{asideTitle || title}</h1>
            {asideText && <p>{asideText}</p>}
          </div>
          {asideNote && (
            <div className="auth-note">
              <strong>{asideNote.label}</strong>
              {asideNote.text && <p>{asideNote.text}</p>}
              {asideNote.items && (
                <ul className="mt-3 space-y-1">
                  {asideNote.items.map((item) => (
                    <li key={item} className="text-sm leading-6 text-white">
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </aside>

        <div className="auth-form-panel">
          <img src={logo} alt="Softinsa" className="auth-logo" />
          <div className="auth-heading">
            <h2>{title}</h2>
            {description && <p>{description}</p>}
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
