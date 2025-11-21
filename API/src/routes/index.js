import express from "express";
import lp from "./LearningPathRoutes.js";
import sl from "./ServiceLineRoutes.js";
import area from "./AreaRoutes.js";
import badge from "./BadgeRoutes.js";
import reqs from "./RequirementRoutes.js";
import userRoutes from "./userRoutes.js";
import adminRoutes from "./adminRoutes.js";

const router = express.Router();

router.use("/learning-paths", lp);        // GET /learning-paths
router.use("/learning-paths", sl);        // GET /learning-paths/:id/service-lines
router.use("/", area);                    // GET /service-lines/:id/areas  -> actually mounted as /service-lines/:id/areas
router.use("/", badge);                   // GET /areas/:id/badges
router.use("/", reqs);                    // GET /badges/:id/requirements

router.use("/api/users", userRoutes);
router.use("/api/admin", adminRoutes);


export default router;
