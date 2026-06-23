# Analise de Gaps face ao PDF de Requisitos PINT 2025

Data da analise: 2026-06-23  
Base: `PINT_2025_Plataforma de Badges da Softinsa - V3.2 - Mobile.pdf`, `AnaliseRequisitosPINT.txt`, e codigo atual em `API`, `Web/frontend` e `Mobile/mobile_app`.

Nota: o PDF existe no repositorio, mas a extracao direta de texto ficou ilegivel por causa da codificacao das fontes. Por isso, usei o TXT de requisitos existente como indice funcional e validei cada ponto contra evidencias reais no codigo. O TXT tambem esta com problemas de codificacao e deve ser tratado como apoio, nao como fonte unica.

## Resumo executivo

O projeto ja cobre grande parte da plataforma: catalogo de badges, dashboards por perfil, workflow de candidatura, upload/validacao de evidencias, certificados PDF, notificacoes em BD, gamification, relatorios/exportacao, app Flutter com cache local e alguns fluxos offline.

O estado real parece mais perto de 75-85% do que dos 95% indicados no `AnaliseRequisitosPINT.txt`, sobretudo porque existem funcionalidades com UI criada mas backend incompleto, endpoints sem controlo de roles, push notifications parcialmente ligado, mobile com fallbacks mock e pouca cobertura de testes.

As prioridades antes de entrega devem ser:

1. Corrigir autorizacao no backend.
2. Fechar o fluxo de registo e area/service line.
3. Ligar push/email/notificacoes de forma consistente.
4. Validar workflow de candidatura ponta a ponta.
5. Remover mocks/fallbacks de producao no mobile.
6. Criar testes minimos para auth, pedidos, evidencias e roles.

## Gaps criticos

Atualizacao apos correcao: os pontos 1 e 2 desta seccao foram tratados no codigo. As rotas sensiveis passaram a ter middleware por role, foram adicionadas validacoes de dono em pedidos/tickets, e o registo publico passou a carregar areas reais e enviar `area_id`.

### 1. Autorizacao backend incompleta

Alguns endpoints sensiveis estao protegidos apenas por login, mas nao por role.

Evidencias:

- `API/src/routes/pedidosRoutes.js` permite `POST /:id/aprovar` e `POST /:id/rejeitar` para qualquer utilizador autenticado. Isto contorna o fluxo TM -> SL.
- `API/src/routes/slaRoutes.js` permite criar/editar/apagar SLAs com qualquer utilizador autenticado.
- `API/src/routes/adminRequirementRoutes.js` nao aplica `authMiddleware`, `protect(["admin"])` ou equivalente, apesar de estar montado em `/api/admin/requirements`.
- `API/src/routes/ticketRoutes.js` expoe listagem total, atualizacao e estatisticas de tickets sem role admin.
- `Web/frontend/src/utils/ProtectedRoute.jsx` protege rotas no cliente, mas isto nao substitui autorizacao no servidor.

Impacto: um consultor autenticado pode executar operacoes administrativas se conhecer os endpoints.

Acao recomendada:

- Aplicar `protect(["admin"])` a rotas admin.
- Aplicar `protect(["talent_manager"])` nos passos TM.
- Aplicar `protect(["service_line_leader"])` nos passos SL.
- Remover ou restringir os endpoints genericos `aprovarPedido`/`rejeitarPedido`, porque duplicam o fluxo final sem validacao de area/service line.

### 2. Registo publico esta inconsistente

O Web tem pagina publica `Web/frontend/src/pages/Auth/Register.jsx`, mas o endpoint chamado (`POST /api/users/register`) esta protegido por `protect(["admin"])` em `API/src/routes/userRoutes.js`.

Ha ainda outro problema: o formulario envia `area: "DevOps" | "Cloud" | ...`, mas `API/src/controllers/userController.js` espera `area_id`. Resultado provavel: mesmo que a autorizacao fosse corrigida, a area nao ficaria associada corretamente.

Acao recomendada:

- Decidir se o registo e publico ou feito por admin.
- Se for publico: criar endpoint proprio sem role admin, com validacao RGPD e dropdown dinamico de areas reais.
- Se for admin-only: remover rota publica `/register` ou alterar o texto para "pedido de acesso" e criar fluxo de aprovacao.
- Trocar valores hardcoded por `area_id` vindo de `/api/areas`.

### 3. Notificacoes push existem, mas nao estao integradas em todas as criacoes

Existe infraestrutura:

- Backend: `API/src/services/firebaseService.js`.
- Mobile: `Mobile/mobile_app/lib/shared/notification_service.dart`.
- Tokens: `POST /api/notifications/device-token`.

Mas as criacoes de notificacao em `pedidosController.js`, `evidenceController.js`, `ticketController.js` e `notificationController.js` usam `Notification.create`/`bulkCreate` sem chamar `sendPushToUser`/`sendPushToUsers`.

Impacto: a app pode registar FCM, mas muitos eventos continuam apenas em BD/refresh manual.

Acao recomendada:

