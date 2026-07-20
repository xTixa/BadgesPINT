import ConsultorBadge from "../models/ConsultorBadge.js";
import User from "../models/User.js";
import Badge from "../models/Badge.js";
import Area from "../models/Area.js";
import RequirementEvidence from "../models/RequirementEvidence.js";
import Requirement from "../models/Requirement.js";
import database from "../config/database.js";
import { QueryTypes, Op } from "sequelize";
import {
  sendBadgeApplicationStartedEmail,
  sendBadgeApplicationEmail,
  sendBadgeApprovedEmail,
  sendBadgeRejectedEmail,
  sendBadgeReturnedEmail,
  sendTMValidationEmail,
  sendSLValidationEmail,
} from "../services/mailService.js";
import { createNotification } from "../services/notificationService.js";
import { createAuditLog } from "./auditLogController.js";

async function getServiceLineIdForUser(userId) {
  const user = await User.findByPk(userId);
  if (!user || !user.area_id) return null;

  const area = await Area.findByPk(user.area_id);
  return area?.service_line_id || null;
}

async function ensureSLAccess(pedido, slServiceLineId) {
  if (!slServiceLineId) return false;
  const badge = await Badge.findByPk(pedido.badge_id, {
    include: [{ model: Area, as: "area", attributes: ["id", "service_line_id"] }]
  });
  return badge?.area?.service_line_id === slServiceLineId;
}

async function getPedidoNotificationContext(pedido) {
  const [badge, consultor] = await Promise.all([
    Badge.findByPk(pedido.badge_id, { attributes: ["id", "description"] }),
    User.findByPk(pedido.consultor_id, { attributes: ["id", "name", "email"] }),
  ]);

  return {
    badge,
    consultor,
    badgeName: badge?.description || `Badge #${pedido.badge_id}`,
    consultorName: consultor?.name || "consultor",
  };
}

async function notifyConsultorPedido({ pedido, titulo, mensagem, emailFactory, transaction = null, teamsNotify = false }) {
  const { consultor, badgeName } = await getPedidoNotificationContext(pedido);

  return createNotification({
    titulo,
    mensagem,
    categoria: "badges_resultado",
    utilizador_id: pedido.consultor_id,
    transaction,
    teamsNotify,
    teamsBadgeId: teamsNotify ? pedido.badge_id : null,
    email: consultor?.email && emailFactory
      ? {
          to: consultor.email,
          send: () =>
            emailFactory({
              to: consultor.email,
              name: consultor.name,
              badgeName,
            }),
        }
      : null,
  });
}

export async function notifySLLeadersOfPendingApproval(pedido) {
  try {
    const badgeWithArea = await Badge.findByPk(pedido.badge_id, {
      include: [{ model: Area, as: "area", attributes: ["id", "service_line_id"] }],
      attributes: ["id", "description"],
    });
    const consultor = await User.findByPk(pedido.consultor_id, { attributes: ["id", "name"] });
    const badgeName = badgeWithArea?.description || `Badge #${pedido.badge_id}`;
    const consultorName = consultor?.name || "consultor";

    if (badgeWithArea?.area?.service_line_id) {
      const slLeaders = await database.query(
        `SELECT u.id, u.name, u.email FROM "Users" u
         JOIN areas a ON a.id = u.area_id
         WHERE u.role = 'service_line_leader' AND a.service_line_id = :slId`,
        { replacements: { slId: badgeWithArea.area.service_line_id }, type: QueryTypes.SELECT }
      );
      for (const leader of slLeaders) {
        await createNotification({
          titulo: "Pedido aguarda aprovação",
          mensagem: `O pedido de badge "${badgeName}" de ${consultorName} aguarda a tua aprovação.`,
          categoria: "badges_pendente",
          utilizador_id: leader.id,
          teamsNotify: true,
          teamsBadgeId: pedido.badge_id,
          email: leader.email
            ? {
                to: leader.email,
                send: () => sendSLValidationEmail({ to: leader.email, name: leader.name, badgeName, consultorName }),
              }
            : null,
        });
      }
    }
  } catch (notifyErr) {
    console.error("Falha ao notificar SL leaders:", notifyErr.message);
  }
}

