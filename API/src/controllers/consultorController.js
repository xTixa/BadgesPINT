import Badge from "../models/Badge.js";
import ConsultorBadge from "../models/ConsultorBadge.js";
import User from "../models/User.js";
import PDFDocument from "pdfkit";
import database from "../config/database.js";
import { QueryTypes } from "sequelize";

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
      Badge.findByPk(badgeId),
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

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="certificado-badge-${badge.id}.pdf"`);

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    doc.pipe(res);

    doc.fontSize(26).fillColor("#244080").text("Certificado de Conclusão", { align: "center" });
    doc.moveDown(1.5);

    if (badge.image_url) {
      try {
        const imageRes = await fetch(badge.image_url);
        if (imageRes.ok) {
          const imageBuffer = Buffer.from(await imageRes.arrayBuffer());
          const imgWidth = 180;
          const x = (doc.page.width - imgWidth) / 2;
          doc.image(imageBuffer, x, doc.y, { width: imgWidth });
          doc.moveDown(2.5);
        }
      } catch (err) {
        console.error("Erro ao carregar imagem do badge:", err);
      }
    }

    doc.fontSize(14).fillColor("#2b2b2b");
    doc.text(`Certifica-se que o Consultor ${consultor.name} concluiu`, { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(18).fillColor("#244080").text(`${badgeName}`, { align: "center" });
    doc.moveDown(1.5);
    doc.fontSize(12).fillColor("#2b2b2b").text(`Data: ${new Date().toLocaleDateString("pt-PT")}`, { align: "center" });

    doc.moveDown(3);
    doc.fontSize(12).fillColor("#6b8cae").text("______________________________", { align: "center" });
    doc.text("Assinatura", { align: "center" });

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