- Criar helper unico `createNotificationAndPush`.
- Usar esse helper para aprovacao/rejeicao, devolucao, novo pedido para SL, evidencias, tickets e broadcast.
- Documentar variaveis `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` no `.env.example`.

### 4. Mobile ainda tem mocks/fallbacks

`Mobile/mobile_app/lib/consultor/consultor_repository.dart` tem:

- `getRankingMock()`
- `getRecommendationsMock()`
- `getExpiryAlertsMock()`
- fallback para ranking mock quando token/API falha

Isto e util em desenvolvimento, mas em producao mascara erros reais.

Acao recomendada:

- Remover mocks da app final ou controlar por `debug`/flag.
- Mostrar estado de erro vazio quando a API falha.
- Garantir endpoints reais para ranking, recomendacoes e expiracao.

### 5. Testes quase inexistentes

Evidencias:

- `API/package.json` nao tem script de teste.
- `Web/frontend/package.json` tem `lint`, mas nao ha testes de componentes/fluxos.
- Mobile tem apenas `test/widget_test.dart` basico para carregar login.
- `API/test.js` testa apenas ligacao a BD.

Acao recomendada minima:

- Backend: testes de auth/roles, registo, pedidos, workflow TM/SL, evidencias, notificacoes.
- Frontend: testes de rotas protegidas e chamadas principais.
- Mobile: testes de repositorio com API fake, offline queue e ecras principais.

## Matriz por area funcional

| Area | Estado | Evidencia | Falta / Melhorar |
|---|---:|---|---|
| Login e JWT | Implementado | `API/src/controllers/authController.js`, `API/src/middleware/authMiddleware.js` | Melhorar expiracao/refresh token, logout real ou blacklist se exigido |
| Primeiro login | Implementado | `FirstLogin.jsx`, `firstLogin()` | Validar UX e regras de password mais fortes |
| Recuperar password | Implementado | `recoverPassword`, `resetPassword`, `RecoverPassword.jsx`, mobile `recover_password_page.dart` | Confirmar SMTP em ambiente final |
| Registo de consultor | Parcial / inconsistente | `Register.jsx`, `userRoutes.js`, `registerConsultant()` | Corrigir protecao, area dinamica e RGPD real |
| Catalogo de badges | Implementado | `Badges.jsx`, `BadgeRoutes.js`, mobile `badges_page.dart` | Confirmar filtros por area/nivel e performance |
| Requisitos por badge | Implementado | `RequirementRoutes.js`, `Requirements.jsx` | Admin requirements sem protecao adequada |
| Upload de evidencias | Implementado | `evidenceController.js`, `UploadEvidencias.jsx`, mobile upload | Validar tamanho/tipo ficheiro, antivirus/opcoes Cloudinary, privacidade |
| Validacao de evidencias por TM | Implementado | `talentManagerRoutes.js`, `ValidarEvidencias.jsx` | Garantir notificacao/email/push em todos os resultados |
| Workflow candidatura TM -> SL | Parcial | `pedidosController.js` | Endpoints genericos permitem contornar roles; falta historico detalhado robusto |
| Dashboard Consultor | Implementado | `DashboardConsultor.jsx`, endpoints consultor | Rever metricas calculadas e estados vazios |
| Dashboard TM | Implementado | `DashboardTalentManager.jsx`, `talentManagerController.js` | Confirmar filtros e exportacao com dados reais |
| Dashboard SL | Implementado | `DashboardServiceLine.jsx`, `sLController.js` | Melhorar comparacao/ranking por service line |
| Admin utilizadores | Implementado | `adminRoutes.js`, `GestaoUtilizadores.jsx` | Auditar permissoes e validacoes |
| Admin badges/learning paths | Implementado | `adminBadgeRoutes.js`, `GestaoBadges.jsx`, `GestaoLearningPaths.jsx` | Proteger admin requirements; validar remocao em cascata |
| Certificados PDF | Implementado | `generateConsultorBadgeCertificate`, `adminGenerateBadgeCertificate` | Personalizacao/branding final e QR code se exigido |
| Verificacao publica de certificados | Implementado | `/api/public/certificates/:code` | Confirmar politica RGPD e pagina publica Web se necessaria |
| LinkedIn share | Parcial | `/share/badges/:id`, campos `linkedin_sharing_enabled` | Verificar botao em UI, imagem OG real e consentimento RGPD |
| Notificacoes em BD | Implementado | `Notification` model/controller | Centralizar criacao e garantir unread counts |
| Push notifications | Parcial | Firebase backend/mobile existe | Integrar chamadas push nos eventos |
| Emails | Parcial | `mailService.js`, registo, reset, candidatura, SL validation | Faltam emails de aprovacao/rejeicao/devolucao e SLA |
| SLA | Parcial | `SLA.js`, `slaRoutes.js`, `GestaoSLA.jsx` | Autorizacao admin, alertas automaticos, emails/push de violacao |
| Relatorios/exportacao | Implementado | `exportController.js`, paginas de relatorios | Validar Excel/PDF com dados reais e permissoes |
| Auditoria | Parcial | `AuditLog`, `authController` | Logar alteracoes admin, pedidos, evidencias, SLA, exports |
| Galeria publica | Implementado | `/api/public/galeria`, `Galeria.jsx` | Confirmar consentimento RGPD e esconder email/dados sensiveis |
| Gamification/ranking | Parcial | `Gamification.jsx`, mobile, endpoints | Remover mock mobile, definir regras oficiais de conquistas |
| Offline mobile | Parcial | DAOs, `SyncService`, `MutationQueueService` | Testar conflitos, retries, duplicados e consistencia apos sync |
| Internacionalizacao | Nao implementado / parcial | `LanguageContext.jsx` existe | Falta PT/EN/ES real em Web e Mobile |

