import api from "/src/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthShell from "./AuthShell";
import { loadBrowserCredentials, storeBrowserCredentials } from "../../utils/browserCredentials";

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    let active = true;
    localStorage.removeItem("savedLogin");
    loadBrowserCredentials().then((credential) => {
      if (!active || !credential) return;
      setEmail(credential.email);
      setPassword(credential.password);
      setRememberMe(true);
    });
    return () => { active = false; };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    const normalizedEmail = email.trim();
    const validationErrors = {};

    if (!normalizedEmail) validationErrors.email = t("auth.login.errors.emailRequired");
    else if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) validationErrors.email = t("auth.login.errors.emailInvalid");
    if (!password) validationErrors.password = t("auth.login.errors.passwordRequired");

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }
    setFieldErrors({});

    try {
      const res = await api.post("/api/auth/login", {
        email: normalizedEmail,
        password,
      });

      const { user, token, greeting, firstLogin } = res.data;

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      if (rememberMe && firstLogin) {
        sessionStorage.setItem("rememberCredentialsAfterFirstLogin", JSON.stringify({ email: normalizedEmail, name: user.name }));
      } else if (rememberMe) {
        await storeBrowserCredentials({ email: normalizedEmail, password, name: user.name });
      } else {
        sessionStorage.removeItem("rememberCredentialsAfterFirstLogin");
      }

      if (greeting) {
        localStorage.setItem("greeting", greeting);
      }

      if (firstLogin) {
        return navigate("/first-login");
      }

      switch (user.role) {
        case "admin":
          navigate("/admin/dashboard");
          break;
        case "talent_manager":
          navigate("/tm/dashboard");
          break;
        case "service_line_leader":
          navigate("/sl/dashboard");
          break;
        case "consultant":
          navigate("/dashboard");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      console.error(err);
      setError(t("auth.login.errors.invalidCredentials"));
      setFieldErrors({ email: true, password: true });
    }
  };

  return (
    <AuthShell
      title={t("auth.login.title")}
      description={t("auth.login.description")}
      asideTitle={t("auth.login.asideTitle")}
      asideText={t("auth.login.asideText")}
      asideNote={{
        label: t("auth.login.asideNote.label"),
        text: t("auth.login.asideNote.text"),
        items: [
          t("auth.login.asideNote.items.admin"),
          t("auth.login.asideNote.items.talentManager"),
          t("auth.login.asideNote.items.serviceLineLeader"),
          t("auth.login.asideNote.items.consultant"),
        ],
      }}
    >
      <form onSubmit={handleLogin} autoComplete="on" noValidate>
        {error && <p className="auth-message auth-message-error">{error}</p>}

        <div className="auth-field">
          <label>{t("auth.login.emailLabel")}</label>
          <input
            type="email"
            name="username"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFieldErrors((current) => ({ ...current, email: undefined }));
            }}
            className={`auth-input ${fieldErrors.email ? "auth-input-error" : ""}`}
            placeholder={t("auth.login.emailPlaceholder")}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
          />
          {typeof fieldErrors.email === "string" && <p id="login-email-error" className="auth-field-error">{fieldErrors.email}</p>}
        </div>

        <div className="auth-field">
          <div className="mb-2 flex items-center justify-between gap-3">
            <label className="auth-label m-0">{t("auth.login.passwordLabel")}</label>
            <button
              type="button"
              onClick={() => navigate("/recover")}
              className="auth-link"
            >
              {t("auth.login.recoverPassword")}
            </button>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFieldErrors((current) => ({ ...current, password: undefined }));
              }}
              className={`auth-input pr-12 ${fieldErrors.password ? "auth-input-error" : ""}`}
              placeholder="********"
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? "login-password-error" : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-3 my-auto inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-[#0F62FE]"
              aria-label={showPassword ? t("auth.login.hidePassword") : t("auth.login.showPassword")}
            >
              <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
            </button>
          </div>
          {typeof fieldErrors.password === "string" && <p id="login-password-error" className="auth-field-error">{fieldErrors.password}</p>}
        </div>

        <div className="mb-6 flex items-center justify-between gap-4 text-sm">
          <label className="flex items-center gap-2 text-slate-700">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-slate-800 focus:ring-[#0F62FE]"
            />
            {t("auth.login.rememberMe")}
          </label>
        </div>

        <button type="submit" className="auth-primary-button">
          <i className="bi bi-box-arrow-in-right"></i>
          {t("auth.login.submit")}
        </button>

        <div className="mt-6 text-center">
          <p className="mb-3 text-sm text-slate-600">{t("auth.login.noAccount")}</p>
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="auth-secondary-button"
          >
            {t("auth.login.createAccount")}
          </button>
        </div>
      </form>
    </AuthShell>
  );
}
