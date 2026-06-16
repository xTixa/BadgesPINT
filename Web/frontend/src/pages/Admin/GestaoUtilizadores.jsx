import { useEffect, useMemo, useState } from "react";
import api from "/src/api";
import Sidebar from "../../layout/Sidebar";
import { useWindowSize } from "../../hooks/useWindowSize";

const roleLabels = {
  admin: "Administrador",
  consultant: "Consultor",
  talent_manager: "Talent Manager",
  service_line_leader: "Service Line Leader",
};

const roleStyles = {
  admin: "bg-rose-50 text-rose-700 ring-rose-200",
  consultant: "bg-sky-50 text-sky-700 ring-sky-200",
  talent_manager: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  service_line_leader: "bg-indigo-50 text-indigo-700 ring-indigo-200",
};

function getRoleLabel(role) {
  return roleLabels[role] || role || "Sem perfil";
}

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function GestaoUtilizadores() {
  const { isMobile } = useWindowSize();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [areas, setAreas] = useState([]);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    role: "consultant",
    area_id: "",
  });

  useEffect(() => {
    fetchUsers();
    fetchAreas();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const payload = response.data?.data || response.data || [];
      setUsers(Array.isArray(payload) ? payload : []);
    } catch (err) {
      console.error("Erro ao carregar utilizadores:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Nao foi possivel carregar os utilizadores.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function fetchAreas() {
    try {
      const response = await api.get("/api/areas");
      setAreas(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Erro ao carregar areas:", err);
    }
  }

  async function handleCreateUser(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.nome.trim() || !form.email.trim()) {
      setError("Preenche o nome e o email do novo utilizador.");
      return;
    }

    if (form.role === "service_line_leader" && !form.area_id) {
      setError("Seleciona uma area para o Service Line Leader.");
      return;
    }

    try {
      setSaving(true);
      const response = await api.post("/api/admin/users", {
        name: form.nome.trim(),
        email: form.email.trim(),
        role: form.role,
        area_id: form.area_id ? Number(form.area_id) : null,
      });

      setForm({ nome: "", email: "", role: "consultant", area_id: "" });
      const emailNote = response.data?.emailSent
        ? " Email enviado com a password temporaria."
        : response.data?.emailError
          ? ` ${response.data.emailError}`
          : "";
      const passwordNote = response.data?.temporaryPassword
        ? ` Password temporaria: ${response.data.temporaryPassword}`
        : "";
      setSuccess(`${getRoleLabel(response.data?.role)} criado com sucesso.${emailNote}${passwordNote}`);
      fetchUsers();
    } catch (err) {
      console.error("Erro ao criar utilizador:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Nao foi possivel criar o utilizador.",
      );
    } finally {
      setSaving(false);
    }
  }

  const stats = useMemo(() => {
    const byRole = users.reduce((acc, user) => {
      const role = user.role || "sem_perfil";
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});

    return {
      total: users.length,
      admins: byRole.admin || 0,
      consultants: byRole.consultant || 0,
      managers:
        (byRole.talent_manager || 0) + (byRole.service_line_leader || 0),
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return users.filter((user) => {
      const matchesRole = !roleFilter || user.role === roleFilter;
      const searchable = `${user.name || ""} ${user.email || ""} ${
        getRoleLabel(user.role)
      }`.toLowerCase();
      const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);

      return matchesRole && matchesQuery;
    });
  }, [users, query, roleFilter]);

  const roleOptions = Object.entries(roleLabels);

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "admin", name: "Admin" }} />

      <main className="admin-main px-4 py-4 sm:px-5 md:px-6">
        <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F62FE] to-[#00AEEF] p-8 text-white shadow-[0_12px_40px_rgba(15,98,254,0.20)]">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10"></div>

          <div className="relative z-10">
            <h1 className="text-3xl font-bold">Gestao de Utilizadores</h1>
            <p className="mt-2 max-w-2xl text-white/80">
              Consulta perfis registados, filtra por funcao e cria novos
              utilizadores para a plataforma.
            </p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total", value: stats.total, icon: "bi-people-fill", tone: "text-slate-700" },
            { label: "Consultants", value: stats.consultants, icon: "bi-person-badge", tone: "text-sky-600" },
            { label: "Talent Managers", value: stats.managers, icon: "bi-diagram-3", tone: "text-emerald-600" },
            { label: "Admins", value: stats.admins, icon: "bi-shield-lock", tone: "text-rose-600" },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {item.label}
                  </div>
                  <div className={`mt-1 text-3xl font-bold ${item.tone}`}>
                    {item.value}
                  </div>
                </div>
                <i className={`bi ${item.icon} text-3xl ${item.tone}`}></i>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Pesquisar
                </label>
                <div className="relative">
                  <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input
                    className="w-full rounded-xl border border-slate-300 px-9 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Nome, email ou perfil"
                  />
                </div>
              </div>

              <div className="lg:col-span-4">
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Perfil
                </label>
                <select
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  value={roleFilter}
                  onChange={(event) => setRoleFilter(event.target.value)}
                >
                  <option value="">Todos os perfis</option>
                  {roleOptions.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end lg:col-span-2">
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  onClick={() => {
                    setQuery("");
                    setRoleFilter("");
                  }}
                >
                  <i className="bi bi-arrow-clockwise"></i>
                  Limpar
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="mb-3 text-base font-bold text-slate-900">
              Novo utilizador
            </h2>
            <form className="space-y-3" onSubmit={handleCreateUser}>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Nome
                </label>
                <input
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  value={form.nome}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, nome: event.target.value }))
                  }
                  placeholder="Nome do utilizador"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Email
                </label>
                <input
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, email: event.target.value }))
                  }
                  placeholder="email@softinsa.pt"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Perfil
                </label>
                <select
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  value={form.role}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      role: event.target.value,
                      area_id:
                        event.target.value === "service_line_leader"
                          ? current.area_id
                          : "",
                    }))
                  }
                >
                  {roleOptions.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {form.role === "service_line_leader" && (
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Area
                  </label>
                  <select
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    value={form.area_id}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, area_id: event.target.value }))
                    }
                  >
                    <option value="">Selecionar area</option>
                    {areas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={saving}
              >
                <i className="bi bi-person-plus"></i>
                {saving ? "A criar..." : "Criar utilizador"}
              </button>
            </form>
          </section>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <i className="bi bi-exclamation-triangle mr-2"></i>
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <i className="bi bi-check-circle mr-2"></i>
            {success}
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Utilizadores
              </h2>
              <p className="text-sm text-slate-500">
                {filteredUsers.length} de {users.length} registos
              </p>
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              onClick={fetchUsers}
              disabled={loading}
            >
              <i className="bi bi-arrow-repeat"></i>
              Atualizar
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 px-4 py-12 text-sm text-slate-500">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-sky-600 border-r-transparent"></span>
              A carregar utilizadores...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-slate-500">
              <i className="bi bi-inbox mb-2 block text-3xl text-slate-300"></i>
              Sem utilizadores para os filtros selecionados.
            </div>
          ) : isMobile ? (
            <div className="space-y-3 p-4">
              {filteredUsers.map((user) => (
                <article key={user.id} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                      {getInitials(user.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-bold text-slate-900">
                        {user.name}
                      </h3>
                      <p className="truncate text-xs text-slate-500">{user.email}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <RoleBadge role={user.role} />
                        <span className="text-xs text-slate-500">
                          {Number(user.points_total || 0)} pontos
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Utilizador</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Perfil</th>
                    <th className="px-4 py-3">Area</th>
                    <th className="px-4 py-3 text-right">Pontos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredUsers.map((user, index) => (
                    <tr
                      key={user.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-slate-50/50"}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                            {getInitials(user.name)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">
                              {user.name || "Sem nome"}
                            </div>
                            <div className="text-xs text-slate-400">ID {user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{user.email || "N/D"}</td>
                      <td className="px-4 py-3">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-4 py-3">{user.area_id || "N/D"}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900">
                        {Number(user.points_total || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function RoleBadge({ role }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
        roleStyles[role] || "bg-slate-50 text-slate-700 ring-slate-200"
      }`}
    >
      {getRoleLabel(role)}
    </span>
  );
}
