export function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function getPublicShareBaseUrl(req) {
  const configuredUrl = process.env.PUBLIC_SITE_URL || process.env.PUBLIC_API_URL || process.env.API_BASE_URL || process.env.APP_BASE_URL;

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  return `${req.protocol}://${req.get("host")}`;
}

export function getPublicImageBaseUrl(req) {
  const configuredUrl = process.env.FRONTEND_URL || process.env.PUBLIC_FRONTEND_URL || process.env.APP_BASE_URL;

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  return `${req.protocol}://${req.get("host")}`;
}

export function renderNotFoundSharePage(message = "Conteudo nao encontrado") {
  return `<!doctype html><html lang="pt"><head><meta charset="UTF-8" /><meta name="robots" content="noindex,nofollow" /><title>${escapeHtml(message)}</title></head><body><h1>${escapeHtml(message)}</h1></body></html>`;
}

// Card de partilha genérico usado tanto para certificados como para perfis públicos.
export function renderSharePage({ ogType = "article", title, description, imageUrl, pageUrl, eyebrow = "BadgesPINT", heading, pills = [], ctaText, ctaHref }) {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeImageUrl = escapeHtml(imageUrl);
  const safePageUrl = escapeHtml(pageUrl);
  const safeHeading = escapeHtml(heading);

  return `<!doctype html>
<html lang="pt">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="index,follow" />
    <meta property="og:type" content="${ogType}" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDescription}" />
    <meta property="og:image" content="${safeImageUrl}" />
    <meta property="og:url" content="${safePageUrl}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDescription}" />
    <meta name="twitter:image" content="${safeImageUrl}" />
    <title>${safeTitle}</title>
    <style>
      :root { color-scheme: light; }
      body {
        margin: 0;
        min-height: 100vh;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: linear-gradient(135deg, #0f172a, #1d4ed8 55%, #00aef0);
        color: #0f172a;
      }
      .wrap { min-height: 100vh; display: grid; place-items: center; padding: 32px 16px; }
      .card { width: min(720px, 100%); overflow: hidden; border-radius: 28px; background: rgba(255, 255, 255, 0.96); box-shadow: 0 30px 80px rgba(15, 23, 42, 0.32); }
      .hero { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 0; }
      .content { padding: 32px; }
      .eyebrow { display: inline-flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 999px; background: #dbeafe; color: #1d4ed8; font-size: 12px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
      h1 { margin: 18px 0 10px; font-size: clamp(30px, 5vw, 48px); line-height: 1.05; }
      p { margin: 0; font-size: 16px; line-height: 1.65; color: #334155; }
      .meta { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px; }
      .pill { padding: 8px 12px; border-radius: 999px; background: #f1f5f9; color: #0f172a; font-size: 13px; font-weight: 700; }
      .visual { background: linear-gradient(180deg, #0f62fe, #00aeef); display: grid; place-items: center; padding: 28px; }
      .visual img { width: 100%; max-height: 320px; object-fit: cover; border-radius: 24px; background: rgba(255,255,255,0.08); }
      .footer { padding: 18px 32px 32px; display: flex; justify-content: space-between; align-items: center; gap: 12px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px; }
      .button { display: inline-flex; align-items: center; justify-content: center; padding: 12px 18px; border-radius: 14px; background: #0f62fe; color: white; text-decoration: none; font-weight: 800; }
      @media (max-width: 700px) {
        .hero { grid-template-columns: 1fr; }
        .content, .footer { padding-left: 20px; padding-right: 20px; }
        .visual { min-height: 220px; }
        .footer { flex-direction: column; align-items: stretch; }
      }
    </style>
  </head>
  <body>
    <main class="wrap">
      <section class="card">
        <div class="hero">
          <div class="content">
            <span class="eyebrow">${escapeHtml(eyebrow)}</span>
            <h1>${safeHeading}</h1>
            <p>${safeDescription}</p>
            <div class="meta">
              ${pills.map((pill) => `<span class="pill">${escapeHtml(String(pill))}</span>`).join("")}
            </div>
          </div>
          <div class="visual">
            <img src="${safeImageUrl}" alt="${safeHeading}" />
          </div>
        </div>
        <div class="footer">
          <span>${escapeHtml(ctaText)}</span>
          <a class="button" href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}" target="_blank" rel="noreferrer noopener">Partilhar no LinkedIn</a>
          ${ctaHref ? `<a class="button" style="background:#0f172a" href="${escapeHtml(ctaHref)}">Ver perfil completo</a>` : ""}
        </div>
      </section>
    </main>
  </body>
</html>`;
}
