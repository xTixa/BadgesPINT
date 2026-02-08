import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

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

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");

    try {
      const res = await axios.post(
        "http://localhost:4000/api/auth/recover-password",
        { email }
      );

      setSent(true);
      setInfo(res.data?.message || "Se o email existir, enviámos instruções.");

      // Em ambiente dev mostramos o token para permitir testes manuais
      if (res.data?.resetToken) {
        setResetToken(res.data.resetToken);
        setTokenInput(res.data.resetToken);
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
      const res = await axios.post(
        "http://localhost:4000/api/auth/reset-password",
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
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* ESQUERDA */}
      <div className="relative flex-1 flex flex-col justify-center px-8 py-12 bg-[#191970] text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-[#191970] via-[#0f1b5b] to-[#000428] opacity-95"></div>

        <div className="relative z-10 max-w-md mx-auto text-center md:text-left">
          <h1 className="text-4xl font-extrabold mb-4 tracking-tight">
            Recuperar Password
          </h1>
          <p className="text-blue-100 text-lg mb-10">
            Introduz o teu email para receberes instruções.
          </p>
        </div>
      </div>

      {/* DIREITA */}
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="w-full max-w-sm bg-white/90 shadow-xl rounded-2xl px-10 py-12 mx-6 border border-gray-100">
          <h2 className="text-2xl font-bold text-[#191970] mb-4 text-center">
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
                  focus:outline-none focus:ring-2 focus:ring-[#191970]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@dominio.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg font-semibold text-white 
                bg-[#191970] hover:bg-[#101050] transition-colors"
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
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#191970]"
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
                  } focus:outline-none focus:ring-2 focus:ring-[#191970]`}
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
                  } focus:outline-none focus:ring-2 focus:ring-[#191970]`}
                  placeholder="Repete a password"
                />
              </div>

              <button
                type="submit"
                disabled={resetting}
                className="w-full py-3 rounded-lg font-semibold text-white 
                bg-[#191970] hover:bg-[#101050] transition-colors"
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
                className="text-[#191970] font-semibold hover:underline"
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
