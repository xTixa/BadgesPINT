import React from "react";
import { Link } from "react-router-dom";

export default function LearningPathCard({ path }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#2AA4BF]">
      <div className="h-2 w-full bg-[#2AA4BF]"></div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-[#013440] mb-2">
          {path?.name || "Learning Path Name"}
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          {path?.description ||
            "Descrição breve do percurso de aprendizagem e dos seus objetivos."}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F2F2F2] text-[#013440] border border-[#2AA4BF]">
            {path?.badgeCount || 5} Badges
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F2F2F2] text-[#013440] border border-[#2AA4BF]">
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
              className="h-2 bg-[#013440] rounded-full"
              style={{ width: `${path?.progress || 0}%` }}
            ></div>
          </div>
        </div>

        <div className="flex justify-end items-center">
          <Link
            to={`/learning-paths/${path?.id || "1"}/service-lines`}
            className="px-4 py-2 rounded-lg bg-[#013440] text-white text-sm font-semibold"
          >
            Começar
          </Link>
        </div>
      </div>
    </div>
  );
}
