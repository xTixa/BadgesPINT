import Badge from "../models/Badge.js";
import Requirement from "../models/Requirement.js";
import Area from "../models/Area.js";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// LISTAR TODOS OS BADGES (com Área + Requisitos)
export async function adminGetAllBadges(req, res) {
  try {
    const badges = await Badge.findAll({
      include: [
        { model: Area, as: "area", attributes: ["id", "name"] },
        { model: Requirement, as: "requirements" }
      ],
      order: [["id", "ASC"]]
    });

    res.json(badges);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar badges" });
  }
}

// OBTER UM BADGE
export async function adminGetBadge(req, res) {
  try {
    const badge = await Badge.findByPk(req.params.id, {
      include: [
        { model: Area, as: "area", attributes: ["id", "name"] },
        { model: Requirement, as: "requirements" }
      ]
    });

    if (!badge) return res.status(404).json({ message: "Badge não encontrado" });

    res.json(badge);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao obter badge" });
  }
}

// CRIAR BADGE
export async function adminCreateBadge(req, res) {
  try {
    const newBadge = await Badge.create(req.body);
    res.status(201).json(newBadge);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar badge" });
  }
}

// ATUALIZAR BADGE
export async function adminUpdateBadge(req, res) {
  try {
    const badge = await Badge.findByPk(req.params.id);
    if (!badge) {
      return res.status(404).json({ message: "Badge não encontrado" });
    }

    await badge.update(req.body);
    
    const updated = await Badge.findByPk(req.params.id, {
      include: [
        { model: Area, as: "area", attributes: ["id", "name"] },
        { model: Requirement, as: "requirements" }
      ]
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar badge" });
  }
}

// APAGAR BADGE + REQUISITOS
export async function adminDeleteBadge(req, res) {
  try {
    const id = req.params.id;

    await Requirement.destroy({ where: { badge_id: id } });
    await Badge.destroy({ where: { id } });

    res.json({ message: "Badge eliminado com sucesso" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao eliminar badge" });
  }
}

// GERAR IMAGEM DE BADGE (Hugging Face Inference API)
export async function adminGenerateBadgeImage(req, res) {
  try {
    const { prompt, size } = req.body;
    const token = process.env.HF_API_TOKEN;
    const model = process.env.HF_MODEL_ID || "stabilityai/sdxl-turbo";

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt é obrigatório" });
    }

    if (!token) {
      return res.status(500).json({ error: "HF_API_TOKEN não definido" });
    }

    let width;
    let height;
    if (typeof size === "string" && size.includes("x")) {
      const [w, h] = size.split("x").map((v) => Number(v));
      if (Number.isFinite(w) && Number.isFinite(h)) {
        width = w;
        height = h;
      }
    }

    const response = await fetch(`https://router.huggingface.co/hf-inference/models/${model}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          ...(width && height ? { width, height } : {})
        },
        options: { wait_for_model: true }
      })
    });

    if (!response.ok) {
      const ct = response.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const details = await response.json();
        console.error("Hugging Face error:", response.status, details);
        return res.status(response.status).json({ error: "Erro do Hugging Face", details });
      }
      const details = await response.text();
      console.error("Hugging Face error:", response.status, details);
      return res.status(response.status).json({ error: "Erro do Hugging Face", details });
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    return res.json({
      image: `data:image/png;base64,${base64}`,
      model
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao gerar imagem" });
  }
}

// UPLOAD DE IMAGEM PARA CLOUDINARY
export async function adminUploadBadgeImage(req, res) {
  try {
    const { image, folder } = req.body;

    if (!image || typeof image !== "string") {
      return res.status(400).json({ error: "Imagem é obrigatória" });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ error: "Credenciais Cloudinary não definidas" });
    }

    const uploadResult = await cloudinary.uploader.upload(image, {
      folder: folder || "badges",
      resource_type: "image"
    });

    return res.json({
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao enviar imagem" });
  }
}
