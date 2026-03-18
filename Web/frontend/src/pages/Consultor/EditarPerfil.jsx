import Sidebar from "../../layout/Sidebar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function EditarPerfil() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(userData);
    setFormData({
      name: userData.name || "",
      email: userData.email || "",
    });
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
      await axios.put(
        `http://localhost:4000/api/users/${user.id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Atualizar localStorage
      const updatedUser = { ...user, ...formData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      alert("Perfil atualizado com sucesso!");
      navigate("/perfil");
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      alert("Erro ao atualizar perfil: " + (error.response?.data?.message || error.message));
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
      await axios.put(
        `http://localhost:4000/api/users/${user.id}/password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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
      alert("Erro ao alterar password: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-[#2AA4BF]"></div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "consultant", name: user.name }} />

      <main className="admin-main">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="mb-0 text-xl font-bold text-slate-900 sm:text-2xl">
              <i className="bi bi-pencil-square mr-2 text-sky-600"></i>
              Editar Perfil
            </h3>
            <p className="mt-1 text-sm text-slate-500">Atualize as suas informacoes pessoais</p>
          </div>
          <button
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            onClick={() => navigate("/perfil")}
          >
            <i className="bi bi-arrow-left mr-2"></i>
            Voltar
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h5 className="mb-4 text-base font-bold text-slate-900">
                <i className="bi bi-person-fill mr-2 text-sky-600"></i>
                  Informações Pessoais
                </h5>
                <form onSubmit={handleUpdateProfile}>
                  <div className="mb-3">
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Nome Completo *</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 focus:border-sky-500"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Email *</label>
                    <input
                      type="email"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 focus:border-sky-500"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center rounded-lg bg-[#2AA4BF] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2AA4BF] disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
                        A guardar...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle mr-2"></i>
                        Guardar Alterações
                      </>
                    )}
                  </button>
                </form>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h5 className="mb-0 text-base font-bold text-slate-900">
                    <i className="bi bi-shield-lock-fill mr-2 text-amber-500"></i>
                    Segurança
                  </h5>
                  {!showPasswordChange && (
                    <button
                      className="rounded-lg border border-amber-500 px-3 py-1 text-xs font-semibold text-amber-600 hover:bg-amber-50 sm:text-sm"
                      onClick={() => setShowPasswordChange(true)}
                    >
                      <i className="bi bi-key mr-2"></i>
                      Alterar Password
                    </button>
                  )}
                </div>

                {showPasswordChange && (
                  <form onSubmit={handleChangePassword}>
                    <div className="mb-3">
                      <label className="mb-1 block text-sm font-semibold text-slate-700">Password Atual *</label>
                      <input
                        type="password"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 focus:border-sky-500"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, currentPassword: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="mb-1 block text-sm font-semibold text-slate-700">Nova Password *</label>
                      <input
                        type="password"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 focus:border-sky-500"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, newPassword: e.target.value })
                        }
                        required
                      />
                      <small className="text-xs text-slate-500">Minimo 6 caracteres</small>
                    </div>

                    <div className="mb-4">
                      <label className="mb-1 block text-sm font-semibold text-slate-700">Confirmar Nova Password *</label>
                      <input
                        type="password"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 focus:border-sky-500"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="submit"
                        className="inline-flex items-center rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
                            A alterar...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-circle mr-2"></i>
                            Confirmar
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                        onClick={() => {
                          setShowPasswordChange(false);
                          setPasswordData({
                            currentPassword: "",
                            newPassword: "",
                            confirmPassword: "",
                          });
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}

                {!showPasswordChange && (
                  <p className="mb-0 text-sm text-slate-500">
                    <i className="bi bi-info-circle mr-2"></i>
                    Mantenha a sua conta segura alterando a password regularmente.
                  </p>
                )}
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h6 className="mb-3 text-sm font-bold text-slate-900">
                  <i className="bi bi-info-circle-fill mr-2 text-cyan-600"></i>
                  Dicas
                </h6>
                <ul className="mb-0 list-disc space-y-2 pl-5 text-xs text-slate-500 sm:text-sm">
                  <li>Use um email valido para recuperacao de conta</li>
                  <li>Mantenha as suas informacoes atualizadas</li>
                  <li>A password deve ter pelo menos 6 caracteres</li>
                  <li>Não partilhe a sua password com terceiros</li>
                </ul>
            </div>

            <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4 text-center shadow-sm">
              <i className="bi bi-shield-check mb-3 block text-4xl text-sky-600"></i>
              <h6 className="mb-2 text-sm font-bold text-slate-900">Dados Protegidos</h6>
              <p className="mb-0 text-xs text-slate-500 sm:text-sm">
                  As suas informações estão seguras e protegidas.
                </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

