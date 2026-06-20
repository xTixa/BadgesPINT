import {
  Badge,
  Area,
  Requirement,
  BadgeSection,
  BadgeLesson,
  BadgeReview,
  User,
} from "../models/index.js";

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getPublicShareBaseUrl(req) {
  const configuredUrl = process.env.PUBLIC_SITE_URL || process.env.PUBLIC_API_URL || process.env.API_BASE_URL || process.env.APP_BASE_URL;

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  return `${req.protocol}://${req.get("host")}`;
}

function getPublicImageBaseUrl(req) {
  const configuredUrl = process.env.FRONTEND_URL || process.env.PUBLIC_FRONTEND_URL || process.env.APP_BASE_URL;

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  return `${req.protocol}://${req.get("host")}`;
}

function renderBadgeSharePage(req, badge) {
  const publicBaseUrl = getPublicShareBaseUrl(req);
  const publicImageBaseUrl = getPublicImageBaseUrl(req);
  const badgeUrl = `${publicBaseUrl}/share/badges/${badge.id}`;
  const fallbackImage = `${publicImageBaseUrl}/badges.svg`;
  const badgeName = badge.name || `Badge ${badge.id}`;
  const areaName = badge.area?.name || "Competencia";
  const description = badge.description || `Badge da area ${areaName} com ${badge.points || 0} pontos.`;
  const imageUrl = badge.image_url || fallbackImage;
  const title = `${badgeName} - BadgesPINT`;
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeImageUrl = escapeHtml(imageUrl);
  const safeBadgeUrl = escapeHtml(badgeUrl);
  const safeBadgeName = escapeHtml(badgeName);
  const safeAreaName = escapeHtml(areaName);

  return `<!doctype html>
<html lang="pt">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="index,follow" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDescription}" />
    <meta property="og:image" content="${safeImageUrl}" />
    <meta property="og:url" content="${safeBadgeUrl}" />
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
      .wrap {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 32px 16px;
      }
      .card {
        width: min(720px, 100%);
        overflow: hidden;
        border-radius: 28px;
        background: rgba(255, 255, 255, 0.96);
        box-shadow: 0 30px 80px rgba(15, 23, 42, 0.32);
      }
      .hero {
        display: grid;
        grid-template-columns: 1.2fr 0.8fr;
        gap: 0;
      }
      .content {
        padding: 32px;
      }
      .eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 999px;
        background: #dbeafe;
        color: #1d4ed8;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      h1 {
        margin: 18px 0 10px;
        font-size: clamp(30px, 5vw, 48px);
        line-height: 1.05;
      }
      p {
        margin: 0;
        font-size: 16px;
        line-height: 1.65;
        color: #334155;
      }
      .meta {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 20px;
      }
      .pill {
        padding: 8px 12px;
        border-radius: 999px;
        background: #f1f5f9;
        color: #0f172a;
        font-size: 13px;
        font-weight: 700;
      }
      .visual {
        background: linear-gradient(180deg, #0f62fe, #00aeef);
        display: grid;
        place-items: center;
        padding: 28px;
      }
      .visual img {
        width: 100%;
        max-height: 320px;
        object-fit: cover;
        border-radius: 24px;
        background: rgba(255,255,255,0.08);
      }
      .footer {
        padding: 18px 32px 32px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        border-top: 1px solid #e2e8f0;
        color: #64748b;
        font-size: 14px;
      }
      .button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 12px 18px;
        border-radius: 14px;
        background: #0f62fe;
        color: white;
        text-decoration: none;
        font-weight: 800;
      }
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
            <span class="eyebrow">BadgesPINT</span>
            <h1>${safeBadgeName}</h1>
            <p>${safeDescription}</p>
            <div class="meta">
              <span class="pill">${safeAreaName}</span>
              <span class="pill">${escapeHtml(String(badge.level || "Nivel"))}</span>
              <span class="pill">${escapeHtml(String(badge.points || 0))} pontos</span>
            </div>
          </div>
          <div class="visual">
            <img src="${safeImageUrl}" alt="${safeBadgeName}" />
          </div>
        </div>
        <div class="footer">
          <span>Partilha este badge no LinkedIn com o link oficial.</span>
          <a class="button" href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(badgeUrl)}" target="_blank" rel="noreferrer noopener">Partilhar no LinkedIn</a>
        </div>
      </section>
    </main>
  </body>
</html>`;
}

// Retorna todos os badges
export async function getAllBadges(req, res) {
  try {
    const badges = await Badge.findAll({
      include: {
        model: Area,
        as: "area",
        attributes: ["id", "name"]
      },
      order: [["points", "DESC"]]
    });
    res.json(badges);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao obter badges" });
  }
}

export async function getBadgesByArea(req, res) {
  try {
    const { id } = req.params; // area id
    const badges = await Badge.findAll({
      where: { area_id: id },
      order: [["level","ASC"]]
    });
    res.json(badges);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao obter badges" });
  }
}

export async function getBadgeDetails(req, res) {
  try {
    const { id } = req.params;
    const badge = await Badge.findByPk(id, {
      include: [
        { model: Area, as: "area", attributes: ["id", "name"] },
        { model: Requirement, as: "requirements" },
        {
          model: BadgeSection,
          as: "sections",
          include: [{ model: BadgeLesson, as: "lessons" }],
        },
        {
          model: BadgeReview,
          as: "reviews",
          include: [{ model: User, as: "consultor", attributes: ["id", "name", "avatar_url"] }],
        },
      ],
    });

    if (!badge) {
      return res.status(404).json({ message: "Badge nao encontrado" });
    }

    const data = badge.toJSON();
    data.sections = (data.sections || [])
      .sort((a, b) => (a.position || 0) - (b.position || 0))
      .map((section) => ({
        ...section,
        lessons: (section.lessons || []).sort((a, b) => (a.position || 0) - (b.position || 0)),
      }));
    data.reviews = (data.reviews || [])
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 10);

    const reviewStats = await BadgeReview.findAll({ where: { badge_id: id } });
    const ratingCount = reviewStats.length;
    const ratingAverage = ratingCount
      ? reviewStats.reduce((sum, review) => sum + Number(review.rating || 0), 0) / ratingCount
      : 0;

    data.rating = {
      average: Number(ratingAverage.toFixed(1)),
      count: ratingCount,
    };

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao obter detalhe do badge" });
  }
}

export async function getPublicBadgeShare(req, res) {
  try {
    const { id } = req.params;
    const badge = await Badge.findByPk(id, {
      include: {
        model: Area,
        as: "area",
        attributes: ["id", "name"],
      },
    });

    if (!badge) {
      return res.status(404).send(`<!doctype html><html lang="pt"><head><meta charset="UTF-8" /><meta name="robots" content="noindex,nofollow" /><title>Badge nao encontrado</title></head><body><h1>Badge nao encontrado</h1></body></html>`);
    }

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(renderBadgeSharePage(req, badge.toJSON()));
  } catch (err) {
    console.error(err);
    res.status(500).send(`<!doctype html><html lang="pt"><head><meta charset="UTF-8" /><meta name="robots" content="noindex,nofollow" /><title>Erro</title></head><body><h1>Erro ao gerar partilha</h1></body></html>`);
  }
}
