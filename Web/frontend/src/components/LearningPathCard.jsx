import React from "react";
import { Link } from "react-router-dom";

export default function LearningPathCard({ path }) {
  return (
    <div className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="p-6">
        <h3 className="text-xl font-bold text-[#191970] mb-2">
          {path?.name || "Learning Path Name"}
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          {path?.description ||
            "Descrição breve do percurso de aprendizagem e dos seus objetivos."}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#191970]/10 text-[#191970]">
            {path?.badgeCount || 5} Badges
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-[#191970]">
            {path?.duration || 3} Meses
          </span>
        </div>

        {/* Barra de progresso */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progresso</span>
            <span>{path?.progress || 0}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-2 bg-[#191970] rounded-full transition-all duration-500"
              style={{ width: `${path?.progress || 0}%` }}
            ></div>
          </div>
        </div>

        {/* Botão e ícones */}
        <div className="flex justify-between items-center">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((_, i) => (
              <div
                key={i}
                className="h-8 w-8 rounded-full ring-2 ring-white bg-[#191970]/80 flex items-center justify-center text-white text-xs font-semibold"
              >
                {i + 1}
              </div>
            ))}
          </div>
          <Link
            to={`/learning-paths/${path?.id || "1"}/service-lines`}
            className="px-4 py-2 rounded-lg bg-[#191970] text-white text-sm font-semibold hover:bg-[#101050] transition-colors"
          >
            Começar
          </Link>
        </div>
      </div>
    </div>
  );
}
