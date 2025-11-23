import React, { useState } from "react";
import SidebarAdmin from "../../components/SidebarAdmin";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import textos from "../../utils/textos";

export default function Configuracoes() {
  const { darkMode, setDarkMode } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [notificacoesAtivas, setNotificacoesAtivas] = React.useState(true);

  // Estilos dinâmicos do modo escuro
  const tema = {
    backgroundColor: darkMode ? "#212529" : "#f4f6f8",
    color: darkMode ? "#fff" : "#212529",
    minHeight: "100vh",
    transition: "all 0.3s"
  };

  return (
    <div className="d-flex" style={tema}>
      <SidebarAdmin />

      <main className="flex-grow-1 p-4" style={{ marginLeft: "250px" }}>
        <h3 className="fw-bold mb-4" style={{ color: tema.color }}>
          <i className="bi bi-gear-fill me-2 text-primary"></i>
          {textos[language].titulo}
        </h3>

        <div
          className="card border-0 shadow-sm rounded-4 p-4"
          style={{
            backgroundColor: darkMode ? "#343a40" : "#fff",
            color: darkMode ? "#fff" : "#212529"
          }}
        >
          <p className="text-muted">{textos[language].descricao}</p>

          {/* Modo Escuro */}
          <div className="form-check form-switch my-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="modoEscuro"
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="modoEscuro">
              {textos[language].modoEscuro}
            </label>
          </div>

          {/* Idioma */}
          <div className="mb-3">
            <label htmlFor="idiomaSelect" className="form-label">
              {textos[language].idioma}
            </label>
            <select
              className="form-select"
              id="idiomaSelect"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="PT">Português</option>
              <option value="EN">English</option>
              <option value="ES">Español</option>
            </select>
          </div>

          {/* Notificações */}
          <div className="form-check form-switch my-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="notificacoes"
              checked={notificacoesAtivas}
              onChange={(e) => setNotificacoesAtivas(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="notificacoes">
              {textos[language].notificacoes}
            </label>
          </div>

          <button className="btn btn-outline-primary mt-2">
            <i className="bi bi-arrow-repeat me-2"></i>
            {textos[language].recarregar}
          </button>
        </div>
      </main>
    </div>
  );
}