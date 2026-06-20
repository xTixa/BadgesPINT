import 'dart:convert';
import 'dart:typed_data';

import '../core/services/connectivity_service.dart';
import '../core/services/sync_service.dart';
import '../data/local/application_dao.dart';
import '../data/local/area_dao.dart';
import '../data/local/badge_dao.dart';
import '../data/local/current_user_dao.dart';
import '../data/local/evidence_dao.dart';
import '../data/local/notification_dao.dart';
import '../data/local/pending_mutation_dao.dart';
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

class ActionResult {
  ActionResult({required this.success, this.message});

  final bool success;
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
    PendingMutationDao? pendingMutationDao,
  })  : _apiClient = apiClient ?? ApiClient(),
        _sessionStorage = sessionStorage ?? SessionStorage.instance,
        _syncService = syncService ?? SyncService(apiClient: apiClient, sessionStorage: sessionStorage),
        _areaDao = areaDao ?? AreaDao(),
        _currentUserDao = currentUserDao ?? CurrentUserDao(),
        _badgeDao = badgeDao ?? BadgeDao(),
        _applicationDao = applicationDao ?? ApplicationDao(),
        _notificationDao = notificationDao ?? NotificationDao(),
        _requirementDao = requirementDao ?? RequirementDao(),
        _evidenceDao = evidenceDao ?? EvidenceDao(),
        _pendingMutationDao = pendingMutationDao ?? PendingMutationDao();

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
  final PendingMutationDao _pendingMutationDao;

  bool get _isOnline => ConnectivityService.instance.isOnline;

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
    String? avatarUrl,
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
          'avatar_url': avatarUrl,
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

  Future<int> getPendingMutationCount() async {
    final pending = await _pendingMutationDao.getAll();
    return pending.length;
  }

  Future<List<RankingItem>> getConsultantsRanking() async {
    if ((_token ?? '').isEmpty) return getRankingMock();

    try {
      final payload = await _apiClient.get(
        '/api/consultores/ranking',
        token: _token,
      );

      if (payload is List) {
        return payload
            .whereType<Map<String, dynamic>>()
            .map(RankingItem.fromJson)
            .toList();
      }
    } catch (_) {
      // Keep the app usable if the API has not been updated yet.
    }

    return getRankingMock();
  }

  Future<List<LearningPathProgressItem>> getLearningPathProgress() async {
    if ((_token ?? '').isEmpty) return <LearningPathProgressItem>[];

    try {
      final payload = await _apiClient.get(
        '/api/consultor/learning-paths/progress',
        token: _token,
      );
      if (payload is List) {
        return payload
            .whereType<Map<String, dynamic>>()
            .map(LearningPathProgressItem.fromJson)
            .toList();
      }
    } catch (_) {
      return <LearningPathProgressItem>[];
    }

    return <LearningPathProgressItem>[];
  }

  Future<List<CertificateItem>> getCertificates() async {
    if ((_token ?? '').isEmpty) return <CertificateItem>[];

    try {
      final payload = await _apiClient.get(
        '/api/consultor/certificates',
        token: _token,
      );
      if (payload is List) {
        return payload
            .whereType<Map<String, dynamic>>()
            .map(CertificateItem.fromJson)
            .toList();
      }
    } catch (_) {
      return <CertificateItem>[];
    }

    return <CertificateItem>[];
  }

  Future<ConsultantUser?> updatePreferences({
    required bool rgpdPublicationAccepted,
    required bool publicProfileEnabled,
    required bool linkedinSharingEnabled,
    String? goalText,
    String? goalDeadline,
  }) async {
    if ((_token ?? '').isEmpty || _userId == null) return null;

    try {
      await _apiClient.put(
        '/api/consultor/preferences',
        token: _token,
        body: <String, dynamic>{
          'rgpd_publication_accepted': rgpdPublicationAccepted,
          'public_profile_enabled': publicProfileEnabled,
          'linkedin_sharing_enabled': linkedinSharingEnabled,
          'goal_text': goalText,
          'goal_deadline': goalDeadline,
        },
      );
      await _syncService.syncInitialUserData();
      return getMyProfile();
    } catch (_) {
      return null;
    }
  }

  Future<PublicConsultantProfile?> getConsultantPublicProfile(int id) async {
    if ((_token ?? '').isEmpty) return null;

    try {
      final payload = await _apiClient.get(
        '/api/consultor/$id/profile',
        token: _token,
      );

      if (payload is Map<String, dynamic>) {
        return PublicConsultantProfile.fromJson(payload);
      }
    } catch (_) {
      return null;
    }

    return null;
  }

  Future<bool> markNotificationAsRead(int notificationId) async {
    if ((_token ?? '').isEmpty) return false;

    if (!_isOnline) {
      await _pendingMutationDao.enqueue(
        mutationKey: 'mark_notification_read_$notificationId',
        endpoint: '/api/notifications/$notificationId/read',
        method: 'PUT',
      );
      return true;
    }

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

    if (!_isOnline) {
      await _pendingMutationDao.enqueue(
        mutationKey: 'mark_all_notifications_read',
        endpoint: '/api/notifications/mark/all-read',
        method: 'PUT',
      );
      return true;
    }

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

    return _apiClient.postBytes(
      '/api/consultor/badges/$badgeId/certificado',
      token: _token,
    );
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

    if (!_isOnline) {
      await _pendingMutationDao.enqueue(
        mutationKey: 'submit_evidence_$requirementId',
        endpoint: '/api/consultor/requirements/$requirementId/evidencias',
        method: 'POST',
        body: <String, dynamic>{'evidence_url': evidenceUrl, 'notes': notes ?? ''},
      );
      return true;
    }

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
          'file': 'data:${_mimeTypeForFile(fileName)};base64,${base64Encode(bytes)}',
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

  String _mimeTypeForFile(String fileName) {
    final extension = fileName.split('.').last.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'application/pdf';
      case 'png':
        return 'image/png';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'doc':
        return 'application/msword';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      default:
        return 'application/octet-stream';
    }
  }

  Future<ActionResult> submitPedido(int badgeId) async {
    if ((_token ?? '').isEmpty) {
      return ActionResult(success: false, message: 'Sessao invalida.');
    }

    if (!_isOnline) {
      await _pendingMutationDao.enqueue(
        mutationKey: 'submit_pedido_$badgeId',
        endpoint: '/api/pedidos',
        method: 'POST',
        body: <String, dynamic>{'badge_id': badgeId},
      );
      return ActionResult(
        success: true,
        message: 'Pedido guardado offline. Sera submetido quando houver ligacao.',
      );
    }

    try {
      final createPayload = await _apiClient.post(
        '/api/pedidos',
        token: _token,
        body: <String, dynamic>{'badge_id': badgeId},
      );

      if (createPayload is! Map<String, dynamic>) {
        return ActionResult(success: false, message: 'Resposta invalida da API.');
      }
      final pedidoId = createPayload['id'];
      if (pedidoId == null) {
        return ActionResult(success: false, message: 'A API nao devolveu o pedido criado.');
      }

      if (createPayload['workflow_status'] == 'open') {
        await _apiClient.post('/api/pedidos/$pedidoId/submeter', token: _token);
      }
      await syncRealtimeData();
      return ActionResult(success: true, message: 'Pedido submetido com sucesso.');
    } on ApiException catch (error) {
      final message = _extractApiMessage(error.message);
      final normalizedMessage = _normalizeForMatch(message);
      if (error.statusCode == 400 &&
          normalizedMessage.contains('ja existe')) {
        await syncRealtimeData();
        return ActionResult(
          success: true,
          message: 'Ja tinhas uma candidatura ativa para este badge.',
        );
      }
      return ActionResult(success: false, message: message);
    } catch (error) {
      return ActionResult(
        success: false,
        message: 'Nao foi possivel contactar a API: $error',
      );
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
      RankingItem(consultantId: 0, position: 1, name: 'Ana Ribeiro', points: 1200),
      RankingItem(consultantId: 0, position: 2, name: 'Carlos Mendes', points: 1100),
      RankingItem(consultantId: 0, position: 3, name: 'Patricia Silva', points: 820),
      RankingItem(consultantId: 0, position: 4, name: 'Joao Rocha', points: 790),
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
        final message = (parsed['message'] ?? '').toString();
        final detail = (parsed['detail'] ?? '').toString();
        if (message.isNotEmpty && detail.isNotEmpty) {
          return '$message: $detail';
        }
        if (message.isNotEmpty) return message;
        if (detail.isNotEmpty) return detail;
        return 'Erro de autenticacao.';
      }
    } catch (_) {
      // Keep raw message if it is not JSON.
    }

    if (rawMessage.trim().isNotEmpty) return rawMessage;
    return 'Erro de autenticacao.';
  }

  String _normalizeForMatch(String value) {
    return value
        .toLowerCase()
        .replaceAll('á', 'a')
        .replaceAll('à', 'a')
        .replaceAll('ã', 'a')
        .replaceAll('â', 'a')
        .replaceAll('é', 'e')
        .replaceAll('ê', 'e')
        .replaceAll('í', 'i')
        .replaceAll('ó', 'o')
        .replaceAll('ô', 'o')
        .replaceAll('õ', 'o')
        .replaceAll('ú', 'u')
        .replaceAll('ç', 'c');
  }
}
