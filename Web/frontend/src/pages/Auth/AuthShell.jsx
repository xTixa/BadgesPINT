import logo from "/src/assets/logo.png";

const particles = Array.from({ length: 14 }, (_, index) => index);

export default function AuthShell({
  eyebrow = "Softinsa Badges",
  title,
  description,
  asideTitle,
  asideText,
  asideNote,
  children,
  wide = false,
}) {
  return (
    <main className="auth-screen">
      <div className="auth-grid"></div>
      <div className="auth-particles" aria-hidden="true">
        {particles.map((particle) => (
          <span key={particle} style={{ "--i": particle }}></span>
        ))}
      </div>

      <section className={`auth-card ${wide ? "auth-card-wide" : ""}`}>
        <aside className="auth-aside">
          <span className="auth-eyebrow">{eyebrow}</span>
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
