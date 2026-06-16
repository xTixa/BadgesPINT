import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "/src/api";
import logo from "/src/assets/logo.png";

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
      const res = await api.post(
        "/api/auth/recover-password",
        { email }
      );

      setSent(true);
      setInfo(res.data?.message || "Se o email existir, enviámos instruções.");

      // Em ambiente dev mostramos o token para permitir testes manuais
      if (res.data?.resetToken) {
        setResetToken(res.data.resetToken);
        setTokenInput(res.data.resetToken);
      }

      if (res.data?.emailSent === false && res.data?.emailError) {
        setInfo(`${res.data.message} ${res.data.emailError}`);
      }

    } catch (err) {
      setError(
        err.response?.data?.message || "Erro ao enviar instruções."
      );
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
      setError("As passwords não coincidem.");
      setResetting(false);
      return;
    }

    try {
      const res = await api.post(
        "/api/auth/reset-password",
        { token: tokenInput, newPassword }
      );

      setDone(true);
      setInfo(res.data?.message || "Password redefinida com sucesso.");

    } catch (err) {
      setError(err.response?.data?.message || "Erro a redefinir password.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-100">
      {/* ESQUERDA */}
      <div className="relative flex-1 flex flex-col justify-center overflow-hidden px-8 py-14 md:py-16 bg-gradient-to-br from-[#124878] via-[#16558C] to-[#1D6AA8] text-white">
        <div className="pointer-events-none absolute -top-20 -left-20 h-56 w-56 rounded-full bg-white/10 blur-2xl"></div>
        <div className="pointer-events-none absolute bottom-8 right-0 h-40 w-40 rounded-full bg-cyan-300/20 blur-2xl"></div>

        <div className="relative max-w-md mx-auto text-center md:text-left">
          <img
            src={logo}
            alt="Softinsa"
            className="h-16 md:h-20 w-auto mb-8 mx-auto md:mx-0 drop-shadow-[0_5px_14px_rgba(0,0,0,0.28)]"
          />
          <h1 className="text-4xl font-extrabold mb-3 tracking-tight">
            Recuperar Password
          </h1>
          <p className="text-[#04C4D9] text-lg mb-8">
            Introduz o teu email para receberes instruções.
          </p>
        </div>
      </div>

      {/* DIREITA */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-[#F6F8FB] to-[#EEF2F7]">
        <div className="w-full max-w-sm bg-white rounded-2xl px-10 py-10 md:py-12 mx-6 border border-[#16558C]/30 shadow-[0_14px_35px_rgba(15,23,42,0.12)]">
          <h2 className="text-2xl font-bold text-slate-800 mb-4 text-center">
            Recuperar Password
          </h2>

          {error && (
            <p className="text-red-600 font-medium mb-4 text-center">
              {error}
            </p>
          )}

          {info && (
            <p className="text-green-600 font-medium mb-4 text-center">
              {info}
            </p>
          )}

          {!sent && !done && (
            <form onSubmit={handleSend}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 
                  focus:outline-none focus:ring-2 focus:ring-[#16558C]/40"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@dominio.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg font-semibold text-white 
                bg-gradient-to-r from-[#16558C] to-[#2B6EA8] hover:shadow-md"
              >
                {loading ? "A enviar..." : "Enviar Instruções"}
              </button>
            </form>
          )}

          {sent && !done && (
            <form onSubmit={handleReset} className="mt-2">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Token de redefinição
                </label>
                <input
                  type="text"
                  required
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#16558C]/40"
                  placeholder="Cole o token enviado por email"
                />
                {resetToken && (
                  <p className="text-xs text-gray-500 mt-1">
                    Token para testes (dev): {resetToken}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nova Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    newPassword && newPassword.length < 6 ? "border-red-400" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-[#16558C]/40`}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Password
                </label>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    confirm && confirm !== newPassword ? "border-red-400" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-[#16558C]/40`}
                  placeholder="Repete a password"
                />
              </div>

              <button
                type="submit"
                disabled={resetting}
                className="w-full py-3 rounded-lg font-semibold text-white 
                bg-gradient-to-r from-[#16558C] to-[#2B6EA8] hover:shadow-md"
              >
                {resetting ? "A guardar..." : "Redefinir Password"}
              </button>
            </form>
          )}

          {done && (
            <div className="text-center">
              <p className="text-green-600 font-medium mb-6">
                Password redefinida com sucesso.
              </p>
              <Link
                to="/login"
                className="text-slate-800 font-semibold hover:underline"
              >
                Voltar ao login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
