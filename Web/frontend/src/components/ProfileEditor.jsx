import { useEffect, useState } from "react";
import api from "/src/api";
import avatarPlaceholder from "../assets/avatar-placeholder.svg";

export default function ProfileEditor() {
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        const response = await api.get("/api/auth/me");
        if (!mounted) return;

        const userData = { ...storedUser, ...response.data };
        setUser(userData);
        setFormData({ name: userData.name || "", email: userData.email || "" });
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        if (!mounted) return;
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        setUser(userData);
        setFormData({ name: userData.name || "", email: userData.email || "" });
      } finally {
        if (mounted) setLoadingProfile(false);
      }
    }

    loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

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
      setAvatarError("Seleciona um ficheiro de imagem.");
      event.target.value = "";
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setAvatarError("A imagem deve ter no máximo 3 MB.");
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
      setAvatarError(error.response?.data?.message || "Erro ao enviar foto de perfil.");
    } finally {
      setAvatarUploading(false);
      event.target.value = "";
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      alert("Nome e email são obrigatórios.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
      };

      const response = await api.put(`/api/users/${user.id}`, payload);

      const updatedUser = { ...user, ...(response.data?.user || payload) };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("user:updated"));
      setUser(updatedUser);

      alert("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      alert("Erro ao atualizar perfil: " + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
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
      setSaving(true);
      await api.put(`/api/users/${user.id}/password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      alert("Password alterada com sucesso!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordChange(false);
    } catch (error) {
      console.error("Erro ao alterar password:", error);
      alert("Erro ao alterar password: " + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (loadingProfile || !user) {
    return (
      <div className="flex justify-center rounded-3xl bg-white p-10 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#0F62FE]"></div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      {/* AVATAR */}
      <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
        <div className="text-center">
          <div className="relative mx-auto mb-4 h-24 w-24">
            <img
              src={user.avatar_url || avatarPlaceholder}
              alt="Perfil"
              className="h-24 w-24 rounded-3xl border-4 border-[#0F62FE]/10 object-cover"
            />

            <label
              htmlFor="profile-editor-avatar-upload"
              className="absolute -bottom-2 -right-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-[#0F62FE] text-white shadow-md transition hover:bg-[#16558C]"
              title="Alterar foto de perfil"
            >
              {avatarUploading ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              ) : (
                <i className="bi bi-camera-fill text-sm"></i>
              )}
            </label>

            <input
              id="profile-editor-avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={avatarUploading}
            />
          </div>

          {avatarError && <p className="mb-3 text-xs font-medium text-rose-600">{avatarError}</p>}

          <h3 className="text-xl font-bold text-slate-900">{user.name}</h3>
          <p className="text-slate-500">{user.email}</p>
        </div>
      </div>

      {/* DADOS + SEGURANCA */}
      <div className="xl:col-span-2">
        <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
          <h2 className="mb-6 text-xl font-semibold">Informações Pessoais</h2>

          <form onSubmit={handleUpdateProfile}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Nome Completo</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-[#0F62FE] focus:outline-none focus:ring-4 focus:ring-[#0F62FE]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-[#0F62FE] focus:outline-none focus:ring-4 focus:ring-[#0F62FE]/10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-6 rounded-2xl bg-gradient-to-r from-[#0F62FE] to-[#00AEEF] px-6 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.02]"
            >
              {saving ? "A guardar..." : "Guardar Alterações"}
            </button>
          </form>
        </div>

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
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                />

                <input
                  type="password"
                  placeholder="Nova Password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                />

                <input
                  type="password"
                  placeholder="Confirmar Nova Password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                />
              </div>

              <div className="mt-6 flex gap-3">
                <button type="submit" className="rounded-2xl bg-amber-500 px-5 py-3 font-semibold text-white">
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
  );
}
