import { useState } from "react";

export default function Register() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    role: "consultor"
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Utilizador criado (simulação)");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* ESQUERDA */}
      <div className="relative flex-1 flex flex-col justify-center px-8 py-12 bg-[#191970] text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-[#191970] to-[#000428] opacity-95"></div>

        <div className="relative z-10 max-w-md mx-auto text-center md:text-left">
          <h1 className="text-4xl font-extrabold mb-4 tracking-tight">
            Criar Utilizador
          </h1>
          <p className="text-blue-100 text-lg mb-10">
            Apenas administradores podem registar novos utilizadores.
          </p>
        </div>
      </div>

      {/* DIREITA */}
      <div className="flex-1 flex items-center justify-center bg-white">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm bg-white/90 shadow-xl rounded-2xl px-10 py-12 mx-6 border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-[#191970] mb-8 text-center">
            Novo Utilizador
          </h2>

          {/* Nome */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome
            </label>
            <input
              type="text"
              name="nome"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-[#191970] focus:ring-2"
              value={form.nome}
              onChange={handleChange}
            />
          </div>

          {/* Email */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-[#191970] focus:ring-2"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          {/* Role */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Utilizador
            </label>
            <select
              name="role"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-[#191970] focus:ring-2"
              value={form.role}
              onChange={handleChange}
            >
              <option value="consultor">Consultor</option>
              <option value="tm">Talent Manager</option>
              <option value="sl">Service Line Leader</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg font-semibold text-white bg-[#191970] hover:bg-[#101050] transition-colors"
          >
            Criar Utilizador
          </button>
        </form>
      </div>
    </div>
  );
}
