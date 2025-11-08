import { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";

export default function LearningPaths() {
  const [paths, setPaths] = useState([]);

  useEffect(() => {
    api.get("/learning-paths") // como tirei o /api dos routes aqui fica api.get("/learning-paths") em vez de api.get("/api/learning-paths")
      .then(res => setPaths(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="container">
      <h2>Learning Paths</h2>
      <div className="grid">
        {paths.map(p => (
          <div key={p.id} className="card">
            <h3>{p.name}</h3>
            <p>{p.description}</p>
            <Link className="btn-sm" to={`/learning-paths/${p.id}/service-lines`}>Explorar</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
