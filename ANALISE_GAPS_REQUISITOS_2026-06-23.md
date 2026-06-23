# Analise de Gaps face ao PDF de Requisitos PINT 2025

Data da analise: 2026-06-23  
Base: `PINT_2025_Plataforma de Badges da Softinsa - V3.2 - Mobile.pdf`, `AnaliseRequisitosPINT.txt`, e codigo atual em `API`, `Web/frontend` e `Mobile/mobile_app`.

Nota: o PDF existe no repositorio, mas a extracao direta de texto ficou ilegivel por causa da codificacao das fontes. Por isso, usei o TXT de requisitos existente como indice funcional e validei cada ponto contra evidencias reais no codigo. O TXT tambem esta com problemas de codificacao e deve ser tratado como apoio, nao como fonte unica.

## Resumo executivo

O projeto ja cobre grande parte da plataforma: catalogo de badges, dashboards por perfil, workflow de candidatura, upload/validacao de evidencias, certificados PDF, notificacoes em BD, gamification, relatorios/exportacao, app Flutter com cache local e alguns fluxos offline.

O estado real melhorou depois das correcoes aplicadas: as falhas criticas de roles, registo publico, notificacoes/eventos, emails principais, transacoes de aprovacao e alertas SLA ja foram tratadas no codigo. O que continua a pesar mais e a falta de testes automatizados, a necessidade de validacao em ambiente real e alguns requisitos de produto ainda incompletos.

As prioridades antes de entrega devem ser agora:

1. Validar workflow de candidatura ponta a ponta com dados reais.
2. Criar testes minimos para auth, pedidos, evidencias, roles e SLA.
3. Confirmar SMTP/Firebase/Cloudinary em ambiente final.
4. Corrigir codificacao PT e documentar `.env`, seeds e passos de arranque.
5. Fechar requisitos de produto ainda pendentes: i18n, timeline profissional, historico detalhado e assinatura email com badges.

## Concluido desde esta analise

- Roles nas rotas sensiveis: pedidos, SLA, tickets e requisitos admin foram protegidos no backend.
- Registo publico: `/api/users/register` aceita registo publico de consultor, valida RGPD, valida `area_id` e o Web carrega areas reais via `/api/areas`.
- Endpoints genericos de aprovar/rejeitar: ficaram restritos a admin; o fluxo normal usa TM -> SL.
- Validacoes de dono: consultores so consultam/cancelam os seus pedidos e tickets.
- Transacoes: aprovacao/rejeicao/devolucao final do fluxo de pedidos usa transacoes onde altera estado/pontos.
- Pontos duplicados: aprovacao nao soma pontos outra vez se o pedido ja estava obtido.
- Emails: aprovacao, rejeicao, devolucao, candidatura, reset e validacao SL ja existem no `mailService`.
- Notificacoes centralizadas: `notificationService.js` cria notificacoes e aciona push via hooks do modelo `Notification`.
- Alertas SLA: existe endpoint admin `POST /api/admin/slas/check-alerts` para detetar pedidos fora de SLA e notificar responsaveis.
- Mobile: fallback de ranking mock ficou limitado a `kDebugMode`, nao a producao.

## Gaps criticos ativos

### 1. Testes quase inexistentes

Evidencias:

- `API/package.json` nao tem script de teste.
- `Web/frontend/package.json` tem `lint`, mas nao ha testes de componentes/fluxos.
- Mobile tem apenas `test/widget_test.dart` basico para carregar login.
- `API/test.js` testa apenas ligacao a BD.

Acao recomendada minima:

- Backend: testes de auth/roles, registo, pedidos, workflow TM/SL, evidencias, notificacoes.
- Frontend: testes de rotas protegidas e chamadas principais.
- Mobile: testes de repositorio com API fake, offline queue e ecras principais.

### 2. Validacao operacional ainda pendente

Evidencias:

- `npm.cmd run build` passa no Web.
- `node --check` passa nos ficheiros backend alterados.
- `flutter analyze` e `dart analyze` nao terminaram dentro do timeout nesta maquina.
- Nao foi executado teste ponta a ponta contra BD/SMTP/Firebase/Cloudinary reais.

Acao recomendada:

- Testar manualmente o fluxo completo: registo -> primeiro login -> candidatura -> validacao TM -> aprovacao/rejeicao SL -> email/push/certificado.
- Confirmar variaveis SMTP, Firebase e Cloudinary em `.env` de producao.
- Executar `flutter analyze`/`flutter test` fora do timeout do Codex ou num terminal local.

