import EmailTemplate from "../models/EmailTemplate.js";
import { EMAIL_TEMPLATE_DEFINITIONS, EMAIL_TEMPLATE_KEYS } from "../config/emailTemplates.js";

export async function listEmailTemplates(req, res) {
  try {
    const saved = await EmailTemplate.findAll({ raw: true });
    const byKey = new Map(saved.map((item) => [item.key, item]));
    res.json(EMAIL_TEMPLATE_DEFINITIONS.map((definition) => ({
      ...definition,
      subject: byKey.get(definition.key)?.subject || "",
      html_body: byKey.get(definition.key)?.html_body || "",
      text_body: byKey.get(definition.key)?.text_body || "",
      enabled: byKey.get(definition.key)?.enabled ?? false,
      customized: byKey.has(definition.key),
    })));
  } catch (error) {
    console.error("Erro ao listar templates de email:", error);
    res.status(500).json({ message: "Erro ao listar templates de email" });
  }
}

export async function saveEmailTemplate(req, res) {
  try {
    const { key } = req.params;
    if (!EMAIL_TEMPLATE_KEYS.has(key)) return res.status(404).json({ message: "Template desconhecido" });
    const subject = String(req.body?.subject || "").trim();
    const htmlBody = String(req.body?.html_body || "").trim();
    if (!subject || !htmlBody) return res.status(400).json({ message: "Assunto e conteúdo HTML são obrigatórios" });

    const [template] = await EmailTemplate.upsert({
      key,
      subject,
      html_body: htmlBody,
      text_body: String(req.body?.text_body || "").trim() || null,
      enabled: req.body?.enabled !== false,
      updated_by: req.userId,
    }, { returning: true });
    res.json(template);
  } catch (error) {
    console.error("Erro ao guardar template de email:", error);
    res.status(500).json({ message: "Erro ao guardar template de email" });
  }
}

export async function resetEmailTemplate(req, res) {
  try {
    if (!EMAIL_TEMPLATE_KEYS.has(req.params.key)) return res.status(404).json({ message: "Template desconhecido" });
    await EmailTemplate.destroy({ where: { key: req.params.key } });
    res.json({ success: true });
  } catch (error) {
    console.error("Erro ao repor template de email:", error);
    res.status(500).json({ message: "Erro ao repor template de email" });
  }
}
