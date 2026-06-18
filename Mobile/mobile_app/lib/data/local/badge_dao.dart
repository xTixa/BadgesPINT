import 'json_cache_dao.dart';

class BadgeDao {
  BadgeDao({JsonCacheDao? cacheDao}) : _cacheDao = cacheDao ?? JsonCacheDao();

  final JsonCacheDao _cacheDao;

  String _userKey(int userId, String key) => 'user_${userId}_$key';

  Future<void> saveMyBadges(int userId, List<Map<String, dynamic>> rows) =>
      _cacheDao.write(_userKey(userId, 'my_badges'), rows);

  Future<List<Map<String, dynamic>>> getMyBadges(int userId) =>
      _cacheDao.readList(_userKey(userId, 'my_badges'));

  Future<void> saveProgress(int userId, List<Map<String, dynamic>> rows) =>
      _cacheDao.write(_userKey(userId, 'badges_progress'), rows);

  Future<List<Map<String, dynamic>>> getProgress(int userId) =>
      _cacheDao.readList(_userKey(userId, 'badges_progress'));

  Future<void> saveCatalog(int userId, List<Map<String, dynamic>> rows) =>
      _cacheDao.write(_userKey(userId, 'catalog_badges'), rows);

  Future<List<Map<String, dynamic>>> getCatalog(int userId) =>
      _cacheDao.readList(_userKey(userId, 'catalog_badges'));

  Future<void> saveByArea(int areaId, List<Map<String, dynamic>> rows) =>
      _cacheDao.write('badges_by_area_$areaId', rows);

  Future<List<Map<String, dynamic>>> getByArea(int areaId) =>
      _cacheDao.readList('badges_by_area_$areaId');
}
