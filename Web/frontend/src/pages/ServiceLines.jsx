import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";

export default function ServiceLines(){
  const { id } = useParams(); // learning path id
  const [sls, setSls] = useState([]);

  useEffect(() => {
    if (!id) return;
    api.get(`learning-paths/${id}/service-lines`) // como tirei o /api dos routes aqui fica api.get("/learning-paths/:id/service-lines") em vez de api.get("/api/learning-paths/:id/service-lines")
      .then(res => setSls(res.data))
      .catch(err => console.error(err));
  }, [id]);

  return (
    <div className="container">
      <h2>Service Lines</h2>
      <div className="grid">
        {sls.map(sl => (
          <div key={sl.id} className="card">
            <h3>{sl.name}</h3>
            <p>{sl.description}</p>
            <Link className="btn-sm" to={`/service-lines/${sl.id}/areas`}>Ver Áreas</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
