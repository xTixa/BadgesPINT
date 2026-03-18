import { useLocation } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

// Rotas sem qualquer layout (navbar, sidebar, footer)
const NO_LAYOUT_ROUTES = ["/login", "/first-login", "/recover", "/register"];

// Rotas que têm sidebar (páginas de dashboard/painel)
const SIDEBAR_ROUTES = [
  "/consultor",
  "/tm",
  "/sl",
  "/admin",
];

export default function Layout({ children, user }) {
  const location = useLocation();
  const { collapsed } = useSidebar();

  const hideLayout = NO_LAYOUT_ROUTES.includes(location.pathname);
  const hasSidebar = !hideLayout && SIDEBAR_ROUTES.some((prefix) =>
    location.pathname.startsWith(prefix)
  );

  // Largura da sidebar (em sync com o CSS var definido no SidebarContext)
  const sidebarWidth = collapsed ? "88px" : "270px";

  if (hideLayout) {
    return <>{children}</>;
  }

  if (hasSidebar) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        {/* Navbar fixa no topo — full width */}
        <Navbar />

        {/* Área abaixo da navbar: sidebar + conteúdo lado a lado */}
        <div className="flex flex-1">
          {/* Sidebar fixa, começa abaixo da navbar (top-16 = 64px) */}
          <Sidebar user={user} />

          {/* Conteúdo principal — margem esquerda igual à largura da sidebar */}
          <main
            className="flex flex-col flex-1 min-w-0 transition-[margin] duration-300"
            style={{ marginLeft: sidebarWidth }}
          >
            <div className="flex-1 p-6 lg:p-8">
              {children}
            </div>

            {/* Footer dentro da área de conteúdo, abaixo da sidebar */}
            <Footer />
          </main>
        </div>
      </div>
    );
  }

  // Layout público: navbar + conteúdo + footer, sem sidebar
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 px-4 py-8">
        {children}
      </main>

      <Footer />
    </div>
  );
}