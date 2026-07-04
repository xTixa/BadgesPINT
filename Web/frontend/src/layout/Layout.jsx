import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

const NO_LAYOUT_ROUTES = ["/login", "/first-login", "/recover", "/register"];

const SIDEBAR_ROUTES = ["/consultor", "/tm", "/sl", "/admin"];

export default function Layout({ children, user }) {
  const location = useLocation();

  const hideLayout = NO_LAYOUT_ROUTES.includes(location.pathname);
  const hasSidebar =
    !hideLayout &&
    SIDEBAR_ROUTES.some((prefix) => location.pathname.startsWith(prefix));

  if (hideLayout) {
    return <>{children}</>;
  }

  if (hasSidebar) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Navbar />

        <div className="flex flex-1">
          <Sidebar user={user} />

          <main
            className="flex flex-col flex-1 min-w-0 transition-[margin] duration-300"
            style={{
              marginLeft: hasSidebar ? `var(--sidebar-width)` : 0,
            }}
          >
            <div className="flex-1 p-6 lg:p-8">{children}</div>

            <Footer />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 px-4 py-8">{children}</main>

      <Footer />
    </div>
  );
}
