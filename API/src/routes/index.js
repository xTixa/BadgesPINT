import { Router } from "express";

import lp from "./LearningPathRoutes.js";
import sl, { serviceLineAdminRouter } from "./ServiceLineRoutes.js";
import area from "./AreaRoutes.js";
import badge from "./BadgeRoutes.js";
import reqs from "./RequirementRoutes.js";
import userRoutes from "./userRoutes.js";
import adminRoutes from "./adminRoutes.js";
import authRoutes from "./authRoutes.js";
import consultorRoutes from "./consultorRoutes.js";
import tmRoutes from "./talentManagerRoutes.js";
import slRoutes from "./sLRoutes.js";
import adminBadgeRoutes from "./adminBadgeRoutes.js";
import adminRequirementRoutes from "./adminRequirementRoutes.js";
import auditLogRoutes from "./auditLogRoutes.js";
import ticketRoutes from "./ticketRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import pedidosRoutes from "./pedidosRoutes.js";
import slaRoutes from "./slaRoutes.js";

const router = Router();

router.use("/learning-paths", lp);        // GET /learning-paths
router.use("/learning-paths", sl);        // GET /learning-paths/:id/service-lines
router.use("/", serviceLineAdminRouter);  // /api/service-lines CRUD
router.use("/", area);                    // GET /service-lines/:id/areas  -> actually mounted as /service-lines/:id/areas
router.use("/", badge);                   // GET /areas/:id/badges
router.use("/", reqs);                    // GET /badges/:id/requirements

router.use("/api/users", userRoutes);
router.use("/api/auth", authRoutes);

router.use("/api", consultorRoutes);
router.use("/api/tm", tmRoutes);
router.use("/api/sl", slRoutes);

// Prefixos especificos de /api/admin/* tem de ser montados antes do
// catch-all "/api/admin" (que exige role admin em todos os seus pedidos),
// senao o Express entrega o pedido ao catch-all primeiro e bloqueia com 403
// qualquer chamada de consultor/TM/SLL a estas rotas.
router.use("/api/admin/badges", adminBadgeRoutes);
router.use("/api/admin/requirements", adminRequirementRoutes);
router.use("/api/admin/pedidos", pedidosRoutes);
router.use("/api/admin/slas", slaRoutes);
router.use("/api/admin", adminRoutes);

router.use("/api/pedidos", pedidosRoutes);
router.use("/api/audit-logs", auditLogRoutes);
router.use("/api/tickets", ticketRoutes);
router.use("/api/notifications", notificationRoutes);


export default router;
