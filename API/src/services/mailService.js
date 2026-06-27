import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import EmailTemplate from "../models/EmailTemplate.js";

const isProduction = process.env.NODE_ENV === "production";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getSmtpConfig() {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM,
    SMTP_TLS_REJECT_UNAUTHORIZED,
  } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  const config = {
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === "true" || Number(SMTP_PORT) === 465,
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 10000,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    from: SMTP_FROM || SMTP_USER,
  };

  if (SMTP_TLS_REJECT_UNAUTHORIZED === "false") {
    config.tls = { rejectUnauthorized: false };
  }

  return config;
}

function requireSmtpConfig() {
  const config = getSmtpConfig();
  if (!config) {
    const error = new Error("Servico de email nao configurado.");
    error.code = "EMAIL_NOT_CONFIGURED";
    throw error;
  }
  return config;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function readSignatureTemplate() {
  const templatePath = path.resolve(__dirname, "../templates/emailSignature.html");
  return fs.readFileSync(templatePath, "utf8");
}

function getTransporter() {
  const { from, ...transportConfig } = requireSmtpConfig();
  return {
    from,
    transporter: nodemailer.createTransport(transportConfig),
  };
}

export function isEmailConfigured() {
  return Boolean(getSmtpConfig());
}

export function getFrontendUrl() {
  return (
    process.env.FRONTEND_URL ||
    process.env.APP_BASE_URL ||
    "http://localhost:5173"
  ).replace(/\/$/, "");
}

export function getDashboardUrl(path = "/consultor") {
  return `${getFrontendUrl()}${path}`;
}

function renderTemplate(value, variables = {}) {
  return String(value || "").replace(/{{\s*([a-z0-9_]+)\s*}}/gi, (_, key) =>
    escapeHtml(variables[key] ?? "")
  );
}

export async function sendMail({ to, subject, text, html, templateKey, variables = {} }) {
  if (templateKey) {
    try {
      const template = await EmailTemplate.findByPk(templateKey);
      if (template?.enabled) {
        subject = renderTemplate(template.subject, variables);
        html = renderTemplate(template.html_body, variables);
        text = template.text_body ? renderTemplate(template.text_body, variables) : text;
      }
    } catch (error) {
      console.error(`Erro ao aplicar template ${templateKey}; usado conteúdo padrão:`, error.message);
    }
  }
  const { transporter, from } = getTransporter();
  const info = await transporter.sendMail({ from, to, subject, text, html });
  console.info("Email enviado:", {
    to,
    subject,
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
  });
  return info;
}

export async function sendPasswordResetEmail({ to, name, token }) {
  const resetUrl = `${getFrontendUrl()}/recover?token=${encodeURIComponent(token)}`;
  const displayName = name || "utilizador";

  return sendMail({
    templateKey: "password_reset",
    variables: { name: displayName, reset_url: resetUrl },
    to,
    subject: "Redefinir password - Badges Softinsa",
    text: [
      `Ola ${displayName},`,
      "",
      "Recebemos um pedido para redefinir a tua password.",
      `Abre este link para criar uma nova password: ${resetUrl}`,
      "",
      "Este link expira em 1 hora. Se nao pediste esta alteracao, ignora este email.",
    ].join("\n"),
    html: `
      <p>Ola ${displayName},</p>
      <p>Recebemos um pedido para redefinir a tua password.</p>
      <p><a href="${resetUrl}">Criar nova password</a></p>
      <p>Este link expira em 1 hora. Se nao pediste esta alteracao, ignora este email.</p>
    `,
  });
}

export async function sendTemporaryPasswordEmail({ to, name, temporaryPassword }) {
  const loginUrl = `${getFrontendUrl()}/login`;
  const displayName = name || "utilizador";

  return sendMail({
    templateKey: "temporary_password",
    variables: { name: displayName, email: to, temporary_password: temporaryPassword, login_url: loginUrl },
    to,
    subject: "Acesso a plataforma de Badges Softinsa",
    text: [
      `Ola ${displayName},`,
      "",
      "A tua conta na plataforma de Badges Softinsa foi criada.",
      `Email: ${to}`,
      `Password temporaria: ${temporaryPassword}`,
      `Login: ${loginUrl}`,
      "",
      "No primeiro login vais ser encaminhado para definir uma nova password.",
    ].join("\n"),
    html: `
      <p>Ola ${displayName},</p>
      <p>A tua conta na plataforma de Badges Softinsa foi criada.</p>
      <p><strong>Email:</strong> ${to}</p>
      <p><strong>Password temporaria:</strong> ${temporaryPassword}</p>
      <p><a href="${loginUrl}">Entrar na plataforma</a></p>
      <p>No primeiro login vais ser encaminhado para definir uma nova password.</p>
    `,
  });
}

export async function sendBadgeApplicationEmail({ to, name, badgeName }) {
  const displayName = name || "consultor";

  return sendMail({
    templateKey: "badge_application",
    variables: { name: displayName, badge_name: badgeName },
    to,
    subject: "Candidatura a badge recebida - Badges Softinsa",
    text: [
      `Ola ${displayName},`,
      "",
      `Recebemos a tua candidatura ao badge ${badgeName}.`,
      "A equipa responsavel vai validar os requisitos e evidencias submetidas.",
      "",
      "Vais receber notificacoes quando houver atualizacoes.",
    ].join("\n"),
    html: `
      <p>Ola ${displayName},</p>
      <p>Recebemos a tua candidatura ao badge <strong>${badgeName}</strong>.</p>
      <p>A equipa responsavel vai validar os requisitos e evidencias submetidas.</p>
      <p>Vais receber notificacoes quando houver atualizacoes.</p>
    `,
  });
}

export async function sendSLValidationEmail({ to, name, badgeName, consultorName }) {
  const displayName = name || "Service Line Leader";
  const consultor = consultorName || "um consultor";

  return sendMail({
    templateKey: "sl_validation",
    variables: { name: displayName, badge_name: badgeName, consultant_name: consultor },
    to,
    subject: "Pedido de badge aguarda a tua aprovação - Badges Softinsa",
    text: [
      `Ola ${displayName},`,
      "",
      `O pedido de badge "${badgeName}" submetido por ${consultor} foi validado pelo Talent Manager e aguarda a tua aprovação final.`,
      "Acede à plataforma para aprovar ou rejeitar o pedido.",
      "",
      "Plataforma Badges Softinsa",
    ].join("\n"),
    html: `
      <p>Ola ${displayName},</p>
      <p>O pedido de badge <strong>${badgeName}</strong> submetido por <strong>${consultor}</strong> foi validado pelo Talent Manager e aguarda a tua aprovação final.</p>
      <p>Acede à plataforma para aprovar ou rejeitar o pedido.</p>
    `,
  });
}

export async function sendBadgeApprovedEmail({ to, name, badgeName, dashboardUrl = getDashboardUrl("/consultor/historico") }) {
  const displayName = name || "consultor";

  return sendMail({
    templateKey: "badge_approved",
    variables: { name: displayName, badge_name: badgeName, dashboard_url: dashboardUrl },
    to,
    subject: "Badge aprovado - Badges Softinsa",
    text: [
      `Ola ${displayName},`,
      "",
      `O teu pedido para o badge ${badgeName} foi aprovado.`,
      "O badge ja esta disponivel no teu historico e no teu perfil.",
      `Dashboard: ${dashboardUrl}`,
      "",
      "Plataforma Badges Softinsa",
    ].join("\n"),
    html: `
      <p>Ola ${displayName},</p>
      <p>O teu pedido para o badge <strong>${badgeName}</strong> foi aprovado.</p>
      <p>O badge ja esta disponivel no teu historico e no teu perfil.</p>
      <p><a href="${dashboardUrl}">Abrir dashboard</a></p>
    `,
  });
}

export async function sendBadgeRejectedEmail({ to, name, badgeName, comment, dashboardUrl = getDashboardUrl("/consultor/historico") }) {
  const displayName = name || "consultor";
  const reason = comment ? `Motivo: ${comment}` : "Consulta o detalhe do pedido para mais informacao.";

  return sendMail({
    templateKey: "badge_rejected",
    variables: { name: displayName, badge_name: badgeName, comment: comment || "", dashboard_url: dashboardUrl },
    to,
    subject: "Pedido de badge rejeitado - Badges Softinsa",
    text: [
      `Ola ${displayName},`,
      "",
      `O teu pedido para o badge ${badgeName} foi rejeitado.`,
      reason,
      `Dashboard: ${dashboardUrl}`,
      "",
      "Plataforma Badges Softinsa",
    ].join("\n"),
    html: `
      <p>Ola ${displayName},</p>
      <p>O teu pedido para o badge <strong>${badgeName}</strong> foi rejeitado.</p>
      <p>${reason}</p>
      <p><a href="${dashboardUrl}">Abrir dashboard</a></p>
    `,
  });
}

export async function sendBadgeReturnedEmail({ to, name, badgeName, comment, dashboardUrl = getDashboardUrl("/consultor/historico") }) {
  const displayName = name || "consultor";
  const reason = comment ? `Nota: ${comment}` : "Revê as evidencias e volta a submeter o pedido.";

  return sendMail({
    templateKey: "badge_returned",
    variables: { name: displayName, badge_name: badgeName, comment: comment || "", dashboard_url: dashboardUrl },
    to,
    subject: "Pedido de badge devolvido - Badges Softinsa",
    text: [
      `Ola ${displayName},`,
      "",
      `O teu pedido para o badge ${badgeName} foi devolvido para retificacao.`,
      reason,
      `Dashboard: ${dashboardUrl}`,
      "",
      "Plataforma Badges Softinsa",
    ].join("\n"),
    html: `
      <p>Ola ${displayName},</p>
      <p>O teu pedido para o badge <strong>${badgeName}</strong> foi devolvido para retificacao.</p>
      <p>${reason}</p>
      <p><a href="${dashboardUrl}">Abrir dashboard</a></p>
    `,
  });
}

export const sendBadgeApprovalEmail = sendBadgeApprovedEmail;
export const sendBadgeRejectionEmail = sendBadgeRejectedEmail;

export async function sendGoalReminderEmail({ to, name, goalText, goalDeadline }) {
  const displayName = name || "consultor";
  const dashboardUrl = getDashboardUrl("/consultor/settings");
  const deadline = goalDeadline
    ? new Date(goalDeadline).toLocaleDateString("pt-PT")
    : "brevemente";

  return sendMail({
    templateKey: "goal_reminder",
    variables: { name: displayName, goal_text: goalText || "objetivo pessoal", goal_deadline: deadline, dashboard_url: dashboardUrl },
    to,
    subject: "Lembrete de objetivo - Badges Softinsa",
    text: [
      `Ola ${displayName},`,
      "",
      `O teu objetivo "${goalText || "objetivo pessoal"}" termina em ${deadline}.`,
      "Revê o teu progresso e atualiza o objetivo se necessario.",
      `Dashboard: ${dashboardUrl}`,
      "",
      "Plataforma Badges Softinsa",
    ].join("\n"),
    html: `
      <p>Ola ${displayName},</p>
      <p>O teu objetivo <strong>${goalText || "objetivo pessoal"}</strong> termina em <strong>${deadline}</strong>.</p>
      <p>Revê o teu progresso e atualiza o objetivo se necessario.</p>
      <p><a href="${dashboardUrl}">Abrir objetivos</a></p>
    `,
  });
}

function getBadgeImageUrl(value) {
  const imageUrl = String(value || "").trim();
  if (!imageUrl) return "";
  if (/^(https?:|cid:|data:image\/)/i.test(imageUrl)) return imageUrl;
  return `${getFrontendUrl()}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
}

export function getEmailSignature({ user, badges = [] } = {}) {
  const template = readSignatureTemplate();
  const badgeHtml = badges.length
    ? badges
        .slice(0, 6)
        .map((badge) => {
          const badgeName = escapeHtml(badge?.name || badge?.description || badge?.badge || "Badge");
          const imageUrl = getBadgeImageUrl(badge?.image_url);
          const name = imageUrl
            ? `<img src="${escapeHtml(imageUrl)}" width="28" height="28" alt="${badgeName}" style="display:inline-block;width:28px;height:28px;margin-right:6px;vertical-align:middle;object-fit:contain;" />${badgeName}`
            : badgeName;
          const level = escapeHtml(badge?.level || badge?.nivel || "");
          return `<span style="display:inline-block;margin:0 6px 6px 0;padding:5px 8px;border:1px solid #BFEFFF;border-radius:999px;background:#F8FBFF;color:#16558C;font-size:11px;font-weight:700;">${name}${level ? ` · ${level}` : ""}</span>`;
        })
        .join("")
    : '<span style="font-size:12px;color:#64748b;">Sem badges publicados na assinatura.</span>';

  return template
    .replaceAll("{{name}}", escapeHtml(user?.name || "Consultor"))
    .replaceAll("{{role}}", escapeHtml(user?.role || "Softinsa Badges"))
    .replaceAll("{{email}}", escapeHtml(user?.email || ""))
    .replaceAll("{{badges}}", badgeHtml);
}

export async function sendSLAAlertEmail({ to, name, badgeName, consultorName, hoursLimit, workflowStatus }) {
  const displayName = name || "responsavel";

  return sendMail({
    templateKey: "sla_alert",
    variables: { name: displayName, badge_name: badgeName, consultant_name: consultorName, hours_limit: hoursLimit, workflow_status: workflowStatus },
    to,
    subject: "Alerta SLA ultrapassado - Badges Softinsa",
    text: [
      `Ola ${displayName},`,
      "",
      `O pedido do badge ${badgeName} submetido por ${consultorName} ultrapassou o SLA de ${hoursLimit} horas.`,
      `Estado atual: ${workflowStatus}.`,
      "Acede a plataforma para tratar o pedido.",
      "",
      "Plataforma Badges Softinsa",
    ].join("\n"),
    html: `
      <p>Ola ${displayName},</p>
      <p>O pedido do badge <strong>${badgeName}</strong> submetido por <strong>${consultorName}</strong> ultrapassou o SLA de <strong>${hoursLimit} horas</strong>.</p>
      <p>Estado atual: ${workflowStatus}.</p>
      <p>Acede a plataforma para tratar o pedido.</p>
    `,
  });
}

export function buildEmailStatus(error = null) {
  if (!error) return { emailSent: true };

  return {
    emailSent: false,
    emailError:
      error.code === "EMAIL_NOT_CONFIGURED"
        ? "Email nao configurado no servidor."
        : "Nao foi possivel enviar o email.",
  };
}

export function getMailErrorDetails(error) {
  if (!error) return null;

  return {
    message: error.message,
    code: error.code,
    command: error.command,
    responseCode: error.responseCode,
    response: error.response,
  };
}

export function shouldExposeEmailSecretsForDev() {
  return !isProduction;
}
