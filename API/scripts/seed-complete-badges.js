import dotenv from "dotenv";
import database from "../src/config/database.js";
import "../src/models/index.js";
import LearningPath from "../src/models/LearningPath.js";
import ServiceLine from "../src/models/ServiceLine.js";
import Area from "../src/models/Area.js";
import Badge from "../src/models/Badge.js";
import Requirement from "../src/models/Requirement.js";

dotenv.config();

const catalog = [
  {
    learningPath: {
      name: "Technology Consulting",
      description: "Percurso base para consultores que trabalham em desenvolvimento, cloud, integracao e entrega tecnica.",
    },
    serviceLine: {
      name: "Cloud & Engineering",
      description: "Competencias de engenharia, cloud, DevOps e desenvolvimento aplicacional.",
    },
    area: "Cloud & DevOps",
    badge: {
      level: "Junior",
      description: "Cloud Foundations",
      points: 80,
      expiry_days: 365,
      image_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    },
    requirements: [
      ["CF1", "Concluir fundamentos cloud", "Completar uma formacao introdutoria sobre modelos IaaS, PaaS, SaaS, regioes, disponibilidade e responsabilidade partilhada."],
      ["CF2", "Criar ambiente de laboratorio", "Entregar evidencias de um recurso cloud criado em ambiente de teste, com identificacao de custo e objetivo."],
      ["CF3", "Documentar arquitetura simples", "Submeter um diagrama simples com rede, compute, storage e uma justificacao das escolhas feitas."],
      ["CF4", "Validacao tecnica", "Obter validacao de um lider tecnico ou mentor apos demonstracao curta do laboratorio."],
    ],
  },
  {
    learningPath: {
      name: "Technology Consulting",
      description: "Percurso base para consultores que trabalham em desenvolvimento, cloud, integracao e entrega tecnica.",
    },
    serviceLine: {
      name: "Cloud & Engineering",
      description: "Competencias de engenharia, cloud, DevOps e desenvolvimento aplicacional.",
    },
    area: "Cloud & DevOps",
    badge: {
      level: "Intermedio",
      description: "Docker & CI/CD Practitioner",
      points: 120,
      expiry_days: 365,
      image_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
    },
    requirements: [
      ["DC1", "Containerizar uma aplicacao", "Entregar Dockerfile funcional para uma aplicacao simples, com instrucoes de build e run."],
      ["DC2", "Configurar pipeline CI", "Submeter evidencia de pipeline com build, testes e validacao automatica em cada commit."],
      ["DC3", "Publicar artefacto", "Demonstrar publicacao de imagem ou artefacto versionado num registry ou repositorio interno."],
      ["DC4", "Aplicar boas praticas", "Documentar variaveis de ambiente, secrets, tags e estrategia basica de rollback."],
    ],
  },
  {
    learningPath: {
      name: "Technology Consulting",
      description: "Percurso base para consultores que trabalham em desenvolvimento, cloud, integracao e entrega tecnica.",
    },
    serviceLine: {
      name: "Application Development",
      description: "Competencias de desenvolvimento web, mobile, APIs e qualidade de software.",
    },
    area: "Web Development",
    badge: {
      level: "Junior",
      description: "React Frontend Foundations",
      points: 85,
      expiry_days: 365,
      image_url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80",
    },
    requirements: [
      ["RF1", "Criar componentes reutilizaveis", "Entregar uma pagina com componentes separados, props claras e estado local controlado."],
      ["RF2", "Consumir API", "Demonstrar chamada a uma API com estados de loading, erro e sucesso."],
      ["RF3", "Aplicar layout responsivo", "Submeter evidencia da pagina a funcionar em desktop e mobile sem overflow visual."],
      ["RF4", "Validar com review", "Obter validacao de codigo por outro elemento da equipa ou mentor tecnico."],
    ],
  },
  {
    learningPath: {
      name: "Technology Consulting",
      description: "Percurso base para consultores que trabalham em desenvolvimento, cloud, integracao e entrega tecnica.",
    },
    serviceLine: {
      name: "Application Development",
      description: "Competencias de desenvolvimento web, mobile, APIs e qualidade de software.",
    },
    area: "Mobile Development",
    badge: {
      level: "Junior",
      description: "Flutter Mobile Foundations",
      points: 90,
      expiry_days: 365,
      image_url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80",
    },
    requirements: [
      ["FM1", "Construir ecras base", "Entregar uma app Flutter com pelo menos tres ecras navegaveis e componentes reutilizaveis."],
      ["FM2", "Persistencia local", "Demonstrar uso de armazenamento local para manter dados essenciais offline."],
      ["FM3", "Integracao HTTP", "Consumir uma API protegida e tratar erros de ligacao de forma visivel para o utilizador."],
      ["FM4", "Teste em dispositivo", "Submeter evidencia da app em telemovel fisico ou emulador, com screenshots dos fluxos principais."],
    ],
  },
  {
    learningPath: {
      name: "Technology Consulting",
      description: "Percurso base para consultores que trabalham em desenvolvimento, cloud, integracao e entrega tecnica.",
    },
    serviceLine: {
      name: "Application Development",
      description: "Competencias de desenvolvimento web, mobile, APIs e qualidade de software.",
    },
    area: "API & Integration",
    badge: {
      level: "Intermedio",
      description: "API Design & Integration",
      points: 120,
      expiry_days: 365,
      image_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
    },
    requirements: [
      ["AI1", "Desenhar contrato REST", "Entregar especificacao de endpoints, payloads, codigos de resposta e regras de autenticacao."],
      ["AI2", "Implementar integracao", "Demonstrar endpoint funcional com validacao de dados e tratamento de erros."],
      ["AI3", "Documentar consumo", "Criar exemplo de chamada e explicar parametros obrigatorios, opcionais e respostas esperadas."],
      ["AI4", "Validar seguranca basica", "Confirmar protecao de rotas, controlo de permissoes e ausencia de dados sensiveis nas respostas."],
    ],
  },
  {
    learningPath: {
      name: "Data & AI",
      description: "Percurso para competencias de dados, analitica, inteligencia artificial e decisao suportada por dados.",
    },
    serviceLine: {
      name: "Data Engineering",
      description: "Modelacao, pipelines, qualidade e disponibilizacao de dados.",
    },
    area: "Databases",
    badge: {
      level: "Junior",
      description: "SQL & Data Modeling",
      points: 80,
      expiry_days: 365,
      image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    },
    requirements: [
      ["SD1", "Modelar entidades", "Entregar modelo relacional com chaves primarias, estrangeiras e regras de integridade."],
      ["SD2", "Escrever queries", "Submeter queries com joins, agregacoes, filtros e ordenacao para casos reais."],
      ["SD3", "Aplicar migracoes", "Demonstrar criacao ou alteracao de schema com script controlado e reversivel."],
      ["SD4", "Explicar performance", "Identificar pelo menos dois indices uteis e justificar o impacto esperado."],
    ],
  },
  {
    learningPath: {
      name: "Data & AI",
      description: "Percurso para competencias de dados, analitica, inteligencia artificial e decisao suportada por dados.",
    },
    serviceLine: {
      name: "Data Engineering",
      description: "Modelacao, pipelines, qualidade e disponibilizacao de dados.",
    },
    area: "Data Engineering",
    badge: {
      level: "Intermedio",
      description: "Data Engineering Pipelines",
      points: 130,
      expiry_days: 365,
      image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    },
    requirements: [
      ["DP1", "Construir pipeline ETL", "Entregar pipeline que extrai, transforma e carrega dados com logs de execucao."],
      ["DP2", "Validar qualidade", "Implementar validacoes para duplicados, campos obrigatorios e tipos esperados."],
      ["DP3", "Agendar execucao", "Demonstrar execucao automatica ou plano de agendamento com monitorizacao basica."],
      ["DP4", "Documentar linhagem", "Explicar origem, transformacoes e destino dos dados tratados no pipeline."],
    ],
  },
  {
    learningPath: {
      name: "Data & AI",
      description: "Percurso para competencias de dados, analitica, inteligencia artificial e decisao suportada por dados.",
    },
    serviceLine: {
      name: "Artificial Intelligence",
      description: "Uso responsavel de IA, automacao assistida e avaliacao de resultados.",
    },
    area: "Artificial Intelligence",
    badge: {
      level: "Junior",
      description: "AI Prompting & Responsible AI",
      points: 90,
      expiry_days: 365,
      image_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
    },
    requirements: [
      ["AR1", "Criar prompts estruturados", "Entregar exemplos de prompts com contexto, tarefa, restricoes e formato de resposta."],
      ["AR2", "Avaliar respostas", "Comparar respostas geradas por IA com criterios objetivos de qualidade e risco."],
      ["AR3", "Aplicar privacidade", "Demonstrar que nao foram usados dados pessoais ou sensiveis fora das regras definidas."],
      ["AR4", "Documentar caso de uso", "Explicar um caso de uso real, ganhos esperados, limites e validacao humana necessaria."],
    ],
  },
  {
    learningPath: {
      name: "Security & Risk",
      description: "Percurso para seguranca aplicacional, risco tecnologico e boas praticas de protecao.",
    },
    serviceLine: {
      name: "Cybersecurity",
      description: "Seguranca, compliance tecnico e reducao de risco em solucoes digitais.",
    },
    area: "Cybersecurity",
    badge: {
      level: "Junior",
      description: "Secure Coding Essentials",
      points: 90,
      expiry_days: 365,
      image_url: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?auto=format&fit=crop&w=1200&q=80",
    },
    requirements: [
      ["SC1", "Identificar riscos OWASP", "Entregar resumo dos principais riscos OWASP aplicaveis a uma aplicacao web ou mobile."],
      ["SC2", "Proteger autenticacao", "Demonstrar boas praticas em tokens, armazenamento de credenciais e expiracao de sessao."],
      ["SC3", "Validar input", "Submeter evidencia de validacao de dados no cliente e no servidor."],
      ["SC4", "Corrigir vulnerabilidade", "Apresentar antes/depois de uma correcao de seguranca com explicacao do impacto."],
    ],
  },
  {
    learningPath: {
      name: "Delivery Excellence",
      description: "Percurso para qualidade, entrega, colaboracao e melhoria continua em equipas de projeto.",
    },
    serviceLine: {
      name: "Quality Assurance",
      description: "Testes, automacao, criterio de aceite e confianca na entrega.",
    },
    area: "Quality Assurance",
    badge: {
      level: "Intermedio",
      description: "Automated Testing Practitioner",
      points: 110,
      expiry_days: 365,
      image_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    },
    requirements: [
      ["AT1", "Criar testes unitarios", "Entregar cobertura minima para logica critica com casos de sucesso e erro."],
      ["AT2", "Criar teste de integracao", "Demonstrar teste que valida interacao entre API, base de dados ou servico externo mockado."],
      ["AT3", "Automatizar execucao", "Integrar testes em pipeline ou script de projeto com resultado reproduzivel."],
      ["AT4", "Reportar falhas", "Documentar falhas encontradas, severidade, passos de reproducao e evidencia."],
    ],
  },
  {
    learningPath: {
      name: "Delivery Excellence",
      description: "Percurso para qualidade, entrega, colaboracao e melhoria continua em equipas de projeto.",
    },
    serviceLine: {
      name: "Agile Delivery",
      description: "Gestao de trabalho, colaboracao, cadencia e entrega incremental.",
    },
    area: "Agile Delivery",
    badge: {
      level: "Junior",
      description: "Agile Delivery & Scrum",
      points: 70,
      expiry_days: 365,
      image_url: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
    },
    requirements: [
      ["AS1", "Participar em cerimonias", "Submeter evidencia de participacao ativa em daily, planning, review ou retrospetiva."],
      ["AS2", "Escrever user stories", "Entregar user stories com criterios de aceite claros e testaveis."],
      ["AS3", "Gerir progresso", "Demonstrar atualizacao de tarefas num board com estados coerentes."],
      ["AS4", "Aplicar melhoria continua", "Documentar uma melhoria identificada em retrospetiva e o resultado apos implementacao."],
    ],
  },
  {
    learningPath: {
      name: "Technology Consulting",
      description: "Percurso base para consultores que trabalham em desenvolvimento, cloud, integracao e entrega tecnica.",
    },
    serviceLine: {
      name: "Cloud & Engineering",
      description: "Competencias de engenharia, cloud, DevOps e desenvolvimento aplicacional.",
    },
    area: "Cloud & DevOps",
    badge: {
      level: "Senior",
      description: "Kubernetes Operations",
      points: 180,
      expiry_days: 365,
      image_url: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=1200&q=80",
    },
    requirements: [
      ["KO1", "Criar deployment", "Entregar manifests ou chart para deployment, service, config e secrets de uma aplicacao."],
      ["KO2", "Configurar observabilidade", "Demonstrar logs, metricas ou health checks para acompanhar o estado da aplicacao."],
      ["KO3", "Executar estrategia de rollout", "Submeter evidencia de rolling update, rollback ou estrategia equivalente."],
      ["KO4", "Analisar incidente", "Documentar um cenario de falha, diagnostico efetuado e acao corretiva aplicada."],
    ],
  },
];

