import 'json_cache_dao.dart';

class AreaDao {
  AreaDao({JsonCacheDao? cacheDao}) : _cacheDao = cacheDao ?? JsonCacheDao();

  final JsonCacheDao _cacheDao;

  Future<void> saveAll(List<Map<String, dynamic>> rows) => _cacheDao.write('areas', rows);

  Future<List<Map<String, dynamic>>> getAll() => _cacheDao.readList('areas');
}
