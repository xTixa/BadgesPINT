import Sidebar from "../../layout/Sidebar";
import React from "react";

export default function ServiceLineSettingsPage() {
  return (
    <div className="settings-page">
        <Sidebar user={{ role: "service_line", name: "Service Line" }} />
      <h1>DefiniÃ§Ãµes do Service Line</h1>

      {/* Service Line e Ã¡reas */}
      <section>
        <h2>Service Line</h2>
        <label>
          Service Line
          <select>{/* options */}</select>
        </label>
        <label>
          Ãreas visÃ­veis por defeito
          <select multiple>{/* options */}</select>
        </label>
      </section>

      {/* NotificaÃ§Ãµes */}
      <section>
        <h2>NotificaÃ§Ãµes</h2>
        <label>
          Candidaturas em validaÃ§Ã£o da Service Line
          <input type="checkbox" />
        </label>
        <label>
          SLA ultrapassado na minha Service Line
          <input type="checkbox" />
        </label>
      </section>

      {/* RelatÃ³rios e ranking */}
      <section>
        <h2>RelatÃ³rios e ranking</h2>
        <label>
          Formato padrÃ£o de exportaÃ§Ã£o
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

      {/* MÃ©tricas comparativas */}
      <section>
        <h2>MÃ©tricas comparativas</h2>
        <label>
          Ativar comparaÃ§Ã£o entre consultores da mesma experiÃªncia/Ã¡rea
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