export async function notifyTMsOfPendingReview(pedido) {
  try {
    const badge = await Badge.findByPk(pedido.badge_id, { attributes: ["id", "description", "area_id"] });
    const consultor = await User.findByPk(pedido.consultor_id, { attributes: ["id", "name"] });
    const badgeName = badge?.description || `Badge #${pedido.badge_id}`;
    const consultorName = consultor?.name || "consultor";

    if (badge?.area_id) {
      const tms = await database.query(
        `SELECT u.id, u.name, u.email FROM "Users" u
         WHERE u.role = 'talent_manager' AND (u.area_id = :areaId OR u.area_id IS NULL)`,
        { replacements: { areaId: badge.area_id }, type: QueryTypes.SELECT }
      );
      for (const tm of tms) {
        await createNotification({
          titulo: "Pedido aguarda validação",
          mensagem: `O pedido de badge "${badgeName}" de ${consultorName} aguarda a tua validação.`,
          categoria: "badges_pendente",
          utilizador_id: tm.id,
          teamsNotify: true,
          teamsBadgeId: pedido.badge_id,
          email: tm.email
            ? {
                to: tm.email,
                send: () => sendTMValidationEmail({ to: tm.email, name: tm.name, badgeName, consultorName }),
              }
            : null,
        });
      }
    }
  } catch (notifyErr) {
    console.error("Falha ao notificar Talent Managers:", notifyErr.message);
  }
}

async function notifyBadgeApplicationStarted(pedido) {
  const badge = await Badge.findByPk(pedido.badge_id, {
    attributes: ["id", "description"],
  });
  const consultor = await User.findByPk(pedido.consultor_id, {
    attributes: ["id", "name", "email"],
  });
  const badgeName = badge?.description || `#${pedido.badge_id}`;

  await createNotification({
    titulo: "Candidatura iniciada",
    mensagem: `Candidataste-te ao badge ${badgeName}.`,
    categoria: "badges_candidatura",
    utilizador_id: pedido.consultor_id,
  });

  if (consultor?.email) {
    try {
      await sendBadgeApplicationStartedEmail({
        to: consultor.email,
        name: consultor.name,
        badgeName,
      });
    } catch (error) {
      console.error("Notificacao criada, mas email de candidatura falhou:", error.message);
    }
  }
}

async function notifyBadgeApplication(pedido) {
  const badge = await Badge.findByPk(pedido.badge_id, {
    attributes: ["id", "description"],
  });
  const consultor = await User.findByPk(pedido.consultor_id, {
    attributes: ["id", "name", "email"],
  });
  const badgeName = badge?.description || `#${pedido.badge_id}`;

  await createNotification({
    titulo: "Candidatura submetida",
    mensagem: `Submeteste as evidências do badge ${badgeName} para validação.`,
    categoria: "badges_candidatura",
    utilizador_id: pedido.consultor_id,
  });

  if (consultor?.email) {
    try {
      await sendBadgeApplicationEmail({
        to: consultor.email,
        name: consultor.name,
        badgeName,
      });
    } catch (error) {
      console.error("Notificacao criada, mas email de submissao falhou:", error.message);
    }
  }
}

/**
 * Listar todos os pedidos de badges (com filtro opcional por status)
 */
