const FLAGS = {
  pt: (
    <svg viewBox="0 0 20 14" width="20" height="14" role="img" aria-hidden="true">
      <rect width="20" height="14" fill="#FF0000" />
      <rect width="8" height="14" fill="#006600" />
      <circle cx="8" cy="7" r="3" fill="#FFCC00" stroke="#FF0000" strokeWidth="0.5" />
    </svg>
  ),
  en: (
    <svg viewBox="0 0 20 14" width="20" height="14" role="img" aria-hidden="true">
      <rect width="20" height="14" fill="#012169" />
      <path d="M0,0 L20,14 M20,0 L0,14" stroke="#FFFFFF" strokeWidth="2.4" />
      <path d="M0,0 L20,14 M20,0 L0,14" stroke="#C8102E" strokeWidth="1" />
      <path d="M10,0 V14 M0,7 H20" stroke="#FFFFFF" strokeWidth="4" />
      <path d="M10,0 V14 M0,7 H20" stroke="#C8102E" strokeWidth="2.4" />
    </svg>
  ),
  es: (
    <svg viewBox="0 0 20 14" width="20" height="14" role="img" aria-hidden="true">
      <rect width="20" height="14" fill="#AA151B" />
      <rect y="3.5" width="20" height="7" fill="#F1BF00" />
    </svg>
  ),
};

export default function FlagIcon({ code, className = "" }) {
  return (
    <span className={`inline-block overflow-hidden rounded-sm ${className}`}>
      {FLAGS[code] || null}
    </span>
  );
}