const legacyBadges = [
  {
    matchDescriptions: ["Badge de Teste", "Onboarding Tecnico Softinsa"],
    learningPath: {
      name: "Delivery Excellence",
      description: "Percurso para qualidade, entrega, colaboracao e melhoria continua em equipas de projeto.",
    },
    serviceLine: {
      name: "Agile Delivery",
      description: "Gestao de trabalho, colaboracao, cadencia e entrega incremental.",
    },
    area: "Onboarding & Boas Praticas",
    badge: {
      level: "Junior",
      description: "Onboarding Tecnico Softinsa",
      points: 50,
      expiry_days: 365,
      image_url: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
    },
    requirements: [
      ["OT1", "Conhecer o processo de badges", "Demonstrar compreensao do fluxo de candidatura, submissao de evidencias e validacao."],
      ["OT2", "Configurar ambiente de trabalho", "Submeter evidencia do ambiente configurado com repositorio, ferramentas e acessos necessarios."],
      ["OT3", "Aplicar boas praticas de equipa", "Explicar normas de comunicacao, versionamento, documentacao e pedido de review."],
      ["OT4", "Validacao de onboarding", "Obter confirmacao de um mentor ou lider apos conclusao dos passos de onboarding tecnico."],
    ],
  },
  {
    matchDescriptions: ["SQL Fundamentals"],
    learningPath: {
      name: "Data & AI",
      description: "Percurso para competencias de dados, analitica, inteligencia artificial e decisao suportada por dados.",
    },
    serviceLine: {
      name: "Data Engineering",
      description: "Modelacao, pipelines, qualidade e disponibilizacao de dados.",
    },
    area: "Databases",
    badge: {
      level: "Junior",
      description: "SQL Fundamentals",
      points: 35,
      expiry_days: 365,
      image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    },
    requirements: [
      ["SQL1", "Consultar dados relacionais", "Entregar queries com SELECT, WHERE, ORDER BY, GROUP BY e funcoes de agregacao."],
      ["SQL2", "Relacionar tabelas", "Demonstrar uso correto de INNER JOIN e LEFT JOIN em casos praticos."],
      ["SQL3", "Modelar tabelas simples", "Criar modelo com chaves primarias, chaves estrangeiras e restricoes basicas."],
      ["SQL4", "Validar resultados", "Explicar como confirmou que os resultados das queries estao corretos."],
    ],
  },
  {
    matchDescriptions: ["Data Visualization com Tableau"],
    learningPath: {
      name: "Data & AI",
      description: "Percurso para competencias de dados, analitica, inteligencia artificial e decisao suportada por dados.",
    },
    serviceLine: {
      name: "Data Engineering",
      description: "Modelacao, pipelines, qualidade e disponibilizacao de dados.",
    },
    area: "Data Visualization",
    badge: {
      level: "Intermedio",
      description: "Data Visualization com Tableau",
      points: 70,
      expiry_days: 365,
      image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    },
    requirements: [
      ["TV1", "Preparar dataset", "Submeter dataset tratado com campos limpos, tipos coerentes e objetivo analitico claro."],
      ["TV2", "Criar dashboard", "Entregar dashboard com graficos adequados, filtros e indicadores principais."],
      ["TV3", "Contar historia com dados", "Explicar conclusoes, tendencias e alertas que o dashboard permite identificar."],
      ["TV4", "Validar com utilizador", "Registar feedback de um utilizador ou stakeholder e melhoria aplicada ao dashboard."],
    ],
  },
  {
    matchDescriptions: ["Advanced Analytics"],
    learningPath: {
      name: "Data & AI",
      description: "Percurso para competencias de dados, analitica, inteligencia artificial e decisao suportada por dados.",
    },
    serviceLine: {
      name: "Artificial Intelligence",
      description: "Uso responsavel de IA, automacao assistida e avaliacao de resultados.",
    },
    area: "Advanced Analytics",
    badge: {
      level: "Senior",
      description: "Advanced Analytics",
      points: 120,
      expiry_days: 365,
      image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    },
    requirements: [
      ["AA1", "Definir problema analitico", "Traduzir uma necessidade de negocio em pergunta analitica, metricas e criterios de sucesso."],
      ["AA2", "Explorar dados", "Apresentar analise exploratoria com distribuicoes, correlacoes, outliers e principais hipoteses."],
      ["AA3", "Aplicar modelo estatistico", "Demonstrar tecnica analitica adequada e justificar as variaveis utilizadas."],
      ["AA4", "Comunicar recomendacoes", "Entregar conclusoes acionaveis, riscos e proximos passos para a equipa ou cliente."],
    ],
  },
  {
    matchDescriptions: ["Machine Learning Models"],
    learningPath: {
      name: "Data & AI",
      description: "Percurso para competencias de dados, analitica, inteligencia artificial e decisao suportada por dados.",
    },
    serviceLine: {
      name: "Artificial Intelligence",
      description: "Uso responsavel de IA, automacao assistida e avaliacao de resultados.",
    },
    area: "Artificial Intelligence",
    badge: {
      level: "Especialista",
      description: "Machine Learning Models",
      points: 160,
      expiry_days: 365,
      image_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
    },
    requirements: [
      ["ML1", "Preparar features", "Documentar limpeza, transformacao, encoding e selecao de variaveis utilizadas no modelo."],
      ["ML2", "Treinar e avaliar modelo", "Entregar metricas adequadas ao problema e comparar pelo menos duas abordagens."],
      ["ML3", "Controlar overfitting", "Demonstrar validacao, separacao treino/teste e analise de generalizacao."],
      ["ML4", "Explicar modelo", "Apresentar interpretabilidade, limites, risco de viés e recomendacao de uso responsavel."],
    ],
  },
  {
    matchDescriptions: ["Data Strategy Leadership"],
    learningPath: {
      name: "Data & AI",
      description: "Percurso para competencias de dados, analitica, inteligencia artificial e decisao suportada por dados.",
    },
    serviceLine: {
      name: "Data Engineering",
      description: "Modelacao, pipelines, qualidade e disponibilizacao de dados.",
    },
    area: "Data Strategy",
    badge: {
      level: "Lider",
      description: "Data Strategy Leadership",
      points: 210,
      expiry_days: 365,
      image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    },
    requirements: [
      ["DL1", "Definir visao de dados", "Entregar roadmap com objetivos, casos de uso prioritarios e valor esperado para negocio."],
      ["DL2", "Desenhar governance", "Definir ownership, qualidade, privacidade, catalogacao e regras de acesso aos dados."],
      ["DL3", "Alinhar stakeholders", "Demonstrar alinhamento com areas envolvidas e criterios de sucesso partilhados."],
      ["DL4", "Medir impacto", "Apresentar metricas de adopcao, valor entregue e plano de melhoria continua."],
    ],
  },
];

