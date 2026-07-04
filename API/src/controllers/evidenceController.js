import Requirement from "../models/Requirement.js";
import RequirementEvidence from "../models/RequirementEvidence.js";
import ConsultorBadge from "../models/ConsultorBadge.js";
import Badge from "../models/Badge.js";
import User from "../models/User.js";
import { createNotification } from "../services/notificationService.js";
import { notifySLLeadersOfPendingApproval } from "./pedidosController.js";
import { createAuditLog } from "./auditLogController.js";
import { getTMAreaIds } from "./talentManagerController.js";
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

const MAX_EVIDENCE_FILE_BYTES = 3 * 1024 * 1024; // 3MB
const ALLOWED_EVIDENCE_FORMATS = ["jpg", "jpeg", "png", "webp", "pdf"];

export function estimateBase64Bytes(fileValue) {
  const base64Part = fileValue.includes(",") ? fileValue.split(",").pop() : fileValue;
  const padding = (base64Part.match(/=+$/) || [""])[0].length;
  return Math.floor((base64Part.length * 3) / 4) - padding;
}

export function isTrustedCloudinaryUrl(url) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    if (parsed.hostname !== "res.cloudinary.com") return false;
    return parsed.pathname.startsWith(`/${cloudName}/`);
  } catch {
    return false;
  }
}

export async function uploadEvidenceFile(req, res) {
  try {
    if (req.userRole !== "consultant") {
      return res.status(403).json({ error: "Apenas consultores podem enviar ficheiros de evidência" });
    }

    const { file, fileName } = req.body;

    if (!file || typeof file !== "string") {
      return res.status(400).json({ error: "Ficheiro e obrigatorio" });
    }

    if (estimateBase64Bytes(file) > MAX_EVIDENCE_FILE_BYTES) {
      return res.status(413).json({
        error: `Ficheiro demasiado grande. Tamanho máximo: ${MAX_EVIDENCE_FILE_BYTES / (1024 * 1024)}MB`,
      });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ error: "Credenciais Cloudinary nao definidas" });
    }

    let uploadResult;
    try {
      uploadResult = await cloudinary.uploader.upload(file, {
        folder: "evidencias",
        resource_type: "auto",
        allowed_formats: ALLOWED_EVIDENCE_FORMATS,
        public_id: `${safePublicId(fileName) || "evidencia"}-${Date.now()}`,
      });
    } catch (uploadErr) {
      if (uploadErr?.message?.includes("format")) {
        return res.status(400).json({
          error: `Formato de ficheiro não permitido. Formatos aceites: ${ALLOWED_EVIDENCE_FORMATS.join(", ")}`,
        });
      }
      throw uploadErr;
    }

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

    if (req.userRole !== "consultant") {
      return res.status(403).json({ error: "Apenas consultores podem submeter evidências" });
    }

    if (!evidence_url) {
      return res.status(400).json({ error: "URL da evidência é obrigatória" });
    }

    if (!isTrustedCloudinaryUrl(evidence_url)) {
      return res.status(400).json({ error: "URL da evidência inválida. Utilize o upload da plataforma." });
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

    if (req.userRole !== "consultant") {
      return res.status(403).json({ error: "Apenas consultores podem consultar as suas evidências" });
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

    const tm = await User.findByPk(req.userId);
    const areaIds = await getTMAreaIds(tm);

    const evidences = await RequirementEvidence.findAll({
      where,
      include: [
        { model: User, as: "consultor", attributes: ["id", "name", "email"], where: { area_id: areaIds }, required: true },
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

// Quando o Talent Manager aprova a última evidência pendente de um badge, o
// pedido segue para "em_validacao" à espera da aprovação final do Service
// Line Leader — nunca atribui o badge diretamente, para respeitar o fluxo
// consultor -> talent manager -> service line leader.
async function finalizeBadgeIfComplete(consultorId, badgeId, tmValidatorId) {
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

  // Já decidido pelo Service Line Leader (obtido ou rejeitado) — não reabrir
  if (consultorBadge?.workflow_status === "fechado") return;

  const now = new Date();
  if (!consultorBadge) {
    consultorBadge = await ConsultorBadge.create({
      consultor_id: consultorId,
      badge_id: badgeId,
      status: "pendente",
      workflow_status: "em_validacao",
      submitted_at: now,
      tm_validator_id: tmValidatorId,
      tm_validated_at: now,
    });
  } else {
    consultorBadge.workflow_status = "em_validacao";
    consultorBadge.submitted_at = consultorBadge.submitted_at || now;
    consultorBadge.tm_validator_id = tmValidatorId;
    consultorBadge.tm_validated_at = now;
    await consultorBadge.save();
  }

  await notifySLLeadersOfPendingApproval(consultorBadge);
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

    await finalizeBadgeIfComplete(evidence.consultor_id, evidence.badge_id, req.userId);

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

    await createAuditLog(req, res, {
      action: "APROVAR_EVIDENCIA",
      entity: "RequirementEvidence",
      userId: req.userId,
      entityId: evidence.id,
      description: `Evidência #${evidence.id} do requisito #${evidence.requirement_id} aprovada para consultor #${evidence.consultor_id}`,
      newValues: { status: evidence.status },
    });

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

    await createAuditLog(req, res, {
      action: "REJEITAR_EVIDENCIA",
      entity: "RequirementEvidence",
      userId: req.userId,
      entityId: evidence.id,
      description: `Evidência #${evidence.id} do requisito #${evidence.requirement_id} rejeitada para consultor #${evidence.consultor_id}`,
      newValues: { status: evidence.status },
    });

    return res.json(evidence);
  } catch (err) {
    console.error("Erro ao rejeitar evidência:", err);
    res.status(500).json({ error: "Erro ao rejeitar evidência" });
  }
}
