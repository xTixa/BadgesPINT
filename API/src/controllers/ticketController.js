import Ticket from "../models/Ticket.js";
import User from "../models/User.js";
import { fn, col } from "sequelize";
import { createNotification } from "../services/notificationService.js";

// Criar novo ticket
export const criarTicket = async (req, res) => {
  try {
    const { titulo, descricao, categoria, prioridade } = req.body;
    const utilizador_id = req.userId;

    // Validação básica
    if (!titulo || !descricao) {
      return res.status(400).json({
        success: false,
        message: "Título e descrição são obrigatórios",
      });
    }

    const ticket = await Ticket.create({
      titulo,
      descricao,
      categoria: categoria || "outro",
      prioridade: prioridade || "media",
      utilizador_id,
    });

    res.status(201).json({
      success: true,
      message: "Ticket criado com sucesso",
      data: ticket,
    });
  } catch (error) {
    console.error("Erro ao criar ticket:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao criar ticket",
      error: error.message,
    });
  }
};

// Obter tickets do utilizador
export const obterMeusTickets = async (req, res) => {
  try {
    const utilizador_id = req.userId;
    const { status, prioridade, page = 1, limit = 15 } = req.query;

    let where = { utilizador_id };
    if (status) where.status = status;
    if (prioridade) where.prioridade = prioridade;

    const offset = (page - 1) * limit;

    const { count, rows } = await Ticket.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      success: true,
      data: rows,
      total: count,
      pages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error("Erro ao obter tickets:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao obter tickets",
      error: error.message,
    });
  }
};

// Obter todos os tickets (admin)
export const obterTodosTickets = async (req, res) => {
  try {
    const { status, prioridade, utilizador_id, page = 1, limit = 15 } = req.query;

    let where = {};
    if (status) where.status = status;
    if (prioridade) where.prioridade = prioridade;
    if (utilizador_id) where.utilizador_id = utilizador_id;

    const offset = (page - 1) * limit;

    const { count, rows } = await Ticket.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      success: true,
      data: rows,
      total: count,
      pages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error("Erro ao obter tickets:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao obter tickets",
      error: error.message,
    });
  }
};

// Obter detalhes de um ticket
export const obterTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const utilizador_id = req.userId;
    const role = req.userRole;

    const ticket = await Ticket.findByPk(id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket não encontrado",
      });
    }

    if (role !== "admin" && ticket.utilizador_id !== utilizador_id) {
      return res.status(403).json({
        success: false,
        message: "Acesso negado",
      });
    }

    res.json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    console.error("Erro ao obter ticket:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao obter ticket",
      error: error.message,
    });
  }
};

// Atualizar ticket (admin)
export const atualizarTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, prioridade, resposta_admin } = req.body;
    const admin_id = req.userId;

    const ticket = await Ticket.findByPk(id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket não encontrado",
      });
    }

    // Atualizar campos
    if (status) ticket.status = status;
    if (prioridade) ticket.prioridade = prioridade;
    if (resposta_admin) ticket.resposta_admin = resposta_admin;
    if (status === "resolvido" || status === "fechado") {
      ticket.data_resolucao = new Date();
      ticket.admin_id = admin_id;
    }

    await ticket.save();

    // Criar notificação para o utilizador
    let tipo = "ticket_resposta";
    let mensagem = "Seu ticket recebeu uma resposta do administrador";

    if (status === "resolvido") {
      tipo = "ticket_resolvido";
      mensagem = "Seu ticket foi marcado como resolvido";
    } else if (status === "fechado") {
      tipo = "ticket_fechado";
      mensagem = "Seu ticket foi fechado";
    }

    await createNotification({
      tipo,
      titulo: `Atualização: ${ticket.titulo}`,
      mensagem,
      utilizador_id: ticket.utilizador_id,
      ticket_id: ticket.id,
    });

    res.json({
      success: true,
      message: "Ticket atualizado com sucesso",
      data: ticket,
    });
  } catch (error) {
    console.error("Erro ao atualizar ticket:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao atualizar ticket",
      error: error.message,
    });
  }
};

// Obter estatísticas de tickets
export const obterEstatisticas = async (req, res) => {
  try {
    const total = await Ticket.count();
    const abertos = await Ticket.count({ where: { status: "aberto" } });
    const resolvidos = await Ticket.count({ where: { status: "resolvido" } });
    const criticos = await Ticket.count({ where: { prioridade: "critica" } });

    res.json({
      success: true,
      data: {
        total,
        abertos,
        resolvidos,
        criticos,
      },
    });
  } catch (error) {
    console.error("Erro ao obter estatísticas:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao obter estatísticas",
      error: error.message,
    });
  }
};
