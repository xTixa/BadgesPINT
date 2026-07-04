import Sidebar from "../../layout/Sidebar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "/src/api";
import avatarPlaceholder from "../../assets/avatar-placeholder.svg";

export default function EditarPerfil() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [areas, setAreas] = useState([]);
  const [user, setUser] = useState(null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    area_id: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    let mounted = true;

    async function loadProfileData() {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        const [meResponse, areasResponse] = await Promise.all([
          api.get("/api/auth/me"),
          api.get("/api/areas"),
        ]);

        if (!mounted) return;

        const userData = { ...storedUser, ...meResponse.data };
        setUser(userData);
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          area_id: userData.area_id ? String(userData.area_id) : "",
        });
        setAreas(Array.isArray(areasResponse.data) ? areasResponse.data : []);
      } catch (error) {
        console.error("Erro ao carregar dados do perfil:", error);
        if (!mounted) return;

        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        setUser(userData);
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          area_id: userData.area_id ? String(userData.area_id) : "",
        });
      } finally {
        if (mounted) setLoadingProfile(false);
      }
    }

    loadProfileData();
    return () => {
      mounted = false;
    };
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      alert("Nome e email são obrigatórios.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        area_id: formData.area_id ? Number(formData.area_id) : null,
      };

      const response = await api.put(`/api/users/${user.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Atualizar localStorage
      const updatedUser = { ...user, ...(response.data?.user || payload) };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      alert("Perfil atualizado com sucesso!");
      navigate("/perfil");
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      alert(
        "Erro ao atualizar perfil: " +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!passwordData.currentPassword || !passwordData.newPassword) {
      alert("Preencha todos os campos de password.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("As passwords novas não coincidem.");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert("A password deve ter pelo menos 6 caracteres.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await api.put(
        `/api/users/${user.id}/password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      alert("Password alterada com sucesso!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordChange(false);
    } catch (error) {
      console.error("Erro ao alterar password:", error);
      alert(
        "Erro ao alterar password: " +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-[#16558C]"></div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "consultant", name: user.name }} />

      <main className="admin-main bg-gradient-to-b from-[#F8FBFF] to-[#EEF6FF]">
        {/* HERO */}
        <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F62FE] via-[#16558C] to-[#00AEEF] p-8 text-white shadow-[0_12px_40px_rgba(15,98,254,0.20)]">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10"></div>

          <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-medium text-white/80">Area do consultor</p>
              <h1 className="text-3xl font-bold text-white">Editar Perfil</h1>

              <p className="mt-2 text-white/80">
                Atualiza os teus dados pessoais e definições de segurança.
              </p>
            </div>

            <button
              onClick={() => navigate("/perfil")}
              className="rounded-2xl bg-white px-5 py-3 font-semibold text-[#0F62FE] transition hover:scale-105"
            >
              <i className="bi bi-arrow-left mr-2"></i>
              Voltar ao Perfil
            </button>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-3">
          {/* PERFIL */}
          <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
            <div className="text-center">
              <img
                src={user.avatar_url || avatarPlaceholder}
                alt="Perfil"
                className="mx-auto mb-4 h-24 w-24 rounded-3xl border-4 border-[#0F62FE]/10"
              />

              <h3 className="text-xl font-bold text-slate-900">{user.name}</h3>

              <p className="text-slate-500">{user.email}</p>

              <div className="mt-6 rounded-2xl bg-[#0F62FE]/5 p-4">
                <p className="text-sm font-medium text-[#0F62FE]">
                  Perfil Profissional
                </p>
              </div>
            </div>
          </div>

          {/* DADOS */}
          <div className="xl:col-span-2">
            <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
              <h2 className="mb-6 text-xl font-semibold">
                Informações Pessoais
              </h2>

              <form onSubmit={handleUpdateProfile}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Nome Completo
                    </label>

                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          name: e.target.value,
                        })
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-[#0F62FE] focus:outline-none focus:ring-4 focus:ring-[#0F62FE]/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Email
                    </label>

                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          email: e.target.value,
                        })
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-[#0F62FE] focus:outline-none focus:ring-4 focus:ring-[#0F62FE]/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Área
                    </label>

                    <select
                      value={formData.area_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          area_id: e.target.value,
                        })
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-[#0F62FE] focus:outline-none focus:ring-4 focus:ring-[#0F62FE]/10"
                    >
                      <option value="">Sem área</option>
                      {areas.map((area) => (
                        <option key={area.id} value={area.id}>
                          {area.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 rounded-2xl bg-gradient-to-r from-[#0F62FE] to-[#00AEEF] px-6 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.02]"
                >
                  {loading ? "A guardar..." : "Guardar Alterações"}
                </button>
              </form>
            </div>

            {/* SEGURANÇA */}
            <div className="mt-6 rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Segurança</h2>

                {!showPasswordChange && (
                  <button
                    onClick={() => setShowPasswordChange(true)}
                    className="rounded-2xl border border-amber-500 px-4 py-2 font-medium text-amber-600 transition hover:bg-amber-50"
                  >
                    Alterar Password
                  </button>
                )}
              </div>

              {!showPasswordChange ? (
                <div className="rounded-2xl bg-amber-50 p-4 text-amber-700">
                  <i className="bi bi-shield-lock mr-2"></i>
                  Mantenha a sua conta segura alterando a password regularmente.
                </div>
              ) : (
                <form onSubmit={handleChangePassword}>
                  <div className="space-y-4">
                    <input
                      type="password"
                      placeholder="Password Atual"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          currentPassword: e.target.value,
                        })
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                    />

                    <input
                      type="password"
                      placeholder="Nova Password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                    />

                    <input
                      type="password"
                      placeholder="Confirmar Nova Password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                    />
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      type="submit"
                      className="rounded-2xl bg-amber-500 px-5 py-3 font-semibold text-white"
                    >
                      Confirmar
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowPasswordChange(false)}
                      className="rounded-2xl border border-slate-300 px-5 py-3 font-semibold text-slate-700"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* DICAS */}
        <div className="mt-6 rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
          <h2 className="mb-4 text-xl font-semibold">Dicas de Segurança</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-[#0F62FE]/5 p-4">
              <i className="bi bi-envelope-check text-[#0F62FE]"></i>
              <p className="mt-2 text-sm">
                Usa um email válido para recuperação de conta.
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50 p-4">
              <i className="bi bi-shield-check text-emerald-600"></i>
              <p className="mt-2 text-sm">
                Mantém a password privada e segura.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
