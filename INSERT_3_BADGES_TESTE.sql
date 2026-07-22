-- ============================================================================
-- INSERT DE 3 BADGES PARA TESTE - AREA ID 10
-- Learning Path ID: 4
-- Service Line ID: 7
-- Area ID: 10
-- ============================================================================

-- BADGE 1: Advanced Database Optimization (SENIOR)
WITH badge1 AS (
    INSERT INTO badges (
        area_id,
        level,
        description,
        points,
        expiry_days,
        image_url
    )
    VALUES (
        10,
        'Senior',
        'Advanced Database Optimization',
        200,
        365,
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80'
    )
    RETURNING id
)
INSERT INTO requirements (badge_id, code, description)
SELECT id, 'ADO1', 'Analyze and optimize slow queries' FROM badge1
UNION ALL
SELECT id, 'ADO2', 'Implement effective indexing strategy' FROM badge1
UNION ALL
SELECT id, 'ADO3', 'Document performance improvements' FROM badge1
UNION ALL
SELECT id, 'ADO4', 'Present optimization results to team' FROM badge1;

-- BADGE 2: Kubernetes Container Orchestration (INTERMEDIO)
WITH badge2 AS (
    INSERT INTO badges (
        area_id,
        level,
        description,
        points,
        expiry_days,
        image_url
    )
    VALUES (
        10,
        'Intermedio',
        'Kubernetes Container Orchestration',
        120,
        365,
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80'
    )
    RETURNING id
)
INSERT INTO requirements (badge_id, code, description)
SELECT id, 'KCO1', 'Deploy application on Kubernetes cluster' FROM badge2
UNION ALL
SELECT id, 'KCO2', 'Configure persistent storage and networking' FROM badge2
UNION ALL
SELECT id, 'KCO3', 'Implement health checks and auto-scaling' FROM badge2
UNION ALL
SELECT id, 'KCO4', 'Validate setup with peer review' FROM badge2;

-- BADGE 3: Security & Compliance Fundamentals (JUNIOR)
WITH badge3 AS (
    INSERT INTO badges (
        area_id,
        level,
        description,
        points,
        expiry_days,
        image_url
    )
    VALUES (
        10,
        'Junior',
        'Security & Compliance Fundamentals',
        80,
        365,
        'https://images.unsplash.com/photo-1516321318423-f06f70259ce1?auto=format&fit=crop&w=1200&q=80'
    )
    RETURNING id
)
INSERT INTO requirements (badge_id, code, description)
SELECT id, 'SCF1', 'Complete security awareness training' FROM badge3
UNION ALL
SELECT id, 'SCF2', 'Identify and report security vulnerabilities' FROM badge3
UNION ALL
SELECT id, 'SCF3', 'Document compliance requirements for your project' FROM badge3
UNION ALL
SELECT id, 'SCF4', 'Get sign-off from security team' FROM badge3;

-- ============================================================================
-- VERIFICAÇÃO - Executar após INSERT para confirmar
-- ============================================================================

SELECT
    b.id,
    b.description,
    b.level,
    b.points,
    COUNT(r.id) as total_requirements
FROM badges b
LEFT JOIN requirements r ON b.id = r.badge_id
WHERE b.area_id = 10
GROUP BY b.id, b.description, b.level, b.points
ORDER BY b.level DESC;

-- ============================================================================
-- OS 3 BADGES CRIADOS SÃO:
-- ============================================================================
--
-- 1. ADVANCED DATABASE OPTIMIZATION (Senior) - 200 pontos
--    Requisitos:
--    - ADO1: Analyze and optimize slow queries
--    - ADO2: Implement effective indexing strategy
--    - ADO3: Document performance improvements
--    - ADO4: Present optimization results to team
--
-- 2. KUBERNETES CONTAINER ORCHESTRATION (Intermedio) - 120 pontos
--    Requisitos:
--    - KCO1: Deploy application on Kubernetes cluster
--    - KCO2: Configure persistent storage and networking
--    - KCO3: Implement health checks and auto-scaling
--    - KCO4: Validate setup with peer review
--
-- 3. SECURITY & COMPLIANCE FUNDAMENTALS (Junior) - 80 pontos
--    Requisitos:
--    - SCF1: Complete security awareness training
--    - SCF2: Identify and report security vulnerabilities
--    - SCF3: Document compliance requirements for your project
--    - SCF4: Get sign-off from security team
--
-- ============================================================================
