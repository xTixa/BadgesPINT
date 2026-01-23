import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useWindowSize } from '../../hooks/useWindowSize';

/**
 * Componente exemplo de responsive design
 * Demonstra as melhores práticas para diferentes dispositivos
 */
export default function ResponsiveExample() {
  const { isMobile, isTablet, isDesktop, width } = useWindowSize();

  return (
    <div style={{ padding: isMobile ? '1rem' : isTablet ? '1.5rem' : '2rem' }}>
      {/* Header Responsivo */}
      <div
        style={{
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '1rem' : '0',
        }}
      >
        <h1
          style={{
            fontSize: isMobile ? '1.5rem' : isTablet ? '2rem' : '2.5rem',
            fontWeight: '700',
            color: '#244080',
            margin: 0,
          }}
        >
          Dashboard Responsivo
        </h1>
        <p
          style={{
            fontSize: isMobile ? '0.8rem' : '0.95rem',
            color: '#6b8cae',
            margin: 0,
          }}
        >
          Testado em: {width}px
        </p>
      </div>

      {/* Grid Responsivo */}
      <div className="row" style={{ marginBottom: '2rem' }}>
        {/* Card 1 */}
        <div className="col-12 col-sm-6 col-md-3 mb-3">
          <div
            style={{
              backgroundColor: 'white',
              padding: isMobile ? '1rem' : '1.5rem',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            <div style={{ color: '#6b8cae', fontSize: isMobile ? '0.85rem' : '0.9rem' }}>
              Total Utilizadores
            </div>
            <div style={{ fontSize: isMobile ? '1.75rem' : '2.5rem', fontWeight: '700', color: '#244080' }}>
              1,234
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="col-12 col-sm-6 col-md-3 mb-3">
          <div
            style={{
              backgroundColor: 'white',
              padding: isMobile ? '1rem' : '1.5rem',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            <div style={{ color: '#6b8cae', fontSize: isMobile ? '0.85rem' : '0.9rem' }}>
              Badges Ativos
            </div>
            <div style={{ fontSize: isMobile ? '1.75rem' : '2.5rem', fontWeight: '700', color: '#244080' }}>
              89
            </div>
          </div>
        </div>

        {/* Card 3 - Hidden em mobile */}
        {!isMobile && (
          <div className="col-12 col-sm-6 col-md-3 mb-3">
            <div
              style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              <div style={{ color: '#6b8cae', fontSize: '0.9rem' }}>
                Taxa Conclusão
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#244080' }}>
                78%
              </div>
            </div>
          </div>
        )}

        {/* Card 4 - Hidden em tablet */}
        {isDesktop && (
          <div className="col-md-3 mb-3">
            <div
              style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              <div style={{ color: '#6b8cae', fontSize: '0.9rem' }}>
                Revenue
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#244080' }}>
                €45K
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabela Responsiva */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          marginBottom: '2rem',
        }}
      >
        {/* Desktop: Tabela Normal */}
        {isDesktop && (
          <table className="table" style={{ marginBottom: 0 }}>
            <thead style={{ backgroundColor: '#f8f9fa' }}>
              <tr>
                <th style={{ color: '#6b8cae' }}>Utilizador</th>
                <th style={{ color: '#6b8cae' }}>Email</th>
                <th style={{ color: '#6b8cae' }}>Função</th>
                <th style={{ color: '#6b8cae' }}>Status</th>
                <th style={{ color: '#6b8cae' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>João Silva</td>
                <td>joao@example.com</td>
                <td>Consultor</td>
                <td><span className="badge bg-success">Ativo</span></td>
                <td>
                  <button className="btn btn-sm btn-outline-primary">Editar</button>
                </td>
              </tr>
              <tr>
                <td>Maria Costa</td>
                <td>maria@example.com</td>
                <td>TM</td>
                <td><span className="badge bg-success">Ativo</span></td>
                <td>
                  <button className="btn btn-sm btn-outline-primary">Editar</button>
                </td>
              </tr>
            </tbody>
          </table>
        )}

        {/* Mobile/Tablet: Cards Empilhados */}
        {!isDesktop && (
          <div style={{ padding: isMobile ? '1rem' : '1.5rem' }}>
            {[
              { name: 'João Silva', email: 'joao@example.com', role: 'Consultor' },
              { name: 'Maria Costa', email: 'maria@example.com', role: 'TM' },
            ].map((user, idx) => (
              <div
                key={idx}
                style={{
                  borderBottom: idx === 1 ? 'none' : '1px solid #dee2e6',
                  paddingBottom: isMobile ? '1rem' : '1.5rem',
                  marginBottom: isMobile ? '1rem' : '1.5rem',
                }}
              >
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong style={{ fontSize: isMobile ? '0.95rem' : '1rem' }}>
                    {user.name}
                  </strong>
                </div>
                <div style={{ fontSize: isMobile ? '0.85rem' : '0.9rem', color: '#6b8cae', marginBottom: '0.25rem' }}>
                  {user.email}
                </div>
                <div style={{ fontSize: isMobile ? '0.85rem' : '0.9rem', color: '#6b8cae', marginBottom: '0.75rem' }}>
                  {user.role}
                </div>
                <div>
                  <span className="badge bg-success" style={{ marginRight: '0.5rem' }}>
                    Ativo
                  </span>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    style={{ fontSize: isMobile ? '0.8rem' : '0.9rem' }}
                  >
                    Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botões Responsivos */}
      <div
        style={{
          display: 'flex',
          gap: isMobile ? '0.5rem' : '1rem',
          flexDirection: isMobile ? 'column' : 'row',
        }}
      >
        <button
          className="btn btn-primary"
          style={{
            width: isMobile ? '100%' : 'auto',
            padding: isMobile ? '0.75rem 1.5rem' : '0.5rem 1.5rem',
            fontSize: isMobile ? '0.9rem' : '1rem',
            minHeight: isMobile ? '44px' : 'auto',
          }}
        >
          <i className="bi bi-plus-lg"></i> {isMobile ? 'Adicionar' : 'Adicionar Novo'}
        </button>
        <button
          className="btn btn-outline-secondary"
          style={{
            width: isMobile ? '100%' : 'auto',
            padding: isMobile ? '0.75rem 1.5rem' : '0.5rem 1.5rem',
            fontSize: isMobile ? '0.9rem' : '1rem',
            minHeight: isMobile ? '44px' : 'auto',
          }}
        >
          <i className="bi bi-download"></i> {isMobile ? 'Export' : 'Exportar'}
        </button>
      </div>

      {/* Info Breakpoint (Debug) */}
      {process.env.NODE_ENV === 'development' && (
        <div
          style={{
            marginTop: '2rem',
            padding: '1rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            fontSize: '0.85rem',
            color: '#6b8cae',
          }}
        >
          <strong>Debug Info:</strong>
          <div>Largura: {width}px</div>
          <div>Mobile: {isMobile ? '✓' : '✗'}</div>
          <div>Tablet: {isTablet ? '✓' : '✗'}</div>
          <div>Desktop: {isDesktop ? '✓' : '✗'}</div>
        </div>
      )}
    </div>
  );
}
