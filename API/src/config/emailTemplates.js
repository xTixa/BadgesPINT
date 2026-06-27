export const EMAIL_TEMPLATE_DEFINITIONS = [
  { key: "password_reset", name: "Recuperação de password", variables: ["name", "reset_url"] },
  { key: "temporary_password", name: "Criação de conta", variables: ["name", "email", "temporary_password", "login_url"] },
  { key: "badge_application", name: "Candidatura recebida", variables: ["name", "badge_name"] },
  { key: "sl_validation", name: "Validação pelo Service Line", variables: ["name", "badge_name", "consultant_name"] },
  { key: "badge_approved", name: "Badge aprovado", variables: ["name", "badge_name", "dashboard_url"] },
  { key: "badge_rejected", name: "Badge rejeitado", variables: ["name", "badge_name", "comment", "dashboard_url"] },
  { key: "badge_returned", name: "Pedido devolvido", variables: ["name", "badge_name", "comment", "dashboard_url"] },
  { key: "goal_reminder", name: "Lembrete de objetivo", variables: ["name", "goal_text", "goal_deadline", "dashboard_url"] },
  { key: "sla_alert", name: "Alerta de SLA", variables: ["name", "badge_name", "consultant_name", "hours_limit", "workflow_status"] },
];

export const EMAIL_TEMPLATE_KEYS = new Set(EMAIL_TEMPLATE_DEFINITIONS.map((item) => item.key));
