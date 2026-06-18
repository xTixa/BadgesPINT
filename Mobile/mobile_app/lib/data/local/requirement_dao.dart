import 'json_cache_dao.dart';

class RequirementDao {
  RequirementDao({JsonCacheDao? cacheDao}) : _cacheDao = cacheDao ?? JsonCacheDao();

  final JsonCacheDao _cacheDao;

  Future<void> saveForBadge(int badgeId, List<Map<String, dynamic>> rows) =>
      _cacheDao.write('requirements_$badgeId', rows);

  Future<List<Map<String, dynamic>>> getForBadge(int badgeId) =>
      _cacheDao.readList('requirements_$badgeId');
}
