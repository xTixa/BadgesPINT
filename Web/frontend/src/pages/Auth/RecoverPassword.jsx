import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "/src/api";
import AuthShell from "./AuthShell";

export default function RecoverPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [resetting, setResetting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) return;

    setSent(true);
    setTokenInput(token);
    setInfo(t("auth.recoverPassword.infoDefineNew"));
  }, [t]);

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");

    try {
      const res = await api.post("/api/auth/recover-password", { email });

      setSent(true);
      setInfo(res.data?.message || t("auth.recoverPassword.infoSent"));

      if (res.data?.resetToken) {
        setResetToken(res.data.resetToken);
        setTokenInput(res.data.resetToken);
      }

      if (res.data?.emailSent === false && res.data?.emailError) {
        setInfo(`${res.data.message} ${res.data.emailError}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || t("auth.recoverPassword.errors.sendFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setResetting(true);
    setError("");
    setInfo("");

    if (newPassword.length < 6) {
      setError(t("auth.recoverPassword.errors.tooShort"));
      setResetting(false);
      return;
    }

    if (newPassword !== confirm) {
      setError(t("auth.recoverPassword.errors.mismatch"));
      setResetting(false);
      return;
    }

    try {
      const res = await api.post("/api/auth/reset-password", {
        token: tokenInput,
        newPassword,
      });

      setDone(true);
      setInfo(res.data?.message || t("auth.recoverPassword.success"));
    } catch (err) {
      setError(err.response?.data?.message || t("auth.recoverPassword.errors.resetFailed"));
    } finally {
      setResetting(false);
    }
  };

  return (
    <AuthShell
      title={t("auth.recoverPassword.title")}
      description={t("auth.recoverPassword.description")}
      asideTitle={t("auth.recoverPassword.asideTitle")}
      asideText={t("auth.recoverPassword.asideText")}
      asideNote={{
        label: t("auth.recoverPassword.asideNote.label"),
        text: t("auth.recoverPassword.asideNote.text"),
      }}
    >
      {error && <p className="auth-message auth-message-error">{error}</p>}
      {info && <p className="auth-message auth-message-success">{info}</p>}

      {!sent && !done && (
        <form onSubmit={handleSend}>
          <div className="auth-field">
            <label>{t("auth.recoverPassword.emailLabel")}</label>
            <input
              type="email"
              required
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("auth.recoverPassword.emailPlaceholder")}
            />
          </div>

          <button type="submit" disabled={loading} className="auth-primary-button">
            <i className="bi bi-send"></i>
            {loading ? t("auth.recoverPassword.sending") : t("auth.recoverPassword.sendInstructions")}
          </button>
        </form>
      )}

      {sent && !done && (
        <form onSubmit={handleReset}>
          <div className="auth-field">
            <label>{t("auth.recoverPassword.tokenLabel")}</label>
            <input
              type="text"
              required
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="auth-input"
              placeholder={t("auth.recoverPassword.tokenPlaceholder")}
            />
            {resetToken && (
              <p className="mt-2 text-xs text-slate-500">
                {t("auth.recoverPassword.devToken", { token: resetToken })}
              </p>
            )}
          </div>

          <div className="auth-field">
            <label>{t("auth.recoverPassword.newPasswordLabel")}</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={`auth-input ${
                newPassword && newPassword.length < 6 ? "border-red-400" : ""
              }`}
              placeholder={t("auth.recoverPassword.newPasswordPlaceholder")}
            />
          </div>

          <div className="auth-field">
            <label>{t("auth.recoverPassword.confirmPasswordLabel")}</label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={`auth-input ${
                confirm && confirm !== newPassword ? "border-red-400" : ""
              }`}
              placeholder={t("auth.recoverPassword.confirmPasswordPlaceholder")}
            />
          </div>

          <button type="submit" disabled={resetting} className="auth-primary-button">
            <i className="bi bi-shield-check"></i>
            {resetting ? t("auth.recoverPassword.saving") : t("auth.recoverPassword.resetSubmit")}
          </button>
        </form>
      )}

      {done && (
        <div className="text-center">
          <Link to="/login" className="auth-secondary-button">
            {t("auth.recoverPassword.backToLogin")}
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
