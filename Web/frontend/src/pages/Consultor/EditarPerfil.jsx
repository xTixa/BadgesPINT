import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../../components/sidebar/sidebar";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

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
      const response = await axios.put(
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
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f4f6f8" }}>
      <Sidebar user={{ role: "consultant", name: user.name }} />

      <main className="flex-grow-1 p-4" style={{ marginLeft: "250px" }}>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold text-dark mb-0">
              <i className="bi bi-pencil-square text-primary me-2"></i>
              Editar Perfil
            </h3>
            <p className="text-muted small mt-1">Atualize as suas informações pessoais</p>
          </div>
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate("/perfil")}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Voltar
          </button>
        </div>

        <div className="row">
          {/* Formulário de Perfil */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-body p-4">
                <h5 className="fw-bold text-dark mb-4">
                  <i className="bi bi-person-fill me-2 text-primary"></i>
                  Informações Pessoais
                </h5>
                <form onSubmit={handleUpdateProfile}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Nome Completo *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        A guardar...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Guardar Alterações
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Alterar Password */}
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold text-dark mb-0">
                    <i className="bi bi-shield-lock-fill me-2 text-warning"></i>
                    Segurança
                  </h5>
                  {!showPasswordChange && (
                    <button
                      className="btn btn-sm btn-outline-warning"
                      onClick={() => setShowPasswordChange(true)}
                    >
                      <i className="bi bi-key me-2"></i>
                      Alterar Password
                    </button>
                  )}
                </div>

                {showPasswordChange && (
                  <form onSubmit={handleChangePassword}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Password Atual *</label>
                      <input
                        type="password"
                        className="form-control"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, currentPassword: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">Nova Password *</label>
                      <input
                        type="password"
                        className="form-control"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, newPassword: e.target.value })
                        }
                        required
                      />
                      <small className="text-muted">Mínimo 6 caracteres</small>
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-semibold">Confirmar Nova Password *</label>
                      <input
                        type="password"
                        className="form-control"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        type="submit"
                        className="btn btn-warning"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            A alterar...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-circle me-2"></i>
                            Confirmar
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
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
                  <p className="text-muted mb-0">
                    <i className="bi bi-info-circle me-2"></i>
                    Mantenha a sua conta segura alterando a password regularmente.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-body p-4">
                <h6 className="fw-bold text-dark mb-3">
                  <i className="bi bi-info-circle-fill me-2 text-info"></i>
                  Dicas
                </h6>
                <ul className="small text-muted mb-0" style={{ paddingLeft: "1.2rem" }}>
                  <li className="mb-2">Use um email válido para recuperação de conta</li>
                  <li className="mb-2">Mantenha as suas informações atualizadas</li>
                  <li className="mb-2">A password deve ter pelo menos 6 caracteres</li>
                  <li>Não partilhe a sua password com terceiros</li>
                </ul>
              </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4" style={{ backgroundColor: "#e8f4f8" }}>
              <div className="card-body p-4 text-center">
                <i className="bi bi-shield-check fs-1 text-primary mb-3"></i>
                <h6 className="fw-bold text-dark mb-2">Dados Protegidos</h6>
                <p className="small text-muted mb-0">
                  As suas informações estão seguras e protegidas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
