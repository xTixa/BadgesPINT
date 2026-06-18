import 'json_cache_dao.dart';

class EvidenceDao {
  EvidenceDao({JsonCacheDao? cacheDao}) : _cacheDao = cacheDao ?? JsonCacheDao();

  final JsonCacheDao _cacheDao;

  String _key(int userId, int badgeId) => 'user_${userId}_evidences_$badgeId';

  Future<void> saveForBadge(int userId, int badgeId, List<Map<String, dynamic>> rows) =>
      _cacheDao.write(_key(userId, badgeId), rows);

  Future<List<Map<String, dynamic>>> getForBadge(int userId, int badgeId) =>
      _cacheDao.readList(_key(userId, badgeId));
}
