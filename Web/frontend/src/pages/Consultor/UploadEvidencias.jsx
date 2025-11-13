import SidebarConsultor from "../../components/SidebarConsultor";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useState } from "react";

export default function UploadEvidencias() {
  const [ficheiro, setFicheiro] = useState(null);

  return (
    <div className="d-flex" style={{ backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
      <SidebarConsultor />

      <main className="flex-grow-1 p-4" style={{ marginLeft: "250px" }}>
        <h3 className="fw-bold text-dark mb-4">
          <i className="bi bi-cloud-upload-fill me-2 text-primary"></i>
          Upload de Evidências
        </h3>

        <div className="card border-0 shadow-sm rounded-4 p-4">
          <p className="text-muted mb-3">
            Submete aqui ficheiros que comprovem as tuas competências.
          </p>

          <div className="mb-3">
            <label className="form-label fw-semibold">Selecionar Badge</label>
            <select className="form-select rounded-3">
              <option>Escolher...</option>
              <option>Outsystems Júnior</option>
              <option>DevOps Intermédio</option>
              <option>Cloud Practitioner</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Ficheiro</label>
            <input
              type="file"
              className="form-control rounded-3"
              onChange={(e) => setFicheiro(e.target.files[0])}
            />
          </div>

          <button
            className="btn btn-primary fw-semibold"
            style={{ backgroundColor: "#191970", borderColor: "#191970" }}
          >
            <i className="bi bi-upload me-2"></i>
            Enviar Evidência
          </button>

          {ficheiro && (
            <div className="alert alert-info mt-3 rounded-3">
              <i className="bi bi-file-earmark-text-fill me-2"></i>
              Ficheiro selecionado: <strong>{ficheiro.name}</strong>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