async function findOrCreateByName(Model, where, defaults, transaction) {
  const found = await Model.findOne({ where, transaction });
  if (found) {
    await found.update(defaults, { transaction });
    return found;
  }

  return Model.create({ ...where, ...defaults }, { transaction });
}

async function ensureHierarchy(item, transaction) {
  const learningPath = await findOrCreateByName(
    LearningPath,
    { name: item.learningPath.name },
    { description: item.learningPath.description },
    transaction,
  );

  const serviceLine = await findOrCreateByName(
    ServiceLine,
    { name: item.serviceLine.name },
    {
      learning_path_id: learningPath.id,
      description: item.serviceLine.description,
    },
    transaction,
  );

  return findOrCreateByName(
    Area,
    { name: item.area, service_line_id: serviceLine.id },
    { parent_id: null },
    transaction,
  );
}

async function upsertBadge(item, area, transaction) {
  const existing = await Badge.findOne({
    where: {
      area_id: area.id,
      level: item.badge.level,
      description: item.badge.description,
    },
    transaction,
  });

  if (existing) {
    await existing.update(item.badge, { transaction });
    return { badge: existing, created: false };
  }

  const badge = await Badge.create(
    {
      ...item.badge,
      area_id: area.id,
    },
    { transaction },
  );

  return { badge, created: true };
}

