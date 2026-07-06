export const CURRENT_RGPD_CONSENT_VERSION = "1.0";

// Regista a aceitação (ou revogação) do consentimento RGPD de publicação,
// guardando a versão e a data em que a aceitação foi dada — a revogação não
// apaga o histórico da última aceitação, apenas desativa a publicação.
export function applyRgpdConsent(user, accepted) {
  user.rgpd_publication_accepted = accepted === true;
  if (user.rgpd_publication_accepted) {
    user.rgpd_consent_version = CURRENT_RGPD_CONSENT_VERSION;
    user.rgpd_consent_at = new Date();
  }
}
