import Badge from "../models/Badge.js";
import ConsultorBadge from "../models/ConsultorBadge.js";
import User from "../models/User.js";
import Area from "../models/Area.js";
import PDFDocument from "pdfkit";
import database from "../config/database.js";
import { QueryTypes } from "sequelize";
import crypto from "crypto";

function publicBaseUrl(req) {
  return (
    process.env.PUBLIC_APP_URL ||
    process.env.FRONTEND_URL ||
    `${req.protocol}://${req.get("host")}`
  ).replace(/\/$/, "");
}

function ensureCertificateCode(consultorBadge) {
  if (consultorBadge.certificate_code) return consultorBadge.certificate_code;
  consultorBadge.certificate_code = crypto.randomBytes(18).toString("base64url");
  return consultorBadge.certificate_code;
}

function normalizeDateOnly(value) {
  if (!value) return null;
  const raw = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const match = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) return `${match[3]}-${match[2]}-${match[1]}`;
  return null;
}

function mapPublicBadge(row) {
  return {
    id: row.id,
    name: row.name || row.description || `Badge #${row.id}`,
    description: row.description,
    points: Number(row.points || 0),
    level: row.level,
    area: row.area,
    image_url: row.image_url,
    status: row.status || "obtido",
    data_atribuicao: row.data_atribuicao,
  };
}

export async function getConsultantsRanking(req, res) {
  try {
    const rows = await database.query(
      `SELECT
         u.id,
         u.name,
         u.email,
         u.area_id,
         u.avatar_url,
         u.points_total,
         a.name AS area_name,
         COUNT(cb.id) FILTER (WHERE cb.status = 'obtido')::int AS badge_count
       FROM "Users" u
       LEFT JOIN areas a ON a.id = u.area_id
       LEFT JOIN consultor_badges cb ON cb.consultor_id = u.id
       WHERE u.role = 'consultant'
       GROUP BY u.id, u.name, u.email, u.area_id, u.avatar_url, u.points_total, a.name
       ORDER BY u.points_total DESC, badge_count DESC, u.name ASC`,
      { type: QueryTypes.SELECT }
    );

    res.json(
      rows.map((row, index) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        area_id: row.area_id,
        area_name: row.area_name,
        avatar_url: row.avatar_url,
        points_total: Number(row.points_total || 0),
        badge_count: Number(row.badge_count || 0),
        ranking: index + 1,
      }))
    );
  } catch (err) {
    console.error("Erro ao listar ranking de consultores:", err);
    res.status(500).json({ message: "Erro ao listar consultores" });
  }
}

export async function getConsultantPublicProfile(req, res) {
  try {
    const { id } = req.params;

    const rows = await database.query(
      `SELECT
         u.id,
         u.name,
         u.email,
         u.area_id,
         u.avatar_url,
         u.points_total,
         a.name AS area_name,
         ranked.ranking
       FROM (
         SELECT
           u.id,
           ROW_NUMBER() OVER (
             ORDER BY u.points_total DESC,
             COUNT(cb.id) FILTER (WHERE cb.status = 'obtido') DESC,
             u.name ASC
           )::int AS ranking
         FROM "Users" u
         LEFT JOIN consultor_badges cb ON cb.consultor_id = u.id
         WHERE u.role = 'consultant'
         GROUP BY u.id, u.points_total, u.name
       ) ranked
       JOIN "Users" u ON u.id = ranked.id
       LEFT JOIN areas a ON a.id = u.area_id
       WHERE u.id = :id AND u.role = 'consultant'`,
      { type: QueryTypes.SELECT, replacements: { id } }
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Consultor nao encontrado" });
    }

    const badges = await database.query(
      `SELECT
         b.id,
         COALESCE(b.description, 'Badge #' || b.id) AS name,
         b.description,
         b.points,
         b.level,
         b.image_url,
         a.name AS area,
         cb.status,
         cb.data_atribuicao
       FROM consultor_badges cb
       JOIN badges b ON b.id = cb.badge_id
       LEFT JOIN areas a ON a.id = b.area_id
       WHERE cb.consultor_id = :id AND cb.status = 'obtido'
       ORDER BY cb.data_atribuicao DESC NULLS LAST, b.description ASC`,
      { type: QueryTypes.SELECT, replacements: { id } }
    );

    const profile = rows[0];
    res.json({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      area_id: profile.area_id,
      area_name: profile.area_name,
      avatar_url: profile.avatar_url,
      points_total: Number(profile.points_total || 0),
      ranking: Number(profile.ranking || 0),
      badges: badges.map(mapPublicBadge),
    });
  } catch (err) {
    console.error("Erro ao obter perfil publico do consultor:", err);
    res.status(500).json({ message: "Erro ao obter perfil do consultor" });
  }
}

