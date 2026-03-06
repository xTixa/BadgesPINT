import Sidebar from "../../components/sidebar/sidebar";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

export default function UploadEvidencias() {
  const [badges, setBadges] = useState([]);
  const [selectedBadgeId, setSelectedBadgeId] = useState("");
  const [requirements, setRequirements] = useState([]);
  const [evidences, setEvidences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pedidoStatus, setPedidoStatus] = useState("");

  const evidenceByRequirement = useMemo(() => {
    const map = new Map();
    evidences.forEach((e) => {
      if (!map.has(e.requirement_id)) map.set(e.requirement_id, e);
    });
    return map;
  }, [evidences]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (!token || !storedUser) return;

    const user = JSON.parse(storedUser);

    const loadBadges = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/consultor/${user.id}/badges`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBadges(res.data || []);
      } catch (err) {
        console.error("Erro ao carregar badges:", err);
        setError("Não foi possível carregar badges.");
      }
    };

    loadBadges();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !selectedBadgeId) return;

    const loadRequirements = async () => {
      try {
        setLoading(true);
        const [reqRes, evRes] = await Promise.all([
          axios.get(`http://localhost:4000/badges/${selectedBadgeId}/requirements`),
          axios.get(`http://localhost:4000/api/consultor/badges/${selectedBadgeId}/evidencias`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setRequirements(reqRes.data || []);
        setEvidences(evRes.data || []);
      } catch (err) {
        console.error("Erro ao carregar requisitos:", err);
        setError("Não foi possível carregar requisitos.");
      } finally {
        setLoading(false);
      }
    };

    loadRequirements();
  }, [selectedBadgeId]);

  const handleSubmitEvidence = async (requirementId, evidenceUrl, notes) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Sem token. Faz login novamente.");

    try {
      const res = await axios.post(
        `http://localhost:4000/api/consultor/requirements/${requirementId}/evidencias`,
        { evidence_url: evidenceUrl, notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEvidences((prev) => [res.data, ...prev]);
    } catch (err) {
      console.error("Erro ao submeter evidência:", err);
      alert("Erro ao submeter evidência.");
    }
  };

  const handleSubmitPedido = async () => {
    if (!selectedBadgeId) return alert("Seleciona um badge primeiro.");
    const token = localStorage.getItem("token");
    if (!token) return alert("Sem token. Faz login novamente.");

    try {
      setPedidoStatus("");
      const createRes = await axios.post(
        "http://localhost:4000/api/admin/pedidos",
        { badge_id: Number(selectedBadgeId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await axios.post(
        `http://localhost:4000/api/admin/pedidos/${createRes.data.id}/submeter`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPedidoStatus("Pedido submetido com sucesso.");
    } catch (err) {
      console.error("Erro ao submeter pedido:", err);
      setPedidoStatus(err.response?.data?.message || "Erro ao submeter pedido.");
    }
  };

  return (
    <div className="d-flex" style={{ backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
      <Sidebar user={{ role: "consultant", name: "Consultant" }} />

      <main className="flex-grow-1 p-4" style={{ marginLeft: "250px" }}>
        <h3 className="fw-bold text-dark mb-4">
          <i className="bi bi-cloud-upload-fill me-2 text-primary"></i>
          Upload de Evidências
        </h3>

        <div className="card border-0 shadow-sm rounded-4 p-4">
          <p className="text-muted mb-3">
            Seleciona um badge e submete evidências para cada requisito.
          </p>

          <div className="mb-3">
            <label className="form-label fw-semibold">Selecionar Badge</label>
            <select
              className="form-select rounded-3"
              value={selectedBadgeId}
              onChange={(e) => setSelectedBadgeId(e.target.value)}
            >
              <option value="">Escolher...</option>
              {badges.map((b) => (
                <option key={b.id} value={b.id}>{b.description || b.name || `Badge #${b.id}`}</option>
              ))}
            </select>
          </div>

          <div className="d-flex justify-content-end mb-3">
            <button
              className="btn btn-outline-primary"
              onClick={handleSubmitPedido}
              disabled={!selectedBadgeId}
            >
              Submeter candidatura
            </button>
          </div>

          {pedidoStatus && (
            <div className="alert alert-info">{pedidoStatus}</div>
          )}

          {error && (
            <div className="alert alert-danger">{error}</div>
          )}

          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {requirements.map((req) => {
                const evidence = evidenceByRequirement.get(req.id);
                return (
                  <RequirementCard
                    key={req.id}
                    requirement={req}
                    latestEvidence={evidence}
                    onSubmit={handleSubmitEvidence}
                  />
                );
              })}

              {!requirements.length && selectedBadgeId && (
                <div className="text-muted">Este badge não tem requisitos definidos.</div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function RequirementCard({ requirement, latestEvidence, onSubmit }) {
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSend = async () => {
    if (!url) return alert("Insere o URL da evidência.");
    setSubmitting(true);
    await onSubmit(requirement.id, url, notes);
    setSubmitting(false);
    setUrl("");
    setNotes("");
  };

  return (
    <div className="card border-0 shadow-sm rounded-4">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <div className="fw-semibold">{requirement.title} <span className="text-muted">({requirement.code})</span></div>
            <div className="text-muted small">{requirement.description}</div>
          </div>
          {requirement.image_url && (
            <img src={requirement.image_url} alt={requirement.title} style={{ width: 56, height: 56, borderRadius: 8, objectFit: "cover" }} />
          )}
        </div>

        {latestEvidence && (
          <div className="mt-2 small">
            Estado: <span className={`badge ${latestEvidence.status === "aprovado" ? "text-bg-success" : latestEvidence.status === "rejeitado" ? "text-bg-danger" : "text-bg-warning"}`}>
              {latestEvidence.status}
            </span>
            <span className="ms-2">Última evidência: <a href={latestEvidence.evidence_url} target="_blank" rel="noreferrer">ver</a></span>
          </div>
        )}

        <div className="row g-2 mt-3">
          <div className="col-md-7">
            <input
              type="text"
              className="form-control"
              placeholder="URL da evidência (Drive, OneDrive, etc.)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="col-md-5">
            <input
              type="text"
              className="form-control"
              placeholder="Notas (opcional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="d-flex justify-content-end mt-2">
          <button className="btn btn-primary btn-sm" onClick={handleSend} disabled={submitting}>
            {submitting ? "A enviar..." : "Submeter evidência"}
          </button>
        </div>
      </div>
    </div>
  );
}