async function findExistingBadge(item, transaction) {
  const descriptions = item.matchDescriptions || [item.badge.description];

  for (const description of descriptions) {
    const badge = await Badge.findOne({
      where: {
        level: item.badge.level,
        description,
      },
      transaction,
    });

    if (badge) return badge;
  }

  return null;
}

async function upsertLegacyBadge(item, transaction) {
  const area = await ensureHierarchy(item, transaction);
  const existing = await findExistingBadge(item, transaction);

  if (existing) {
    const areaConflict = await Badge.findOne({
      where: {
        area_id: area.id,
        level: item.badge.level,
      },
      transaction,
    });
    const canMoveArea = !areaConflict || areaConflict.id === existing.id;

    await existing.update(
      {
        ...item.badge,
        area_id: canMoveArea ? area.id : existing.area_id,
      },
      { transaction },
    );
    return { badge: existing, created: false };
  }

  const badge = await Badge.create(
    {
      ...item.badge,
      area_id: area.id,
    },
    { transaction },
  );

  return { badge, created: true };
}

async function upsertRequirements(badge, requirements, transaction) {
  let created = 0;
  let updated = 0;

  for (const [code, title, description] of requirements) {
    const existing = await Requirement.findOne({
      where: { badge_id: badge.id, code },
      transaction,
    });

    const values = {
      badge_id: badge.id,
      code,
      title,
      description,
      image_url: badge.image_url,
    };

    if (existing) {
      await existing.update(values, { transaction });
      updated += 1;
    } else {
      await Requirement.create(values, { transaction });
      created += 1;
    }
  }

  return { created, updated };
}