export async function getAllPedidos(req, res) {
  try {
    const { status } = req.query;
    const where = status && status !== "all" ? { status } : {};

    if (req.userRole === "consultant") {
      where.consultor_id = req.userId;
    }

    let badgeWhere = null;
    if (req.userRole === "service_line_leader") {
      const slServiceLineId = await getServiceLineIdForUser(req.userId);
      if (!slServiceLineId) {
        return res.status(403).json({ message: "Service Line não associada ao utilizador" });
      }
      const areas = await Area.findAll({
        where: { service_line_id: slServiceLineId },
        attributes: ["id"],
        raw: true,
      });
      // area_id: [] faria o Sequelize gerar "IN ()" (SQL invalido) — [-1] garante
      // zero resultados em vez de devolver pedidos de todas as areas.
      badgeWhere = { area_id: areas.length ? areas.map((a) => a.id) : [-1] };
    }

    const pedidos = await ConsultorBadge.findAll({
      attributes: [
        "id",
        "consultor_id",
        "badge_id",
        "status",
        "workflow_status",
        "submitted_at",
        "data_atribuicao",
        "tm_validator_id",
        "tm_validated_at",
        "tm_comment",
        "sl_validator_id",
        "sl_validated_at",
        "sl_comment",
        "rejection_reason",
        "certificate_code",
        "created_at"
      ],
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"]
        },
        {
          model: Badge,
          as: "badge",
          attributes: ["id", "description", "level", "points", "area_id"],
          where: badgeWhere || undefined,
          required: Boolean(badgeWhere),
          include: [{ model: Area, as: "area", attributes: ["id", "service_line_id"] }]
        }
      ],
      order: [["created_at", "DESC"]]
    });

    let evidencesByPedido = {};
    if (pedidos.length) {
      const evidences = await RequirementEvidence.findAll({
        where: {
          [Op.or]: pedidos.map((p) => ({
            consultor_id: p.consultor_id,
            badge_id: p.badge_id
          }))
        },
        attributes: ["id", "requirement_id", "badge_id", "consultor_id", "status", "evidence_url", "notes", "created_at"],
        include: [{ model: Requirement, as: "requirement", attributes: ["id", "title", "code"] }],
        order: [["created_at", "DESC"]]
      });

      evidencesByPedido = evidences.reduce((acc, ev) => {
        const key = `${ev.consultor_id}_${ev.badge_id}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(ev);
        return acc;
      }, {});
    }

    const pedidosComEvidencias = pedidos.map((p) => {
      const json = p.toJSON();
      json.evidences = evidencesByPedido[`${p.consultor_id}_${p.badge_id}`] || [];
      return json;
    });

    res.json(pedidosComEvidencias);
  } catch (err) {
    console.error("Erro ao listar pedidos:", err);
    res.status(500).json({ message: "Erro ao listar pedidos de badges" });
  }
}

/**
 * Obter detalhe de um pedido específico
 */
export async function getPedidoById(req, res) {
  try {
    const { id } = req.params;

    const pedido = await ConsultorBadge.findByPk(id, {
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email"] },
        { model: Badge, as: "badge", attributes: ["id", "description", "level", "points", "area_id"], include: [{ model: Area, as: "area", attributes: ["id", "service_line_id"] }] }
      ]
    });

    if (!pedido) {
      return res.status(404).json({ message: "Pedido não encontrado" });
    }

    if (req.userRole === "consultant" && pedido.consultor_id !== req.userId) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    if (req.userRole === "service_line_leader") {
      const slServiceLineId = await getServiceLineIdForUser(req.userId);
      if (!slServiceLineId || pedido.badge?.area?.service_line_id !== slServiceLineId) {
        return res.status(403).json({ message: "Acesso negado" });
      }
    }

    res.json(pedido);
  } catch (err) {
    console.error("Erro ao obter pedido:", err);
    res.status(500).json({ message: "Erro ao obter pedido" });
  }
}

/**
 * Aprovar um pedido de badge
 */
export async function aprovarPedido(req, res) {
  try {
    const { id } = req.params;
    let pedido;

    await database.transaction(async (transaction) => {
      pedido = await ConsultorBadge.findByPk(id, { transaction });
      if (!pedido) {
        const error = new Error("Pedido não encontrado");
        error.statusCode = 404;
        throw error;
      }

      const wasObtained = pedido.status === "obtido";
      pedido.status = "obtido";
      pedido.workflow_status = "fechado";
      pedido.data_atribuicao = pedido.data_atribuicao || new Date();
      pedido.rejection_reason = null;
      if (!pedido.tm_validator_id) {
        pedido.tm_validator_id = req.userId;
        pedido.tm_validated_at = new Date();
        pedido.tm_comment = pedido.tm_comment || "Aprovado diretamente por administrador (bypass de fluxo).";
      }
      if (!pedido.sl_validator_id) {
        pedido.sl_validator_id = req.userId;
        pedido.sl_validated_at = new Date();
        pedido.sl_comment = pedido.sl_comment || "Aprovado diretamente por administrador (bypass de fluxo).";
      }
      await pedido.save({ transaction });

      const [user, badge] = await Promise.all([
        User.findByPk(pedido.consultor_id, { transaction }),
        Badge.findByPk(pedido.badge_id, { transaction }),
      ]);

      if (user && badge && !wasObtained) {
        user.points_total = (user.points_total || 0) + (badge.points || 0);
        await user.save({ transaction });
      }
    });

    await notifyConsultorPedido({
      pedido,
      titulo: "Badge aprovado",
      mensagem: "O teu pedido foi aprovado e o badge está disponível.",
      emailFactory: sendBadgeApprovedEmail,
      teamsNotify: true,
    });

    await createAuditLog(req, res, {
      action: "APROVAR_PEDIDO",
      entity: "ConsultorBadge",
      userId: req.userId,
      entityId: pedido.id,
      description: `Pedido de badge #${pedido.badge_id} aprovado para consultor #${pedido.consultor_id}`,
      newValues: { status: pedido.status, workflow_status: pedido.workflow_status },
    });

    res.json({
      message: "Pedido aprovado com sucesso",
      pedido
    });

  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    console.error("Erro ao aprovar pedido:", err);
    res.status(500).json({ message: "Erro ao aprovar pedido" });
  }
}

