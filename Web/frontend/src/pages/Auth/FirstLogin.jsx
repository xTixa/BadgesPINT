import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "/src/api";
import AuthShell from "./AuthShell";
import { storeBrowserCredentials } from "../../utils/browserCredentials";

export default function FirstLogin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      return setError(t("auth.firstLogin.errors.tooShort"));
    }

    if (password !== confirm) {
      return setError(t("auth.firstLogin.errors.mismatch"));
    }

    try {
      const token = localStorage.getItem("token");

      const res = await api.post(
        "/api/auth/first-login",
        { newPassword: password },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      const pendingCredential = sessionStorage.getItem("rememberCredentialsAfterFirstLogin");
      if (pendingCredential) {
        try {
          const { email, name } = JSON.parse(pendingCredential);
          await storeBrowserCredentials({ email, password, name });
        } finally {
          sessionStorage.removeItem("rememberCredentialsAfterFirstLogin");
        }
      }

      alert(t("auth.firstLogin.success"));

      switch (res.data.user.role) {
        case "admin":
          navigate("/admin/dashboard");
          break;
        case "talent_manager":
          navigate("/tm/dashboard");
          break;
        case "service_line_leader":
          navigate("/sl/dashboard");
          break;
        default:
          navigate("/dashboard");
      }
    } catch (error) {
      console.error(error);
      setError(t("auth.firstLogin.errors.updateFailed"));
    }
  };

  return (
    <AuthShell
      title={t("auth.firstLogin.title")}
      description={t("auth.firstLogin.description")}
      asideTitle={t("auth.firstLogin.asideTitle")}
      asideText={t("auth.firstLogin.asideText")}
      asideNote={{
        label: t("auth.firstLogin.asideNote.label"),
        text: t("auth.firstLogin.asideNote.text"),
      }}
    >
      <form onSubmit={handleSubmit} autoComplete="on">
        {error && <p className="auth-message auth-message-error">{error}</p>}

        <div className="auth-field">
          <label>{t("auth.firstLogin.newPasswordLabel")}</label>
          <input
            type="password"
            name="new-password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
            placeholder={t("auth.firstLogin.newPasswordPlaceholder")}
          />
        </div>

        <div className="auth-field">
          <label>{t("auth.firstLogin.confirmPasswordLabel")}</label>
          <input
            type="password"
            name="confirm-password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="auth-input"
            placeholder={t("auth.firstLogin.confirmPasswordPlaceholder")}
          />
        </div>

        <button type="submit" className="auth-primary-button">
          <i className="bi bi-check2-circle"></i>
          {t("auth.firstLogin.submit")}
        </button>
      </form>
    </AuthShell>
  );
}
