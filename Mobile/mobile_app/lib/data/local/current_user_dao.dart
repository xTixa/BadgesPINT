import 'package:flutter/foundation.dart';

import 'json_cache_dao.dart';
import 'local_table_dao.dart';

class CurrentUserDao {
  CurrentUserDao({JsonCacheDao? cacheDao, LocalTableDao? tableDao})
      : _cacheDao = cacheDao ?? JsonCacheDao(),
        _tableDao = tableDao ?? LocalTableDao();

  final JsonCacheDao _cacheDao;
  final LocalTableDao _tableDao;

  String _key(int userId) => 'user_${userId}_profile';

  Future<void> save(int userId, Map<String, dynamic> row) {
    if (kIsWeb) return _cacheDao.write(_key(userId), row);
    return _tableDao.saveMap(
      table: 'users',
      idColumn: 'id',
      id: userId,
      row: row,
    );
  }

  Future<Map<String, dynamic>?> get(int userId) {
    if (kIsWeb) return _cacheDao.readMap(_key(userId));
    return _tableDao.getMap(table: 'users', idColumn: 'id', id: userId);
  }
}
