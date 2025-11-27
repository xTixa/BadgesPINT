import React from "react";
import Sidebar from "../../components/sidebar/sidebar";

export default function ServiceLineSettingsPage() {
  return (
    <div className="settings-page">
        <Sidebar user={{ role: "service_line", name: "Service Line" }} />
      <h1>Definições do Service Line</h1>

      {/* Service Line e áreas */}
      <section>
        <h2>Service Line</h2>
        <label>
          Service Line
          <select>{/* options */}</select>
        </label>
        <label>
          Áreas visíveis por defeito
          <select multiple>{/* options */}</select>
        </label>
      </section>

      {/* Notificações */}
      <section>
        <h2>Notificações</h2>
        <label>
          Candidaturas em validação da Service Line
          <input type="checkbox" />
        </label>
        <label>
          SLA ultrapassado na minha Service Line
          <input type="checkbox" />
        </label>
      </section>

      {/* Relatórios e ranking */}
      <section>
        <h2>Relatórios e ranking</h2>
        <label>
          Formato padrão de exportação
          <select>
            <option value="excel">Excel</option>
            <option value="pdf">PDF</option>
          </select>
        </label>
        <label>
          Mostrar ranking Top N consultores
          <input type="number" placeholder="Ex.: 10" />
        </label>
      </section>

      {/* Métricas comparativas */}
      <section>
        <h2>Métricas comparativas</h2>
        <label>
          Ativar comparação entre consultores da mesma experiência/área
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
