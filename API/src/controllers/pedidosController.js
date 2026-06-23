import ConsultorBadge from "../models/ConsultorBadge.js";
import User from "../models/User.js";
import Badge from "../models/Badge.js";
import Area from "../models/Area.js";
import database from "../config/database.js";
import { QueryTypes, Op } from "sequelize";
import {
  sendBadgeApplicationEmail,
  sendBadgeApprovedEmail,
  sendBadgeRejectedEmail,
  sendBadgeReturnedEmail,
  sendSLValidationEmail,
} from "../services/mailService.js";
import { createNotification } from "../services/notificationService.js";

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

async function notifyConsultorPedido({ pedido, titulo, mensagem, emailFactory, transaction = null }) {
  const { consultor, badgeName } = await getPedidoNotificationContext(pedido);

  return createNotification({
    titulo,
    mensagem,
    utilizador_id: pedido.consultor_id,
    transaction,
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
    mensagem: `Candidataste-te ao badge ${badgeName}.`,
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
      console.error("Notificacao criada, mas email de candidatura falhou:", error.message);
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

    let badgeAreaFilter = null;
    if (req.userRole === "service_line_leader") {
      const slServiceLineId = await getServiceLineIdForUser(req.userId);
      if (!slServiceLineId) {
        return res.status(403).json({ message: "Service Line não associada ao utilizador" });
      }
      badgeAreaFilter = { service_line_id: slServiceLineId };
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
          include: badgeAreaFilter ? [{ model: Area, as: "area", where: badgeAreaFilter, attributes: ["id", "service_line_id"] }] : []
        }
      ],
      order: [["created_at", "DESC"]]
    });

    res.json(pedidos);
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
      await pedido.save({ transaction });
    });

    await notifyConsultorPedido({
      pedido,
      titulo: "Pedido rejeitado",
      mensagem: motivo ? `O teu pedido foi rejeitado. Motivo: ${motivo}` : "O teu pedido foi rejeitado.",
      emailFactory: (payload) => sendBadgeRejectedEmail({ ...payload, comment: motivo }),
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
      attributes: ["id"]
    });

    if (!badge) {
      return res.status(404).json({ message: "Badge não encontrado" });
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
      workflow_status: "submitted",
      submitted_at: new Date()
    });

    try {
      await notifyBadgeApplication(pedido);
    } catch (notificationError) {
      console.error("Pedido criado, mas falhou notificação de candidatura:", notificationError);
    }

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

    pedido.workflow_status = "submitted";
    pedido.submitted_at = new Date();
    await pedido.save();

    await notifyBadgeApplication(pedido);

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

    pedido.workflow_status = "em_validacao";
    pedido.tm_validator_id = req.userId;
    pedido.tm_validated_at = new Date();
    pedido.tm_comment = comment || null;
    pedido.rejection_reason = null;
    await pedido.save();

    await createNotification({
      titulo: "Pedido em validação",
      mensagem: "O teu pedido foi validado pelo Talent Manager e segue para validação final.",
      utilizador_id: pedido.consultor_id,
    });

    // Notify SL leaders of the badge's service line
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
            utilizador_id: leader.id,
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

    await database.transaction(async (transaction) => {
      pedido = await ConsultorBadge.findByPk(id, { transaction });
      if (!pedido) {
        const error = new Error("Pedido não encontrado");
        error.statusCode = 404;
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

    await database.transaction(async (transaction) => {
      pedido = await ConsultorBadge.findByPk(id, { transaction });
      if (!pedido) {
        const error = new Error("Pedido não encontrado");
        error.statusCode = 404;
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

    await database.transaction(async (transaction) => {
      pedido = await ConsultorBadge.findByPk(id, { transaction });
      if (!pedido) {
        const error = new Error("Pedido não encontrado");
        error.statusCode = 404;
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
