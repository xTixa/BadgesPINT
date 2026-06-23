import { runSLAAlertCheck } from "../controllers/slaController.js";

const DEFAULT_INTERVAL_MS = 60 * 60 * 1000;
let intervalId = null;

export async function runSLAAlertJob() {
  return runSLAAlertCheck();
}

export function startSLAAlertJob() {
  if (intervalId || process.env.SLA_ALERT_JOB_ENABLED === "false") {
    return null;
  }

  const intervalMs = Number(process.env.SLA_ALERT_JOB_INTERVAL_MS || DEFAULT_INTERVAL_MS);

  const run = () => {
    runSLAAlertJob()
      .then((result) => {
        if (result.alerts_created_or_existing > 0) {
          console.info("Job SLA concluido:", result);
        }
      })
      .catch((error) => {
        console.error("Erro no job de alertas SLA:", error);
      });
  };

  run();
  intervalId = setInterval(run, intervalMs);
  return intervalId;
}
