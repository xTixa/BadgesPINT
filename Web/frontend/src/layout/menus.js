export function getSidebarMenus(t) {
  return {
    consultant: {
      title: t("layout.sidebar.menus.consultant.title"),
      icon: "bi-person-badge-fill",
      items: [
        { to: "/dashboard", label: t("layout.sidebar.menus.consultant.dashboard"), icon: "bi-speedometer2" },
        { to: "/consultor/historico", label: t("layout.sidebar.menus.consultant.meusBadges"), icon: "bi-award-fill" },
        { to: "/consultor/gamification", label: t("layout.sidebar.menus.consultant.gamification"), icon: "bi-stars" },
        { to: "/consultor/upload", label: t("layout.sidebar.menus.consultant.uploadEvidencias"), icon: "bi-cloud-upload-fill" },
        { to: "/consultor/ranking", label: t("layout.sidebar.menus.consultant.ranking"), icon: "bi-trophy-fill" },
        { to: "/galeria", label: t("layout.sidebar.menus.consultant.galeriaPublica"), icon: "bi-people-fill" },
        { to: "/faq", label: t("layout.sidebar.menus.consultant.faq"), icon: "bi-question-circle-fill" },
      ],
      footer: [
        { to: "/consultor/perfil", label: t("layout.sidebar.menus.consultant.perfil"), icon: "bi-person-fill" },
        { to: "/consultor/settings", label: t("layout.sidebar.menus.consultant.configuracoes"), icon: "bi-gear-fill" },
        { to: "/consultor/assinatura-email", label: t("layout.sidebar.menus.consultant.assinaturaEmail"), icon: "bi-envelope-paper-fill" },
      ],
    },

    talent_manager: {
      title: t("layout.sidebar.menus.talentManager.title"),
      icon: "bi-people-fill",
      items: [
        { to: "/tm/dashboard", label: t("layout.sidebar.menus.talentManager.dashboard"), icon: "bi-speedometer2" },
        { to: "/tm/pedidos", label: t("layout.sidebar.menus.talentManager.pedidosBadges"), icon: "bi-inbox" },
        { to: "/tm/catalogo", label: t("layout.sidebar.menus.talentManager.catalogoBadges"), icon: "bi-award-fill" },
        { to: "/tm/badges/especial", label: t("layout.sidebar.menus.talentManager.badgeEspecial"), icon: "bi-hourglass-split" },
        { to: "/tm/equipa", label: t("layout.sidebar.menus.talentManager.equipa"), icon: "bi-person-lines-fill" },
        { to: "/tm/expiracoes", label: t("layout.sidebar.menus.talentManager.expiracoesBadges"), icon: "bi-calendar2-x-fill" },
        { to: "/tm/comparacao", label: t("layout.sidebar.menus.talentManager.compararConsultores"), icon: "bi-bar-chart-steps" },
        { to: "/tm/evidencias", label: t("layout.sidebar.menus.talentManager.evidencias"), icon: "bi-folder-check" },
        { to: "/tm/relatorios", label: t("layout.sidebar.menus.talentManager.relatorios"), icon: "bi-bar-chart-line-fill" },
        { to: "/tm/historico", label: t("layout.sidebar.menus.talentManager.historico"), icon: "bi-clock-history" },
        { to: "/tm/avisos", label: t("layout.sidebar.menus.talentManager.avisos"), icon: "bi-megaphone-fill" },
        { to: "/faq", label: t("layout.sidebar.menus.talentManager.faq"), icon: "bi-question-circle-fill" },
      ],
      footer: [
        { to: "/tm/assinatura-email", label: t("layout.sidebar.menus.talentManager.assinaturaEmail"), icon: "bi-envelope-paper-fill" },
        { to: "/tm/settings", label: t("layout.sidebar.menus.talentManager.perfilConfiguracoes"), icon: "bi-gear-fill" },
      ],
    },

    service_line_leader: {
      title: t("layout.sidebar.menus.serviceLine.title"),
      icon: "bi-diagram-3-fill",
      items: [
        { to: "/sl/dashboard", label: t("layout.sidebar.menus.serviceLine.dashboard"), icon: "bi-speedometer2" },
        { to: "/sl/pedidos", label: t("layout.sidebar.menus.serviceLine.pedidosBadges"), icon: "bi-inbox" },
        { to: "/sl/consultores", label: t("layout.sidebar.menus.serviceLine.consultores"), icon: "bi-person-badge-fill" },
        { to: "/sl/comparacao", label: t("layout.sidebar.menus.serviceLine.compararConsultores"), icon: "bi-bar-chart-steps" },
        { to: "/sl/badges", label: t("layout.sidebar.menus.serviceLine.catalogoBadges"), icon: "bi-award-fill" },
        { to: "/sl/badges/especial", label: t("layout.sidebar.menus.serviceLine.badgeEspecial"), icon: "bi-hourglass-split" },
        { to: "/sl/historico", label: t("layout.sidebar.menus.serviceLine.historico"), icon: "bi-clock-history" },
        { to: "/sl/gamificacao", label: t("layout.sidebar.menus.serviceLine.gamificacao"), icon: "bi-stars" },
        { to: "/sl/estatisticas", label: t("layout.sidebar.menus.serviceLine.relatorios"), icon: "bi-bar-chart-line" },
        { to: "/sl/avisos", label: t("layout.sidebar.menus.serviceLine.avisos"), icon: "bi-megaphone-fill" },
        { to: "/faq", label: t("layout.sidebar.menus.serviceLine.faq"), icon: "bi-question-circle-fill" },
      ],
      footer: [
        { to: "/sl/assinatura-email", label: t("layout.sidebar.menus.serviceLine.assinaturaEmail"), icon: "bi-envelope-paper-fill" },
        { to: "/sl/settings", label: t("layout.sidebar.menus.serviceLine.perfilConfiguracoes"), icon: "bi-gear-fill" },
      ],
    },

    admin: {
      title: t("layout.sidebar.menus.admin.title"),
      icon: "bi-shield-lock-fill",
      items: [
        { to: "/admin/dashboard", label: t("layout.sidebar.menus.admin.dashboard"), icon: "bi-speedometer2" },
        { to: "/admin/gestao-pedidos-badges", label: t("layout.sidebar.menus.admin.pedidosBadges"), icon: "bi-inbox" },
        { to: "/admin/gestao-badges", label: t("layout.sidebar.menus.admin.gestaoBadges"), icon: "bi-award-fill" },
        { to: "/admin/gestao-learning-paths", label: t("layout.sidebar.menus.admin.learningPaths"), icon: "bi-diagram-3-fill" },
        { to: "/admin/gestao-sla", label: t("layout.sidebar.menus.admin.sla"), icon: "bi-hourglass-split" },
        { to: "/admin/gestao-utilizadores", label: t("layout.sidebar.menus.admin.utilizadores"), icon: "bi-people-fill" },
        { to: "/admin/exportacao", label: t("layout.sidebar.menus.admin.exportarDados"), icon: "bi-file-earmark-arrow-down" },
        { to: "/admin/logs", label: t("layout.sidebar.menus.admin.logsAuditoria"), icon: "bi-clock-history" },
      ],
      footer: [
        { to: "/admin/configuracoes", label: t("layout.sidebar.menus.admin.configuracoes"), icon: "bi-gear-fill" },
        { to: "/admin/templates-email", label: t("layout.sidebar.menus.admin.templatesEmail"), icon: "bi-envelope-gear-fill" },
        { to: "/admin/avisos", label: t("layout.sidebar.menus.admin.avisos"), icon: "bi-megaphone-fill" },
      ],
    },
  };
}
