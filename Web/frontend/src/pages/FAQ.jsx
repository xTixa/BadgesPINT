import { useState } from "react";

const FAQS = [
  {
    category: "Badges & Candidaturas",
    icon: "bi-award-fill",
    color: "text-[#0F62FE]",
    items: [
      {
        q: "Como submeto uma candidatura a um badge?",
        a: "Acede ao catálogo de badges, escolhe o badge desejado e clica em 'Candidatar'. Podes fazer upload das tuas evidências (certificados, projetos, etc.) antes ou depois de submeter o pedido.",
      },
      {
        q: "Quem valida os meus pedidos de badge?",
        a: "O processo tem duas etapas: primeiro o teu Talent Manager revê as evidências; depois o Service Line Leader faz a aprovação final. Receberás uma notificação em cada etapa.",
      },
      {
        q: "Quanto tempo demora a validação?",
        a: "Não há um prazo fixo — depende da disponibilidade dos validadores. Podes acompanhar o estado do teu pedido em tempo real na secção 'Meus Badges'.",
      },
      {
        q: "O que acontece se o meu pedido for rejeitado?",
        a: "Recebes uma notificação com o motivo da rejeição. Podes rever as evidências, melhorá-las e submeter novamente o pedido.",
      },
      {
        q: "Posso candidatar-me a badges fora da minha área?",
        a: "Sim. O catálogo mostra todos os badges da plataforma. Podes candidatar-te a qualquer badge, mas a validação é sempre feita pelos responsáveis da área a que o badge pertence.",
      },
    ],
  },
  {
    category: "Certificados & Exportações",
    icon: "bi-file-earmark-text-fill",
    color: "text-emerald-600",
    items: [
      {
        q: "Como faço o download do meu certificado?",
        a: "Na secção 'Meus Badges', clica no badge obtido e usa o botão 'Descarregar Certificado PDF'. O certificado inclui o teu nome, o badge, a data de obtenção e um código único de verificação.",
      },
      {
        q: "Posso exportar os meus badges em Excel ou PDF?",
        a: "Sim. Na secção de Relatórios (disponível para Talent Managers e Service Line Leaders) podes exportar listas de badges, pedidos e consultores em formato Excel ou PDF.",
      },
    ],
  },
  {
    category: "Pontos & Gamificação",
    icon: "bi-stars",
    color: "text-amber-500",
    items: [
      {
        q: "Como funciona o sistema de pontos?",
        a: "Cada badge tem um valor em pontos definido pelo administrador (pode ser zero). Ao obteres um badge, os pontos são acumulados no teu perfil. A tua pontuação total determina o teu tier: Iniciante, Bronze (50+), Prata (100+), Ouro (200+) ou Platina (500+).",
      },
      {
        q: "O que são badges Premium?",
        a: "São badges de nível Especialista ou Líder de Conhecimento, ou com 100 ou mais pontos. Representam competências avançadas e têm destaque especial no sistema de gamificação.",
      },
      {
        q: "O que é a conquista 'Fast Track'?",
        a: "É atribuída automaticamente a consultores que obtenham 3 ou mais badges no mesmo mês civil. Aparece no painel de gamificação do Service Line Leader.",
      },
      {
        q: "O que é a conquista 'Mestre da Área'?",
        a: "É atribuída a consultores que completes todos os níveis de aprendizagem numa mesma área (Fundação → Especialista). É uma das conquistas mais difíceis da plataforma.",
      },
    ],
  },
  {
    category: "Perfil & Notificações",
    icon: "bi-person-fill",
    color: "text-violet-600",
    items: [
      {
        q: "Como altero a minha palavra-passe?",
        a: "Acede às Configurações no menu lateral. Na secção de segurança podes definir uma nova palavra-passe. Se esqueceste a palavra-passe, usa a opção 'Recuperar acesso' no ecrã de login.",
      },
      {
        q: "Porque não estou a receber emails de notificação?",
        a: "Verifica se o endereço de email no teu perfil está correto. Os emails podem chegar à pasta de spam — adiciona o remetente à lista de contactos de confiança. Se o problema persistir, contacta o teu administrador.",
      },
      {
        q: "Onde vejo o histórico completo dos meus pedidos?",
        a: "Em 'Meus Badges' tens o histórico de todos os pedidos com o estado atual. Podes clicar em qualquer pedido para ver a timeline completa do processo (submissão → validação TM → decisão SL).",
      },
    ],
  },
];

function FAQItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-sm font-semibold text-slate-800">{item.q}</span>
        <i className={`bi ${open ? "bi-chevron-up" : "bi-chevron-down"} shrink-0 text-slate-400`}></i>
      </button>
      {open && (
        <p className="pb-4 text-sm leading-relaxed text-slate-600">{item.a}</p>
      )}
    </div>
  );
}

export default function FAQ() {
  const [search, setSearch] = useState("");

  const filtered = FAQS.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        search === "" ||
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0F62FE]/10">
          <i className="bi bi-question-circle-fill text-2xl text-[#0F62FE]"></i>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Perguntas Frequentes</h1>
        <p className="mt-2 text-sm text-slate-500">
          Encontra respostas às dúvidas mais comuns sobre a plataforma de badges.
        </p>
      </div>

      <div className="mb-8">
        <div className="relative">
          <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm shadow-sm focus:border-[#0F62FE] focus:outline-none focus:ring-2 focus:ring-[#0F62FE]/20"
            placeholder="Pesquisar pergunta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
          {filtered.map((cat) => (
            <section
              key={cat.category}
              className="rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
            >
              <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                <i className={`bi ${cat.icon} ${cat.color}`}></i>
                {cat.category}
              </h2>
              {cat.items.map((item, i) => (
                <FAQItem key={i} item={item} />
              ))}
            </section>
          ))}
        </div>
      )}

      <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
        <i className="bi bi-envelope-fill mb-2 block text-2xl text-slate-400"></i>
        <p className="text-sm font-semibold text-slate-700">Não encontraste o que procuravas?</p>
        <p className="mt-1 text-sm text-slate-500">
          Fala com o teu Talent Manager ou com o administrador da plataforma.
        </p>
      </div>
    </div>
  );
}
