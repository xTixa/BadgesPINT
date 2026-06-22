import { useState } from "react";
import api from "/src/api";
import { useNavigate } from "react-router-dom";
import AuthShell from "./AuthShell";

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
      const res = await api.post("/api/users/register", {
        nome: form.nome,
        email: form.email,
        area: form.area,
        rgpdAccepted: form.rgpd,
      });

      setMensagem(
        `Utilizador criado! Password temporaria: ${res.data.temporaryPassword}. Verifica o teu email para confirmar a conta antes de entrar.`
      );

      setTimeout(() => navigate("/login"), 4000);
    } catch (err) {
      setErro(err.response?.data?.message || "Erro ao criar utilizador.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Criar conta"
      description="Preenche os dados para iniciar o pedido de acesso."
      asideTitle="O teu percurso comeca aqui"
      asideText="Depois do registo, recebes a confirmacao e podes entrar para consultar badges e progresso."
      asideNote={{
        label: "Registo simples",
        text: "Associa o teu perfil a uma service line para ativar a experiencia certa.",
      }}
      wide
    >
      <form onSubmit={handleSubmit}>
        {erro && <p className="auth-message auth-message-error">{erro}</p>}
        {mensagem && (
          <p className="auth-message auth-message-success">{mensagem}</p>
        )}

        <div className="grid gap-x-4 sm:grid-cols-2">
          <div className="auth-field">
            <label>Nome</label>
            <input
              type="text"
              name="nome"
              required
              className="auth-input"
              value={form.nome}
              onChange={handleChange}
              placeholder="Nome completo"
            />
          </div>

          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              name="email"
              required
              className="auth-input"
              value={form.email}
              onChange={handleChange}
              placeholder="exemplo@dominio.com"
            />
          </div>
        </div>

        <div className="auth-field">
          <label>Area / Service Line</label>
          <select
            name="area"
            required
            className="auth-input"
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

        <div className="mb-6 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <input
            id="rgpd"
            name="rgpd"
            type="checkbox"
            required
            className="mt-1 h-4 w-4 rounded border-gray-300 text-[#0F62FE] focus:ring-[#0F62FE]"
            checked={form.rgpd}
            onChange={(e) => setForm({ ...form, rgpd: e.target.checked })}
          />
          <label htmlFor="rgpd" className="text-sm leading-6 text-slate-700">
            Aceito a publicacao e partilha dos meus badges e receberei um email
            de confirmacao antes de usar a plataforma.
          </label>
        </div>

        <button type="submit" disabled={loading} className="auth-primary-button">
          <i className="bi bi-person-plus"></i>
          {loading ? "A criar..." : "Criar utilizador"}
        </button>
      </form>
    </AuthShell>
  );
}
