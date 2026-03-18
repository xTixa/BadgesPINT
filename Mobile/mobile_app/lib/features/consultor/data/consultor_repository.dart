import '../../../core/network/api_client.dart';
import '../../../core/storage/session_storage.dart';
import 'models/consultor_models.dart';

class ConsultorRepository {
  ConsultorRepository({ApiClient? apiClient, SessionStorage? sessionStorage})
      : _apiClient = apiClient ?? const ApiClient(),
        _sessionStorage = sessionStorage ?? SessionStorage.instance;

  final ApiClient _apiClient;
  final SessionStorage _sessionStorage;

  String? get _token => _sessionStorage.token;
  int? get _userId => _sessionStorage.userId;

  Future<ConsultantUser?> getMyProfile() async {
    if ((_token ?? '').isEmpty) return null;

    try {
      final payload = await _apiClient.get('/api/auth/me', token: _token);
      if (payload is Map<String, dynamic>) {
        return ConsultantUser.fromJson(payload);
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  Future<List<BadgeItem>> getMyBadges() async {
    if ((_token ?? '').isEmpty || _userId == null) {
      return _mockBadges;
    }

    try {
      final payload = await _apiClient.get('/api/consultor/${_userId!}/badges', token: _token);
      return _readList(payload).map(BadgeItem.fromJson).toList();
    } catch (_) {
      return _mockBadges;
    }
  }

  Future<List<BadgeProgress>> getBadgesProgress() async {
    if ((_token ?? '').isEmpty || _userId == null) {
      return <BadgeProgress>[];
    }

    try {
      final payload = await _apiClient.get('/api/consultor/${_userId!}/badges-progress', token: _token);
      return _readList(payload).map(BadgeProgress.fromJson).toList();
    } catch (_) {
      return <BadgeProgress>[];
    }
  }

  Future<List<RequirementItem>> getRequirementsByBadge(int badgeId) async {
    try {
      final payload = await _apiClient.get('/badges/$badgeId/requirements', token: _token);
      return _readList(payload).map(RequirementItem.fromJson).toList();
    } catch (_) {
      return <RequirementItem>[];
    }
  }

  Future<List<EvidenceItem>> getEvidencesByBadge(int badgeId) async {
    if ((_token ?? '').isEmpty) return <EvidenceItem>[];

    try {
      final payload = await _apiClient.get('/api/consultor/badges/$badgeId/evidencias', token: _token);
      return _readList(payload).map(EvidenceItem.fromJson).toList();
    } catch (_) {
      return <EvidenceItem>[];
    }
  }

  Future<bool> submitEvidence({
    required int requirementId,
    required String evidenceUrl,
    String? notes,
  }) async {
    if ((_token ?? '').isEmpty) return false;

    try {
      await _apiClient.post(
        '/api/consultor/requirements/$requirementId/evidencias',
        token: _token,
        body: <String, dynamic>{
          'evidence_url': evidenceUrl,
          'notes': notes ?? '',
        },
      );
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> submitPedido(int badgeId) async {
    if ((_token ?? '').isEmpty) return false;

    try {
      final createPayload = await _apiClient.post(
        '/api/admin/pedidos',
        token: _token,
        body: <String, dynamic>{'badge_id': badgeId},
      );

      if (createPayload is! Map<String, dynamic>) return false;
      final pedidoId = createPayload['id'];
      if (pedidoId == null) return false;

      await _apiClient.post('/api/admin/pedidos/$pedidoId/submeter', token: _token);
      return true;
    } catch (_) {
      return false;
    }
  }

  List<RecommendationItem> getRecommendationsMock() {
    return <RecommendationItem>[
      RecommendationItem(id: 1, name: 'Badge SQL', reason: 'Completa modulo de queries', points: 60),
      RecommendationItem(id: 2, name: 'Badge Agile', reason: 'Entrega sprint review', points: 40),
    ];
  }

  List<ExpiryAlert> getExpiryAlertsMock() {
    return <ExpiryAlert>[
      ExpiryAlert(id: 1, name: 'ISO Security', expireInDays: 12),
      ExpiryAlert(id: 2, name: 'Kubernetes', expireInDays: 25),
    ];
  }

  List<RankingItem> getRankingMock() {
    return <RankingItem>[
      RankingItem(position: 1, name: 'Ana Ribeiro', points: 1200),
      RankingItem(position: 2, name: 'Carlos Mendes', points: 1100),
      RankingItem(position: 3, name: 'Patricia Silva', points: 820),
      RankingItem(position: 4, name: 'Joao Rocha', points: 790),
    ];
  }

  List<Map<String, dynamic>> _readList(dynamic payload) {
    if (payload is List) {
      return payload.whereType<Map<String, dynamic>>().toList();
    }
    return <Map<String, dynamic>>[];
  }
}

final List<BadgeItem> _mockBadges = <BadgeItem>[
  BadgeItem(id: 1, name: 'Excel Avancado', status: 'obtido', area: 'Data', points: 120, expireInDays: 45),
  BadgeItem(id: 2, name: 'Power BI', status: 'pendente', area: 'Data', points: 90, expireInDays: 20),
  BadgeItem(id: 3, name: 'Gestao de Projeto', status: 'em progresso', area: 'PMO', points: 100),
];
