import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "/src/api";
import Sidebar from "../../layout/Sidebar";
import { useWindowSize } from "../../hooks/useWindowSize";
import SortableTh from "../../components/ui/SortableTh";
import AdminPagination from "../../components/ui/AdminPagination";
import AdminPageTitle from "../../components/ui/AdminPageTitle";
import { useSortableData } from "../../hooks/useSortableData";
import { useClientPagination } from "../../hooks/useClientPagination";

const roleKeys = {
  admin: "admin.fichaUtilizador.roles.admin",
  consultant: "admin.fichaUtilizador.roles.consultant",
  talent_manager: "admin.fichaUtilizador.roles.talentManager",
  service_line_leader: "admin.fichaUtilizador.roles.serviceLineLeader",
};

const roleStyles = {
  admin: "bg-rose-50 text-rose-700 ring-rose-200",
  consultant: "bg-sky-50 text-sky-700 ring-sky-200",
  talent_manager: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  service_line_leader: "bg-indigo-50 text-indigo-700 ring-indigo-200",
};

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatDate(value, naLabel) {
  if (!value) return naLabel;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return naLabel;
  return date.toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function GestaoUtilizadores() {
  const { t } = useTranslation();
  const { isMobile } = useWindowSize();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [areas, setAreas] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [profileMode, setProfileMode] = useState("preview");
  const [editingUser, setEditingUser] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    role: "consultant",
    area_id: "",
  });
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "consultant",
    area_id: "",
    password: "",
  });

  const getRoleLabel = (role) => (roleKeys[role] ? t(roleKeys[role]) : role || t("admin.fichaUtilizador.roles.none"));
  const getAreaNameFallback = (areaId) => areaId || t("admin.common.notAvailable");

  useEffect(() => {
    fetchUsers();
    fetchAreas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchUsers() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/api/admin/users");

      const payload = response.data?.data || response.data || [];
      setUsers(Array.isArray(payload) ? payload : []);
    } catch (err) {
      console.error("Erro ao carregar utilizadores:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          t("admin.gestaoUtilizadores.errors.loadFailed"),
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
      setError(t("admin.gestaoUtilizadores.errors.fillNameAndEmail"));
      return;
    }

    if (form.role === "service_line_leader" && !form.area_id) {
      setError(t("admin.gestaoUtilizadores.errors.selectAreaForLeader"));
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
      setSuccess(
        `${getRoleLabel(response.data?.role)}: ${
          response.data?.message || t("admin.gestaoUtilizadores.success.created")
        }`,
      );
      fetchUsers();
    } catch (err) {
      console.error("Erro ao criar utilizador:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          t("admin.gestaoUtilizadores.errors.createFailed"),
      );
    } finally {
      setSaving(false);
    }
  }

  function openUserProfile(user, mode = "preview") {
    setError("");
    setSuccess("");
    setSelectedUser(user);
    setProfileMode(mode);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "consultant",
      area_id: user.area_id ? String(user.area_id) : "",
      password: "",
    });
  }

  function closeUserProfile() {
    if (editingUser || deletingUser) return;
    setSelectedUser(null);
    setProfileMode("preview");
    setEditForm({
      name: "",
      email: "",
      role: "consultant",
      area_id: "",
      password: "",
    });
  }

  async function handleUpdateUser(event) {
    event.preventDefault();
    if (!selectedUser) return;

    setError("");
    setSuccess("");

    if (!editForm.name.trim() || !editForm.email.trim()) {
      setError(t("admin.gestaoUtilizadores.errors.fillNameAndEmail"));
      return;
    }

    if (editForm.role === "service_line_leader" && !editForm.area_id) {
      setError(t("admin.gestaoUtilizadores.errors.selectAreaForLeader"));
      return;
    }

    try {
      setEditingUser(true);
      const payload = {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        role: editForm.role,
        area_id: editForm.area_id ? Number(editForm.area_id) : null,
      };

      if (editForm.password.trim()) {
        payload.password = editForm.password.trim();
      }

      const response = await api.put(`/api/admin/users/${selectedUser.id}`, payload);
      const updatedUser = {
        ...selectedUser,
        ...response.data,
        points_total: selectedUser.points_total,
        createdAt: selectedUser.createdAt,
        updatedAt: response.data?.updatedAt || selectedUser.updatedAt,
      };

      setUsers((current) =>
        current.map((user) => (user.id === selectedUser.id ? updatedUser : user)),
      );
      setSelectedUser(updatedUser);
      setEditForm((current) => ({ ...current, password: "" }));
      setSuccess(t("admin.gestaoUtilizadores.success.updated"));
    } catch (err) {
      console.error("Erro ao atualizar utilizador:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          t("admin.gestaoUtilizadores.errors.updateFailed"),
      );
    } finally {
      setEditingUser(false);
    }
  }

  async function handleDeleteUser() {
    if (!selectedUser) return;

    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (storedUser?.id === selectedUser.id) {
      setError(t("admin.gestaoUtilizadores.errors.cannotDeleteSelf"));
      return;
    }

    if (!window.confirm(t("admin.gestaoUtilizadores.confirmDelete", { name: selectedUser.name || selectedUser.email }))) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      setDeletingUser(true);
      await api.delete(`/api/admin/users/${selectedUser.id}`);
      setUsers((current) => current.filter((user) => user.id !== selectedUser.id));
      setSelectedUser(null);
      setSuccess(t("admin.gestaoUtilizadores.success.deleted"));
    } catch (err) {
      console.error("Erro ao apagar utilizador:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          t("admin.gestaoUtilizadores.errors.deleteFailed"),
      );
    } finally {
      setDeletingUser(false);
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
      talentManagers: byRole.talent_manager || 0,
      serviceLineLeaders: byRole.service_line_leader || 0,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, query, roleFilter]);

  const roleOptions = Object.keys(roleKeys).map((value) => [value, t(roleKeys[value])]);
  const areaById = useMemo(
    () => new Map(areas.map((area) => [Number(area.id), area.name])),
    [areas],
  );

  function getAreaName(areaId) {
    return areaById.get(Number(areaId)) || getAreaNameFallback(areaId);
  }

  const { sortedItems: usersOrdenados, sortConfig, requestSort } = useSortableData(filteredUsers);
  const {
    page,
    setPage,
    totalPages,
    totalItems,
    startItem,
    endItem,
    paginatedItems: usersPaginados,
  } = useClientPagination(usersOrdenados, 15, `${query}|${roleFilter}`);

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "admin", name: "Admin" }} />

      <main className="admin-main bg-[#F6F8FA]">
        <AdminPageTitle title={t("admin.gestaoUtilizadores.title")} subtitle={t("admin.gestaoUtilizadores.subtitle")} />

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: t("admin.gestaoUtilizadores.stats.total"), value: stats.total, icon: "bi-people-fill", tone: "text-slate-700" },
            { label: t("admin.gestaoUtilizadores.stats.consultants"), value: stats.consultants, icon: "bi-person-badge", tone: "text-sky-600" },
            { label: t("admin.gestaoUtilizadores.stats.talentManagers"), value: stats.talentManagers, icon: "bi-diagram-3", tone: "text-emerald-600" },
            { label: t("admin.gestaoUtilizadores.stats.serviceLineLeaders"), value: stats.serviceLineLeaders, icon: "bi-person-workspace", tone: "text-indigo-600" },
            { label: t("admin.gestaoUtilizadores.stats.admins"), value: stats.admins, icon: "bi-shield-lock", tone: "text-rose-600" },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {item.label}
                  </div>
                  <div className={`mt-1 text-3xl font-semibold ${item.tone}`}>
                    {item.value}
                  </div>
                </div>
                <i className={`bi ${item.icon} text-3xl ${item.tone}`}></i>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  {t("admin.gestaoUtilizadores.searchLabel")}
                </label>
                <div className="relative">
                  <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input
                    className="w-full rounded-xl border border-slate-300 px-9 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t("admin.gestaoUtilizadores.searchPlaceholder")}
                  />
                </div>
              </div>

              <div className="lg:col-span-4">
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  {t("admin.gestaoUtilizadores.profileLabel")}
                </label>
                <select
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  value={roleFilter}
                  onChange={(event) => setRoleFilter(event.target.value)}
                >
                  <option value="">{t("admin.gestaoUtilizadores.allProfiles")}</option>
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
                  {t("admin.gestaoUtilizadores.clear")}
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <h2 className="mb-3 text-base font-semibold text-slate-900">
              {t("admin.gestaoUtilizadores.newUser")}
            </h2>
            <form className="space-y-3" onSubmit={handleCreateUser}>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  {t("admin.gestaoUtilizadores.nameLabel")}
                </label>
                <input
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  value={form.nome}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, nome: event.target.value }))
                  }
                  placeholder={t("admin.gestaoUtilizadores.namePlaceholder")}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  {t("admin.gestaoUtilizadores.emailLabel")}
                </label>
                <input
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, email: event.target.value }))
                  }
                  placeholder={t("admin.gestaoUtilizadores.emailPlaceholder")}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  {t("admin.gestaoUtilizadores.roleLabel")}
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
                    {t("admin.gestaoUtilizadores.areaLabel")}
                  </label>
                  <select
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    value={form.area_id}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, area_id: event.target.value }))
                    }
                  >
                    <option value="">{t("admin.gestaoUtilizadores.selectArea")}</option>
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
                {saving ? t("admin.gestaoUtilizadores.creating") : t("admin.gestaoUtilizadores.createButton")}
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

        <section className="admin-table-shell">
          <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {t("admin.gestaoUtilizadores.usersTitle")}
              </h2>
              <p className="text-sm text-slate-500">
                {t("admin.gestaoUtilizadores.records", { shown: filteredUsers.length, total: users.length })}
              </p>
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              onClick={fetchUsers}
              disabled={loading}
            >
              <i className="bi bi-arrow-repeat"></i>
              {t("admin.gestaoUtilizadores.refresh")}
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 px-4 py-12 text-sm text-slate-500">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-sky-600 border-r-transparent"></span>
              {t("admin.gestaoUtilizadores.loading")}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-slate-500">
              <i className="bi bi-inbox mb-2 block text-3xl text-slate-300"></i>
              {t("admin.gestaoUtilizadores.emptyState")}
            </div>
          ) : isMobile ? (
            <div className="space-y-3 p-4">
              {usersPaginados.map((user) => (
                <article key={user.id} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                      {getInitials(user.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold text-slate-900">
                        {user.name}
                      </h3>
                      <p className="truncate text-xs text-slate-500">{user.email}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <RoleBadge role={user.role} t={t} />
                        <span className="text-xs text-slate-500">
                          {Number(user.points_total || 0)} {t("admin.gestaoUtilizadores.pointsSuffix")}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          onClick={() => openUserProfile(user, "preview")}
                        >
                          <i className="bi bi-eye"></i>
                          {t("admin.gestaoUtilizadores.preview")}
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 rounded-lg border border-sky-200 px-2.5 py-1.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-50"
                          onClick={() => navigate(`/admin/users/${user.id}`)}
                        >
                          <i className="bi bi-file-earmark-person"></i>
                          {t("admin.gestaoUtilizadores.fullProfile")}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <SortableTh label={t("admin.gestaoUtilizadores.columns.user")} sortKey="name" accessor={(u) => u.name || ""} sortConfig={sortConfig} onSort={requestSort} />
                    <SortableTh label={t("admin.gestaoUtilizadores.columns.email")} sortKey="email" accessor={(u) => u.email || ""} sortConfig={sortConfig} onSort={requestSort} />
                    <SortableTh label={t("admin.gestaoUtilizadores.columns.role")} sortKey="role" accessor={(u) => u.role || ""} sortConfig={sortConfig} onSort={requestSort} />
                    <SortableTh label={t("admin.gestaoUtilizadores.columns.area")} sortKey="area" accessor={(u) => getAreaName(u.area_id)} sortConfig={sortConfig} onSort={requestSort} />
                    <SortableTh label={t("admin.gestaoUtilizadores.columns.points")} sortKey="points_total" accessor={(u) => Number(u.points_total || 0)} sortConfig={sortConfig} onSort={requestSort} className="text-right" />
                    <th className="px-4 py-3 text-right">{t("admin.gestaoUtilizadores.columns.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {usersPaginados.map((user, index) => (
                    <tr
                      key={user.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-slate-50/50"}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                            {getInitials(user.name)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">
                              {user.name || t("admin.gestaoUtilizadores.noName")}
                            </div>
                            <div className="text-xs text-slate-400">ID {user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{user.email || t("admin.common.notAvailable")}</td>
                      <td className="px-4 py-3">
                        <RoleBadge role={user.role} t={t} />
                      </td>
                      <td className="px-4 py-3">{getAreaName(user.area_id)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900">
                        {Number(user.points_total || 0)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                            onClick={() => openUserProfile(user, "preview")}
                          >
                            <i className="bi bi-eye"></i>
                            {t("admin.gestaoUtilizadores.preview")}
                          </button>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-lg border border-sky-200 px-2.5 py-1.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-50"
                            onClick={() => navigate(`/admin/users/${user.id}`)}
                          >
                            <i className="bi bi-file-earmark-person"></i>
                            {t("admin.gestaoUtilizadores.fullProfileShort")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <AdminPagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            startItem={startItem}
            endItem={endItem}
            onPageChange={setPage}
          />
        </section>

        {selectedUser && (
          <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/50 px-4 py-6">
            <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                    {getInitials(selectedUser.name)}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {profileMode === "preview" ? t("admin.gestaoUtilizadores.previewProfile") : t("admin.gestaoUtilizadores.fullProfile")}
                    </h2>
                    <p className="text-sm text-slate-500">
                      {selectedUser.name || t("admin.gestaoUtilizadores.noName")} Ã‚Â· {selectedUser.email || t("admin.common.notAvailable")}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-500 transition hover:bg-slate-50"
                  onClick={closeUserProfile}
                  disabled={editingUser || deletingUser}
                  aria-label={t("admin.gestaoUtilizadores.closeProfile")}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-5 px-5 py-5 lg:grid-cols-[260px_minmax(0,1fr)]">
                <aside className="space-y-3">
                  <div className="rounded-xl border border-slate-200 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {t("admin.gestaoUtilizadores.profileLabel")}
                      </span>
                      <RoleBadge role={selectedUser.role} t={t} />
                    </div>
                    <dl className="space-y-3 text-sm">
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          ID
                        </dt>
                        <dd className="mt-1 font-semibold text-slate-800">{selectedUser.id}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          {t("admin.gestaoUtilizadores.areaLabel")}
                        </dt>
                        <dd className="mt-1 text-slate-700">{getAreaName(selectedUser.area_id)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          {t("admin.fichaUtilizador.pointsLabel")}
                        </dt>
                        <dd className="mt-1 font-semibold text-slate-800">
                          {Number(selectedUser.points_total || 0)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          {t("admin.fichaUtilizador.createdAtLabel")}
                        </dt>
                        <dd className="mt-1 text-slate-700">{formatDate(selectedUser.createdAt, t("admin.common.notAvailable"))}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          {t("admin.fichaUtilizador.updatedAtLabel")}
                        </dt>
                        <dd className="mt-1 text-slate-700">{formatDate(selectedUser.updatedAt, t("admin.common.notAvailable"))}</dd>
                      </div>
                    </dl>
                  </div>

                  <button
                    type="button"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={handleDeleteUser}
                    disabled={editingUser || deletingUser}
                  >
                    <i className="bi bi-trash"></i>
                    {deletingUser ? t("admin.gestaoUtilizadores.deleting") : t("admin.gestaoUtilizadores.deleteUser")}
                  </button>
                </aside>

                {profileMode === "preview" ? (
                  <section className="space-y-4">
                    <div className="rounded-xl border border-slate-200 p-4">
                      <h3 className="mb-4 text-base font-semibold text-slate-900">
                        {t("admin.gestaoUtilizadores.summary")}
                      </h3>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <InfoItem label={t("admin.gestaoUtilizadores.nameLabel")} value={selectedUser.name || t("admin.common.notAvailable")} />
                        <InfoItem label={t("admin.gestaoUtilizadores.emailLabel")} value={selectedUser.email || t("admin.common.notAvailable")} />
                        <InfoItem label={t("admin.gestaoUtilizadores.profileLabel")} value={getRoleLabel(selectedUser.role)} />
                        <InfoItem label={t("admin.gestaoUtilizadores.areaLabel")} value={getAreaName(selectedUser.area_id)} />
                        <InfoItem label={t("admin.fichaUtilizador.pointsLabel")} value={Number(selectedUser.points_total || 0)} />
                        <InfoItem label={t("admin.fichaUtilizador.createdAtLabel")} value={formatDate(selectedUser.createdAt, t("admin.common.notAvailable"))} />
                      </div>
                    </div>

                    <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        onClick={closeUserProfile}
                      >
                        {t("admin.gestaoUtilizadores.closeProfile")}
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
                        onClick={() => navigate(`/admin/users/${selectedUser.id}`)}
                      >
                        <i className="bi bi-file-earmark-person"></i>
                        {t("admin.gestaoUtilizadores.openFullProfile")}
                      </button>
                    </div>
                  </section>
                ) : (
                <form className="space-y-4" onSubmit={handleUpdateUser}>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">
                        {t("admin.gestaoUtilizadores.nameLabel")}
                      </label>
                      <input
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                        value={editForm.name}
                        onChange={(event) =>
                          setEditForm((current) => ({ ...current, name: event.target.value }))
                        }
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">
                        {t("admin.gestaoUtilizadores.emailLabel")}
                      </label>
                      <input
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                        type="email"
                        value={editForm.email}
                        onChange={(event) =>
                          setEditForm((current) => ({ ...current, email: event.target.value }))
                        }
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">
                        {t("admin.gestaoUtilizadores.roleLabel")}
                      </label>
                      <select
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                        value={editForm.role}
                        onChange={(event) =>
                          setEditForm((current) => ({
                            ...current,
                            role: event.target.value,
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

                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">
                        {t("admin.gestaoUtilizadores.areaLabel")}
                      </label>
                      <select
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                        value={editForm.area_id}
                        onChange={(event) =>
                          setEditForm((current) => ({ ...current, area_id: event.target.value }))
                        }
                      >
                        <option value="">{t("admin.gestaoUtilizadores.noArea")}</option>
                        {areas.map((area) => (
                          <option key={area.id} value={area.id}>
                            {area.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      {t("admin.gestaoUtilizadores.newPasswordLabel")}
                    </label>
                    <input
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                      type="password"
                      value={editForm.password}
                      onChange={(event) =>
                        setEditForm((current) => ({ ...current, password: event.target.value }))
                      }
                      placeholder={t("admin.gestaoUtilizadores.newPasswordPlaceholder")}
                    />
                  </div>

                  <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      onClick={closeUserProfile}
                      disabled={editingUser || deletingUser}
                    >
                      {t("admin.common.cancel")}
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={editingUser || deletingUser}
                    >
                      <i className="bi bi-save"></i>
                      {editingUser ? t("admin.gestaoUtilizadores.saving") : t("admin.gestaoUtilizadores.saveChanges")}
                    </button>
                  </div>
                </form>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function RoleBadge({ role, t }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
        roleStyles[role] || "bg-slate-50 text-slate-700 ring-slate-200"
      }`}
    >
      {roleKeys[role] ? t(roleKeys[role]) : role || t("admin.fichaUtilizador.roles.none")}
    </span>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-slate-800">{value}</div>
    </div>
  );
}
