import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

export default function Requirements(){
  const { id } = useParams(); // badge id
  const [reqs, setReqs] = useState([]);

  useEffect(() => {
    if (!id) return;
    api.get(`/badges/${id}/requirements`)
      .then(res => setReqs(res.data))
      .catch(err => console.error(err));
  }, [id]);

  return (
    <div className="container">
      <h2>Requisitos</h2>
      <ul className="requirements">
        {reqs.map(r => (
          <li key={r.id}>
            <strong>{r.code}</strong> — {r.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
