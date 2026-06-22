import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "/src/api";
import AuthShell from "./AuthShell";

export default function RecoverPassword() {
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
    setInfo("Define a tua nova password para concluir a recuperacao.");
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");

    try {
      const res = await api.post("/api/auth/recover-password", { email });

      setSent(true);
      setInfo(res.data?.message || "Se o email existir, enviamos instrucoes.");

      if (res.data?.resetToken) {
        setResetToken(res.data.resetToken);
        setTokenInput(res.data.resetToken);
      }

      if (res.data?.emailSent === false && res.data?.emailError) {
        setInfo(`${res.data.message} ${res.data.emailError}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao enviar instrucoes.");
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
      setError("A password deve ter pelo menos 6 caracteres.");
      setResetting(false);
      return;
    }

    if (newPassword !== confirm) {
      setError("As passwords nao coincidem.");
      setResetting(false);
      return;
    }

    try {
      const res = await api.post("/api/auth/reset-password", {
        token: tokenInput,
        newPassword,
      });

      setDone(true);
      setInfo(res.data?.message || "Password redefinida com sucesso.");
    } catch (err) {
      setError(err.response?.data?.message || "Erro a redefinir password.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <AuthShell
      title="Recuperar password"
      description="Recebe um token e define uma nova password de acesso."
      asideTitle="Volta a entrar com seguranca"
      asideText="Enviaremos as instrucoes para o email associado a tua conta."
      asideNote={{
        label: "Conta protegida",
        text: "O token de recuperacao e validado antes de qualquer alteracao.",
      }}
    >
      {error && <p className="auth-message auth-message-error">{error}</p>}
      {info && <p className="auth-message auth-message-success">{info}</p>}

      {!sent && !done && (
        <form onSubmit={handleSend}>
          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              required
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@dominio.com"
            />
          </div>

          <button type="submit" disabled={loading} className="auth-primary-button">
            <i className="bi bi-send"></i>
            {loading ? "A enviar..." : "Enviar instrucoes"}
          </button>
        </form>
      )}

      {sent && !done && (
        <form onSubmit={handleReset}>
          <div className="auth-field">
            <label>Token de redefinicao</label>
            <input
              type="text"
              required
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="auth-input"
              placeholder="Cole o token enviado por email"
            />
            {resetToken && (
              <p className="mt-2 text-xs text-slate-500">
                Token para testes (dev): {resetToken}
              </p>
            )}
          </div>

          <div className="auth-field">
            <label>Nova password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={`auth-input ${
                newPassword && newPassword.length < 6 ? "border-red-400" : ""
              }`}
              placeholder="Minimo 6 caracteres"
            />
          </div>

          <div className="auth-field">
            <label>Confirmar password</label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={`auth-input ${
                confirm && confirm !== newPassword ? "border-red-400" : ""
              }`}
              placeholder="Repete a password"
            />
          </div>

          <button type="submit" disabled={resetting} className="auth-primary-button">
            <i className="bi bi-shield-check"></i>
            {resetting ? "A guardar..." : "Redefinir password"}
          </button>
        </form>
      )}

      {done && (
        <div className="text-center">
          <Link to="/login" className="auth-secondary-button">
            Voltar ao login
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
