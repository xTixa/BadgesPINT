import Sidebar from "../../layout/Sidebar";
import React from "react";

export default function ConsultorSettingsPage() {
  return (
    <div className="bg-gray-100 min-h-screen pt-16">
      
      {/* Sidebar verdadeira */}
      <Sidebar user={{ role: "consultant", name: "Consultant" }} />

      <div className="flex">

        {/* CONTEÃšDO â€” agora empurrado automaticamente porque a sidebar tem largura fixa */}
        <div className="flex-1 ml-[250px] p-8">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">
            DefiniÃ§Ãµes do Consultor
          </h1>

          <div className="space-y-8 max-w-4xl">

            {/* CARD - Perfil */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold mb-4">Perfil pessoal</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ãrea principal
                  </label>
                  <select className="w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500">
                    <option>Selecione...</option>
                  </select>
                </div>
              </div>
            </div>

            {/* CARD - Objetivos */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold mb-4">Objetivos e Aprendizagem</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Objetivo (ex.: nÂº de badges)
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data limite
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 mt-4">
                <input type="checkbox" className="h-5 w-5 text-blue-600" />
                <span className="text-gray-700">
                  Ativar recomendaÃ§Ãµes de prÃ³ximos badges
                </span>
              </div>
            </div>

            {/* CARD - NotificaÃ§Ãµes */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold mb-4">NotificaÃ§Ãµes</h2>

              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="h-5 w-5 text-blue-600" />
                  <span>Email de confirmaÃ§Ã£o de candidatura</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="h-5 w-5 text-blue-600" />
                  <span>NotificaÃ§Ãµes de aprovaÃ§Ã£o/rejeiÃ§Ã£o</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="h-5 w-5 text-blue-600" />
                  <span>Alertas de expiraÃ§Ã£o de badges</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="h-5 w-5 text-blue-600" />
                  <span>Lembretes da timeline/objetivos</span>
                </label>
              </div>
            </div>

            {/* CARD - Privacidade */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold mb-4">Privacidade e Partilha</h2>

              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="h-5 w-5 text-blue-600" />
                  <span>Aceito os termos RGPD para publicaÃ§Ã£o de badges</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="h-5 w-5 text-blue-600" />
                  <span>Permitir galeria pÃºblica de badges</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="h-5 w-5 text-blue-600" />
                  <span>Ativar partilha no LinkedIn</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="h-5 w-5 text-blue-600" />
                  <span>Usar badges na assinatura de email</span>
                </label>
              </div>
            </div>

            {/* CARD - Interface */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold mb-4">Interface</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Idioma
                  </label>
                  <select className="w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500">
                    <option value="pt">PortuguÃªs</option>
                    <option value="en">InglÃªs</option>
                    <option value="es">Espanhol</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tema
                  </label>
                  <select className="w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500">
                    <option value="light">Claro</option>
                    <option value="dark">Escuro</option>
                  </select>
                </div>
              </div>
            </div>

            {/* BotÃ£o */}
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
              Guardar alteraÃ§Ãµes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

