import Sidebar from "../../layout/Sidebar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "/src/api";
import avatarPlaceholder from "../../assets/avatar-placeholder.svg";

export default function EditarPerfil() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [areas, setAreas] = useState([]);
  const [user, setUser] = useState(null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");

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
      alert(t("consultor.editarPerfil.nameEmailRequired"));
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
      window.dispatchEvent(new Event("user:updated"));
      setUser(updatedUser);

      alert(t("consultor.editarPerfil.updateSuccess"));
      navigate("/perfil");
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      alert(
        t("consultor.editarPerfil.updateError") +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setLoading(false);
    }
  };

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAvatarError(t("consultor.editarPerfil.selectImageFile"));
      event.target.value = "";
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setAvatarError(t("consultor.editarPerfil.imageMaxSize"));
      event.target.value = "";
      return;
    }

    try {
      setAvatarUploading(true);
      setAvatarError("");
      const image = await readFileAsDataUrl(file);
      const response = await api.post("/api/users/avatar", { image });

      const updatedUser = { ...user, avatar_url: response.data.avatar_url };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("user:updated"));
      setUser(updatedUser);
    } catch (error) {
      console.error("Erro ao enviar foto de perfil:", error);
      setAvatarError(error.response?.data?.message || t("consultor.editarPerfil.avatarUploadError"));
    } finally {
      setAvatarUploading(false);
      event.target.value = "";
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!passwordData.currentPassword || !passwordData.newPassword) {
      alert(t("consultor.editarPerfil.fillAllPasswordFields"));
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert(t("consultor.editarPerfil.passwordsDontMatch"));
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert(t("consultor.editarPerfil.passwordMinLength"));
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

      alert(t("consultor.editarPerfil.passwordChangeSuccess"));
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordChange(false);
    } catch (error) {
      console.error("Erro ao alterar password:", error);
      alert(
        t("consultor.editarPerfil.passwordChangeError") +
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
        <section className="relative mb-8 overflow-hidden rounded-3xl border border-[#CFE0FB] bg-[#EAF2FF] p-8 text-slate-900">
          <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-medium text-slate-500">{t("consultor.common.consultantArea")}</p>
              <h1 className="text-3xl font-bold text-slate-900">{t("consultor.editarPerfil.title")}</h1>

              <p className="mt-2 text-slate-600">
                {t("consultor.editarPerfil.subtitle")}
              </p>
            </div>

            <button
              onClick={() => navigate("/perfil")}
              className="rounded-2xl bg-[#0F62FE] px-5 py-3 font-semibold text-white transition hover:scale-105"
            >
              <i className="bi bi-arrow-left mr-2"></i>
              {t("consultor.editarPerfil.backToProfile")}
            </button>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-3">
          {/* PERFIL */}
          <div className="rounded-3xl bg-white p-6 shadow-[0_4px_16px_rgba(15,98,254,0.05)]">
            <div className="text-center">
              <div className="relative mx-auto mb-4 h-24 w-24">
                <img
                  src={user.avatar_url || avatarPlaceholder}
                  alt={t("consultor.editarPerfil.profileAlt")}
                  className="h-24 w-24 rounded-3xl border-4 border-[#EAF2FF] object-cover"
                />

                <label
                  htmlFor="avatar-upload"
                  className="absolute -bottom-2 -right-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-[#0F62FE] text-white shadow-md transition hover:bg-[#16558C]"
                  title={t("consultor.editarPerfil.changePhoto")}
                >
                  {avatarUploading ? (
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  ) : (
                    <i className="bi bi-camera-fill text-sm"></i>
                  )}
                </label>

                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={avatarUploading}
                />
              </div>

              {avatarError && (
                <p className="mb-3 text-xs font-medium text-rose-600">{avatarError}</p>
              )}

              <h3 className="text-xl font-bold text-slate-900">{user.name}</h3>

              <p className="text-slate-500">{user.email}</p>

              <div className="mt-6 rounded-2xl bg-[#EAF2FF] p-4">
                <p className="text-sm font-medium text-[#0F62FE]">
                  {t("consultor.editarPerfil.professionalProfile")}
                </p>
              </div>
            </div>
          </div>

          {/* DADOS */}
          <div className="xl:col-span-2">
            <div className="rounded-3xl bg-white p-6 shadow-[0_4px_16px_rgba(15,98,254,0.05)]">
              <h2 className="mb-6 text-xl font-semibold">
                {t("consultor.editarPerfil.personalInfo")}
              </h2>

              <form onSubmit={handleUpdateProfile}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      {t("consultor.editarPerfil.fullName")}
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
                      {t("consultor.editarPerfil.email")}
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
                      {t("consultor.editarPerfil.area")}
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
                      <option value="">{t("consultor.editarPerfil.noArea")}</option>
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
                  className="mt-6 rounded-2xl bg-[#0F62FE] px-6 py-3 font-semibold text-white shadow-sm transition hover:scale-[1.02]"
                >
                  {loading ? t("consultor.editarPerfil.saving") : t("consultor.editarPerfil.saveChanges")}
                </button>
              </form>
            </div>

            {/* SEGURANÇA */}
            <div className="mt-6 rounded-3xl bg-white p-6 shadow-[0_4px_16px_rgba(15,98,254,0.05)]">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">{t("consultor.editarPerfil.security")}</h2>

                {!showPasswordChange && (
                  <button
                    onClick={() => setShowPasswordChange(true)}
                    className="rounded-2xl border border-amber-500 px-4 py-2 font-medium text-amber-600 transition hover:bg-amber-50"
                  >
                    {t("consultor.editarPerfil.changePassword")}
                  </button>
                )}
              </div>

              {!showPasswordChange ? (
                <div className="rounded-2xl bg-amber-50 p-4 text-amber-700">
                  <i className="bi bi-shield-lock mr-2"></i>
                  {t("consultor.editarPerfil.securityHint")}
                </div>
              ) : (
                <form onSubmit={handleChangePassword}>
                  <div className="space-y-4">
                    <input
                      type="password"
                      placeholder={t("consultor.editarPerfil.currentPassword")}
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
                      placeholder={t("consultor.editarPerfil.newPassword")}
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
                      placeholder={t("consultor.editarPerfil.confirmNewPassword")}
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
                      {t("consultor.editarPerfil.confirm")}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowPasswordChange(false)}
                      className="rounded-2xl border border-slate-300 px-5 py-3 font-semibold text-slate-700"
                    >
                      {t("consultor.editarPerfil.cancel")}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* DICAS */}
        <div className="mt-6 rounded-3xl bg-white p-6 shadow-[0_4px_16px_rgba(15,98,254,0.05)]">
          <h2 className="mb-4 text-xl font-semibold">{t("consultor.editarPerfil.securityTips")}</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-[#EAF2FF] p-4">
              <i className="bi bi-envelope-check text-[#0F62FE]"></i>
              <p className="mt-2 text-sm">
                {t("consultor.editarPerfil.tipValidEmail")}
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50 p-4">
              <i className="bi bi-shield-check text-emerald-600"></i>
              <p className="mt-2 text-sm">
                {t("consultor.editarPerfil.tipKeepPasswordSafe")}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
