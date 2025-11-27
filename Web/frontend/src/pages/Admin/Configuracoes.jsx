import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import textos from "../../utils/textos";
import Sidebar from "../../components/sidebar/sidebar";

export default function Configuracoes() {
  return (
    <div className="settings-page">
        <Sidebar user={{ role: "admin", name: "Admin" }} />
      <h1>Definições do Administrador</h1>
      {/* Conta e segurança */}
      <section>
        <h2>Conta e segurança</h2>
        <label>
          Nova password
          <input type="password" />
        </label>
        <button>Alterar password</button>
        <button>Terminar sessões em todos os dispositivos</button>
      </section>

      {/* Utilizadores e perfis */}
      <section>
        <h2>Utilizadores e perfis</h2>
        <button>Criar utilizador</button>
        {/* Aqui podes listar utilizadores e permitir editar perfil, service line, área, etc. */}
      </section>

      {/* Learning Paths e Badges */}
      <section>
        <h2>Learning Paths e Badges</h2>
        <button>Novo Learning Path</button>
        <button>Nova Service Line</button>
        <button>Nova Área</button>
        <button>Novo Nível</button>
        <button>Novo Requisito (A1...An)</button>
        {/* Lista de LPs/Badges com botões editar/remover */}
      </section>

      {/* Pontos e expiração */}
      <section>
        <h2>Gamification e expiração</h2>
        <label>
          Pontos por badge (default)
          <input type="number" />
        </label>
        <label>
          Badge pode expirar?
          <input type="checkbox" />
        </label>
        <label>
          SLA padrão (dias para validação)
          <input type="number" />
        </label>
      </section>

      {/* Notificações */}
      <section>
        <h2>Notificações</h2>
        <label>
          Notificações por email
          <input type="checkbox" />
        </label>
        <label>
          Notificações push
          <input type="checkbox" />
        </label>
        <label>
          Integração Teams/Slack
          <input type="checkbox" />
        </label>
        {/* Botão para editar templates de email numa modal, por ex. */}
        <button>Configurar templates de email</button>
      </section>

      {/* RGPD */}
      <section>
        <h2>RGPD e privacidade</h2>
        <label>
          Texto dos termos RGPD
          <textarea rows={4} />
        </label>
        <label>
          Permitir galeria pública de badges
          <input type="checkbox" />
        </label>
      </section>

      {/* Internacionalização e UI */}
      <section>
        <h2>Interface e idioma</h2>
        <label>
          Idioma por defeito
          <select>
            <option value="pt">Português</option>
            <option value="en">Inglês</option>
            <option value="es">Espanhol</option>
          </select>
        </label>
        <label>
          Tema
          <select>
            <option value="light">Claro</option>
            <option value="dark">Escuro</option>
          </select>
        </label>
      </section>

      <button>Guardar alterações</button>
    </div>
  );
}