/**
 * Rejeitar um pedido de badge
 */
export async function rejeitarPedido(req, res) {
  try {
    const { id } = req.params;
    const { motivo } = req.body;
    let pedido;

    await database.transaction(async (transaction) => {
      pedido = await ConsultorBadge.findByPk(id, { transaction });
      if (!pedido) {
        const error = new Error("Pedido não encontrado");
        error.statusCode = 404;
        throw error;
      }

      pedido.status = "rejeitado";
      pedido.workflow_status = "fechado";
      pedido.sl_comment = motivo || pedido.sl_comment;
      pedido.rejection_reason = motivo || pedido.rejection_reason;
      if (!pedido.sl_validator_id) {
        pedido.sl_validator_id = req.userId;
        pedido.sl_validated_at = new Date();
      }
      await pedido.save({ transaction });
    });

    await notifyConsultorPedido({
      pedido,
      titulo: "Pedido rejeitado",
      mensagem: motivo ? `O teu pedido foi rejeitado. Motivo: ${motivo}` : "O teu pedido foi rejeitado.",
      emailFactory: (payload) => sendBadgeRejectedEmail({ ...payload, comment: motivo }),
      teamsNotify: true,
    });

    await createAuditLog(req, res, {
      action: "REJEITAR_PEDIDO",
      entity: "ConsultorBadge",
      userId: req.userId,
      entityId: pedido.id,
      description: `Pedido de badge #${pedido.badge_id} rejeitado para consultor #${pedido.consultor_id}${motivo ? `: ${motivo}` : ""}`,
      newValues: { status: pedido.status, workflow_status: pedido.workflow_status },
    });

    res.json({
      message: "Pedido rejeitado com sucesso",
      pedido
    });

  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    console.error("Erro ao rejeitar pedido:", err);
    res.status(500).json({ message: "Erro ao rejeitar pedido" });
  }
}

/**
 * Criar novo pedido de badge (por consultores)
 */
