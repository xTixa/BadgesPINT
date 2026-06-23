import { startGoalReminderJob } from "./reminderJob.js";
import { startSLAAlertJob } from "./slaAlertJob.js";

export function startBackgroundJobs() {
  startGoalReminderJob();
  startSLAAlertJob();
}
