import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function RecoverPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tempPassword, setTempPassword] = useState("");

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:4000/api/auth/recover-password",
        { email }
      );

      setTempPassword(res.data.temporaryPassword);
      setSent(true);

    } catch (err) {
      setError(
        err.response?.data?.message || "Erro ao enviar instruções."
      );
    } finally {
      setLoading(false);
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
        <form
          onSubmit={handleSend}
          className="w-full max-w-sm bg-white/90 shadow-xl rounded-2xl px-10 py-12 mx-6 border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-[#191970] mb-8 text-center">
            Recuperar Password
          </h2>

          {!sent ? (
            <>
              {error && (
                <p className="text-red-600 font-medium mb-4 text-center">
                  {error}
                </p>
              )}

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
            </>
          ) : (
            <div className="text-center">
              <p className="text-green-600 font-medium mb-6">
                Instruções enviadas com sucesso!
              </p>

              {/* MOSTRAR PASSWORD TEMPORÁRIA */}
              <p className="text-sm text-gray-800 mb-3">
                Nova password temporária:
              </p>
              <p className="font-bold text-lg mb-4">{tempPassword}</p>

              <Link
                to="/login"
                className="text-[#191970] font-semibold hover:underline"
              >
                Voltar ao login
              </Link>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
