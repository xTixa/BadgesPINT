import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";

export default function Areas(){
  const { id } = useParams(); // service_line id
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    if (!id) return;
    api.get(`/service-lines/${id}/areas`)
      .then(res => setAreas(res.data))
      .catch(err => console.error(err));
  }, [id]);

  return (
    <div className="container">
      <h2>Áreas</h2>
      <div className="grid">
        {areas.map(a => (
          <div key={a.id} className="card">
            <h3>{a.name}</h3>
            <Link className="btn-sm" to={`/areas/${a.id}/badges`}>Ver Níveis / Badges</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
