import { useState } from "react";
import Sidebar from "../layout/Sidebar";

const FAQS = [
  {
    category: "Badges & Candidaturas",
    icon: "bi-award-fill",
    color: "text-[#0F62FE]",
    items: [
      {
        q: "Como submeto uma candidatura a um badge?",
        a: "Acede ao catalogo de badges, escolhe o badge desejado e clica em Candidatar. Podes fazer upload das tuas evidencias antes ou depois de submeter o pedido.",
      },
      {
        q: "Quem valida os meus pedidos de badge?",
        a: "O processo tem duas etapas: primeiro o Talent Manager reve as evidencias; depois o Service Line Leader faz a aprovacao final.",
      },
      {
        q: "Quanto tempo demora a validacao?",
        a: "Nao ha um prazo fixo. Podes acompanhar o estado do pedido em tempo real na seccao Meus Badges.",
      },
      {
        q: "O que acontece se o meu pedido for rejeitado?",
        a: "Recebes uma notificacao com o motivo da rejeicao. Podes rever as evidencias, melhora-las e submeter novamente o pedido.",
      },
    ],
  },
  {
    category: "Certificados & Exportacoes",
    icon: "bi-file-earmark-text-fill",
    color: "text-emerald-600",
    items: [
      {
        q: "Como faco o download do meu certificado?",
        a: "Na seccao Meus Badges, clica no badge obtido e usa o botao Descarregar Certificado PDF.",
      },
      {
        q: "Posso exportar os meus badges em Excel ou PDF?",
        a: "Sim. Nas areas de relatorios podes exportar listas em Excel ou PDF quando o teu perfil tem permissoes para isso.",
      },
    ],
  },
  {
    category: "Pontos & Gamificacao",
    icon: "bi-stars",
    color: "text-amber-500",
    items: [
      {
        q: "Como funciona o sistema de pontos?",
        a: "Cada badge tem um valor em pontos definido pelo administrador. Ao obteres um badge, os pontos sao acumulados no teu perfil.",
      },
      {
        q: "O que sao badges Premium?",
        a: "Sao badges de nivel avancado ou com maior pontuacao, com destaque especial no sistema de gamificacao.",
      },
    ],
  },
  {
    category: "Perfil & Notificacoes",
    icon: "bi-person-fill",
    color: "text-violet-600",
    items: [
      {
        q: "Como altero a minha palavra-passe?",
        a: "Acede as configuracoes no menu lateral. Na seccao de seguranca podes definir uma nova palavra-passe.",
      },
      {
        q: "Porque nao estou a receber emails de notificacao?",
        a: "Verifica se o email no teu perfil esta correto e confirma a pasta de spam. Se persistir, contacta o administrador.",
      },
    ],
  },
];

function FAQItem({ item }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="text-sm font-semibold text-slate-800">{item.q}</span>
        <i
          className={`bi ${open ? "bi-chevron-up" : "bi-chevron-down"} shrink-0 text-slate-400`}
        ></i>
      </button>
      {open ? (
        <p className="pb-4 text-sm leading-relaxed text-slate-600">{item.a}</p>
      ) : null}
    </div>
  );
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export default function FAQ() {
  const [search, setSearch] = useState("");
  const user = getUser();

  const filtered = FAQS.map((category) => ({
    ...category,
    items: category.items.filter(
      (item) =>
        search === "" ||
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase()),
    ),
  })).filter((category) => category.items.length > 0);

  return (
    <div className="admin-shell">
      {user ? <Sidebar user={user} /> : null}

      <main className="admin-main bg-gradient-to-b from-[#F8FBFF] to-[#EEF6FF]">
        <div className="mx-auto max-w-3xl">
          <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F62FE] via-[#16558C] to-[#00AEEF] p-8 text-white shadow-[0_12px_40px_rgba(15,98,254,0.20)]">
            <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10"></div>
            <div className="relative z-10 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
                <i className="bi bi-question-circle-fill text-2xl text-white"></i>
              </div>
              <p className="mb-2 text-sm font-medium text-white/80">
                Centro de ajuda
              </p>
              <h1 className="text-3xl font-bold text-white">
                Perguntas Frequentes
              </h1>
              <p className="mt-2 text-white/85">
                Encontra respostas as duvidas mais comuns sobre a plataforma.
              </p>
            </div>
          </section>

          <div className="mb-8">
            <div className="relative">
              <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm shadow-sm focus:border-[#0F62FE] focus:outline-none focus:ring-2 focus:ring-[#0F62FE]/20"
                placeholder="Pesquisar pergunta..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              <i className="bi bi-inbox mb-3 block text-3xl"></i>
              Nenhuma pergunta encontrada para "{search}".
            </div>
          ) : (
            <div className="space-y-6">
              {filtered.map((category) => (
                <section
                  key={category.category}
                  className="rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
                >
                  <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                    <i className={`bi ${category.icon} ${category.color}`}></i>
                    {category.category}
                  </h2>
                  {category.items.map((item) => (
                    <FAQItem key={item.q} item={item} />
                  ))}
                </section>
              ))}
            </div>
          )}

          <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <i className="bi bi-envelope-fill mb-2 block text-2xl text-slate-400"></i>
            <p className="text-sm font-semibold text-slate-700">
              Nao encontraste o que procuravas?
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Fala com o teu Talent Manager ou com o administrador da plataforma.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
