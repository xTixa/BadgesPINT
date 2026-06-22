export function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 19) return "Boa tarde";
  return "Boa noite";
}
