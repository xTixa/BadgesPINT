import AuditLog from "../models/AuditLog.js";
import User from "../models/User.js";
import { Op } from "sequelize";

// Função auxiliar para registar logs (usar em outros controllers)
export const createAuditLog = async (req, res, data) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress || "Unknown";
    const userAgent = req.get("user-agent") || "Unknown";

    const auditLog = await AuditLog.create({
      userId: data.userId || null,
      action: data.action,
      entity: data.entity,
      entityId: data.entityId || null,
      description: data.description || null,
      oldValues: data.oldValues || null,
      newValues: data.newValues || null,
      ipAddress,
      userAgent,
      status: data.status || "success",
    });

    return auditLog;
  } catch (error) {
    console.error("Erro ao criar audit log:", error);
  }
};

// Obter todos os logs com filtros
export const getLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, action, entity, userId, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (action) where.action = action;
    if (entity) where.entity = entity;
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const { count, rows } = await AuditLog.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (error) {
    console.error("Erro ao obter logs:", error);
    res.status(500).json({ error: "Erro ao obter logs de auditoria" });
  }
};

// Obter logs de um utilizador específico
export const getUserLogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await AuditLog.findAndCountAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (error) {
    console.error("Erro ao obter logs do utilizador:", error);
    res.status(500).json({ error: "Erro ao obter logs" });
  }
};

// Obter estatísticas dos logs
export const getAuditStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};

    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    // Total de logs
    const totalLogs = await AuditLog.count({ where });

    res.json({
      totalLogs,
    });
  } catch (error) {
    console.error("Erro ao obter estatísticas:", error);
    res.status(500).json({ error: "Erro ao obter estatísticas de auditoria" });
  }
};

// Exportar logs para CSV (futura implementação)
export const exportLogs = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};

    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const logs = await AuditLog.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    res.json(logs);
  } catch (error) {
    console.error("Erro ao exportar logs:", error);
    res.status(500).json({ error: "Erro ao exportar logs" });
  }
};
