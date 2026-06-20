// import models to ensure associations are registered when needed
import User from "./User.js";
import LearningPath from "./LearningPath.js";
import ServiceLine from "./ServiceLine.js";
import Area from "./Area.js";
import Badge from "./Badge.js";
import BadgeSection from "./BadgeSection.js";
import BadgeLesson from "./BadgeLesson.js";
import BadgeReview from "./BadgeReview.js";
import Requirement from "./Requirement.js";
import ConsultorBadge from "./ConsultorBadge.js";
import RequirementEvidence from "./RequirementEvidence.js";
import LessonProgress from "./LessonProgress.js";
import Ticket from "./Ticket.js";
import Notification from "./Notification.js";
import AuditLog from "./AuditLog.js";
import PasswordReset from "./PasswordReset.js";
import SLA from "./SLA.js";
import FcmToken from "./FcmToken.js";

// Associations
User.belongsTo(Area, { foreignKey: "area_id", as: "area" });
Area.hasMany(User, { foreignKey: "area_id", as: "users" });

ConsultorBadge.belongsTo(User, { foreignKey: "consultor_id", as: "user" });
ConsultorBadge.belongsTo(Badge, { foreignKey: "badge_id", as: "badge" });
User.hasMany(ConsultorBadge, { foreignKey: "consultor_id", as: "consultorBadges" });
Badge.hasMany(ConsultorBadge, { foreignKey: "badge_id", as: "consultorBadges" });

RequirementEvidence.belongsTo(User, { foreignKey: "consultor_id", as: "consultor" });
RequirementEvidence.belongsTo(Requirement, { foreignKey: "requirement_id", as: "requirement" });
RequirementEvidence.belongsTo(Badge, { foreignKey: "badge_id", as: "badge" });
User.hasMany(RequirementEvidence, { foreignKey: "consultor_id", as: "evidences" });
Requirement.hasMany(RequirementEvidence, { foreignKey: "requirement_id", as: "evidences" });
Badge.hasMany(RequirementEvidence, { foreignKey: "badge_id", as: "evidences" });

export {
  User,
  LearningPath,
  ServiceLine,
  Area,
  Badge,
  BadgeSection,
  BadgeLesson,
  BadgeReview,
  Requirement,
  RequirementEvidence,
  ConsultorBadge,
  LessonProgress,
  Ticket,
  Notification,
  AuditLog,
  PasswordReset,
  SLA,
  FcmToken
};
