import nodemailer from "nodemailer";

const isProduction = process.env.NODE_ENV === "production";

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

export async function sendMail({ to, subject, text, html }) {
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

export function shouldExposeEmailSecretsForDev() {
  return !isProduction;
}
