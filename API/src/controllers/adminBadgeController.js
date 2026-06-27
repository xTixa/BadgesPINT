import Badge from "../models/Badge.js";
import Requirement from "../models/Requirement.js";
import BadgeSection from "../models/BadgeSection.js";
import BadgeLesson from "../models/BadgeLesson.js";
import Area from "../models/Area.js";
import User from "../models/User.js";
import ConsultorBadge from "../models/ConsultorBadge.js";
import { v2 as cloudinary } from "cloudinary";
import PDFDocument from "pdfkit";
import { renderCertificatePdf } from "../services/certificateService.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

async function replaceBadgeCurriculum(badgeId, sections) {
  await BadgeLesson.destroy({ where: { badge_id: badgeId } });
  await BadgeSection.destroy({ where: { badge_id: badgeId } });

  if (!Array.isArray(sections) || sections.length === 0) return;

  for (const [sectionIndex, section] of sections.entries()) {
    const createdSection = await BadgeSection.create({
      badge_id: badgeId,
      title: section.title || `Secao ${sectionIndex + 1}`,
      description: section.description || null,
      position: Number(section.position ?? sectionIndex + 1),
    });

    const lessons = Array.isArray(section.lessons) ? section.lessons : [];
    if (lessons.length > 0) {
      await BadgeLesson.bulkCreate(
        lessons.map((lesson, lessonIndex) => ({
          badge_id: badgeId,
          section_id: createdSection.id,
          title: lesson.title || `Aula ${lessonIndex + 1}`,
          description: lesson.description || null,
          content_type: lesson.content_type || "article",
          content_url: lesson.content_url || null,
          duration_minutes: Number(lesson.duration_minutes || 0),
          is_preview: lesson.is_preview === true,
          position: Number(lesson.position ?? lessonIndex + 1),
        }))
      );
    }
  }
}

// LISTAR TODOS OS BADGES (com Área + Requisitos)
export async function adminGetAllBadges(req, res) {
  try {
    const badges = await Badge.findAll({
      include: [
        { model: Area, as: "area", attributes: ["id", "name"] },
        { model: Requirement, as: "requirements" },
        {
          model: BadgeSection,
          as: "sections",
          include: [{ model: BadgeLesson, as: "lessons" }]
        }
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
        { model: Requirement, as: "requirements" },
        {
          model: BadgeSection,
          as: "sections",
          include: [{ model: BadgeLesson, as: "lessons" }]
        }
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
    const { requirements, sections, ...badgeData } = req.body;
    const newBadge = await Badge.create(badgeData);

    if (Array.isArray(requirements) && requirements.length > 0) {
      const formatted = requirements.map((r, idx) => ({
        badge_id: newBadge.id,
        title: r.title || `Requisito ${idx + 1}`,
        code: r.code || `A${idx + 1}`,
        description: r.description || "",
        image_url: r.image_url || null
      }));
      await Requirement.bulkCreate(formatted);
    }

    await replaceBadgeCurriculum(newBadge.id, sections);

    const created = await Badge.findByPk(newBadge.id, {
      include: [
        { model: Area, as: "area", attributes: ["id", "name"] },
        { model: Requirement, as: "requirements" },
        {
          model: BadgeSection,
          as: "sections",
          include: [{ model: BadgeLesson, as: "lessons" }]
        }
      ]
    });

    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar badge" });
  }
}

// ATUALIZAR BADGE
export async function adminUpdateBadge(req, res) {
  try {
    const { requirements, sections, ...badgeData } = req.body;
    const badge = await Badge.findByPk(req.params.id);
    if (!badge) {
      return res.status(404).json({ message: "Badge não encontrado" });
    }

    await badge.update(badgeData);

    if (Array.isArray(requirements)) {
      await Requirement.destroy({ where: { badge_id: badge.id } });
      if (requirements.length > 0) {
        const formatted = requirements.map((r, idx) => ({
          badge_id: badge.id,
          title: r.title || `Requisito ${idx + 1}`,
          code: r.code || `A${idx + 1}`,
          description: r.description || "",
          image_url: r.image_url || null
        }));
        await Requirement.bulkCreate(formatted);
      }
    }

    if (Array.isArray(sections)) {
      await replaceBadgeCurriculum(badge.id, sections);
    }
    
    const updated = await Badge.findByPk(req.params.id, {
      include: [
        { model: Area, as: "area", attributes: ["id", "name"] },
        { model: Requirement, as: "requirements" },
        {
          model: BadgeSection,
          as: "sections",
          include: [{ model: BadgeLesson, as: "lessons" }]
        }
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

    await BadgeLesson.destroy({ where: { badge_id: id } });
    await BadgeSection.destroy({ where: { badge_id: id } });
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

// LISTAR COLABORADORES QUE CONCLUÍRAM UM BADGE
export async function adminGetBadgeConsultores(req, res) {
  try {
    const { badgeId } = req.params;

    const registos = await ConsultorBadge.findAll({
      where: { badge_id: badgeId, status: "obtido" },
      include: [
        { model: User, as: "user", attributes: ["id", "name"] }
      ],
      attributes: ["id", "consultor_id", "data_atribuicao"],
      order: [["data_atribuicao", "DESC"]]
    });

    const consultores = registos.map(r => ({
      consultorId: r.consultor_id,
      nome: r.user?.name ?? "—",
      dataConclusao: r.data_atribuicao
    }));

    res.json(consultores);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar colaboradores do badge" });
  }
}

// 📌 GERAR CERTIFICADO PDF DO BADGE
export async function adminGenerateBadgeCertificate(req, res) {
  try {
    const { badgeId } = req.params;
    const { consultorId } = req.body;

    if (!consultorId) {
      return res.status(400).json({ error: "consultorId é obrigatório" });
    }

    const [badge, consultor] = await Promise.all([
      Badge.findByPk(badgeId, { include: [{ model: Area, as: "area" }] }),
      User.findByPk(consultorId)
    ]);

    if (!badge) return res.status(404).json({ error: "Badge não encontrado" });
    if (!consultor) return res.status(404).json({ error: "Consultor não encontrado" });

    const consultorBadge = await ConsultorBadge.findOne({
      where: {
        consultor_id: consultorId,
        badge_id: badgeId,
        status: "obtido"
      }
    });

    if (!consultorBadge) {
      return res.status(400).json({ error: "O consultor ainda não concluiu este badge" });
    }

    const badgeName = badge.name || badge.title || badge.description || `Badge #${badge.id}`;
    const awardedAt = consultorBadge.data_atribuicao
      ? new Date(consultorBadge.data_atribuicao)
      : new Date();

    let badgeImageBuffer = null;
    if (badge.image_url) {
      try {
        const imgRes = await fetch(badge.image_url);
        if (imgRes.ok) badgeImageBuffer = Buffer.from(await imgRes.arrayBuffer());
      } catch { /* continua sem imagem */ }
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="certificado-badge-${badge.id}.pdf"`);

    const doc = new PDFDocument({ size: "A4", margin: 0 });
    doc.pipe(res);

    renderCertificatePdf(doc, {
      consultor,
      badge,
      badgeName,
      awardedAt,
      certificateCode: null,
      verificationUrl: null,
      badgeImageBuffer,
    });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao gerar certificado" });
  }
}
