import ConsultorBadge from "../models/ConsultorBadge.js";
import Badge from "../models/Badge.js";
import Area from "../models/Area.js";
import User from "../models/User.js";
import database from "../config/database.js";
import { QueryTypes } from "sequelize";
import {
  getPublicShareBaseUrl,
  getPublicImageBaseUrl,
  renderSharePage,
  renderNotFoundSharePage,
} from "../utils/shareHtml.js";

export async function getPublicCertificateShare(req, res) {
  try {
    const { code } = req.params;
    const row = await ConsultorBadge.findOne({
      where: { certificate_code: code, status: "obtido" },
      include: [
        { model: User, as: "user", attributes: ["id", "name", "public_profile_enabled", "rgpd_publication_accepted"] },
        { model: Badge, as: "badge", include: [{ model: Area, as: "area" }] },
      ],
    });

    if (!row || !row.user?.rgpd_publication_accepted || !row.user?.public_profile_enabled) {
      return res.status(404).send(renderNotFoundSharePage("Certificado nao disponivel publicamente"));
    }

    const publicBaseUrl = getPublicShareBaseUrl(req);
    const publicImageBaseUrl = getPublicImageBaseUrl(req);
    const pageUrl = `${publicBaseUrl}/share/certificates/${code}`;
    const badgeName = row.badge?.description || `Badge #${row.badge_id}`;
    const areaName = row.badge?.area?.name || "Competencia";
    const consultantName = row.user.name;
    const imageUrl = row.badge?.image_url || `${publicImageBaseUrl}/badges.svg`;
    const description = `${consultantName} obteve o badge "${badgeName}" (${areaName}) na Softinsa.`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(
      renderSharePage({
        ogType: "article",
        title: `Certificado de ${consultantName} - BadgesPINT`,
        description,
        imageUrl,
        pageUrl,
        heading: badgeName,
        pills: [areaName, row.badge?.level || "Nivel", `${row.badge?.points || 0} pontos`],
        ctaText: "Certificado verificado da Softinsa.",
        ctaHref: `${getPublicImageBaseUrl(req)}/galeria/${row.user.id}`,
      })
    );
  } catch (err) {
    console.error("Erro ao gerar partilha de certificado:", err);
    res.status(500).send(renderNotFoundSharePage("Erro ao gerar partilha"));
  }
}

export async function getPublicConsultorShare(req, res) {
  try {
    const { id } = req.params;

    const rows = await database.query(
      `SELECT
         u.id,
         u.name,
         u.avatar_url,
         u.points_total,
         a.name AS area_name,
         COUNT(cb.id) FILTER (WHERE cb.status = 'obtido')::int AS badge_count
       FROM "Users" u
       LEFT JOIN areas a ON a.id = u.area_id
       LEFT JOIN consultor_badges cb ON cb.consultor_id = u.id
       WHERE u.id = :id
         AND u.role = 'consultant'
         AND u.public_profile_enabled = true
         AND u.rgpd_publication_accepted = true
       GROUP BY u.id, u.name, u.avatar_url, u.points_total, a.name`,
      { type: QueryTypes.SELECT, replacements: { id } }
    );

    const consultor = rows[0];
    if (!consultor) {
      return res.status(404).send(renderNotFoundSharePage("Perfil nao disponivel publicamente"));
    }

    const publicBaseUrl = getPublicShareBaseUrl(req);
    const publicImageBaseUrl = getPublicImageBaseUrl(req);
    const pageUrl = `${publicBaseUrl}/share/consultores/${id}`;
    const imageUrl = consultor.avatar_url || `${publicImageBaseUrl}/badges.svg`;
    const description = `${consultor.name} tem ${consultor.badge_count} badge(s) e ${consultor.points_total || 0} pontos na Softinsa.`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(
      renderSharePage({
        ogType: "profile",
        title: `${consultor.name} - Perfil Softinsa BadgesPINT`,
        description,
        imageUrl,
        pageUrl,
        heading: consultor.name,
        pills: [
          consultor.area_name || "Softinsa",
          `${consultor.badge_count} badges`,
          `${consultor.points_total || 0} pontos`,
        ],
        ctaText: "Perfil publico de competencias certificadas na Softinsa.",
        ctaHref: `${publicImageBaseUrl}/galeria/${id}`,
      })
    );
  } catch (err) {
    console.error("Erro ao gerar partilha de perfil:", err);
    res.status(500).send(renderNotFoundSharePage("Erro ao gerar partilha"));
  }
}
