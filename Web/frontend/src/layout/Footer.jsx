import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="relative z-10 mt-auto border-t border-[#16558C]/15 bg-white text-slate-800">
      <div className="mx-auto max-w-[1200px] px-4 py-10">
        <div className="grid gap-8 [grid-template-columns:repeat(auto-fit,minmax(250px,1fr))]">
          <div>
            <h3 className="mb-4 text-lg font-semibold text-slate-800">Badges PINT</h3>
            <p className="text-sm text-slate-600">
              Plataforma de reconhecimento de competências para apoiar a evolução profissional na Softinsa.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold text-slate-800">Links Rápidos</h3>
            <ul className="m-0 list-none p-0">
              <li className="mb-2">
                <Link className="text-sm text-slate-700 transition hover:text-[#16558C]" to="/learning-paths">
                  Percursos
                </Link>
              </li>
              <li className="mb-2">
                <Link className="text-sm text-slate-700 transition hover:text-[#16558C]" to="/badges">
                  Catálogo de Badges
                </Link>
              </li>
              <li className="mb-2">
                <Link className="text-sm text-slate-700 transition hover:text-[#16558C]" to="/areas">
                  Áreas
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold text-slate-800">Contacto</h3>
            <p className="text-sm text-slate-600">
              Dúvidas ou sugestões: suporte interno da plataforma Badges PINT.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-[#16558C]/15 pt-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Badges PINT · Softinsa.
        </div>
      </div>
    </footer>
  );
}