import { Op } from "sequelize";
import User from "../models/User.js";
import { sendGoalReminderEmail } from "../services/mailService.js";
import { createUniqueNotification } from "../services/notificationService.js";

const DEFAULT_INTERVAL_MS = 6 * 60 * 60 * 1000;
let intervalId = null;

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toDateOnly(date) {
  return date.toISOString().slice(0, 10);
}

export async function runGoalReminderJob({ daysAhead = 7 } = {}) {
  const today = new Date();
  const users = await User.findAll({
    where: {
      role: "consultant",
      goal_deadline: {
        [Op.between]: [toDateOnly(today), toDateOnly(addDays(today, daysAhead))],
      },
    },
    attributes: ["id", "name", "email", "goal_text", "goal_deadline"],
  });

  let created = 0;

  for (const user of users) {
    const deadline = user.goal_deadline
      ? new Date(user.goal_deadline).toLocaleDateString("pt-PT")
      : "brevemente";
    const titulo = "Objetivo perto do prazo";
    const mensagem = `O teu objetivo "${user.goal_text || "objetivo pessoal"}" termina em ${deadline}.`;

    const notification = await createUniqueNotification({
      utilizador_id: user.id,
      titulo,
      mensagem,
      tipo: "geral",
      email: user.email
        ? {
            to: user.email,
            send: () =>
              sendGoalReminderEmail({
                to: user.email,
                name: user.name,
                goalText: user.goal_text,
                goalDeadline: user.goal_deadline,
              }),
          }
        : null,
    });

    if (!notification.getDataValue("_existing")) {
      created += 1;
    }
  }

  return { checked: users.length, reminders_created: created };
}

export function startGoalReminderJob() {
  if (intervalId || process.env.GOAL_REMINDER_JOB_ENABLED === "false") {
    return null;
  }

  const intervalMs = Number(process.env.GOAL_REMINDER_JOB_INTERVAL_MS || DEFAULT_INTERVAL_MS);
  const daysAhead = Number(process.env.GOAL_REMINDER_DAYS_AHEAD || 7);

  const run = () => {
    runGoalReminderJob({ daysAhead }).catch((error) => {
      console.error("Erro no job de lembretes de objetivos:", error);
    });
  };

  run();
  intervalId = setInterval(run, intervalMs);
  return intervalId;
}
