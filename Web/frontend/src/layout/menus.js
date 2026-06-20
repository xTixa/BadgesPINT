export const sidebarMenus = {
  consultant: {
    title: "Consultor",
    icon: "bi-person-badge-fill",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: "bi-speedometer2" },
      { to: "/consultor/historico", label: "Meus Badges", icon: "bi-award-fill" },
      { to: "/consultor/gamification", label: "Gamification", icon: "bi-stars" },
      { to: "/consultor/upload", label: "Upload Evidências", icon: "bi-cloud-upload-fill" },
      { to: "/consultor/ranking", label: "Ranking", icon: "bi-trophy-fill" },
      { to: "/criar-ticket", label: "Reportar Problema", icon: "bi-exclamation-circle-fill" },
      { to: "/meus-tickets", label: "Meus Tickets", icon: "bi-ticket-fill" },
    ],
    footer: [
      { to: "/consultor/perfil", label: "Perfil", icon: "bi-person-fill" },
      { to: "/consultor/settings", label: "Configurações", icon: "bi-gear-fill" },
    ]
  },

  talent_manager: {
    title: "Talent Manager",
    icon: "bi-people-fill",
    items: [
      { to: "/tm/dashboard", label: "Dashboard", icon: "bi-speedometer2" },
      { to: "/tm/pedidos", label: "Pedidos de Badges", icon: "bi-inbox" },
      { to: "/tm/equipa", label: "Equipa", icon: "bi-person-lines-fill" },
      { to: "/tm/evidencias", label: "Evidências", icon: "bi-folder-check" },
      { to: "/tm/relatorios", label: "Relatórios", icon: "bi-bar-chart-line-fill" },
      { to: "/tm/historico", label: "Histórico", icon: "bi-clock-history" },
      { to: "/criar-ticket", label: "Reportar Problema", icon: "bi-exclamation-circle-fill" },
      { to: "/meus-tickets", label: "Meus Tickets", icon: "bi-ticket-fill" },
    ],
    footer: []
  },

  service_line_leader: {
    title: "Service Line",
    icon: "bi-diagram-3-fill",
    items: [
      { to: "/sl/dashboard", label: "Dashboard", icon: "bi-speedometer2" },
      { to: "/sl/pedidos", label: "Pedidos de Badges", icon: "bi-inbox" },
      { to: "/sl/consultores", label: "Consultores", icon: "bi-person-badge-fill" },
      { to: "/sl/badges", label: "Catálogo Badges", icon: "bi-award-fill" },
      { to: "/sl/historico", label: "Histórico", icon: "bi-clock-history" },
      { to: "/sl/gamificacao", label: "Gamificação", icon: "bi-stars" },
      { to: "/sl/estatisticas", label: "Relatórios", icon: "bi-bar-chart-line" },
      { to: "/criar-ticket", label: "Reportar Problema", icon: "bi-exclamation-circle-fill" },
      { to: "/meus-tickets", label: "Meus Tickets", icon: "bi-ticket-fill" },
    ],
    footer: []
  },

  admin: {
    title: "Admin",
    icon: "bi-shield-lock-fill",
    items: [
      { to: "/admin/dashboard", label: "Dashboard", icon: "bi-speedometer2" },
      { to: "/admin/gestao-pedidos-badges", label: "Pedidos de Badges", icon: "bi-inbox" },
      { to: "/admin/gestao-badges", label: "Gestão de Badges", icon: "bi-award-fill" },
      { to: "/admin/gestao-learning-paths", label: "Learning Paths", icon: "bi-diagram-3-fill" },
      { to: "/admin/gestao-sla", label: "SLA", icon: "bi-hourglass-split" },
      { to: "/admin/gestao-utilizadores", label: "Utilizadores", icon: "bi-people-fill" },
      { to: "/admin/gestao-tickets", label: "Gestão de Tickets", icon: "bi-ticket-perforated-fill" },
      { to: "/admin/exportacao", label: "Exportar Dados", icon: "bi-file-earmark-arrow-down" },
      { to: "/admin/logs", label: "Logs de Auditoria", icon: "bi-clock-history" },
    ],
    footer: [
      { to: "/admin/configuracoes", label: "Configurações", icon: "bi-gear-fill" },
      { to: "/admin/avisos", label: "Avisos", icon: "bi-megaphone-fill" },
    ]
  }
};
