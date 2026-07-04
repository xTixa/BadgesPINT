const MIN_LENGTH = 8;

export function getPasswordPolicyError(password) {
  if (!password || password.length < MIN_LENGTH) {
    return `A password deve ter pelo menos ${MIN_LENGTH} caracteres.`;
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return "A password deve conter pelo menos uma letra e um número.";
  }
  return null;
}