## Backend: melhorias tecnicas

1. Centralizar autorizacao por role nas rotas.
2. Remover `ALTER TABLE ...` em `server.js` e mover para migrations/seed scripts.
3. Criar camada de servico para workflow de pedidos para evitar duplicacao entre admin/TM/SL.
4. Garantir transacoes em operacoes que alteram pedido + pontos + notificacoes.
5. Prevenir atribuicao duplicada de pontos se um pedido ja aprovado for aprovado outra vez.
6. Normalizar nomes/codificacao: ha varias mensagens com caracteres corrompidos (`nÃ£o`, `aprovaÃ§Ã£o`).
7. Rever CORS para producao, atualmente `app.use(cors())` e permissivo.
8. Rever limite `express.json({ limit: "5mb" })` face a upload base64 de evidencias.
9. Validar inputs com schema (ex.: Zod/Joi/Yup) em vez de checks soltos.
10. Proteger dados sensiveis em respostas de utilizador; algumas respostas devolvem o objeto `user` completo.

## Web frontend: melhorias tecnicas

1. Corrigir `Register.jsx`: endpoint, `area_id`, areas dinamicas e mensagem que expõe password temporaria em dev.
2. Usar guards baseados em `/api/auth/me` quando necessario, nao apenas `localStorage`.
3. Tratar expiracao de token globalmente em `api.js`.
4. Uniformizar estados de loading/erro/vazio nas paginas de dashboard e listas.
5. Remover textos/areas hardcoded onde ja existem endpoints.
6. Rever acessibilidade: labels, contraste, foco, botoes icon-only se aplicavel.
7. Validar responsividade nas paginas administrativas mais densas.

## Mobile: melhorias tecnicas

1. Remover mocks/fallbacks de producao em ranking/recomendacoes/alertas.
2. Garantir configuracao Firebase Android/iOS real (`google-services.json`, plist, permissao Android 13+).
3. Testar offline queue com perda de rede, duplicacao e reenvio apos login/logout.
4. Melhorar tratamento de erros da API: atualmente muitos `catch (_) { return false/null; }` escondem a causa.
5. Implementar internacionalizacao real se os 3 idiomas forem requisito.
6. Adicionar testes para repositorio, DAOs e fluxos principais.

## Requisitos que parecem faltar ou precisam confirmacao

- Registo publico funcional com escolha real de area.
- Aceitacao RGPD juridicamente consistente, com texto/politica versionada.
- Email automatico de aprovacao/rejeicao/devolucao.
- Push notifications acionadas por eventos reais.
- Alertas SLA automaticos para equipas responsaveis.
- Historico detalhado de cada candidatura, preferencialmente com eventos/auditoria por etapa.
- Comparacao/ranking por service line/area para SL.
- Timeline de evolucao profissional completa e ligada a dados reais.
- Internacionalizacao PT/EN/ES.
- Assinatura de email com badges, caso seja requisito bonus.
- Testes automatizados e evidencia de validacao.

## Plano sugerido de conclusao

### Prioridade 0 - seguranca e consistencia

1. Fechar roles nas rotas sensiveis.
2. Corrigir registo e area_id.
3. Remover endpoints genericos de aprovar/rejeitar ou restringi-los a admin.
4. Adicionar transacoes para aprovacao/rejeicao.

### Prioridade 1 - requisitos visiveis

1. Ligar emails de aprovacao/rejeicao/devolucao.
2. Ligar push notifications via helper central.
3. Completar SLA alerts.
4. Remover mocks mobile em producao.

### Prioridade 2 - qualidade de entrega

1. Criar testes backend para auth, roles e workflow.
2. Criar testes web/mobile basicos dos fluxos criticos.
3. Corrigir codificacao PT nos ficheiros.
4. Documentar `.env`, seeds e passos de arranque.

## Checklist final antes de demonstracao

- Admin nao consegue ser contornado por chamadas diretas.
- Consultor nao aprova/rejeita pedidos via API.
- TM valida, SL aprova, e os pontos so entram uma vez.
- Consultor recebe notificacao em BD, email e push nos eventos chave.
- Registo cria consultor com area correta e fluxo de primeiro login.
- Mobile funciona online e offline sem dados mock em ambiente final.
- Exportacoes abrem corretamente e respeitam role/scope.
- Galeria e certificados publicos respeitam RGPD.
- Build Web passa.
- App Flutter passa `flutter test`.
- Backend tem testes ou, no minimo, colecao de testes manuais documentada.
