import { Router } from "express";

import lp from "./LearningPathRoutes.js";
import sl from "./ServiceLineRoutes.js";
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

const router = Router();

router.use("/learning-paths", lp);        // GET /learning-paths
router.use("/learning-paths", sl);        // GET /learning-paths/:id/service-lines
router.use("/", area);                    // GET /service-lines/:id/areas  -> actually mounted as /service-lines/:id/areas
router.use("/", badge);                   // GET /areas/:id/badges
router.use("/", reqs);                    // GET /badges/:id/requirements

router.use("/api/users", userRoutes);
router.use("/api/admin", adminRoutes);
router.use("/api/auth", authRoutes);

router.use("/api", consultorRoutes);
router.use("/api/tm", tmRoutes);
router.use("/api/sl", slRoutes);

router.use("/api/admin/badges", adminBadgeRoutes);
router.use("/api/admin/requirements", adminRequirementRoutes);
router.use("/api/audit-logs", auditLogRoutes);
router.use("/api/tickets", ticketRoutes);
router.use("/api/notifications", notificationRoutes);

export default router;
