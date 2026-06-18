import 'json_cache_dao.dart';

class CurrentUserDao {
  CurrentUserDao({JsonCacheDao? cacheDao}) : _cacheDao = cacheDao ?? JsonCacheDao();

  final JsonCacheDao _cacheDao;

  String _key(int userId) => 'user_${userId}_profile';

  Future<void> save(int userId, Map<String, dynamic> row) => _cacheDao.write(_key(userId), row);

  Future<Map<String, dynamic>?> get(int userId) => _cacheDao.readMap(_key(userId));
}