### 3. SLA ainda precisa automatizacao

O endpoint `POST /api/admin/slas/check-alerts` ja verifica pedidos fora de SLA e notifica responsaveis, mas ainda depende de chamada manual/API.

Acao recomendada:

- Adicionar cron/job externo ou scheduler backend para executar a verificacao periodicamente.
- Definir regra de repeticao: notificar uma vez por pedido, diariamente, ou ate ser tratado.

## Matriz por area funcional

| Area | Estado | Evidencia | Falta / Melhorar |
|---|---:|---|---|
| Login e JWT | Implementado | `API/src/controllers/authController.js`, `API/src/middleware/authMiddleware.js` | Melhorar expiracao/refresh token, logout real ou blacklist se exigido |
| Primeiro login | Implementado | `FirstLogin.jsx`, `firstLogin()` | Validar UX e regras de password mais fortes |
| Recuperar password | Implementado | `recoverPassword`, `resetPassword`, `RecoverPassword.jsx`, mobile `recover_password_page.dart` | Confirmar SMTP em ambiente final |
| Registo de consultor | Implementado | `Register.jsx`, `userRoutes.js`, `registerConsultant()` | Validar SMTP e texto legal RGPD final |
| Catalogo de badges | Implementado | `Badges.jsx`, `BadgeRoutes.js`, mobile `badges_page.dart` | Confirmar filtros por area/nivel e performance |
| Requisitos por badge | Implementado | `RequirementRoutes.js`, `Requirements.jsx` | Validar remocao/edicao em cascata nos requisitos admin |
| Upload de evidencias | Implementado | `evidenceController.js`, `UploadEvidencias.jsx`, mobile upload | Validar tamanho/tipo ficheiro, antivirus/opcoes Cloudinary, privacidade |
| Validacao de evidencias por TM | Implementado | `talentManagerRoutes.js`, `ValidarEvidencias.jsx` | Testar notificacao/push com Firebase real |
| Workflow candidatura TM -> SL | Implementado | `pedidosController.js` | Falta historico detalhado robusto por evento |
| Dashboard Consultor | Implementado | `DashboardConsultor.jsx`, endpoints consultor | Rever metricas calculadas e estados vazios |
| Dashboard TM | Implementado | `DashboardTalentManager.jsx`, `talentManagerController.js` | Confirmar filtros e exportacao com dados reais |
| Dashboard SL | Implementado | `DashboardServiceLine.jsx`, `sLController.js` | Melhorar comparacao/ranking por service line |
| Admin utilizadores | Implementado | `adminRoutes.js`, `GestaoUtilizadores.jsx` | Auditar permissoes e validacoes |
| Admin badges/learning paths | Implementado | `adminBadgeRoutes.js`, `GestaoBadges.jsx`, `GestaoLearningPaths.jsx` | Validar remocao em cascata |
| Certificados PDF | Implementado | `generateConsultorBadgeCertificate`, `adminGenerateBadgeCertificate` | Personalizacao/branding final e QR code se exigido |
| Verificacao publica de certificados | Implementado | `/api/public/certificates/:code` | Confirmar politica RGPD e pagina publica Web se necessaria |
| LinkedIn share | Parcial | `/share/badges/:id`, campos `linkedin_sharing_enabled` | Verificar botao em UI, imagem OG real e consentimento RGPD |
| Notificacoes em BD | Implementado | `Notification` model/controller, `notificationService.js` | Validar unread counts em UI |
| Push notifications | Implementado / por validar | Firebase backend/mobile existe | Confirmar credenciais Firebase e rececao em dispositivo real |
| Emails | Implementado / por validar | `mailService.js` | Confirmar SMTP final e templates |
| SLA | Parcial | `SLA.js`, `slaRoutes.js`, `GestaoSLA.jsx`, `checkSLAAlerts` | Falta scheduler automatico para chamar os alertas |
| Relatorios/exportacao | Implementado | `exportController.js`, paginas de relatorios | Validar Excel/PDF com dados reais e permissoes |
| Auditoria | Parcial | `AuditLog`, `authController` | Logar alteracoes admin, pedidos, evidencias, SLA, exports |
| Galeria publica | Implementado | `/api/public/galeria`, `Galeria.jsx` | Confirmar consentimento RGPD e esconder email/dados sensiveis |
| Gamification/ranking | Parcial | `Gamification.jsx`, mobile, endpoints | Definir regras oficiais de conquistas |
| Offline mobile | Parcial | DAOs, `SyncService`, `MutationQueueService` | Testar conflitos, retries, duplicados e consistencia apos sync |
| Internacionalizacao | Nao implementado / parcial | `LanguageContext.jsx` existe | Falta PT/EN/ES real em Web e Mobile |

