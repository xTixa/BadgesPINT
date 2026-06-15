import Notification from "../models/Notification.js";
import User from "../models/User.js";
import FcmToken from "../models/FcmToken.js";

// Obter notificações do utilizador
export const obterNotificacoes = async (req, res) => {
  try {
    const utilizador_id = req.userId;
    const { lido, page = 1, limit = 20 } = req.query;

    let where = { utilizador_id };
    if (lido !== undefined) where.lido = lido === "true";

    const offset = (page - 1) * limit;

    const { count, rows } = await Notification.findAndCountAll({
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
      naoLidas: await Notification.count({ where: { utilizador_id, lido: false } }),
    });
  } catch (error) {
    console.error("Erro ao obter notificações:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao obter notificações",
      error: error.message,
    });
  }
};

export const registarDeviceToken = async (req, res) => {
  try {
    const utilizador_id = req.userId;
    const { token, platform } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token FCM obrigatorio",
      });
    }

    const [deviceToken] = await FcmToken.findOrCreate({
      where: { token },
      defaults: {
        utilizador_id,
        token,
        platform: platform ?? "mobile",
        ativo: true,
        ultimo_uso: new Date(),
      },
    });

    if (deviceToken.utilizador_id !== utilizador_id || !deviceToken.ativo) {
      deviceToken.utilizador_id = utilizador_id;
      deviceToken.ativo = true;
    }

    deviceToken.platform = platform ?? deviceToken.platform;
    deviceToken.ultimo_uso = new Date();
    await deviceToken.save();

    res.json({
      success: true,
      message: "Dispositivo registado para notificacoes push",
    });
  } catch (error) {
    console.error("Erro ao registar token FCM:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao registar dispositivo",
      error: error.message,
    });
  }
};

export const removerDeviceToken = async (req, res) => {
  try {
    const utilizador_id = req.userId;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token FCM obrigatorio",
      });
    }

    await FcmToken.update(
      { ativo: false },
      { where: { utilizador_id, token } }
    );

    res.json({
      success: true,
      message: "Dispositivo removido das notificacoes push",
    });
  } catch (error) {
    console.error("Erro ao remover token FCM:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao remover dispositivo",
      error: error.message,
    });
  }
};

// Marcar notificação como lida
export const marcarComoLida = async (req, res) => {
  try {
    const { id } = req.params;
    const utilizador_id = req.userId;

    const notification = await Notification.findByPk(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notificação não encontrada",
      });
    }

    if (notification.utilizador_id !== utilizador_id) {
      return res.status(403).json({
        success: false,
        message: "Acesso negado",
      });
    }

    notification.lido = true;
    notification.data_leitura = new Date();
    await notification.save();

    res.json({
      success: true,
      message: "Notificação marcada como lida",
      data: notification,
    });
  } catch (error) {
    console.error("Erro ao marcar notificação como lida:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao marcar notificação",
      error: error.message,
    });
  }
};

// Marcar todas as notificações como lidas
export const marcarTodasComoLidas = async (req, res) => {
  try {
    const utilizador_id = req.userId;

    await Notification.update(
      { lido: true, data_leitura: new Date() },
      { where: { utilizador_id, lido: false } }
    );

    res.json({
      success: true,
      message: "Todas as notificações marcadas como lidas",
    });
  } catch (error) {
    console.error("Erro ao marcar todas as notificações como lidas:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao marcar notificações",
      error: error.message,
    });
  }
};

// Obter contagem de notificações não lidas
export const obterContagemNaoLidas = async (req, res) => {
  try {
    const utilizador_id = req.userId;

    const count = await Notification.count({
      where: { utilizador_id, lido: false },
    });

    res.json({
      success: true,
      naoLidas: count,
    });
  } catch (error) {
    console.error("Erro ao obter contagem de notificações:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao obter contagem",
      error: error.message,
    });
  }
};

// Apagar notificação
export const apagarNotificacao = async (req, res) => {
  try {
    const { id } = req.params;
    const utilizador_id = req.userId;

    const notification = await Notification.findByPk(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notificação não encontrada",
      });
    }

    if (notification.utilizador_id !== utilizador_id) {
      return res.status(403).json({
        success: false,
        message: "Acesso negado",
      });
    }

    await notification.destroy();

    res.json({
      success: true,
      message: "Notificação apagada",
    });
  } catch (error) {
    console.error("Erro ao apagar notificação:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao apagar notificação",
      error: error.message,
    });
  }
};

// Enviar notificação para todos os utilizadores (broadcast)
export const enviarBroadcast = async (req, res) => {
  try {
    const { titulo, mensagem, roles } = req.body;

    if (!titulo || !mensagem) {
      return res.status(400).json({
        success: false,
        message: "Título e mensagem são obrigatórios",
      });
    }

    // Buscar utilizadores (filtrar por roles se especificado)
    let whereClause = {};
    if (roles && roles.length > 0) {
      whereClause.role = roles;
    }

    const users = await User.findAll({
      where: whereClause,
      attributes: ["id"],
    });

    // Criar notificação para cada utilizador
    const notifications = users.map((user) => ({
      tipo: "geral",
      titulo,
      mensagem,
      utilizador_id: user.id,
      lido: false,
    }));

    await Notification.bulkCreate(notifications);

    res.json({
      success: true,
      message: `Anúncio enviado para ${users.length} utilizador(es)`,
      enviados: users.length,
    });
  } catch (error) {
    console.error("Erro ao enviar broadcast:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao enviar anúncio",
      error: error.message,
    });
  }
};
