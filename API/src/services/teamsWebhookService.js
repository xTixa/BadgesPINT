import PlatformSetting from "../models/PlatformSetting.js";

// Envia uma mensagem simples {text} para um webhook — formato aceite tanto por
// Slack incoming webhooks como por conectores do Microsoft Teams.
async function postToWebhook(webhookUrl, { titulo, mensagem }) {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: `*${titulo}*\n${mensagem}` }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(`Webhook Teams/Slack falhou: ${response.status} ${body}`);
    }
  } catch (error) {
    console.error("Erro ao enviar webhook Teams/Slack:", error.message);
  }
}

// Envia para o webhook global configurado pelo Admin (definições da plataforma).
export async function sendTeamsWebhook({ titulo, mensagem }) {
  const settings = await PlatformSetting.findOne({ where: { id: 1 } });

  if (!settings?.notify_teams || !settings?.teams_webhook_url) {
    return;
  }

  await postToWebhook(settings.teams_webhook_url, { titulo, mensagem });
}

// Envia para um conjunto de webhooks específicos (ex.: canais de equipa
// configurados por Service Line Leaders / Talent Managers nas suas próprias
// preferências). Ignora URLs vazias/duplicadas silenciosamente.
export async function sendTeamsWebhookToUrls(webhookUrls, { titulo, mensagem }) {
  const uniqueUrls = [...new Set((webhookUrls || []).filter(Boolean))];
  await Promise.all(uniqueUrls.map((url) => postToWebhook(url, { titulo, mensagem })));
}
