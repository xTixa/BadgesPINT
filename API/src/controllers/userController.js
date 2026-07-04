import User from "../models/User.js";
import Area from "../models/Area.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";
import {
  getMailErrorDetails,
  isEmailConfigured,
  sendTemporaryPasswordEmail,
  shouldExposeEmailSecretsForDev,
} from "../services/mailService.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const generateTemporaryPassword = () => crypto.randomBytes(6).toString("base64url");

const normalizeDateOnly = (value) => {
  if (!value) return null;
  const raw = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const match = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) return `${match[3]}-${match[2]}-${match[1]}`;
  return null;
};

export const registerConsultant = async (req, res) => {
  try {
    const { nome, email, area_id, area, rgpdAccepted } = req.body;

    if (!nome || !email) {
      return res.status(400).json({ message: "Nome e email sao obrigatorios." });
    }

    if (rgpdAccepted !== true) {
      return res.status(400).json({ message: "E obrigatorio aceitar os termos RGPD." });
    }

    const parsedAreaId = Number(area_id);
    let selectedArea = null;

    if (Number.isInteger(parsedAreaId) && parsedAreaId > 0) {
      selectedArea = await Area.findByPk(parsedAreaId);
    } else if (typeof area === "string" && area.trim()) {
      selectedArea = await Area.findOne({ where: { name: area.trim() } });
    }

    if (!selectedArea) {
      return res.status(400).json({ message: "Area nao encontrada." });
    }

    // Verifica duplicado
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: "Email já existe." });

    // Password automatica
    const generatedPassword = generateTemporaryPassword();
    const hash = await bcrypt.hash(generatedPassword, 10);

    const newUser = await User.create({
      name: nome,
      email,
      password_hash: hash,
      role: "consultant",
      area_id: selectedArea.id,
      points_total: 0,
      rgpd_publication_accepted: true,
    });

    const emailStatus = isEmailConfigured()
      ? { emailSent: false, emailQueued: true }
      : { emailSent: false, emailQueued: false, emailError: "Email nao configurado no servidor." };

    if (emailStatus.emailQueued) {
      sendTemporaryPasswordEmail({
        to: newUser.email,
        name: newUser.name,
        temporaryPassword: generatedPassword,
      }).catch((mailError) => {
        console.error(
          "Utilizador criado, mas email de convite falhou:",
          getMailErrorDetails(mailError),
        );
      });
    }

    res.status(201).json({
      message: emailStatus.emailQueued
        ? "Utilizador criado com sucesso. O email com a password temporaria esta a ser enviado."
        : "Utilizador criado, mas o email nao esta configurado no servidor.",
      ...emailStatus,
      ...(shouldExposeEmailSecretsForDev() ? { temporaryPassword: generatedPassword } : {}),
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        area_id: newUser.area_id,
      },
    });

  } catch (err) {
    console.error("Erro ao registar utilizador:", err);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export async function getAllUsers(req, res) {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email", "role", "area_id", "avatar_url", "points_total"],
      order: [["id", "ASC"]],
    });

    res.json(users);
  } catch (err) {
    console.error("Erro ao carregar utilizadores:", err);
    res.status(500).json({ error: "Erro ao carregar utilizadores" });
  }
}

// Atualizar perfil do utilizador
export const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      area_id,
      avatar_url,
      rgpd_publication_accepted,
      public_profile_enabled,
      linkedin_sharing_enabled,
      goal_text,
      goal_deadline,
    } = req.body;
    const requestingUserId = req.userId;

    // Verificar se o utilizador está a editar o próprio perfil
    if (parseInt(id) !== requestingUserId) {
      return res.status(403).json({ message: "Não pode editar perfil de outro utilizador" });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "Utilizador não encontrado" });
    }

    // Verificar se email já existe (se está a ser alterado)
    if (email && email !== user.email) {
      const exists = await User.findOne({ where: { email } });
      if (exists) {
        return res.status(400).json({ message: "Email já existe." });
      }
    }

    // Atualizar campos
    if (name) user.name = name;
    if (email) user.email = email;
    if (area_id !== undefined) user.area_id = area_id || null;
    if (avatar_url !== undefined) user.avatar_url = avatar_url || null;
    if (rgpd_publication_accepted !== undefined) {
      user.rgpd_publication_accepted = rgpd_publication_accepted === true;
    }
    if (public_profile_enabled !== undefined) {
      user.public_profile_enabled = public_profile_enabled === true;
    }
    if (linkedin_sharing_enabled !== undefined) {
      user.linkedin_sharing_enabled = linkedin_sharing_enabled !== false;
    }
    if (goal_text !== undefined) user.goal_text = goal_text || null;
    if (goal_deadline !== undefined) user.goal_deadline = normalizeDateOnly(goal_deadline);
    if (!user.rgpd_publication_accepted) {
      user.public_profile_enabled = false;
      user.linkedin_sharing_enabled = false;
    }

    await user.save();

    res.json({
      success: true,
      message: "Perfil atualizado com sucesso",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        area_id: user.area_id,
        avatar_url: user.avatar_url,
        points_total: user.points_total || 0,
        rgpd_publication_accepted: user.rgpd_publication_accepted,
        public_profile_enabled: user.public_profile_enabled,
        linkedin_sharing_enabled: user.linkedin_sharing_enabled,
        goal_text: user.goal_text,
        goal_deadline: user.goal_deadline,
      },
    });
  } catch (err) {
    console.error("Erro ao atualizar perfil:", err);
    res.status(500).json({ message: "Erro ao atualizar perfil" });
  }
};

// Upload da foto de perfil do proprio utilizador
export const uploadAvatar = async (req, res) => {
  try {
    const { image } = req.body;
    const requestingUserId = req.userId;

    if (!image || typeof image !== "string") {
      return res.status(400).json({ message: "Imagem é obrigatória" });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ message: "Credenciais Cloudinary não definidas" });
    }

    const user = await User.findByPk(requestingUserId);
    if (!user) {
      return res.status(404).json({ message: "Utilizador não encontrado" });
    }

    const uploadResult = await cloudinary.uploader.upload(image, {
      folder: "avatars",
      resource_type: "image",
      transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
    });

    user.avatar_url = uploadResult.secure_url;
    await user.save();

    res.json({ avatar_url: user.avatar_url });
  } catch (err) {
    console.error("Erro ao enviar foto de perfil:", err);
    res.status(500).json({ message: "Erro ao enviar foto de perfil" });
  }
};

// Alterar password
export const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    const requestingUserId = req.userId;

    // Verificar se o utilizador está a alterar a própria password
    if (parseInt(id) !== requestingUserId) {
      return res.status(403).json({ message: "Não pode alterar password de outro utilizador" });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "Utilizador não encontrado" });
    }

    // Verificar password atual
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Password atual incorreta" });
    }

    // Validar nova password
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Nova password deve ter pelo menos 6 caracteres" });
    }

    // Atualizar password
    const hash = await bcrypt.hash(newPassword, 10);
    user.password_hash = hash;
    await user.save();

    res.json({
      success: true,
      message: "Password alterada com sucesso",
    });
  } catch (err) {
    console.error("Erro ao alterar password:", err);
    res.status(500).json({ message: "Erro ao alterar password" });
  }
};