export async function criarPedido(req, res) {
  try {
    const { badge_id } = req.body;
    const consultor_id = req.userId;
    const badgeId = Number(badge_id);

    if (!Number.isInteger(badgeId) || badgeId <= 0) {
      return res.status(400).json({ message: "badge_id inválido" });
    }

    const consultor = await User.findByPk(consultor_id, {
      attributes: ["id", "role"]
    });

    if (!consultor) {
      return res.status(404).json({ message: "Consultor não encontrado" });
    }

    if (consultor.role !== "consultant") {
      return res.status(403).json({ message: "Apenas consultores podem submeter pedidos" });
    }

    const badge = await Badge.findByPk(badgeId, {
      attributes: ["id", "special_deadline"]
    });

    if (!badge) {
      return res.status(404).json({ message: "Badge não encontrado" });
    }

    if (badge.special_deadline && new Date(badge.special_deadline) < new Date()) {
      return res.status(400).json({ message: "O prazo para este badge especial já terminou" });
    }

    // Verificar se já existe pedido pendente/obtido para este badge
    const existing = await ConsultorBadge.findOne({
      where: {
        consultor_id,
        badge_id: badgeId
      }
    });

    if (existing) {
      return res.status(400).json({ message: "Já existe um pedido ativo para este badge" });
    }

    const pedido = await ConsultorBadge.create({
      consultor_id,
      badge_id: badgeId,
      status: "pendente",
      workflow_status: "open",
    });

    await notifyBadgeApplicationStarted(pedido);

    res.status(201).json(pedido);

  } catch (err) {
    console.error("Erro ao criar pedido:", err);
    res.status(500).json({
      message: "Erro ao criar pedido de badge",
      detail: process.env.NODE_ENV === "production" ? undefined : err.message,
    });
  }
}

/**
 * Cancelar um pedido (apenas se pendente)
 */
export async function cancelarPedido(req, res) {
  try {
    const { id } = req.params;

    const pedido = await ConsultorBadge.findByPk(id);
    if (!pedido) {
      return res.status(404).json({ message: "Pedido não encontrado" });
    }

    if (pedido.consultor_id !== req.userId) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    if (pedido.status !== "pendente" || pedido.workflow_status !== "open") {
      return res.status(400).json({ message: "Apenas pedidos pendentes podem ser cancelados" });
    }

    await pedido.destroy();

    res.json({ message: "Pedido cancelado com sucesso" });

  } catch (err) {
    console.error("Erro ao cancelar pedido:", err);
    res.status(500).json({ message: "Erro ao cancelar pedido" });
  }
}

/**
 * Submeter pedido (Open -> Submitted)
 */
export async function submeterPedido(req, res) {
  try {
    const { id } = req.params;
    const consultorId = req.userId;

    const pedido = await ConsultorBadge.findByPk(id);
    if (!pedido) return res.status(404).json({ message: "Pedido não encontrado" });

    if (pedido.consultor_id !== consultorId) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    if (pedido.workflow_status !== "open") {
      return res.status(400).json({ message: "Pedido já submetido" });
    }

    const requirements = await Requirement.findAll({
      where: { badge_id: pedido.badge_id },
      attributes: ["id"],
    });

    if (requirements.length > 0) {
      const evidences = await RequirementEvidence.findAll({
        where: { consultor_id: consultorId, badge_id: pedido.badge_id },
        attributes: ["requirement_id"],
      });
      const requirementIdsWithEvidence = new Set(evidences.map((e) => e.requirement_id));
      const missing = requirements.filter((r) => !requirementIdsWithEvidence.has(r.id));

      if (missing.length > 0) {
        return res.status(400).json({
          message: "Submete evidência para todos os requisitos antes de submeter a candidatura.",
          missingRequirementIds: missing.map((r) => r.id),
        });
      }
    }

    pedido.workflow_status = "submitted";
    pedido.submitted_at = new Date();
    await pedido.save();

    await notifyBadgeApplication(pedido);
    await notifyTMsOfPendingReview(pedido);

    return res.json(pedido);
  } catch (err) {
    console.error("Erro ao submeter pedido:", err);
    res.status(500).json({ message: "Erro ao submeter pedido" });
  }
}

/**
 * Talent Manager valida (Submitted -> Em Validação)
 */
