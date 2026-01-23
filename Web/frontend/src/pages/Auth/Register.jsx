import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome: "",
    email: "",
    area: "",
    rgpd: false,
  });

  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro("");
    setMensagem("");

    try {
      const res = await axios.post("http://localhost:4000/api/users/register", {
        nome: form.nome,
        email: form.email,
        area: form.area,
        rgpdAccepted: form.rgpd,
      });

      setMensagem(
        `Utilizador criado! Password temporária: ${res.data.temporaryPassword}. Verifica o teu email para confirmar a conta antes de entrar.`
      );

      setTimeout(() => navigate("/login"), 4000);

    } catch (err) {
      setErro(
        err.response?.data?.message || "Erro ao criar utilizador."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* ESQUERDA */}
      <div className="relative flex-1 flex flex-col justify-center px-8 py-12 bg-[#191970] text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-[#191970] to-[#000428] opacity-95"></div>

        <div className="relative z-10 max-w-md mx-auto text-center md:text-left">
          <h1 className="text-4xl font-extrabold mb-4 tracking-tight">
            Criar Conta
          </h1>
          <p className="text-blue-100 text-lg mb-10">
            O teu acesso à plataforma começa aqui.
          </p>
        </div>
      </div>

      {/* DIREITA */}
      <div className="flex-1 flex items-center justify-center bg-white">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm bg-white/90 shadow-xl rounded-2xl px-10 py-12 mx-6 border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-[#191970] mb-8 text-center">
            Novo Utilizador
          </h2>

          {/* Mensagens */}
          {erro && (
            <p className="text-red-600 text-center font-semibold mb-3">{erro}</p>
          )}

          {mensagem && (
            <p className="text-green-600 text-center font-semibold mb-3">
              {mensagem}
            </p>
          )}

          {/* Nome */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome
            </label>
            <input
              type="text"
              name="nome"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 
              focus:outline-none focus:ring-[#191970] focus:ring-2"
              value={form.nome}
              onChange={handleChange}
            />
          </div>

          {/* Email */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 
              focus:outline-none focus:ring-[#191970] focus:ring-2"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          {/* Área */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Área / Service Line
            </label>
            <select
              name="area"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-[#191970] focus:ring-2"
              value={form.area}
              onChange={handleChange}
            >
              <option value="">Selecionar...</option>
              <option value="DevOps">DevOps</option>
              <option value="Cloud">Cloud</option>
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="Data">Data & Analytics</option>
              <option value="Outsystems">Outsystems</option>
            </select>
          </div>

          {/* RGPD */}
          <div className="mb-6 flex items-start gap-2">
            <input
              id="rgpd"
              name="rgpd"
              type="checkbox"
              required
              className="mt-1"
              checked={form.rgpd}
              onChange={(e) => setForm({ ...form, rgpd: e.target.checked })}
            />
            <label htmlFor="rgpd" className="text-sm text-gray-700">
              Aceito a publicação/partilha dos meus badges (RGPD) e receberei um email de confirmação de registo antes de usar a plataforma.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-white bg-[#191970] 
            hover:bg-[#101050] transition-colors"
          >
            {loading ? "A criar..." : "Criar Utilizador"}
          </button>
        </form>
      </div>
    </div>
  );
}