function isGenericRequirement(requirement) {
  const title = (requirement.title || "").trim();
  const description = (requirement.description || "").trim();

  return (
    title.length === 0 ||
    /^Requisito \d+ do badge/i.test(description) ||
    /^Requisito \d+$/i.test(title)
  );
}

function areaProfile(areaName = "", badgeDescription = "") {
  const value = `${areaName} ${badgeDescription}`.toLowerCase();

  if (value.includes("azure") || value.includes("cloud")) {
    return {
      topic: "cloud",
      tool: "Azure ou plataforma cloud equivalente",
      lab: "criar um recurso cloud simples",
      evidence: "screenshot do recurso, configuracao usada e pequena justificacao tecnica",
    };
  }

  if (value.includes("vmware") || value.includes("virtual")) {
    return {
      topic: "virtualizacao",
      tool: "VMware ou laboratorio de virtualizacao equivalente",
      lab: "criar e configurar uma maquina virtual",
      evidence: "screenshot da VM, configuracao de CPU/RAM/disco e explicacao do objetivo",
    };
  }

  if (value.includes("devops") || value.includes("ci/cd")) {
    return {
      topic: "DevOps e CI/CD",
      tool: "GitHub Actions, GitLab CI ou pipeline equivalente",
      lab: "criar uma pipeline com build e validacao automatica",
      evidence: "link ou screenshot da pipeline executada com sucesso",
    };
  }

  if (value.includes("automation") || value.includes("iac")) {
    return {
      topic: "automacao e infraestrutura como codigo",
      tool: "Terraform, Ansible ou script de automacao equivalente",
      lab: "automatizar uma tarefa tecnica repetivel",
      evidence: "codigo da automacao, output da execucao e explicacao dos parametros",
    };
  }

  if (value.includes("recruitment") || value.includes("talent")) {
    return {
      topic: "talento e crescimento tecnico",
      tool: "matriz de competencias ou plano de desenvolvimento",
      lab: "avaliar competencias e propor proximos passos",
      evidence: "documento com criterios, avaliacao e recomendacao fundamentada",
    };
  }

  if (value.includes("data") || value.includes("sql") || value.includes("analytics")) {
    return {
      topic: "dados e analitica",
      tool: "SQL, dashboard ou pipeline de dados",
      lab: "resolver um caso pratico com dados reais ou simulados",
      evidence: "query, dashboard ou notebook com conclusoes e validacao dos resultados",
    };
  }

  if (value.includes("security") || value.includes("cyber")) {
    return {
      topic: "seguranca aplicacional",
      tool: "checklist OWASP ou validacao de seguranca equivalente",
      lab: "identificar e corrigir um risco de seguranca",
      evidence: "descricao do risco, correcao aplicada e prova de validacao",
    };
  }

  return {
    topic: "competencia tecnica do badge",
    tool: "ferramentas usadas no contexto do projeto",
    lab: "executar um exercicio pratico alinhado com o badge",
    evidence: "documento, screenshot ou link que prove a execucao e o resultado",
  };
}

