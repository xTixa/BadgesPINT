import React from "react";
import Sidebar from "../../components/sidebar/sidebar";

export default function TalentManagerSettingsPage() {
  return (
    <div className="settings-page">
        <Sidebar user={{ role: "talent_manager", name: "Talent Manager" }} />
      <h1>Definições do Talent Manager</h1>

      {/* Âmbito */}
      <section>
        <h2>Âmbito</h2>
        <label>
          Service Line
          <select>{/* options */}</select>
        </label>
        <label>
          Áreas sob responsabilidade
          <select multiple>{/* options */}</select>
        </label>
      </section>

      {/* Notificações */}
      <section>
        <h2>Notificações</h2>
        <label>
          Novas candidaturas
          <input type="checkbox" />
        </label>
        <label>
          Candidaturas com SLA ultrapassado
          <input type="checkbox" />
        </label>
        <label>
          Atualizações de estado (aprovado/rejeitado)
          <input type="checkbox" />
        </label>
      </section>

      {/* Relatórios e exportações */}
      <section>
        <h2>Relatórios e exportações</h2>
        <label>
          Formato padrão de exportação
          <select>
            <option value="excel">Excel</option>
            <option value="pdf">PDF</option>
          </select>
        </label>
        <label>
          Filtro de período padrão
          <select>
            <option value="month">Último mês</option>
            <option value="quarter">Último trimestre</option>
            <option value="year">Último ano</option>
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
            <option value="badges">Número de badges</option>
          </select>
        </label>
        <label>
          Mostrar timeline de evolução profissional
          <input type="checkbox" />
        </label>
      </section>

      {/* Interface */}
      <section>
        <h2>Interface</h2>
        <label>
          Idioma
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
