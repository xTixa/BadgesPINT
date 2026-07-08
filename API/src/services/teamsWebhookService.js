import PlatformSetting from "../models/PlatformSetting.js";

// Envia uma mensagem simples {text} via webhook — formato aceite tanto por
// Slack incoming webhooks como por conectores do Microsoft Teams.
export async function sendTeamsWebhook({ titulo, mensagem }) {
  try {
    const settings = await PlatformSetting.findOne({ where: { id: 1 } });

    if (!settings?.notify_teams || !settings?.teams_webhook_url) {
      return;
    }

    const response = await fetch(settings.teams_webhook_url, {
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
