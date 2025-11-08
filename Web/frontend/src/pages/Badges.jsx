import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";

export default function Badges(){
  const { id } = useParams(); // area id
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    if (!id) return;
    api.get(`/areas/${id}/badges`)
      .then(res => setBadges(res.data))
      .catch(err => console.error(err));
  }, [id]);

  return (
    <div className="container">
      <h2>Badges / Níveis</h2>
      <div className="grid">
        {badges.map(b => (
          <div key={b.id} className="card">
            <h3>{b.level}</h3>
            <p>{b.description}</p>
            <Link className="btn-sm" to={`/badges/${b.id}/requirements`}>Requisitos</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
