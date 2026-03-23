import 'dart:convert';
import 'dart:typed_data';

import 'package:http/http.dart' as http;

import '../shared/app_config.dart';
import '../shared/api_client.dart';
import '../shared/session_storage.dart';
import 'consultor_models.dart';

class LoginResult {
  LoginResult({
    required this.success,
    this.requiresPasswordChange = false,
    this.message,
  });

  final bool success;
  final bool requiresPasswordChange;
  final String? message;
}

class ConsultorRepository {
  ConsultorRepository({ApiClient? apiClient, SessionStorage? sessionStorage})
      : _apiClient = apiClient ?? const ApiClient(),
        _sessionStorage = sessionStorage ?? SessionStorage.instance;

  final ApiClient _apiClient;
  final SessionStorage _sessionStorage;

  String? get _token => _sessionStorage.token;
  int? get _userId => _sessionStorage.userId;

  Future<LoginResult> login({required String email, required String password}) async {
    try {
      final payload = await _apiClient.post(
        '/api/auth/login',
        body: <String, dynamic>{
          'email': email,
          'password': password,
        },
      );

      if (payload is! Map<String, dynamic>) {
        return LoginResult(success: false, message: 'Resposta invalida do servidor.');
      }

      final token = payload['token']?.toString();
      final user = payload['user'];
      if (token == null || user is! Map<String, dynamic>) {
        return LoginResult(success: false, message: 'Falha ao autenticar.');
      }

      final firstLogin = payload['firstLogin'] == true;

      final role = (user['role'] ?? '').toString();
      if (role != 'consultant') {
        return LoginResult(
          success: false,
          message: 'Esta app mobile esta disponivel apenas para perfil Consultor.',
        );
      }

      final userId = _toInt(user['id']);
      if (userId == null) {
        return LoginResult(success: false, message: 'Utilizador invalido no login.');
      }

      await _sessionStorage.setSession(tokenValue: token, userIdValue: userId);
      return LoginResult(success: true, requiresPasswordChange: firstLogin);
    } on ApiException catch (error) {
      return LoginResult(success: false, message: _extractApiMessage(error.message));
    } catch (_) {
      return LoginResult(success: false, message: 'Nao foi possivel autenticar agora.');
    }
  }

  Future<void> logout() async {
    await _sessionStorage.clear();
  }

  Future<bool> completeFirstLogin({required String newPassword}) async {
    if ((_token ?? '').isEmpty) return false;

    try {
      await _apiClient.post(
        '/api/auth/first-login',
        token: _token,
        body: <String, dynamic>{'newPassword': newPassword},
      );
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<List<AreaItem>> getAreas() async {
    try {
      final payload = await _apiClient.get('/api/areas');
      return _readList(payload).map(AreaItem.fromJson).toList();
    } catch (_) {
      return <AreaItem>[];
    }
  }

  Future<LoginResult> registerConsultant({
    required String name,
    required String email,
    int? areaId,
    required bool acceptedRgpd,
  }) async {
    if (!acceptedRgpd) {
      return LoginResult(
        success: false,
        message: 'Tens de aceitar os termos RGPD para criar conta.',
      );
    }

    try {
      await _apiClient.post(
        '/api/users/register',
        body: <String, dynamic>{
          'nome': name,
          'email': email,
          'area_id': areaId,
          'rgpdAccepted': acceptedRgpd,
        },
      );

      return LoginResult(
        success: true,
        message: 'Registo criado. Verifica o email de confirmacao e usa a password temporaria enviada.',
      );
    } on ApiException catch (error) {
      return LoginResult(success: false, message: _extractApiMessage(error.message));
    } catch (_) {
      return LoginResult(success: false, message: 'Nao foi possivel concluir o registo.');
    }
  }

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

  Future<List<CatalogBadgeItem>> getCatalogBadges() async {
    try {
      final payload = await _apiClient.get('/badges');
      return _readList(payload).map(CatalogBadgeItem.fromJson).toList();
    } catch (_) {
      return <CatalogBadgeItem>[];
    }
  }

  Future<List<CatalogBadgeItem>> getBadgesByArea(int areaId) async {
    try {
      final payload = await _apiClient.get('/areas/$areaId/badges');
      return _readList(payload).map(CatalogBadgeItem.fromJson).toList();
    } catch (_) {
      return <CatalogBadgeItem>[];
    }
  }

  Future<List<PedidoBadgeStatus>> getMyPedidosStatus() async {
    if ((_token ?? '').isEmpty || _userId == null) {
      return <PedidoBadgeStatus>[];
    }

    try {
      final payload = await _apiClient.get('/api/admin/pedidos', token: _token);
      final all = _readList(payload);
      final mine = all.where((Map<String, dynamic> item) {
        final user = item['user'];
        if (user is! Map<String, dynamic>) return false;
        return _toInt(user['id']) == _userId;
      }).toList();

      return mine.map(PedidoBadgeStatus.fromJson).toList();
    } catch (_) {
      return <PedidoBadgeStatus>[];
    }
  }

  Future<List<UserNotificationItem>> getMyNotifications() async {
    if ((_token ?? '').isEmpty) return <UserNotificationItem>[];

    try {
      final payload = await _apiClient.get('/api/notifications', token: _token);
      if (payload is Map<String, dynamic>) {
        final data = payload['data'];
        if (data is List) {
          return data.whereType<Map<String, dynamic>>().map(UserNotificationItem.fromJson).toList();
        }
      }
      return <UserNotificationItem>[];
    } catch (_) {
      return <UserNotificationItem>[];
    }
  }

  Future<bool> markNotificationAsRead(int notificationId) async {
    if ((_token ?? '').isEmpty) return false;

    try {
      await _apiClient.post('/api/notifications/$notificationId/read', token: _token);
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> markAllNotificationsAsRead() async {
    if ((_token ?? '').isEmpty) return false;

    try {
      await _apiClient.put('/api/notifications/mark/all-read', token: _token);
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<Uint8List?> downloadCertificatePdf(int badgeId) async {
    if ((_token ?? '').isEmpty) return null;

    try {
      final uri = Uri.parse('${AppConfig.apiBaseUrl}/api/consultor/badges/$badgeId/certificado');
      final response = await http.post(
        uri,
        headers: <String, String>{
          'Authorization': 'Bearer $_token',
          'Content-Type': 'application/json',
        },
        body: '{}',
      );

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return response.bodyBytes;
      }

      return null;
    } catch (_) {
      return null;
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

  int? _toInt(dynamic value) {
    if (value is int) return value;
    return int.tryParse(value?.toString() ?? '');
  }

  String _extractApiMessage(String rawMessage) {
    try {
      final dynamic parsed = jsonDecode(rawMessage);
      if (parsed is Map<String, dynamic>) {
        return (parsed['message'] ?? 'Erro de autenticacao.').toString();
      }
    } catch (_) {
      // Keep raw message if it is not JSON.
    }

    if (rawMessage.trim().isNotEmpty) return rawMessage;
    return 'Erro de autenticacao.';
  }
}

final List<BadgeItem> _mockBadges = <BadgeItem>[
  BadgeItem(id: 1, name: 'Excel Avancado', status: 'obtido', area: 'Data', points: 120, expireInDays: 45),
  BadgeItem(id: 2, name: 'Power BI', status: 'pendente', area: 'Data', points: 90, expireInDays: 20),
  BadgeItem(id: 3, name: 'Gestao de Projeto', status: 'em progresso', area: 'PMO', points: 100),
];
