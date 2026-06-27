import Sidebar from "../layout/Sidebar";

function getAuthenticatedUser() {
  if (!localStorage.getItem("token")) return null;
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return user?.role ? user : null;
  } catch {
    return null;
  }
}

export default function PublicGalleryShell({ children }) {
  const user = getAuthenticatedUser();

  if (!user) return children;

  return (
    <div className="admin-shell">
      <Sidebar user={user} />
      <main className="admin-main bg-gradient-to-b from-[#F8FBFF] to-[#EEF6FF]">
        {children}
      </main>
    </div>
  );
}
