import ConsultorBadge from "../models/ConsultorBadge.js";
import User from "../models/User.js";
import Badge from "../models/Badge.js";
import database from "../config/database.js";
import { QueryTypes, Op } from "sequelize";

/**
 * Listar todos os pedidos de badges (com filtro opcional por status)
 */
export async function getAllPedidos(req, res) {
  try {
    const { status } = req.query;
    const where = status && status !== "all" ? { status } : {};

    const pedidos = await ConsultorBadge.findAll({
      attributes: ["id", "status", "data_atribuicao", "created_at"],
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
          attributes: ["id", "name", "description", "level", "points"]
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
        { model: Badge, as: "badge", attributes: ["id", "name", "description", "level", "points"] }
      ]
    });

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
    pedido.data_atribuicao = new Date();
    await pedido.save();

    // Atualizar pontos do utilizador
    const user = await User.findByPk(pedido.user_id);
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
    const user_id = req.user.id; // Do token JWT

    // Verificar se já existe pedido pendente/obtido para este badge
    const existing = await ConsultorBadge.findOne({
      where: {
        user_id,
        badge_id,
        status: { [Op.in]: ["pendente", "obtido"] }
      }
    });

    if (existing) {
      return res.status(400).json({ message: "Já existe um pedido ativo para este badge" });
    }

    const pedido = await ConsultorBadge.create({
      user_id,
      badge_id,
      status: "pendente",
      created_at: new Date()
    });

    res.status(201).json(pedido);

  } catch (err) {
    console.error("Erro ao criar pedido:", err);
    res.status(500).json({ message: "Erro ao criar pedido de badge" });
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

    if (pedido.status !== "pendente") {
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