## Backend: melhorias tecnicas

1. Remover `ALTER TABLE ...` em `server.js` e mover para migrations/seed scripts.
2. Criar camada de servico para workflow de pedidos para reduzir duplicacao entre admin/TM/SL.
3. Normalizar nomes/codificacao: ha varias mensagens com caracteres corrompidos (`nÃ£o`, `aprovaÃ§Ã£o`).
4. Rever CORS para producao, atualmente `app.use(cors())` e permissivo.
5. Rever limite `express.json({ limit: "5mb" })` face a upload base64 de evidencias.
6. Validar inputs com schema (ex.: Zod/Joi/Yup) em vez de checks soltos.
7. Rever todas as respostas de utilizador para garantir que nenhum endpoint devolve `password_hash` ou dados sensiveis.

## Web frontend: melhorias tecnicas

1. Usar guards baseados em `/api/auth/me` quando necessario, nao apenas `localStorage`.
2. Uniformizar estados de loading/erro/vazio nas paginas de dashboard e listas.
3. Remover restantes textos/dados hardcoded onde ja existem endpoints.
4. Rever acessibilidade: labels, contraste, foco, botoes icon-only se aplicavel.
5. Validar responsividade nas paginas administrativas mais densas.

## Mobile: melhorias tecnicas

1. Garantir configuracao Firebase Android/iOS real (`google-services.json`, plist, permissao Android 13+).
2. Testar offline queue com perda de rede, duplicacao e reenvio apos login/logout.
3. Melhorar tratamento de erros da API: atualmente muitos `catch (_) { return false/null; }` escondem a causa.
4. Implementar internacionalizacao real se os 3 idiomas forem requisito.
5. Adicionar testes para repositorio, DAOs e fluxos principais.

## Requisitos que parecem faltar ou precisam confirmacao

- Aceitacao RGPD juridicamente consistente, com texto/politica versionada.
- Automatizacao dos alertas SLA para equipas responsaveis.
- Historico detalhado de cada candidatura, preferencialmente com eventos/auditoria por etapa.
- Comparacao/ranking por service line/area para SL.
- Timeline de evolucao profissional completa e ligada a dados reais.
- Internacionalizacao PT/EN/ES.
- Assinatura de email com badges, caso seja requisito bonus.
- Testes automatizados e evidencia de validacao.

## Plano sugerido de conclusao

### Prioridade 0 - qualidade de entrega

1. Criar testes backend para auth, roles e workflow.
2. Criar testes web/mobile basicos dos fluxos criticos.
3. Corrigir codificacao PT nos ficheiros.
4. Documentar `.env`, seeds e passos de arranque.

### Prioridade 1 - validacao operacional

1. Validar SMTP, Firebase, Cloudinary e BD em ambiente final.
2. Testar fluxo completo de candidatura ponta a ponta.
3. Automatizar `POST /api/admin/slas/check-alerts` com scheduler/cron.
4. Executar `flutter analyze` e `flutter test` fora do timeout atual.

### Prioridade 2 - requisitos restantes

1. Historico detalhado de cada candidatura.
2. Internacionalizacao PT/EN/ES.
3. Timeline profissional ligada a dados reais.
4. Comparacao/ranking por service line/area para SL.
5. Assinatura de email com badges, se for mantida como bonus.

## Checklist final antes de demonstracao

- Exportacoes abrem corretamente e respeitam role/scope.
- Galeria e certificados publicos respeitam RGPD.
- Consultor recebe notificacao em BD, email e push nos eventos chave em ambiente real.
- Registo cria consultor com area correta e fluxo de primeiro login em ambiente real.
- Mobile funciona online e offline sem dados mock em build de producao.
- Build Web passa.
- App Flutter passa `flutter test`.
- Backend tem testes ou, no minimo, colecao de testes manuais documentada.
