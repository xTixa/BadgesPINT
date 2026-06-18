import ConsultorBadge from "../models/ConsultorBadge.js";
import User from "../models/User.js";
import Badge from "../models/Badge.js";
import Area from "../models/Area.js";
import Notification from "../models/Notification.js";
import database from "../config/database.js";
import { QueryTypes, Op } from "sequelize";

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

async function notifyBadgeApplication(pedido) {
  const badge = await Badge.findByPk(pedido.badge_id, {
    attributes: ["id", "name", "description"],
  });
  const badgeName = badge?.name || badge?.description || `#${pedido.badge_id}`;

  await Notification.create({
    tipo: "geral",
    titulo: "Candidatura submetida",
    mensagem: `Candidataste-te ao badge ${badgeName}.`,
    utilizador_id: pedido.consultor_id,
    lido: false
  });
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
          attributes: ["id", "name", "description", "level", "points", "area_id"],
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
        { model: Badge, as: "badge", attributes: ["id", "name", "description", "level", "points", "area_id"], include: [{ model: Area, as: "area", attributes: ["id", "service_line_id"] }] }
      ]
    });

    if (req.userRole === "service_line_leader") {
      const slServiceLineId = await getServiceLineIdForUser(req.userId);
      if (!slServiceLineId || pedido?.badge?.area?.service_line_id !== slServiceLineId) {
        return res.status(403).json({ message: "Acesso negado" });
      }
    }

    if (!pedido) {
      return res.status(404).json({ message: "Pedido não encontrado" });
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

    const pedido = await ConsultorBadge.findByPk(id);
    if (!pedido) {
      return res.status(404).json({ message: "Pedido não encontrado" });
    }

    pedido.status = "obtido";
    pedido.workflow_status = "fechado";
    pedido.data_atribuicao = new Date();
    await pedido.save();

    // Atualizar pontos do utilizador
    const user = await User.findByPk(pedido.consultor_id);
    const badge = await Badge.findByPk(pedido.badge_id);

    if (user && badge) {
      user.points_total = (user.points_total || 0) + badge.points;
      await user.save();
    }

    res.json({
      message: "Pedido aprovado com sucesso",
      pedido
    });

  } catch (err) {
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

    const pedido = await ConsultorBadge.findByPk(id);
    if (!pedido) {
      return res.status(404).json({ message: "Pedido não encontrado" });
    }

    pedido.status = "rejeitado";
    pedido.workflow_status = "fechado";
    await pedido.save();

    res.json({
      message: "Pedido rejeitado com sucesso",
      pedido
    });

  } catch (err) {
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

    if (req.userRole !== "consultant") {
      return res.status(403).json({ message: "Apenas consultores podem submeter pedidos" });
    }

    // Verificar se já existe pedido pendente/obtido para este badge
    const existing = await ConsultorBadge.findOne({
      where: {
        consultor_id,
        badge_id
      }
    });

    if (existing) {
      return res.status(400).json({ message: "Já existe um pedido ativo para este badge" });
    }

    const pedido = await ConsultorBadge.create({
      consultor_id,
      badge_id,
      status: "pendente",
      workflow_status: "submitted",
      submitted_at: new Date()
    });

    await notifyBadgeApplication(pedido);

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
    await pedido.save();

    await Notification.create({
      tipo: "geral",
      titulo: "Pedido em validação",
      mensagem: "O teu pedido foi validado pelo Talent Manager e segue para validação final.",
      utilizador_id: pedido.consultor_id,
      lido: false
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

    pedido.workflow_status = "open";
    pedido.tm_validator_id = req.userId;
    pedido.tm_validated_at = new Date();
    pedido.tm_comment = comment || null;
    await pedido.save();

    await Notification.create({
      tipo: "geral",
      titulo: "Pedido devolvido",
      mensagem: "O teu pedido precisa de retificação. Revê as evidências e volta a submeter.",
      utilizador_id: pedido.consultor_id,
      lido: false
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

    const pedido = await ConsultorBadge.findByPk(id);
    if (!pedido) return res.status(404).json({ message: "Pedido não encontrado" });

    const slServiceLineId = await getServiceLineIdForUser(req.userId);
    const hasAccess = await ensureSLAccess(pedido, slServiceLineId);
    if (!hasAccess) return res.status(403).json({ message: "Acesso negado" });

    pedido.workflow_status = "fechado";
    pedido.status = "obtido";
    pedido.data_atribuicao = new Date();
    pedido.sl_validator_id = req.userId;
    pedido.sl_validated_at = new Date();
    pedido.sl_comment = comment || null;
    await pedido.save();

    const badge = await Badge.findByPk(pedido.badge_id);
    const user = await User.findByPk(pedido.consultor_id);
    if (badge && user) {
      user.points_total = (user.points_total || 0) + (badge.points || 0);
      await user.save();
    }

    await Notification.create({
      tipo: "geral",
      titulo: "Badge aprovado",
      mensagem: "O teu pedido foi aprovado e o badge está disponível.",
      utilizador_id: pedido.consultor_id,
      lido: false
    });

    return res.json(pedido);
  } catch (err) {
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

    const pedido = await ConsultorBadge.findByPk(id);
    if (!pedido) return res.status(404).json({ message: "Pedido não encontrado" });

    const slServiceLineId = await getServiceLineIdForUser(req.userId);
    const hasAccess = await ensureSLAccess(pedido, slServiceLineId);
    if (!hasAccess) return res.status(403).json({ message: "Acesso negado" });

    pedido.workflow_status = "fechado";
    pedido.status = "rejeitado";
    pedido.sl_validator_id = req.userId;
    pedido.sl_validated_at = new Date();
    pedido.sl_comment = comment || null;
    await pedido.save();

    await Notification.create({
      tipo: "geral",
      titulo: "Pedido rejeitado",
      mensagem: "O teu pedido foi rejeitado pela Service Line.",
      utilizador_id: pedido.consultor_id,
      lido: false
    });

    return res.json(pedido);
  } catch (err) {
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

    const pedido = await ConsultorBadge.findByPk(id);
    if (!pedido) return res.status(404).json({ message: "Pedido não encontrado" });

    const slServiceLineId = await getServiceLineIdForUser(req.userId);
    const hasAccess = await ensureSLAccess(pedido, slServiceLineId);
    if (!hasAccess) return res.status(403).json({ message: "Acesso negado" });

    pedido.workflow_status = "open";
    pedido.status = "pendente";
    pedido.sl_validator_id = req.userId;
    pedido.sl_validated_at = new Date();
    pedido.sl_comment = comment || null;
    await pedido.save();

    await Notification.create({
      tipo: "geral",
      titulo: "Pedido devolvido",
      mensagem: "O teu pedido foi devolvido pela Service Line para retificação.",
      utilizador_id: pedido.consultor_id,
      lido: false
    });

    return res.json(pedido);
  } catch (err) {
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
