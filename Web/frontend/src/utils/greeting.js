export function getTimeGreetingKey() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return "greeting.morning";
  if (hour >= 12 && hour < 19) return "greeting.afternoon";
  return "greeting.evening";
}

const GREETING_TYPE_KEYS = {
  welcome: "greeting.welcome",
  welcomeBack: "greeting.welcomeBack",
};

/**
 * Consome (lê e apaga) o tipo de saudação guardado no login, para que
 * "Bem-vindo!"/"Seja bem-vindo novamente" só apareça uma vez por sessão
 * e as recargas seguintes do dashboard caiam na saudação por hora.
 */
export function consumeGreetingKey() {
  const greetingType = localStorage.getItem("greetingType");
  localStorage.removeItem("greetingType");
  return GREETING_TYPE_KEYS[greetingType] || getTimeGreetingKey();
}