export async function tmValidarPedido(req, res) {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    if (req.userRole !== "talent_manager") {
      return res.status(403).json({ message: "Apenas Talent Manager" });
    }

    const pedido = await ConsultorBadge.findByPk(id);
    if (!pedido) return res.status(404).json({ message: "Pedido não encontrado" });

    if (pedido.workflow_status !== "submitted") {
      return res.status(400).json({ message: "Apenas pedidos submetidos podem ser validados pelo Talent Manager" });
    }

    pedido.workflow_status = "em_validacao";
    pedido.tm_validator_id = req.userId;
    pedido.tm_validated_at = new Date();
    pedido.tm_comment = comment || null;
    pedido.rejection_reason = null;
    await pedido.save();

    await createNotification({
      titulo: "Pedido em validação",
      mensagem: "O teu pedido foi validado pelo Talent Manager e segue para validação final.",
      categoria: "badges_resultado",
      utilizador_id: pedido.consultor_id,
    });

    await notifySLLeadersOfPendingApproval(pedido);

    await createAuditLog(req, res, {
      action: "TM_VALIDAR_PEDIDO",
      entity: "ConsultorBadge",
      userId: req.userId,
      entityId: pedido.id,
      description: `Talent Manager validou pedido de badge #${pedido.badge_id} do consultor #${pedido.consultor_id}`,
      newValues: { workflow_status: pedido.workflow_status },
    });

    return res.json(pedido);
  } catch (err) {
    console.error("Erro TM validar pedido:", err);
    res.status(500).json({ message: "Erro ao validar pedido" });
  }
}

/**
 * Talent Manager devolve ao consultor (Submitted -> Open)
 */
export async function tmDevolverPedido(req, res) {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    if (req.userRole !== "talent_manager") {
      return res.status(403).json({ message: "Apenas Talent Manager" });
    }

    const pedido = await ConsultorBadge.findByPk(id);
    if (!pedido) return res.status(404).json({ message: "Pedido não encontrado" });

    if (pedido.workflow_status !== "submitted") {
      return res.status(400).json({ message: "Apenas pedidos submetidos podem ser devolvidos pelo Talent Manager" });
    }

    pedido.workflow_status = "open";
    pedido.tm_validator_id = req.userId;
    pedido.tm_validated_at = new Date();
    pedido.tm_comment = comment || null;
    pedido.rejection_reason = comment || null;
    await pedido.save();

    await notifyConsultorPedido({
      pedido,
      titulo: "Pedido devolvido",
      mensagem: comment
        ? `O teu pedido precisa de retificacao. Motivo: ${comment}`
        : "O teu pedido precisa de retificacao. Reve as evidencias e volta a submeter.",
      emailFactory: (payload) => sendBadgeReturnedEmail({ ...payload, comment }),
    });

    await createAuditLog(req, res, {
      action: "TM_DEVOLVER_PEDIDO",
      entity: "ConsultorBadge",
      userId: req.userId,
      entityId: pedido.id,
      description: `Talent Manager devolveu pedido de badge #${pedido.badge_id} do consultor #${pedido.consultor_id}${comment ? `: ${comment}` : ""}`,
      newValues: { workflow_status: pedido.workflow_status },
    });

    return res.json(pedido);
  } catch (err) {
    console.error("Erro TM devolver pedido:", err);
    res.status(500).json({ message: "Erro ao devolver pedido" });
  }
}

/**
 * Service Line aprova (Em Validação -> Fechado/Obtido)
 */