function levelExpectation(level) {
  switch (level) {
    case "Intermedio":
      return "com autonomia e justificacao das decisoes tecnicas";
    case "Senior":
      return "incluindo desenho da solucao, trade-offs e impacto em projeto";
    case "Especialista":
      return "incluindo otimizacao, riscos, limites e recomendacoes avancadas";
    case "Lider":
      return "incluindo orientacao da equipa, governance e medicao de impacto";
    default:
      return "com acompanhamento de mentor ou lider tecnico";
  }
}

function genericRequirementTemplates(badge) {
  const areaName = badge.area?.name || "";
  const profile = areaProfile(areaName, badge.description);
  const expectation = levelExpectation(badge.level);

  return [
    [
      "REQ1",
      `Concluir formacao de ${profile.topic}`,
      `Completar uma formacao ou modulo introdutorio sobre ${profile.topic} e registar os principais conceitos aprendidos.`,
    ],
    [
      "REQ2",
      "Executar exercicio pratico",
      `Usar ${profile.tool} para ${profile.lab}, ${expectation}.`,
    ],
    [
      "REQ3",
      "Submeter evidencia tecnica",
      `Entregar ${profile.evidence}.`,
    ],
    [
      "REQ4",
      "Documentar aprendizagem",
      "Explicar passos executados, dificuldades encontradas, decisoes tomadas e como o resultado foi validado.",
    ],
    [
      "REQ5",
      "Validacao por responsavel",
      "Obter validacao de mentor, talent manager ou service line leader confirmando que os criterios do badge foram cumpridos.",
    ],
  ];
}

