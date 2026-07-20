export const NOTIFICATION_BRANCHES = [
  {
    key: "badges",
    categories: ["badges_candidatura", "badges_evidencia", "badges_resultado", "badges_pendente"],
  },
  { key: "avisos", categories: ["avisos"] },
  { key: "sla", categories: ["sla"] },
  { key: "tickets", categories: ["tickets"] },
];

export const NOTIFICATION_CATEGORIES = NOTIFICATION_BRANCHES.flatMap((branch) => branch.categories);

export const DEFAULT_NOTIFICATION_PREFERENCES = NOTIFICATION_CATEGORIES.reduce((acc, categoria) => {
  acc[categoria] = { push: true, email: true, inApp: true };
  return acc;
}, {});

export function categoriaFromTipo(tipo) {
  if (typeof tipo === "string" && tipo.startsWith("ticket_")) return "tickets";
  if (tipo === "sla") return "sla";
  return "badges_resultado";
}

export function resolvePreferences(rawPreferences) {
  const prefs = rawPreferences && typeof rawPreferences === "object" ? rawPreferences : {};
  return NOTIFICATION_CATEGORIES.reduce((acc, categoria) => {
    const stored = prefs[categoria] && typeof prefs[categoria] === "object" ? prefs[categoria] : {};
    acc[categoria] = {
      push: stored.push !== false,
      email: stored.email !== false,
      inApp: stored.inApp !== false,
    };
    return acc;
  }, {});
}

export function getChannelsForCategory(rawPreferences, categoria) {
  const resolved = resolvePreferences(rawPreferences);
  return resolved[categoria] || DEFAULT_NOTIFICATION_PREFERENCES.badges_resultado;
}