export async function slAprovarPedido(req, res) {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    if (req.userRole !== "service_line_leader") {
      return res.status(403).json({ message: "Apenas Service Line Leader" });
    }

    let pedido = await ConsultorBadge.findByPk(id);
    if (!pedido) return res.status(404).json({ message: "Pedido não encontrado" });

    const slServiceLineId = await getServiceLineIdForUser(req.userId);
    const hasAccess = await ensureSLAccess(pedido, slServiceLineId);
    if (!hasAccess) return res.status(403).json({ message: "Acesso negado" });

    if (pedido.workflow_status !== "em_validacao") {
      return res.status(400).json({ message: "Apenas pedidos validados pelo Talent Manager podem ser aprovados" });
    }

    await database.transaction(async (transaction) => {
      pedido = await ConsultorBadge.findByPk(id, { transaction });
      if (!pedido) {
        const error = new Error("Pedido não encontrado");
        error.statusCode = 404;
        throw error;
      }

      if (pedido.workflow_status !== "em_validacao") {
        const error = new Error("Apenas pedidos validados pelo Talent Manager podem ser aprovados");
        error.statusCode = 400;
        throw error;
      }

      const wasObtained = pedido.status === "obtido";
      pedido.workflow_status = "fechado";
      pedido.status = "obtido";
      pedido.data_atribuicao = pedido.data_atribuicao || new Date();
      pedido.sl_validator_id = req.userId;
      pedido.sl_validated_at = new Date();
      pedido.sl_comment = comment || null;
      pedido.rejection_reason = null;
      await pedido.save({ transaction });

      const [badge, user] = await Promise.all([
        Badge.findByPk(pedido.badge_id, { transaction }),
        User.findByPk(pedido.consultor_id, { transaction }),
      ]);
      if (badge && user && !wasObtained) {
        user.points_total = (user.points_total || 0) + (badge.points || 0);
        await user.save({ transaction });
      }
    });

    await notifyConsultorPedido({
      pedido,
      titulo: "Badge aprovado",
      mensagem: "O teu pedido foi aprovado e o badge está disponível.",
      emailFactory: sendBadgeApprovedEmail,
      teamsNotify: true,
    });

    await createAuditLog(req, res, {
      action: "SL_APROVAR_PEDIDO",
      entity: "ConsultorBadge",
      userId: req.userId,
      entityId: pedido.id,
      description: `Service Line Leader aprovou pedido de badge #${pedido.badge_id} do consultor #${pedido.consultor_id}`,
      newValues: { status: pedido.status, workflow_status: pedido.workflow_status },
    });

    return res.json(pedido);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    console.error("Erro SL aprovar pedido:", err);
    res.status(500).json({ message: "Erro ao aprovar pedido" });
  }
}

/**
 * Service Line rejeita (Em Validação -> Fechado/Rejeitado)
 */
export async function slRejeitarPedido(req, res) {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    if (req.userRole !== "service_line_leader") {
      return res.status(403).json({ message: "Apenas Service Line Leader" });
    }

    let pedido = await ConsultorBadge.findByPk(id);
    if (!pedido) return res.status(404).json({ message: "Pedido não encontrado" });

    const slServiceLineId = await getServiceLineIdForUser(req.userId);
    const hasAccess = await ensureSLAccess(pedido, slServiceLineId);
    if (!hasAccess) return res.status(403).json({ message: "Acesso negado" });

    if (pedido.workflow_status !== "em_validacao") {
      return res.status(400).json({ message: "Apenas pedidos validados pelo Talent Manager podem ser rejeitados" });
    }

    await database.transaction(async (transaction) => {
      pedido = await ConsultorBadge.findByPk(id, { transaction });
      if (!pedido) {
        const error = new Error("Pedido não encontrado");
        error.statusCode = 404;
        throw error;
      }

      if (pedido.workflow_status !== "em_validacao") {
        const error = new Error("Apenas pedidos validados pelo Talent Manager podem ser rejeitados");
        error.statusCode = 400;
        throw error;
      }

      pedido.workflow_status = "fechado";
      pedido.status = "rejeitado";
      pedido.sl_validator_id = req.userId;
      pedido.sl_validated_at = new Date();
      pedido.sl_comment = comment || null;
      pedido.rejection_reason = comment || null;
      await pedido.save({ transaction });
    });

    await notifyConsultorPedido({
      pedido,
      titulo: "Pedido rejeitado",
      mensagem: comment
        ? `O teu pedido foi rejeitado pela Service Line. Motivo: ${comment}`
        : "O teu pedido foi rejeitado pela Service Line.",
      emailFactory: (payload) => sendBadgeRejectedEmail({ ...payload, comment }),
      teamsNotify: true,
    });

    await createAuditLog(req, res, {
      action: "SL_REJEITAR_PEDIDO",
      entity: "ConsultorBadge",
      userId: req.userId,
      entityId: pedido.id,
      description: `Service Line Leader rejeitou pedido de badge #${pedido.badge_id} do consultor #${pedido.consultor_id}${comment ? `: ${comment}` : ""}`,
      newValues: { status: pedido.status, workflow_status: pedido.workflow_status },
    });

    return res.json(pedido);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    console.error("Erro SL rejeitar pedido:", err);
    res.status(500).json({ message: "Erro ao rejeitar pedido" });
  }
}

