import 'json_cache_dao.dart';

class ApplicationDao {
  ApplicationDao({JsonCacheDao? cacheDao}) : _cacheDao = cacheDao ?? JsonCacheDao();

  final JsonCacheDao _cacheDao;

  String _key(int userId) => 'user_${userId}_pedidos_status';

  Future<void> saveAll(int userId, List<Map<String, dynamic>> rows) =>
      _cacheDao.write(_key(userId), rows);

  Future<List<Map<String, dynamic>>> getAll(int userId) => _cacheDao.readList(_key(userId));
}
