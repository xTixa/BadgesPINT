export const sidebarMenus = {
  consultant: {
    title: "Consultor",
    icon: "bi-person-badge-fill",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: "bi-speedometer2" },
      { to: "/consultor/historico", label: "Meus Badges", icon: "bi-award-fill" },
      { to: "/consultor/gamification", label: "Gamification", icon: "bi-stars" },
      { to: "/consultor/upload", label: "Upload Evidencias", icon: "bi-cloud-upload-fill" },
      { to: "/consultor/ranking", label: "Ranking", icon: "bi-trophy-fill" },
      { to: "/galeria", label: "Galeria Publica", icon: "bi-people-fill" },
      { to: "/faq", label: "Ajuda / FAQ", icon: "bi-question-circle-fill" },
    ],
    footer: [
      { to: "/consultor/perfil", label: "Perfil", icon: "bi-person-fill" },
      { to: "/consultor/settings", label: "Configuracoes", icon: "bi-gear-fill" },
      { to: "/consultor/assinatura-email", label: "Assinatura de Email", icon: "bi-envelope-paper-fill" },
    ],
  },

  talent_manager: {
    title: "Talent Manager",
    icon: "bi-people-fill",
    items: [
      { to: "/tm/dashboard", label: "Dashboard", icon: "bi-speedometer2" },
      { to: "/tm/pedidos", label: "Pedidos de Badges", icon: "bi-inbox" },
      { to: "/tm/catalogo", label: "Catalogo Badges", icon: "bi-award-fill" },
      { to: "/tm/equipa", label: "Equipa", icon: "bi-person-lines-fill" },
      { to: "/tm/expiracoes", label: "Expirações Badges", icon: "bi-calendar2-x-fill" },
      { to: "/tm/comparacao", label: "Comparar Consultores", icon: "bi-bar-chart-steps" },
      { to: "/tm/evidencias", label: "Evidencias", icon: "bi-folder-check" },
      { to: "/tm/relatorios", label: "Relatorios", icon: "bi-bar-chart-line-fill" },
      { to: "/tm/historico", label: "Historico", icon: "bi-clock-history" },
      { to: "/tm/avisos", label: "Informacoes/Avisos", icon: "bi-megaphone-fill" },
      { to: "/faq", label: "Ajuda / FAQ", icon: "bi-question-circle-fill" },
    ],
    footer: [
      { to: "/tm/settings", label: "Perfil / Configurações", icon: "bi-gear-fill" },
    ],
  },

  service_line_leader: {
    title: "Service Line",
    icon: "bi-diagram-3-fill",
    items: [
      { to: "/sl/dashboard", label: "Dashboard", icon: "bi-speedometer2" },
      { to: "/sl/pedidos", label: "Pedidos de Badges", icon: "bi-inbox" },
      { to: "/sl/consultores", label: "Consultores", icon: "bi-person-badge-fill" },
      { to: "/sl/comparacao", label: "Comparar Consultores", icon: "bi-bar-chart-steps" },
      { to: "/sl/badges", label: "Catalogo Badges", icon: "bi-award-fill" },
      { to: "/sl/historico", label: "Historico", icon: "bi-clock-history" },
      { to: "/sl/gamificacao", label: "Gamificacao", icon: "bi-stars" },
      { to: "/sl/estatisticas", label: "Relatorios", icon: "bi-bar-chart-line" },
      { to: "/sl/avisos", label: "Informacoes/Avisos", icon: "bi-megaphone-fill" },
      { to: "/faq", label: "Ajuda / FAQ", icon: "bi-question-circle-fill" },
    ],
    footer: [
      { to: "/sl/settings", label: "Perfil / Configurações", icon: "bi-gear-fill" },
    ],
  },

  admin: {
    title: "Admin",
    icon: "bi-shield-lock-fill",
    items: [
      { to: "/admin/dashboard", label: "Dashboard", icon: "bi-speedometer2" },
      { to: "/admin/gestao-pedidos-badges", label: "Pedidos de Badges", icon: "bi-inbox" },
      { to: "/admin/gestao-badges", label: "Gestao de Badges", icon: "bi-award-fill" },
      { to: "/admin/gestao-learning-paths", label: "Learning Paths", icon: "bi-diagram-3-fill" },
      { to: "/admin/gestao-sla", label: "SLA", icon: "bi-hourglass-split" },
      { to: "/admin/gestao-utilizadores", label: "Utilizadores", icon: "bi-people-fill" },
      { to: "/admin/exportacao", label: "Exportar Dados", icon: "bi-file-earmark-arrow-down" },
      { to: "/admin/logs", label: "Logs de Auditoria", icon: "bi-clock-history" },
    ],
    footer: [
      { to: "/admin/configuracoes", label: "Configuracoes", icon: "bi-gear-fill" },
      { to: "/admin/templates-email", label: "Templates de Email", icon: "bi-envelope-gear-fill" },
      { to: "/admin/avisos", label: "Informacoes/Avisos", icon: "bi-megaphone-fill" },
    ],
  },
};