/**
 * Service Line devolve ao consultor (Em Validação -> Open)
 */
export async function slDevolverPedido(req, res) {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    if (req.userRole !== "service_line_leader") {
      return res.status(403).json({ message: "Apenas Service Line Leader" });
    }

    let pedido = await ConsultorBadge.findByPk(id);
    if (!pedido) return res.status(404).json({ message: "Pedido não encontrado" });

    const slServiceLineId = await getServiceLineIdForUser(req.userId);
    const hasAccess = await ensureSLAccess(pedido, slServiceLineId);
    if (!hasAccess) return res.status(403).json({ message: "Acesso negado" });

    if (pedido.workflow_status !== "em_validacao") {
      return res.status(400).json({ message: "Apenas pedidos validados pelo Talent Manager podem ser devolvidos pela Service Line" });
    }

    await database.transaction(async (transaction) => {
      pedido = await ConsultorBadge.findByPk(id, { transaction });
      if (!pedido) {
        const error = new Error("Pedido não encontrado");
        error.statusCode = 404;
        throw error;
      }

      if (pedido.workflow_status !== "em_validacao") {
        const error = new Error("Apenas pedidos validados pelo Talent Manager podem ser devolvidos pela Service Line");
        error.statusCode = 400;
        throw error;
      }

      pedido.workflow_status = "open";
      pedido.status = "pendente";
      pedido.sl_validator_id = req.userId;
      pedido.sl_validated_at = new Date();
      pedido.sl_comment = comment || null;
      pedido.rejection_reason = comment || null;
      await pedido.save({ transaction });
    });

    await notifyConsultorPedido({
      pedido,
      titulo: "Pedido devolvido",
      mensagem: comment
        ? `O teu pedido foi devolvido pela Service Line para retificacao. Motivo: ${comment}`
        : "O teu pedido foi devolvido pela Service Line para retificacao.",
      emailFactory: (payload) => sendBadgeReturnedEmail({ ...payload, comment }),
    });

    await createAuditLog(req, res, {
      action: "SL_DEVOLVER_PEDIDO",
      entity: "ConsultorBadge",
      userId: req.userId,
      entityId: pedido.id,
      description: `Service Line Leader devolveu pedido de badge #${pedido.badge_id} do consultor #${pedido.consultor_id}${comment ? `: ${comment}` : ""}`,
      newValues: { status: pedido.status, workflow_status: pedido.workflow_status },
    });

    return res.json(pedido);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    console.error("Erro SL devolver pedido:", err);
    res.status(500).json({ message: "Erro ao devolver pedido" });
  }
}

/**
 * Estatísticas de pedidos
 */
export async function getPedidosStats(req, res) {
  try {
    const total = await ConsultorBadge.count();
    const pendentes = await ConsultorBadge.count({ where: { status: "pendente" } });
    const aprovados = await ConsultorBadge.count({ where: { status: "obtido" } });
    const rejeitados = await ConsultorBadge.count({ where: { status: "rejeitado" } });

    res.json({
      total,
      pendentes,
      aprovados,
      rejeitados,
      aprovadosPercent: total > 0 ? Math.round((aprovados / total) * 100) : 0
    });

  } catch (err) {
    console.error("Erro ao obter stats:", err);
    res.status(500).json({ message: "Erro ao obter estatísticas" });
  }
}
