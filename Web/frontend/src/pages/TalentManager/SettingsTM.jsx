import Sidebar from "../../layout/Sidebar";
import React from "react";

export default function TalentManagerSettingsPage() {
  return (
    <div className="settings-page">
        <Sidebar user={{ role: "talent_manager", name: "Talent Manager" }} />
      <h1>DefiniÃ§Ãµes do Talent Manager</h1>

      {/* Ã‚mbito */}
      <section>
        <h2>Ã‚mbito</h2>
        <label>
          Service Line
          <select>{/* options */}</select>
        </label>
        <label>
          Ãreas sob responsabilidade
          <select multiple>{/* options */}</select>
        </label>
      </section>

      {/* NotificaÃ§Ãµes */}
      <section>
        <h2>NotificaÃ§Ãµes</h2>
        <label>
          Novas candidaturas
          <input type="checkbox" />
        </label>
        <label>
          Candidaturas com SLA ultrapassado
          <input type="checkbox" />
        </label>
        <label>
          AtualizaÃ§Ãµes de estado (aprovado/rejeitado)
          <input type="checkbox" />
        </label>
      </section>

      {/* RelatÃ³rios e exportaÃ§Ãµes */}
      <section>
        <h2>RelatÃ³rios e exportaÃ§Ãµes</h2>
        <label>
          Formato padrÃ£o de exportaÃ§Ã£o
          <select>
            <option value="excel">Excel</option>
            <option value="pdf">PDF</option>
          </select>
        </label>
        <label>
          Filtro de perÃ­odo padrÃ£o
          <select>
            <option value="month">Ãšltimo mÃªs</option>
            <option value="quarter">Ãšltimo trimestre</option>
            <option value="year">Ãšltimo ano</option>
          </select>
        </label>
      </section>

      {/* Gamification */}
      <section>
        <h2>Gamification e ranking</h2>
        <label>
          Ordenar ranking por
          <select>
            <option value="points">Pontos</option>
            <option value="badges">NÃºmero de badges</option>
          </select>
        </label>
        <label>
          Mostrar timeline de evoluÃ§Ã£o profissional
          <input type="checkbox" />
        </label>
      </section>

      {/* Interface */}
      <section>
        <h2>Interface</h2>
        <label>
          Idioma
          <select>
            <option value="pt">PortuguÃªs</option>
            <option value="en">InglÃªs</option>
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

      <button>Guardar alteraÃ§Ãµes</button>
    </div>
  );
}

