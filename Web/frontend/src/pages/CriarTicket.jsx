import React, { useState } from "react";
import axios from "axios";
import { useWindowSize } from "../hooks/useWindowSize";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function CriarTicket() {
  const { isMobile, isTablet } = useWindowSize();
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
    <div style={{ padding: isMobile ? "1rem" : isTablet ? "1.5rem" : "2rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ color: "#244080", fontWeight: "700", fontSize: isMobile ? "1.5rem" : "2rem" }}>
          <i className="bi bi-ticket" style={{ marginRight: "0.5rem" }}></i>
          {isMobile ? "Novo Ticket" : "Criar Novo Ticket"}
        </h2>
        <p style={{ color: "#6b8cae", fontSize: isMobile ? "0.85rem" : "0.95rem" }}>
          Descreva o problema ou solicitude detalhadamente
        </p>
      </div>

      {/* Mensagens */}
      {sucesso && (
        <div className="alert alert-success" role="alert">
          <i className="bi bi-check-circle"></i> Ticket criado com sucesso! Em breve um administrador analisará.
        </div>
      )}
      {erro && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-circle"></i> {erro}
        </div>
      )}

      {/* Formulário */}
      <div
        style={{
          backgroundColor: "white",
          padding: isMobile ? "1.5rem" : "2rem",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
        }}
      >
        <form onSubmit={handleSubmit}>
          {/* Título */}
          <div className="mb-3">
            <label
              htmlFor="titulo"
              style={{
                fontSize: isMobile ? "0.9rem" : "1rem",
                fontWeight: "500",
                color: "#244080",
                marginBottom: "0.5rem",
              }}
            >
              Título do Ticket <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              className="form-control"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              placeholder="Ex: Erro ao fazer login"
              style={{ fontSize: isMobile ? "0.9rem" : "1rem" }}
              required
            />
            <small style={{ color: "#6b8cae" }}>
              {formData.titulo.length}/100
            </small>
          </div>

          {/* Descrição */}
          <div className="mb-3">
            <label
              htmlFor="descricao"
              style={{
                fontSize: isMobile ? "0.9rem" : "1rem",
                fontWeight: "500",
                color: "#244080",
                marginBottom: "0.5rem",
              }}
            >
              Descrição <span style={{ color: "red" }}>*</span>
            </label>
            <textarea
              className="form-control"
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              placeholder="Descreva detalhadamente o problema..."
              rows={isMobile ? 4 : 6}
              style={{ fontSize: isMobile ? "0.9rem" : "1rem", fontFamily: "inherit" }}
              required
            />
            <small style={{ color: "#6b8cae" }}>
              {formData.descricao.length}/5000
            </small>
          </div>

          {/* Categoria e Prioridade */}
          <div className="row g-2 mb-3">
            <div className="col-12 col-sm-6">
              <label
                htmlFor="categoria"
                style={{
                  fontSize: isMobile ? "0.9rem" : "1rem",
                  fontWeight: "500",
                  color: "#244080",
                  marginBottom: "0.5rem",
                }}
              >
                Categoria
              </label>
              <select
                className="form-select"
                id="categoria"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                style={{ fontSize: isMobile ? "0.9rem" : "1rem" }}
              >
                {categoriasOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-sm-6">
              <label
                htmlFor="prioridade"
                style={{
                  fontSize: isMobile ? "0.9rem" : "1rem",
                  fontWeight: "500",
                  color: "#244080",
                  marginBottom: "0.5rem",
                }}
              >
                Prioridade
              </label>
              <select
                className="form-select"
                id="prioridade"
                name="prioridade"
                value={formData.prioridade}
                onChange={handleChange}
                style={{ fontSize: isMobile ? "0.9rem" : "1rem" }}
              >
                {prioridadeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Botões */}
          <div style={{ display: "flex", gap: isMobile ? "0.5rem" : "1rem", marginTop: "2rem" }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ flex: 1, fontSize: isMobile ? "0.9rem" : "1rem" }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
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
              className="btn btn-outline-secondary"
              style={{ flex: 1, fontSize: isMobile ? "0.9rem" : "1rem" }}
              onClick={() => setFormData({ titulo: "", descricao: "", categoria: "outro", prioridade: "media" })}
            >
              <i className="bi bi-arrow-clockwise"></i> Limpar
            </button>
          </div>
        </form>

        {/* Dicas */}
        <div
          style={{
            marginTop: "2rem",
            padding: "1rem",
            backgroundColor: "#f0f4f8",
            borderRadius: "6px",
            borderLeft: "4px solid #3b82f6",
          }}
        >
          <h5 style={{ color: "#244080", marginBottom: "0.5rem", fontSize: isMobile ? "0.9rem" : "1rem" }}>
            <i className="bi bi-lightbulb"></i> Dicas para um ticket melhor:
          </h5>
          <ul style={{ fontSize: isMobile ? "0.8rem" : "0.9rem", color: "#6b8cae", marginBottom: 0 }}>
            <li>Seja o mais descritivo possível</li>
            <li>Inclua os passos para reproduzir o problema</li>
            <li>Mencione qual navegador ou dispositivo está usando</li>
            <li>Tickets mais detalhados são resolvidos mais rapidamente</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