export async function updateConsultorPreferences(req, res) {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) return res.status(404).json({ message: "Consultor nao encontrado" });

    const {
      rgpd_publication_accepted,
      public_profile_enabled,
      linkedin_sharing_enabled,
      goal_text,
      goal_deadline,
    } = req.body;

    if (rgpd_publication_accepted !== undefined) {
      user.rgpd_publication_accepted = rgpd_publication_accepted === true;
    }
    if (public_profile_enabled !== undefined) {
      user.public_profile_enabled = public_profile_enabled === true;
    }
    if (linkedin_sharing_enabled !== undefined) {
      user.linkedin_sharing_enabled = linkedin_sharing_enabled !== false;
    }
    if (goal_text !== undefined) user.goal_text = goal_text || null;
    if (goal_deadline !== undefined) user.goal_deadline = normalizeDateOnly(goal_deadline);

    if (!user.rgpd_publication_accepted) {
      user.public_profile_enabled = false;
      user.linkedin_sharing_enabled = false;
    }

    await user.save();

    res.json({
      rgpd_publication_accepted: user.rgpd_publication_accepted,
      public_profile_enabled: user.public_profile_enabled,
      linkedin_sharing_enabled: user.linkedin_sharing_enabled,
      goal_text: user.goal_text,
      goal_deadline: user.goal_deadline,
    });
  } catch (err) {
    console.error("Erro ao atualizar preferencias mobile:", err);
    res.status(500).json({ message: "Erro ao atualizar preferencias" });
  }
}

export async function getConsultorCertificates(req, res) {
  try {
    const consultorId = req.userId;
    const rows = await ConsultorBadge.findAll({
      where: { consultor_id: consultorId, status: "obtido" },
      include: [{ model: Badge, as: "badge", include: [{ model: Area, as: "area" }] }],
      order: [["data_atribuicao", "DESC"]],
    });

    for (const row of rows) {
      ensureCertificateCode(row);
      await row.save();
    }

    res.json(rows.map((row) => ({
      id: row.id,
      badge_id: row.badge_id,
      badge_name: row.badge?.description || `Badge #${row.badge_id}`,
      area_name: row.badge?.area?.name || null,
      points: row.badge?.points || 0,
      awarded_at: row.data_atribuicao,
      certificate_code: row.certificate_code,
      verification_url: `${publicBaseUrl(req)}/api/public/certificates/${row.certificate_code}`,
    })));
  } catch (err) {
    console.error("Erro ao listar certificados:", err);
    res.status(500).json({ message: "Erro ao listar certificados" });
  }
}

export async function verifyPublicCertificate(req, res) {
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
      return res.status(404).json({ message: "Certificado nao disponivel publicamente" });
    }

    res.json({
      valid: true,
      consultant: row.user.name,
      badge: row.badge?.description || `Badge #${row.badge_id}`,
      area: row.badge?.area?.name || null,
      level: row.badge?.level || null,
      points: row.badge?.points || 0,
      awarded_at: row.data_atribuicao,
      certificate_code: row.certificate_code,
    });
  } catch (err) {
    console.error("Erro ao verificar certificado:", err);
    res.status(500).json({ message: "Erro ao verificar certificado" });
  }
}

export async function getLearningPathProgress(req, res) {
  try {
    const rows = await database.query(
      `SELECT
         lp.id,
         lp.name,
         COUNT(DISTINCT b.id)::int AS total_badges,
         COUNT(DISTINCT cb.badge_id) FILTER (WHERE cb.status = 'obtido')::int AS obtained_badges,
         COALESCE(SUM(b.points), 0)::int AS total_points,
         COALESCE(SUM(b.points) FILTER (WHERE cb.status = 'obtido'), 0)::int AS obtained_points
       FROM learning_paths lp
       JOIN service_lines sl ON sl.learning_path_id = lp.id
       JOIN areas a ON a.service_line_id = sl.id
       JOIN badges b ON b.area_id = a.id
       LEFT JOIN consultor_badges cb ON cb.badge_id = b.id AND cb.consultor_id = :consultorId
       GROUP BY lp.id, lp.name
       ORDER BY lp.name ASC`,
      { type: QueryTypes.SELECT, replacements: { consultorId: req.userId } }
    );

    res.json(rows.map((row) => ({
      id: row.id,
      name: row.name,
      total_badges: Number(row.total_badges || 0),
      obtained_badges: Number(row.obtained_badges || 0),
      total_points: Number(row.total_points || 0),
      obtained_points: Number(row.obtained_points || 0),
      progress: row.total_badges > 0
        ? Math.round((Number(row.obtained_badges || 0) / Number(row.total_badges)) * 100)
        : 0,
    })));
  } catch (err) {
    console.error("Erro ao obter learning paths mobile:", err);
    res.status(500).json({ message: "Erro ao obter learning paths" });
  }
}

