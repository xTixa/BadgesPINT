import SLA from "../models/SLA.js";
import User from "../models/User.js";

/**
 * Listar todos os SLAs
 */
export async function getAllSLAs(req, res) {
  try {
    const slas = await SLA.findAll({
      include: [
        {
          model: User,
          as: "team",
          attributes: ["id", "name", "email", "role"]
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    res.json(slas);
  } catch (err) {
    console.error("Erro ao listar SLAs:", err);
    res.status(500).json({ message: "Erro ao listar SLAs" });
  }
}

/**
 * Obter um SLA específico
 */
export async function getSLAById(req, res) {
  try {
    const { id } = req.params;

    const sla = await SLA.findByPk(id, {
      include: [
        {
          model: User,
          as: "team",
          attributes: ["id", "name", "email", "role"]
        }
      ]
    });

    if (!sla) {
      return res.status(404).json({ message: "SLA não encontrado" });
    }

    res.json(sla);
  } catch (err) {
    console.error("Erro ao obter SLA:", err);
    res.status(500).json({ message: "Erro ao obter SLA" });
  }
}

/**
 * Criar novo SLA
 */
export async function createSLA(req, res) {
  try {
    const { team_id, team_type, hours_limit, notification_enabled, email_notification, push_notification } = req.body;

    if (!team_id || !team_type) {
      return res.status(400).json({ message: "team_id e team_type são obrigatórios" });
    }

    // Verificar se já existe SLA para esta equipa
    const existing = await SLA.findOne({ where: { team_id } });
    if (existing) {
      return res.status(400).json({ message: "Já existe um SLA para esta equipa" });
    }

    const sla = await SLA.create({
      team_id,
      team_type,
      hours_limit: hours_limit || 24,
      notification_enabled: notification_enabled !== false,
      email_notification: email_notification !== false,
      push_notification: push_notification !== false,
      status: "active"
    });

    res.status(201).json(sla);
  } catch (err) {
    console.error("Erro ao criar SLA:", err);
    res.status(500).json({ message: "Erro ao criar SLA" });
  }
}

/**
 * Atualizar SLA
 */
export async function updateSLA(req, res) {
  try {
    const { id } = req.params;
    const { hours_limit, notification_enabled, email_notification, push_notification, status } = req.body;

    const sla = await SLA.findByPk(id);
    if (!sla) {
      return res.status(404).json({ message: "SLA não encontrado" });
    }

    await sla.update({
      hours_limit: hours_limit !== undefined ? hours_limit : sla.hours_limit,
      notification_enabled: notification_enabled !== undefined ? notification_enabled : sla.notification_enabled,
      email_notification: email_notification !== undefined ? email_notification : sla.email_notification,
      push_notification: push_notification !== undefined ? push_notification : sla.push_notification,
      status: status || sla.status
    });

    res.json(sla);
  } catch (err) {
    console.error("Erro ao atualizar SLA:", err);
    res.status(500).json({ message: "Erro ao atualizar SLA" });
  }
}

/**
 * Deletar SLA
 */
export async function deleteSLA(req, res) {
  try {
    const { id } = req.params;

    const sla = await SLA.findByPk(id);
    if (!sla) {
      return res.status(404).json({ message: "SLA não encontrado" });
    }

    await sla.destroy();

    res.json({ message: "SLA deletado com sucesso" });
  } catch (err) {
    console.error("Erro ao deletar SLA:", err);
    res.status(500).json({ message: "Erro ao deletar SLA" });
  }
}

/**
 * Obter SLAs por tipo de equipa
 */
export async function getSLAsByTeamType(req, res) {
  try {
    const { teamType } = req.params;

    const slas = await SLA.findAll({
      where: { team_type: teamType, status: "active" },
      include: [
        {
          model: User,
          as: "team",
          attributes: ["id", "name", "email"]
        }
      ]
    });

    res.json(slas);
  } catch (err) {
    console.error("Erro ao obter SLAs:", err);
    res.status(500).json({ message: "Erro ao obter SLAs" });
  }
}
