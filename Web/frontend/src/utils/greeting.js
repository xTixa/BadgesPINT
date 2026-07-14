export function getTimeGreetingKey() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return "greeting.morning";
  if (hour >= 12 && hour < 19) return "greeting.afternoon";
  return "greeting.evening";
}
