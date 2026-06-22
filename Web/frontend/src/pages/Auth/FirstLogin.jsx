import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "/src/api";
import AuthShell from "./AuthShell";

export default function FirstLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      return setError("A password deve ter pelo menos 6 caracteres.");
    }

    if (password !== confirm) {
      return setError("As passwords nao coincidem.");
    }

    try {
      const token = localStorage.getItem("token");

      const res = await api.post(
        "/api/auth/first-login",
        { newPassword: password },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      alert("Password atualizada com sucesso!");

      switch (res.data.user.role) {
        case "admin":
          navigate("/admin/dashboard");
          break;
        case "talent_manager":
          navigate("/tm/dashboard");
          break;
        case "service_line_leader":
          navigate("/sl/dashboard");
          break;
        default:
          navigate("/dashboard");
      }
    } catch (error) {
      console.error(error);
      setError("Erro ao atualizar password.");
    }
  };

  return (
    <AuthShell
      title="Criar nova password"
      description="Define uma password pessoal para concluir o primeiro acesso."
      asideTitle="Primeiro login"
      asideText="Este passo protege a tua conta antes de entrares no portal."
      asideNote={{
        label: "Nova credencial",
        text: "Usa pelo menos 6 caracteres e confirma a password antes de guardar.",
      }}
    >
      <form onSubmit={handleSubmit}>
        {error && <p className="auth-message auth-message-error">{error}</p>}

        <div className="auth-field">
          <label>Nova password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
            placeholder="Minimo 6 caracteres"
          />
        </div>

        <div className="auth-field">
          <label>Confirmar password</label>
          <input
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="auth-input"
            placeholder="Repete a password"
          />
        </div>

        <button type="submit" className="auth-primary-button">
          <i className="bi bi-check2-circle"></i>
          Guardar password
        </button>
      </form>
    </AuthShell>
  );
}