async function improveGenericRequirements(transaction) {
  const badges = await Badge.findAll({
    include: [{ model: Area, as: "area" }],
    order: [["id", "ASC"]],
    transaction,
  });

  let updated = 0;

  for (const badge of badges) {
    const requirements = await Requirement.findAll({
      where: { badge_id: badge.id },
      order: [["code", "ASC"], ["id", "ASC"]],
      transaction,
    });

    if (!requirements.some(isGenericRequirement)) continue;

    const templates = genericRequirementTemplates(badge);

    for (let index = 0; index < requirements.length; index += 1) {
      const requirement = requirements[index];
      if (!isGenericRequirement(requirement)) continue;

      const [code, title, description] = templates[index] || templates[templates.length - 1];
      await requirement.update(
        {
          code: requirement.code || code,
          title,
          description,
          image_url: requirement.image_url || badge.image_url,
        },
        { transaction },
      );
      updated += 1;
    }
  }

  return updated;
}

async function main() {
  const totals = {
    badgesCreated: 0,
    badgesUpdated: 0,
    requirementsCreated: 0,
    requirementsUpdated: 0,
    genericRequirementsUpdated: 0,
  };

  await database.transaction(async (transaction) => {
    for (const item of catalog) {
      const area = await ensureHierarchy(item, transaction);
      const { badge, created } = await upsertBadge(item, area, transaction);
      const requirementTotals = await upsertRequirements(badge, item.requirements, transaction);

      totals.badgesCreated += created ? 1 : 0;
      totals.badgesUpdated += created ? 0 : 1;
      totals.requirementsCreated += requirementTotals.created;
      totals.requirementsUpdated += requirementTotals.updated;
    }

    for (const item of legacyBadges) {
      const { badge, created } = await upsertLegacyBadge(item, transaction);
      const requirementTotals = await upsertRequirements(badge, item.requirements, transaction);

      totals.badgesCreated += created ? 1 : 0;
      totals.badgesUpdated += created ? 0 : 1;
      totals.requirementsCreated += requirementTotals.created;
      totals.requirementsUpdated += requirementTotals.updated;
    }

    totals.genericRequirementsUpdated = await improveGenericRequirements(transaction);
  });

  console.log("Complete badge catalog seed finished.");
  console.table(totals);
  await database.close();
}

main().catch(async (error) => {
  console.error("Erro ao criar catalogo completo de badges:", error);
  await database.close();
  process.exit(1);
});
