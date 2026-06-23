import Requirement from "../models/Requirement.js";
import RequirementEvidence from "../models/RequirementEvidence.js";
import ConsultorBadge from "../models/ConsultorBadge.js";
import Badge from "../models/Badge.js";
import User from "../models/User.js";
import { createNotification } from "../services/notificationService.js";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

function safePublicId(fileName) {
  if (!fileName || typeof fileName !== "string") return undefined;
  const withoutExtension = fileName.replace(/\.[^/.]+$/, "");
  const safe = withoutExtension
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return safe || undefined;
}

export async function uploadEvidenceFile(req, res) {
  try {
    const { file, fileName } = req.body;

    if (!file || typeof file !== "string") {
      return res.status(400).json({ error: "Ficheiro e obrigatorio" });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ error: "Credenciais Cloudinary nao definidas" });
    }

    const uploadResult = await cloudinary.uploader.upload(file, {
      folder: "evidencias",
      resource_type: "auto",
      public_id: `${safePublicId(fileName) || "evidencia"}-${Date.now()}`,
    });

    return res.json({
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      resource_type: uploadResult.resource_type,
    });
  } catch (err) {
    console.error("Erro ao enviar ficheiro de evidencia:", err);
    res.status(500).json({ error: "Erro ao enviar ficheiro" });
  }
}

export async function submitEvidence(req, res) {
  try {
    const { requirementId } = req.params;
    const { evidence_url, notes } = req.body;
    const consultorId = req.userId;

    if (!consultorId) {
      return res.status(401).json({ error: "Utilizador não autenticado" });
    }

    if (!evidence_url) {
      return res.status(400).json({ error: "URL da evidência é obrigatória" });
    }

    const requirement = await Requirement.findByPk(requirementId);
    if (!requirement) {
      return res.status(404).json({ error: "Requisito não encontrado" });
    }

    const evidence = await RequirementEvidence.create({
      consultor_id: consultorId,
      requirement_id: requirement.id,
      badge_id: requirement.badge_id,
      evidence_url,
      notes: notes || null,
      status: "pendente"
    });

    return res.status(201).json(evidence);
  } catch (err) {
    console.error("Erro ao submeter evidência:", err);
    res.status(500).json({ error: "Erro ao submeter evidência" });
  }
}

export async function getConsultorEvidencesByBadge(req, res) {
  try {
    const { badgeId } = req.params;
    const consultorId = req.userId;

    if (!consultorId) {
      return res.status(401).json({ error: "Utilizador não autenticado" });
    }

    const evidences = await RequirementEvidence.findAll({
      where: { consultor_id: consultorId, badge_id: badgeId },
      order: [["created_at", "DESC"]]
    });

    return res.json(evidences);
  } catch (err) {
    console.error("Erro ao obter evidências:", err);
    res.status(500).json({ error: "Erro ao obter evidências" });
  }
}

export async function listEvidencesForTM(req, res) {
  try {
    if (req.userRole !== "talent_manager") {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const { status } = req.query;
    const where = status && status !== "todas" ? { status } : {};

    const evidences = await RequirementEvidence.findAll({
      where,
      include: [
        { model: User, as: "consultor", attributes: ["id", "name", "email"] },
        { model: Badge, as: "badge", attributes: ["id", "description", "level"] },
        { model: Requirement, as: "requirement", attributes: ["id", "title", "code"] }
      ],
      order: [["created_at", "DESC"]]
    });

    return res.json(evidences);
  } catch (err) {
    console.error("Erro ao listar evidências:", err);
    res.status(500).json({ error: "Erro ao listar evidências" });
  }
}

async function finalizeBadgeIfComplete(consultorId, badgeId) {
  const totalReqs = await Requirement.count({ where: { badge_id: badgeId } });
  if (!totalReqs) return;

  const approved = await RequirementEvidence.findAll({
    where: { consultor_id: consultorId, badge_id: badgeId, status: "aprovado" },
    attributes: ["requirement_id"]
  });

  const approvedUnique = new Set(approved.map((a) => a.requirement_id));
  if (approvedUnique.size < totalReqs) return;

  let consultorBadge = await ConsultorBadge.findOne({
    where: { consultor_id: consultorId, badge_id: badgeId }
  });

  const wasObtained = consultorBadge?.status === "obtido";

  if (!consultorBadge) {
    consultorBadge = await ConsultorBadge.create({
      consultor_id: consultorId,
      badge_id: badgeId,
      status: "obtido",
      data_atribuicao: new Date()
    });
  } else if (!wasObtained) {
    consultorBadge.status = "obtido";
    consultorBadge.data_atribuicao = new Date();
    await consultorBadge.save();
  }

  const badge = await Badge.findByPk(badgeId);
  const user = await User.findByPk(consultorId);
  if (badge && user && !wasObtained) {
    user.points_total = (user.points_total || 0) + (badge.points || 0);
    await user.save();
  }
}

export async function approveEvidence(req, res) {
  try {
    if (req.userRole !== "talent_manager") {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const { id } = req.params;
    const evidence = await RequirementEvidence.findByPk(id);
    if (!evidence) return res.status(404).json({ error: "Evidência não encontrada" });

    evidence.status = "aprovado";
    await evidence.save();

    await finalizeBadgeIfComplete(evidence.consultor_id, evidence.badge_id);

    try {
      const [reqItem, badge] = await Promise.all([
        Requirement.findByPk(evidence.requirement_id),
        Badge.findByPk(evidence.badge_id)
      ]);

      await createNotification({
        titulo: "Evidência aprovada",
        mensagem: `O requisito ${reqItem?.code || ""} ${reqItem?.title ? `(${reqItem.title})` : ""} foi aprovado${badge ? ` no badge ${badge.name || badge.description}` : ""}.`,
        utilizador_id: evidence.consultor_id,
      });
    } catch (err) {
      console.error("Erro ao criar notificação:", err);
    }

    return res.json(evidence);
  } catch (err) {
    console.error("Erro ao aprovar evidência:", err);
    res.status(500).json({ error: "Erro ao aprovar evidência" });
  }
}

export async function rejectEvidence(req, res) {
  try {
    if (req.userRole !== "talent_manager") {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const { id } = req.params;
    const evidence = await RequirementEvidence.findByPk(id);
    if (!evidence) return res.status(404).json({ error: "Evidência não encontrada" });

    evidence.status = "rejeitado";
    await evidence.save();

    try {
      const [reqItem, badge] = await Promise.all([
        Requirement.findByPk(evidence.requirement_id),
        Badge.findByPk(evidence.badge_id)
      ]);

      await createNotification({
        titulo: "Evidência rejeitada",
        mensagem: `O requisito ${reqItem?.code || ""} ${reqItem?.title ? `(${reqItem.title})` : ""} foi rejeitado${badge ? ` no badge ${badge.name || badge.description}` : ""}.`,
        utilizador_id: evidence.consultor_id,
      });
    } catch (err) {
      console.error("Erro ao criar notificação:", err);
    }

    return res.json(evidence);
  } catch (err) {
    console.error("Erro ao rejeitar evidência:", err);
    res.status(500).json({ error: "Erro ao rejeitar evidência" });
  }
}