export async function getConsultantBadges(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "ID do consultor é obrigatório." });
    }

    const consultorBadges = await ConsultorBadge.findAll({
      where: { consultor_id: id },
      attributes: ["badge_id", "status", "workflow_status", "submitted_at", "data_atribuicao"],
    });

    if (!consultorBadges.length) {
      return res.json([]);
    }

    const badgeIds = consultorBadges.map((cb) => cb.badge_id);
    const statusMap = new Map(
      consultorBadges.map((cb) => [cb.badge_id, {
        status: cb.status,
        workflow_status: cb.workflow_status,
        submitted_at: cb.submitted_at,
        data_atribuicao: cb.data_atribuicao,
      }])
    );

    const badges = await Badge.findAll({ where: { id: badgeIds } });

    const result = badges.map((b) => ({
      ...b.toJSON(),
      ...(statusMap.get(b.id) || {}),
    }));

    res.json(result);
  } catch (err) {
    console.error("Erro ao buscar badges do consultor:", err);
    res.status(500).json({ message: "Erro servidor." });
  }
}

// GERAR CERTIFICADO PDF PARA O CONSULTOR AUTENTICADO
export async function generateConsultorBadgeCertificate(req, res) {
  try {
    const { badgeId } = req.params;
    const consultorId = req.userId;

    if (!consultorId) {
      return res.status(401).json({ error: "Utilizador não autenticado" });
    }

    const [badge, consultor] = await Promise.all([
      Badge.findByPk(badgeId, { include: [{ model: Area, as: "area" }] }),
      User.findByPk(consultorId)
    ]);

    if (!badge) return res.status(404).json({ error: "Badge não encontrado" });
    if (!consultor) return res.status(404).json({ error: "Consultor não encontrado" });

    const consultorBadge = await ConsultorBadge.findOne({
      where: {
        consultor_id: consultorId,
        badge_id: badgeId,
        status: "obtido"
      }
    });

    if (!consultorBadge) {
      return res.status(400).json({ error: "Ainda não concluiu este badge" });
    }

    const badgeName = badge.name || badge.title || badge.description || `Badge #${badge.id}`;
    const certificateCode = ensureCertificateCode(consultorBadge);
    await consultorBadge.save();
    const verificationUrl = `${publicBaseUrl(req)}/api/public/certificates/${certificateCode}`;
    const awardedAt = consultorBadge.data_atribuicao
      ? new Date(consultorBadge.data_atribuicao)
      : new Date();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="certificado-badge-${badge.id}.pdf"`);

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    doc.pipe(res);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const borderX = 36;
    const borderY = 36;
    const borderWidth = pageWidth - borderX * 2;
    const borderHeight = pageHeight - borderY * 2;

    doc.rect(0, 0, pageWidth, pageHeight).fill("#F7FAFC");
    doc.roundedRect(borderX, borderY, borderWidth, borderHeight, 18)
      .fillAndStroke("#FFFFFF", "#0F62FE");
    doc.rect(borderX, borderY, borderWidth, 92).fill("#0F62FE");

    doc.fillColor("#FFFFFF").fontSize(13).text("Softinsa | BadgesPINT", borderX + 28, borderY + 24);
    doc.fontSize(30).font("Helvetica-Bold").text("Certificado de Conclusao", borderX + 28, borderY + 46, {
      width: borderWidth - 56,
      align: "center",
    });

    const badgeBoxWidth = 170;
    const badgeBoxX = (pageWidth - badgeBoxWidth) / 2;
    const badgeBoxY = 165;
    doc.roundedRect(badgeBoxX, badgeBoxY, badgeBoxWidth, 96, 18)
      .fillAndStroke("#EFF4FF", "#0F62FE");
    doc.fillColor("#0F62FE").font("Helvetica-Bold").fontSize(15).text("BADGE", badgeBoxX, badgeBoxY + 22, {
      width: badgeBoxWidth,
      align: "center",
    });
    doc.fillColor("#111827").font("Helvetica").fontSize(11).text(badge.level || "Certificacao", badgeBoxX + 14, badgeBoxY + 52, {
      width: badgeBoxWidth - 28,
      align: "center",
    });

    doc.fillColor("#111827").font("Helvetica").fontSize(14).text("Certifica-se que", 86, 305, {
      width: pageWidth - 172,
      align: "center",
    });
    doc.font("Helvetica-Bold").fontSize(24).fillColor("#0F172A").text(consultor.name, {
      width: pageWidth - 172,
      align: "center",
    });
    doc.moveDown(0.7);
    doc.font("Helvetica").fontSize(14).fillColor("#111827").text("concluiu com sucesso o badge", {
      width: pageWidth - 172,
      align: "center",
    });
    doc.moveDown(0.4);
    doc.font("Helvetica-Bold").fontSize(22).fillColor("#0F62FE").text(badgeName, {
      width: pageWidth - 172,
      align: "center",
    });

    const detailsY = 470;
    doc.roundedRect(76, detailsY, pageWidth - 152, 92, 12)
      .fillAndStroke("#F8FAFC", "#CBD5E1");
    doc.fillColor("#334155").font("Helvetica").fontSize(11);
    doc.text(`Area: ${badge.area?.name || "Nao definida"}`, 98, detailsY + 18);
    doc.text(`Nivel: ${badge.level || "Nao definido"}`, 98, detailsY + 38);
    doc.text(`Pontos: ${badge.points || 0}`, 98, detailsY + 58);
    doc.text(`Data de atribuicao: ${awardedAt.toLocaleDateString("pt-PT")}`, 310, detailsY + 18);
    doc.text(`Codigo: ${certificateCode}`, 310, detailsY + 38, { width: 210 });

    doc.fillColor("#0F172A").font("Helvetica-Bold").fontSize(12).text("Verificacao publica", 86, 600, {
      width: pageWidth - 172,
      align: "center",
    });
    doc.fillColor("#475569").font("Helvetica").fontSize(10).text(verificationUrl, 86, 620, {
      width: pageWidth - 172,
      align: "center",
    });

    doc.moveTo(170, 700).lineTo(425, 700).strokeColor("#94A3B8").stroke();
    doc.fillColor("#475569").fontSize(11).text("Validacao Softinsa", 86, 710, {
      width: pageWidth - 172,
      align: "center",
    });
    doc.fillColor("#64748B").fontSize(9).text("Este certificado pode ser confirmado atraves do codigo publico de verificacao.", 76, 770, {
      width: pageWidth - 152,
      align: "center",
    });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao gerar certificado" });
  }
}

// PROGRESSO DO CONSULTOR POR BADGE (x/y requisitos aprovados)
export async function getConsultorBadgesProgress(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "ID do consultor é obrigatório." });
    }

    const consultorBadges = await ConsultorBadge.findAll({
      where: { consultor_id: id },
      attributes: ["badge_id"]
    });

    const badgeIds = consultorBadges.map((cb) => cb.badge_id);
    if (!badgeIds.length) return res.json([]);

    const totalReqs = await database.query(
      `SELECT badge_id, COUNT(*)::int AS total
       FROM requirements
       WHERE badge_id IN (:badgeIds)
       GROUP BY badge_id`,
      { type: QueryTypes.SELECT, replacements: { badgeIds } }
    );

    const approvedReqs = await database.query(
      `SELECT badge_id, COUNT(DISTINCT requirement_id)::int AS approved
       FROM requirement_evidences
       WHERE consultor_id = :consultorId AND status = 'aprovado' AND badge_id IN (:badgeIds)
       GROUP BY badge_id`,
      { type: QueryTypes.SELECT, replacements: { consultorId: id, badgeIds } }
    );

    const totalMap = new Map(totalReqs.map((r) => [Number(r.badge_id), Number(r.total)]));
    const approvedMap = new Map(approvedReqs.map((r) => [Number(r.badge_id), Number(r.approved)]));

    const progress = badgeIds.map((badgeId) => ({
      badge_id: badgeId,
      total: totalMap.get(badgeId) || 0,
      approved: approvedMap.get(badgeId) || 0
    }));

    res.json(progress);
  } catch (err) {
    console.error("Erro ao obter progresso:", err);
    res.status(500).json({ message: "Erro ao obter progresso" });
  }
}
