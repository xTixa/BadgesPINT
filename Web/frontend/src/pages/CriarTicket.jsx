import React, { useState } from "react";
import axios from "axios";
import Sidebar from "../layout/Sidebar";

export default function CriarTicket() {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const sidebarUser = {
    role: storedUser.role || "consultant",
    name: storedUser.name || storedUser.nome || "Utilizador",
  };

  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    categoria: "outro",
    prioridade: "media",
  });

  const categoriasOptions = [
    { value: "bug", label: "🐛 Bug" },
    { value: "feature", label: "✨ Funcionalidade" },
    { value: "duvida", label: "❓ Dúvida" },
    { value: "outro", label: "📝 Outro" },
  ];

  const prioridadeOptions = [
    { value: "baixa", label: "🟢 Baixa" },
    { value: "media", label: "🟡 Média" },
    { value: "alta", label: "🔴 Alta" },
    { value: "critica", label: "🔴🔴 Crítica" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErro("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro("");
    setSucesso(false);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:4000/api/tickets",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setSucesso(true);
        setFormData({
          titulo: "",
          descricao: "",
          categoria: "outro",
          prioridade: "media",
        });
        setTimeout(() => setSucesso(false), 3000);
      }
    } catch (err) {
      setErro(err.response?.data?.message || "Erro ao criar ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-shell">
      <Sidebar user={sidebarUser} />

      <main className="admin-main px-4 py-4 sm:px-5 md:px-6">
      <div className="mb-8">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-800 sm:text-3xl">
          <i className="bi bi-ticket"></i>
          Criar Novo Ticket
        </h2>
        <p className="mt-1 text-sm text-slate-500 sm:text-base">
          Descreva o problema ou solicitude detalhadamente
        </p>
      </div>

      {sucesso && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700" role="alert">
          <i className="bi bi-check-circle mr-2"></i> Ticket criado com sucesso! Em breve um administrador analisará.
        </div>
      )}
      {erro && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
          <i className="bi bi-exclamation-circle mr-2"></i> {erro}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="titulo" className="mb-2 block text-sm font-semibold text-slate-800 sm:text-base">
              Título do Ticket <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200 sm:text-base"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              placeholder="Ex: Erro ao fazer login"
              required
            />
            <small className="text-xs text-slate-500 sm:text-sm">
              {formData.titulo.length}/100
            </small>
          </div>

          <div className="mb-3">
            <label htmlFor="descricao" className="mb-2 block text-sm font-semibold text-slate-800 sm:text-base">
              Descrição <span style={{ color: "red" }}>*</span>
            </label>
            <textarea
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200 sm:text-base"
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              placeholder="Descreva detalhadamente o problema..."
              rows={6}
              style={{ fontFamily: "inherit" }}
              required
            />
            <small className="text-xs text-slate-500 sm:text-sm">
              {formData.descricao.length}/5000
            </small>
          </div>

          <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="categoria" className="mb-2 block text-sm font-semibold text-slate-800 sm:text-base">
                Categoria
              </label>
              <select
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200 sm:text-base"
                id="categoria"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
              >
                {categoriasOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="prioridade" className="mb-2 block text-sm font-semibold text-slate-800 sm:text-base">
                Prioridade
              </label>
              <select
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200 sm:text-base"
                id="prioridade"
                name="prioridade"
                value={formData.prioridade}
                onChange={handleChange}
              >
                {prioridadeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl border border-sky-700 bg-sky-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
                  Enviando...
                </>
              ) : (
                <>
                  <i className="bi bi-send"></i> Enviar Ticket
                </>
              )}
            </button>
            <button
              type="reset"
              className="inline-flex items-center justify-center rounded-xl border border-slate-400 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:text-base"
              onClick={() => setFormData({ titulo: "", descricao: "", categoria: "outro", prioridade: "media" })}
            >
              <i className="bi bi-arrow-clockwise"></i> Limpar
            </button>
          </div>
        </form>

        <div className="mt-8 rounded-xl border border-sky-200 bg-sky-50 p-4">
          <h5 className="mb-2 text-sm font-semibold text-slate-800 sm:text-base">
            <i className="bi bi-lightbulb"></i> Dicas para um ticket melhor:
          </h5>
          <ul className="mb-0 list-disc pl-5 text-xs text-slate-500 sm:text-sm">
            <li>Seja o mais descritivo possível</li>
            <li>Inclua os passos para reproduzir o problema</li>
            <li>Mencione qual navegador ou dispositivo está usando</li>
            <li>Tickets mais detalhados são resolvidos mais rapidamente</li>
          </ul>
        </div>
      </div>
      </main>
    </div>
  );
}
