import SLA from "../models/SLA.js";
import User from "../models/User.js";
import ConsultorBadge from "../models/ConsultorBadge.js";
import Badge from "../models/Badge.js";
import Area from "../models/Area.js";
import { Op } from "sequelize";
import { sendSLAAlertEmail } from "../services/mailService.js";
import { createUniqueNotification } from "../services/notificationService.js";
import { createAuditLog } from "./auditLogController.js";

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

    const result = await Promise.all(
      slas.map(async (sla) => {
        const [overduePedidos, pendingPedidos] = await Promise.all([
          getOverduePedidosForSLA(sla),
          getPendingPedidosForSLA(sla),
        ]);

        return {
          id: sla.id,
          team_id: sla.team_id,
          teamName: sla.team?.name || `Equipa #${sla.team_id}`,
          teamType: sla.team_type,
          hoursLimit: sla.hours_limit,
          notification_enabled: sla.notification_enabled,
          email_notification: sla.email_notification,
          push_notification: sla.push_notification,
          status: sla.status,
          overdue: overduePedidos.length,
          pending: pendingPedidos.length,
        };
      })
    );

    res.json(result);
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

    await createAuditLog(req, res, {
      action: "CRIAR_SLA",
      entity: "SLA",
      userId: req.userId,
      entityId: sla.id,
      description: `SLA criado para equipa #${sla.team_id} (${sla.team_type})`,
      newValues: sla.toJSON(),
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

    const oldValues = sla.toJSON();

    await sla.update({
      hours_limit: hours_limit !== undefined ? hours_limit : sla.hours_limit,
      notification_enabled: notification_enabled !== undefined ? notification_enabled : sla.notification_enabled,
      email_notification: email_notification !== undefined ? email_notification : sla.email_notification,
      push_notification: push_notification !== undefined ? push_notification : sla.push_notification,
      status: status || sla.status
    });

    await createAuditLog(req, res, {
      action: "ATUALIZAR_SLA",
      entity: "SLA",
      userId: req.userId,
      entityId: sla.id,
      description: `SLA #${sla.id} (equipa #${sla.team_id}) atualizado`,
      oldValues,
      newValues: sla.toJSON(),
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

    const oldValues = sla.toJSON();
    await sla.destroy();

    await createAuditLog(req, res, {
      action: "ELIMINAR_SLA",
      entity: "SLA",
      userId: req.userId,
      entityId: id,
      description: `SLA #${id} (equipa #${oldValues.team_id}) eliminado`,
      oldValues,
    });

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

async function getServiceLineIdForUser(userId) {
  const user = await User.findByPk(userId, { attributes: ["id", "area_id"] });
  if (!user?.area_id) return null;
  const area = await Area.findByPk(user.area_id, { attributes: ["id", "service_line_id"] });
  return area?.service_line_id || null;
}

async function getPendingPedidosForSLA(sla) {
  const cutoff = new Date(Date.now() - Number(sla.hours_limit || 24) * 60 * 60 * 1000);

  if (sla.team_type === "talent_manager") {
    return ConsultorBadge.findAll({
      where: {
        workflow_status: "submitted",
        submitted_at: { [Op.gt]: cutoff },
      },
      attributes: ["id"],
    });
  }

  const serviceLineId = await getServiceLineIdForUser(sla.team_id);
  if (!serviceLineId) return [];

  return ConsultorBadge.findAll({
    where: {
      workflow_status: "em_validacao",
      tm_validated_at: { [Op.gt]: cutoff },
    },
    attributes: ["id"],
    include: [
      {
        model: Badge,
        as: "badge",
        required: true,
        attributes: ["id"],
        include: [
          {
            model: Area,
            as: "area",
            where: { service_line_id: serviceLineId },
            required: true,
            attributes: [],
          },
        ],
      },
    ],
  });
}

async function getOverduePedidosForSLA(sla) {
  const cutoff = new Date(Date.now() - Number(sla.hours_limit || 24) * 60 * 60 * 1000);

  if (sla.team_type === "talent_manager") {
    return ConsultorBadge.findAll({
      where: {
        workflow_status: "submitted",
        submitted_at: { [Op.lte]: cutoff },
      },
      include: [
        { model: Badge, as: "badge", attributes: ["id", "description", "area_id"] },
        { model: User, as: "user", attributes: ["id", "name", "email"] },
      ],
      order: [["submitted_at", "ASC"]],
    });
  }

  const serviceLineId = await getServiceLineIdForUser(sla.team_id);
  if (!serviceLineId) return [];

  const areas = await Area.findAll({
    where: { service_line_id: serviceLineId },
    attributes: ["id"],
    raw: true,
  });
  // area_id: [] geraria "IN ()" (SQL invalido) — [-1] devolve zero resultados
  // em vez de (por causa de um `where` aninhado sem `required`) todas as areas.
  const areaIds = areas.length ? areas.map((a) => a.id) : [-1];

  return ConsultorBadge.findAll({
    where: {
      workflow_status: "em_validacao",
      tm_validated_at: { [Op.lte]: cutoff },
    },
    include: [
      {
        model: Badge,
        as: "badge",
        attributes: ["id", "description", "area_id"],
        where: { area_id: areaIds },
        required: true,
        include: [{ model: Area, as: "area", attributes: ["id", "service_line_id"] }],
      },
      { model: User, as: "user", attributes: ["id", "name", "email"] },
    ],
    order: [["tm_validated_at", "ASC"]],
  });
}

export async function runSLAAlertCheck() {
  const slas = await SLA.findAll({
    where: {
      status: "active",
      notification_enabled: true,
    },
    include: [{ model: User, as: "team", attributes: ["id", "name", "email", "role"] }],
  });

  let checked = 0;
  let alerts = 0;

  for (const sla of slas) {
    const pedidos = await getOverduePedidosForSLA(sla);
    checked += pedidos.length;

    for (const pedido of pedidos) {
      const badgeName = pedido.badge?.description || `Badge #${pedido.badge_id}`;
      const consultorName = pedido.user?.name || "consultor";
      const workflowStatus = pedido.workflow_status;
      const titulo = `SLA ultrapassado - Pedido #${pedido.id}`;
      const mensagem = `O pedido do badge "${badgeName}" de ${consultorName} ultrapassou o SLA de ${sla.hours_limit} horas.`;

      const notification = await createUniqueNotification({
        titulo,
        mensagem,
        utilizador_id: sla.team_id,
        push: sla.push_notification !== false,
        email:
          sla.email_notification && sla.team?.email
            ? {
                to: sla.team.email,
                send: () =>
                  sendSLAAlertEmail({
                    to: sla.team.email,
                    name: sla.team.name,
                    badgeName,
                    consultorName,
                    hoursLimit: sla.hours_limit,
                    workflowStatus,
                  }),
              }
            : null,
      });

      if (!notification.getDataValue("_existing")) {
        alerts += 1;
      }
    }
  }

  return {
    success: true,
    slas_checked: slas.length,
    overdue_pedidos_checked: checked,
    alerts_created_or_existing: alerts,
  };
}

export async function checkSLAAlerts(req, res) {
  try {
    res.json(await runSLAAlertCheck());
  } catch (err) {
    console.error("Erro ao verificar alertas SLA:", err);
    res.status(500).json({ message: "Erro ao verificar alertas SLA" });
  }
}
