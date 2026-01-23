import React from 'react';
import { useWindowSize } from '../../hooks/useWindowSize';

/**
 * CASOS DE USO COMUNS - Copie e Adapte!
 */

// ========== CASO 1: Tabela Responsiva ==========
export function TabelaResponsiva() {
  const { isDesktop } = useWindowSize();

  const dados = [
    { id: 1, nome: 'João', email: 'joao@example.com', role: 'Consultor' },
    { id: 2, nome: 'Maria', email: 'maria@example.com', role: 'TM' },
  ];

  return (
    <div style={{ marginBottom: '2rem' }}>
      {isDesktop ? (
        // DESKTOP: Tabela Normal
        <table className="table">
          <thead style={{ backgroundColor: '#f8f9fa' }}>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Função</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {dados.map(item => (
              <tr key={item.id}>
                <td>{item.nome}</td>
                <td>{item.email}</td>
                <td>{item.role}</td>
                <td>
                  <button className="btn btn-sm btn-primary">Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        // MOBILE: Cards Empilhados
        <div>
          {dados.map(item => (
            <div
              key={item.id}
              style={{
                backgroundColor: 'white',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>{item.nome}</strong>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#6b8cae' }}>
                {item.email}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#6b8cae', marginBottom: '0.5rem' }}>
                {item.role}
              </div>
              <button className="btn btn-sm btn-primary" style={{ width: '100%' }}>
                Editar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ========== CASO 2: Cards em Grid ==========
export function GridCardsResponsivo() {
  const cards = [
    { title: 'Utilizadores', value: '1,234', icon: 'bi-people' },
    { title: 'Badges', value: '89', icon: 'bi-award' },
    { title: 'Caminhos', value: '45', icon: 'bi-diagram-3' },
    { title: 'Revenue', value: '€45K', icon: 'bi-cash-coin' },
  ];

  return (
    <div className="row">
      {cards.map((card, idx) => (
        <div key={idx} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
          <div
            style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              textAlign: 'center',
            }}
          >
            <i
              className={`bi ${card.icon}`}
              style={{ fontSize: '2rem', color: '#5a7a9a', marginBottom: '0.5rem', display: 'block' }}
            ></i>
            <div style={{ color: '#6b8cae', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              {card.title}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#244080' }}>
              {card.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ========== CASO 3: Formulário Responsivo ==========
export function FormularioResponsivo() {
  const [formData, setFormData] = React.useState({
    nome: '',
    email: '',
    telefone: '',
    mensagem: '',
  });

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <form>
        <div className="row">
          {/* Campo nome - Full width em mobile */}
          <div className="col-12 col-md-6 mb-3">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Nome
            </label>
            <input
              type="text"
              className="form-control"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            />
          </div>

          {/* Campo email - Full width em mobile */}
          <div className="col-12 col-md-6 mb-3">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Email
            </label>
            <input
              type="email"
              className="form-control"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {/* Campo telefone - Full width */}
          <div className="col-12 mb-3">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Telefone
            </label>
            <input
              type="tel"
              className="form-control"
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
            />
          </div>

          {/* Campo mensagem - Full width */}
          <div className="col-12 mb-3">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Mensagem
            </label>
            <textarea
              className="form-control"
              rows={4}
              value={formData.mensagem}
              onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
            ></textarea>
          </div>

          {/* Botões */}
          <div className="col-12">
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1, minHeight: '44px' }}
              >
                Enviar
              </button>
              <button
                type="reset"
                className="btn btn-outline-secondary"
                style={{ flex: 1, minHeight: '44px' }}
              >
                Limpar
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

// ========== CASO 4: Menu Sidebar Colapsável ==========
export function MenuResponsivo() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { isMobile } = useWindowSize();

  return (
    <>
      {/* Botão menu - Apenas mobile */}
      {isMobile && (
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            zIndex: 999,
            background: '#5a7a9a',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            cursor: 'pointer',
            minHeight: '44px',
          }}
        >
          <i className="bi bi-list"></i>
        </button>
      )}

      {/* Menu Overlay - Mobile */}
      {isMobile && menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 998,
          }}
        />
      )}

      {/* Menu */}
      <nav
        style={{
          position: isMobile ? 'fixed' : 'relative',
          left: isMobile && !menuOpen ? '-100%' : '0',
          top: 0,
          width: isMobile ? '250px' : '100%',
          height: isMobile ? '100vh' : 'auto',
          backgroundColor: '#5a7a9a',
          color: 'white',
          padding: '1rem',
          transition: 'left 0.3s ease',
          zIndex: 999,
          overflowY: 'auto',
        }}
      >
        <h5 style={{ marginBottom: '1rem' }}>Menu</h5>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '0.5rem' }}>
            <a href="#" style={{ color: 'white', textDecoration: 'none' }}>
              Home
            </a>
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <a href="#" style={{ color: 'white', textDecoration: 'none' }}>
              Sobre
            </a>
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <a href="#" style={{ color: 'white', textDecoration: 'none' }}>
              Contato
            </a>
          </li>
        </ul>
      </nav>
    </>
  );
}

// ========== CASO 5: Layout Flexível ==========
export function LayoutFlexivel() {
  const { isMobile } = useWindowSize();

  return (
    <div
      style={{
        display: 'flex',
        gap: isMobile ? '1rem' : '2rem',
        flexDirection: isMobile ? 'column' : 'row',
      }}
    >
      {/* Sidebar */}
      <aside style={{ width: isMobile ? '100%' : '250px' }}>
        <div
          style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          <h5>Filtros</h5>
          <p>Conteúdo filtro</p>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main style={{ flex: 1 }}>
        <div
          style={{
            backgroundColor: 'white',
            padding: isMobile ? '1rem' : '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          <h5>Conteúdo Principal</h5>
          <p>Conteúdo</p>
        </div>
      </main>
    </div>
  );
}

// ========== CASO 6: Imagem Responsiva ==========
export function ImagemResponsiva() {
  return (
    <div className="row">
      <div className="col-12 col-md-6 col-lg-4">
        <img
          src="https://via.placeholder.com/400x300"
          alt="Exemplo"
          style={{
            maxWidth: '100%',
            height: 'auto',
            borderRadius: '8px',
            display: 'block',
          }}
        />
      </div>
    </div>
  );
}

// ========== CASO 7: Botão Responsivo ==========
export function BotaoResponsivo() {
  const { isMobile } = useWindowSize();

  return (
    <button
      className="btn btn-primary"
      style={{
        width: isMobile ? '100%' : 'auto',
        padding: isMobile ? '0.75rem 1.5rem' : '0.5rem 2rem',
        fontSize: isMobile ? '0.9rem' : '1rem',
        minHeight: isMobile ? '44px' : 'auto',
      }}
    >
      <i className="bi bi-plus-lg"></i>
      {isMobile ? 'Add' : 'Adicionar Novo'}
    </button>
  );
}

// ========== CASO 8: Badges Inline ==========
export function BadgesResponsivo() {
  const { isMobile } = useWindowSize();

  const badges = ['Active', 'Pending', 'Completed', 'Failed'];

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: isMobile ? '0.5rem' : '1rem',
      }}
    >
      {badges.map((badge, idx) => (
        <span
          key={idx}
          className="badge bg-primary"
          style={{
            padding: isMobile ? '0.35rem 0.65rem' : '0.5rem 0.75rem',
            fontSize: isMobile ? '0.75rem' : '0.875rem',
          }}
        >
          {badge}
        </span>
      ))}
    </div>
  );
}

// ========== CASO 9: Modal Responsivo ==========
export function ModalResponsivo() {
  const { isMobile } = useWindowSize();
  const [show, setShow] = React.useState(false);

  return (
    <>
      <button onClick={() => setShow(true)} className="btn btn-primary">
        Abrir Modal
      </button>

      {show && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setShow(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 999,
            }}
          />

          {/* Modal */}
          <div
            style={{
              position: 'fixed',
              top: isMobile ? '50%' : '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: isMobile ? '95%' : '500px',
              maxHeight: isMobile ? '90vh' : '80vh',
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: isMobile ? '1rem' : '2rem',
              overflowY: 'auto',
              zIndex: 1000,
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ marginBottom: '1rem' }}>
              <h5>Modal Title</h5>
            </div>
            <p>Modal content aqui</p>
            <button onClick={() => setShow(false)} className="btn btn-secondary">
              Fechar
            </button>
          </div>
        </>
      )}
    </>
  );
}

// ========== CASO 10: Drawer Lado ==========
export function DrawerLadoResponsivo() {
  const [show, setShow] = React.useState(false);
  const { isMobile } = useWindowSize();

  return (
    <>
      <button onClick={() => setShow(true)} className="btn btn-primary">
        <i className="bi bi-sliders"></i> Opções
      </button>

      {show && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setShow(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 999,
            }}
          />

          {/* Drawer */}
          <div
            style={{
              position: 'fixed',
              right: show ? '0' : '-100%',
              top: 0,
              width: isMobile ? '100%' : '300px',
              height: '100vh',
              backgroundColor: 'white',
              boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',
              transition: 'right 0.3s ease',
              zIndex: 1000,
              overflow: 'auto',
              padding: '1rem',
            }}
          >
            <button
              onClick={() => setShow(false)}
              style={{
                float: 'right',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
            <h5>Opções</h5>
            <p>Conteúdo do drawer</p>
          </div>
        </>
      )}
    </>
  );
}
