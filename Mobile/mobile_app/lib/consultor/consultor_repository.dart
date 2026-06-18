import 'dart:convert';
import 'dart:typed_data';

import '../core/services/sync_service.dart';
import '../data/local/application_dao.dart';
import '../data/local/area_dao.dart';
import '../data/local/badge_dao.dart';
import '../data/local/current_user_dao.dart';
import '../data/local/evidence_dao.dart';
import '../data/local/notification_dao.dart';
import '../data/local/requirement_dao.dart';
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
  ConsultorRepository({
    ApiClient? apiClient,
    SessionStorage? sessionStorage,
    SyncService? syncService,
    AreaDao? areaDao,
    CurrentUserDao? currentUserDao,
    BadgeDao? badgeDao,
    ApplicationDao? applicationDao,
    NotificationDao? notificationDao,
    RequirementDao? requirementDao,
    EvidenceDao? evidenceDao,
  })  : _apiClient = apiClient ?? ApiClient(),
        _sessionStorage = sessionStorage ?? SessionStorage.instance,
        _syncService = syncService ?? SyncService(apiClient: apiClient, sessionStorage: sessionStorage),
        _areaDao = areaDao ?? AreaDao(),
        _currentUserDao = currentUserDao ?? CurrentUserDao(),
        _badgeDao = badgeDao ?? BadgeDao(),
        _applicationDao = applicationDao ?? ApplicationDao(),
        _notificationDao = notificationDao ?? NotificationDao(),
        _requirementDao = requirementDao ?? RequirementDao(),
        _evidenceDao = evidenceDao ?? EvidenceDao();

  final ApiClient _apiClient;
  final SessionStorage _sessionStorage;
  final SyncService _syncService;
  final AreaDao _areaDao;
  final CurrentUserDao _currentUserDao;
  final BadgeDao _badgeDao;
  final ApplicationDao _applicationDao;
  final NotificationDao _notificationDao;
  final RequirementDao _requirementDao;
  final EvidenceDao _evidenceDao;

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
    await ApiClient.clearCookies();
    await _sessionStorage.clear();
  }

  Future<void> syncInitialData() async {
    await _syncService.syncInitialUserData();
  }

  Future<void> syncRealtimeData() async {
    await _syncService.syncRealtimeData();
  }

  Future<void> syncAreas() async {
    await _syncService.syncBootstrap();
  }

  Future<void> syncBadgesByArea(int areaId) async {
    await _syncService.syncBadgesByArea(areaId);
  }

  Future<void> syncBadgeDetails(int badgeId) async {
    await _syncService.syncBadgeDetails(badgeId);
  }

  Future<bool> registerDeviceToken(String fcmToken) async {
    if ((_token ?? '').isEmpty || fcmToken.isEmpty) return false;

    try {
      await _apiClient.post(
        '/api/notifications/device-token',
        token: _token,
        body: <String, dynamic>{
          'token': fcmToken,
          'platform': 'mobile',
        },
      );
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> unregisterDeviceToken(String fcmToken) async {
    if ((_token ?? '').isEmpty || fcmToken.isEmpty) return false;

    try {
      await _apiClient.post(
        '/api/notifications/device-token/remove',
        token: _token,
        body: <String, dynamic>{'token': fcmToken},
      );
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> completeFirstLogin({required String newPassword}) async {
    if ((_token ?? '').isEmpty) return false;

    try {
      final payload = await _apiClient.post(
        '/api/auth/first-login',
        token: _token,
        body: <String, dynamic>{'newPassword': newPassword},
      );

      if (payload is Map<String, dynamic>) {
        final token = payload['token']?.toString();
        final user = payload['user'];
        final userId =
            user is Map<String, dynamic> ? _toInt(user['id']) : _userId;
        if (token != null && token.isNotEmpty && userId != null) {
          await _sessionStorage.setSession(
            tokenValue: token,
            userIdValue: userId,
          );
        }
      }
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<List<AreaItem>> getAreas() async {
    final rows = await _areaDao.getAll();
    return rows.map(AreaItem.fromJson).toList();
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
    final userId = _userId;
    if (userId == null) return null;
    final payload = await _currentUserDao.get(userId);
    if (payload is Map<String, dynamic>) return ConsultantUser.fromJson(payload);
    return null;
  }

  Future<ConsultantUser?> updateProfile({
    required String name,
    required String email,
    int? areaId,
  }) async {
    if ((_token ?? '').isEmpty || _userId == null) return null;

    try {
      final payload = await _apiClient.put(
        '/api/users/${_userId!}',
        token: _token,
        body: <String, dynamic>{
          'name': name,
          'email': email,
          'area_id': areaId,
        },
      );

      if (payload is Map<String, dynamic>) {
        final user = payload['user'];
        if (user is Map<String, dynamic>) {
          await _currentUserDao.save(_userId!, user);
          return ConsultantUser.fromJson(user);
        }
      }

      return null;
    } catch (_) {
      return null;
    }
  }

  Future<String?> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    if ((_token ?? '').isEmpty || _userId == null) {
      return 'Sessao invalida.';
    }

    try {
      await _apiClient.put(
        '/api/users/${_userId!}/password',
        token: _token,
        body: <String, dynamic>{
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        },
      );
      return null;
    } on ApiException catch (error) {
      return _extractApiMessage(error.message);
    } catch (_) {
      return 'Nao foi possivel alterar a password.';
    }
  }

  Future<List<BadgeItem>> getMyBadges() async {
    final userId = _userId;
    if (userId == null) return <BadgeItem>[];
    final rows = await _badgeDao.getMyBadges(userId);
    return rows.map(BadgeItem.fromJson).toList();
  }

  Future<List<BadgeProgress>> getBadgesProgress() async {
    final userId = _userId;
    if (userId == null) return <BadgeProgress>[];
    final rows = await _badgeDao.getProgress(userId);
    return rows.map(BadgeProgress.fromJson).toList();
  }

  Future<List<RequirementItem>> getRequirementsByBadge(int badgeId) async {
    final rows = await _requirementDao.getForBadge(badgeId);
    return rows.map(RequirementItem.fromJson).toList();
  }

  Future<List<CatalogBadgeItem>> getCatalogBadges() async {
    final userId = _userId;
    if (userId == null) return <CatalogBadgeItem>[];
    final rows = await _badgeDao.getCatalog(userId);
    return rows.map(CatalogBadgeItem.fromJson).toList();
  }

  Future<List<CatalogBadgeItem>> getBadgesByArea(int areaId) async {
    final rows = await _badgeDao.getByArea(areaId);
    return rows.map(CatalogBadgeItem.fromJson).toList();
  }

  Future<List<PedidoBadgeStatus>> getMyPedidosStatus() async {
    final userId = _userId;
    if (userId == null) return <PedidoBadgeStatus>[];
    final rows = await _applicationDao.getAll(userId);
    return rows.map(PedidoBadgeStatus.fromJson).toList();
  }

  Future<List<UserNotificationItem>> getMyNotifications() async {
    final userId = _userId;
    if (userId == null) return <UserNotificationItem>[];
    final rows = await _notificationDao.getAll(userId);
    return rows.map(UserNotificationItem.fromJson).toList();
  }

  Future<bool> markNotificationAsRead(int notificationId) async {
    if ((_token ?? '').isEmpty) return false;

    try {
      await _apiClient.put('/api/notifications/$notificationId/read', token: _token);
      await syncRealtimeData();
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> markAllNotificationsAsRead() async {
    if ((_token ?? '').isEmpty) return false;

    try {
      await _apiClient.put('/api/notifications/mark/all-read', token: _token);
      await syncRealtimeData();
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<Uint8List?> downloadCertificatePdf(int badgeId) async {
    if ((_token ?? '').isEmpty) return null;

    try {
      return await _apiClient.postBytes(
        '/api/consultor/badges/$badgeId/certificado',
        token: _token,
      );
    } catch (_) {
      return null;
    }
  }

  Future<List<EvidenceItem>> getEvidencesByBadge(int badgeId) async {
    final userId = _userId;
    if (userId == null) return <EvidenceItem>[];
    final rows = await _evidenceDao.getForBadge(userId, badgeId);
    return rows.map(EvidenceItem.fromJson).toList();
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

  Future<String?> uploadEvidenceFile({
    required String fileName,
    required Uint8List bytes,
  }) async {
    if ((_token ?? '').isEmpty) return null;

    try {
      final payload = await _apiClient.post(
        '/api/consultor/evidencias/upload',
        token: _token,
        body: <String, dynamic>{
          'fileName': fileName,
          'file': 'data:application/octet-stream;base64,${base64Encode(bytes)}',
        },
      );

      if (payload is Map<String, dynamic>) {
        return payload['url']?.toString();
      }

      return null;
    } catch (_) {
      return null;
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

      if (createPayload['workflow_status'] == 'open') {
        await _apiClient.post('/api/admin/pedidos/$pedidoId/submeter', token: _token);
      }
      await syncRealtimeData();
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
