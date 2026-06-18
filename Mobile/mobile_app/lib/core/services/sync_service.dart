import '../../data/local/application_dao.dart';
import '../../data/local/area_dao.dart';
import '../../data/local/badge_dao.dart';
import '../../data/local/current_user_dao.dart';
import '../../data/local/evidence_dao.dart';
import '../../data/local/notification_dao.dart';
import '../../data/local/requirement_dao.dart';
import '../../data/local/sync_metadata_dao.dart';
import '../../shared/api_client.dart';
import '../../shared/session_storage.dart';
import 'connectivity_service.dart';

class SyncService {
  SyncService({
    ApiClient? apiClient,
    SessionStorage? sessionStorage,
    AreaDao? areaDao,
    CurrentUserDao? currentUserDao,
    BadgeDao? badgeDao,
    ApplicationDao? applicationDao,
    NotificationDao? notificationDao,
    RequirementDao? requirementDao,
    EvidenceDao? evidenceDao,
    SyncMetadataDao? syncMetadataDao,
  })  : _apiClient = apiClient ?? ApiClient(),
        _sessionStorage = sessionStorage ?? SessionStorage.instance,
        _areaDao = areaDao ?? AreaDao(),
        _currentUserDao = currentUserDao ?? CurrentUserDao(),
        _badgeDao = badgeDao ?? BadgeDao(),
        _applicationDao = applicationDao ?? ApplicationDao(),
        _notificationDao = notificationDao ?? NotificationDao(),
        _requirementDao = requirementDao ?? RequirementDao(),
        _evidenceDao = evidenceDao ?? EvidenceDao(),
        _syncMetadataDao = syncMetadataDao ?? SyncMetadataDao();

  final ApiClient _apiClient;
  final SessionStorage _sessionStorage;
  final AreaDao _areaDao;
  final CurrentUserDao _currentUserDao;
  final BadgeDao _badgeDao;
  final ApplicationDao _applicationDao;
  final NotificationDao _notificationDao;
  final RequirementDao _requirementDao;
  final EvidenceDao _evidenceDao;
  final SyncMetadataDao _syncMetadataDao;

  String? get _token => _sessionStorage.token;
  int? get _userId => _sessionStorage.userId;

  Future<void> syncBootstrap() async {
    await _sync('areas', () async {
      final payload = await _apiClient.get('/api/areas');
      await _areaDao.saveAll(_readList(payload));
    });
  }

  Future<void> syncInitialUserData() async {
    await syncBootstrap();
    final userId = _userId;
    final token = _token;
    if (userId == null || token == null || token.isEmpty) return;

    await _sync('user_${userId}_profile', () async {
      final payload = await _apiClient.get('/api/auth/me', token: token);
      if (payload is Map<String, dynamic>) {
        await _currentUserDao.save(userId, payload);
      }
    });

    await Future.wait(<Future<void>>[
      _syncMyBadges(userId, token),
      _syncBadgeProgress(userId, token),
      _syncCatalog(userId),
      _syncApplications(userId, token),
      _syncNotifications(userId, token),
    ]);

    final profile = await _currentUserDao.get(userId);
    final areaId = _toInt(profile?['area_id']);
    if (areaId != null) {
      await syncBadgesByArea(areaId);
    }
  }

  Future<void> syncRealtimeData() async {
    final userId = _userId;
    final token = _token;
    if (userId == null || token == null || token.isEmpty) return;

    await Future.wait(<Future<void>>[
      _syncApplications(userId, token),
      _syncNotifications(userId, token),
      _syncMyBadges(userId, token),
      _syncBadgeProgress(userId, token),
    ]);
  }

  Future<void> syncBadgesByArea(int areaId) async {
    await _sync('badges_by_area_$areaId', () async {
      final payload = await _apiClient.get('/areas/$areaId/badges');
      await _badgeDao.saveByArea(areaId, _readList(payload));
    });
  }

  Future<void> syncBadgeDetails(int badgeId) async {
    final userId = _userId;
    final token = _token;
    if (userId == null || token == null || token.isEmpty) return;

    await Future.wait(<Future<void>>[
      _sync('requirements_$badgeId', () async {
        final payload = await _apiClient.get('/badges/$badgeId/requirements', token: token);
        await _requirementDao.saveForBadge(badgeId, _readList(payload));
      }),
      _sync('user_${userId}_evidences_$badgeId', () async {
        final payload = await _apiClient.get('/api/consultor/badges/$badgeId/evidencias', token: token);
        await _evidenceDao.saveForBadge(userId, badgeId, _readList(payload));
      }),
    ]);
  }

  Future<void> _syncMyBadges(int userId, String token) {
    return _sync('user_${userId}_my_badges', () async {
      final payload = await _apiClient.get('/api/consultor/$userId/badges', token: token);
      await _badgeDao.saveMyBadges(userId, _readList(payload));
    });
  }

  Future<void> _syncBadgeProgress(int userId, String token) {
    return _sync('user_${userId}_badges_progress', () async {
      final payload = await _apiClient.get('/api/consultor/$userId/badges-progress', token: token);
      await _badgeDao.saveProgress(userId, _readList(payload));
    });
  }

  Future<void> _syncCatalog(int userId) {
    return _sync('user_${userId}_catalog_badges', () async {
      final payload = await _apiClient.get('/badges');
      await _badgeDao.saveCatalog(userId, _readList(payload));
    });
  }

  Future<void> _syncApplications(int userId, String token) {
    return _sync('user_${userId}_pedidos_status', () async {
      final payload = await _apiClient.get('/api/admin/pedidos', token: token);
      final all = _readList(payload);
      final mine = all.where((Map<String, dynamic> item) {
        final user = item['user'];
        if (user is! Map<String, dynamic>) return false;
        return _toInt(user['id']) == userId;
      }).toList();
      await _applicationDao.saveAll(userId, mine);
    });
  }

  Future<void> _syncNotifications(int userId, String token) {
    return _sync('user_${userId}_notifications', () async {
      final payload = await _apiClient.get('/api/notifications', token: token);
      if (payload is Map<String, dynamic>) {
        final data = payload['data'];
        if (data is List) {
          await _notificationDao.saveAll(
            userId,
            data.whereType<Map<String, dynamic>>().toList(),
          );
        }
      }
    });
  }

  Future<void> _sync(String key, Future<void> Function() action) async {
    if (!ConnectivityService.instance.isOnline) return;
    try {
      await action();
      await _syncMetadataDao.markSuccess(key);
    } catch (error) {
      await _syncMetadataDao.markError(key, error);
    }
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
}
