import 'package:flutter/foundation.dart';

import 'json_cache_dao.dart';
import 'local_table_dao.dart';

class ApplicationDao {
  ApplicationDao({JsonCacheDao? cacheDao, LocalTableDao? tableDao})
      : _cacheDao = cacheDao ?? JsonCacheDao(),
        _tableDao = tableDao ?? LocalTableDao();

  final JsonCacheDao _cacheDao;
  final LocalTableDao _tableDao;

  String _key(int userId) => 'user_${userId}_pedidos_status';

  Future<void> saveAll(int userId, List<Map<String, dynamic>> rows) =>
      kIsWeb
          ? _cacheDao.write(_key(userId), rows)
          : _tableDao.replaceList(
              table: 'applications',
              scope: <String, Object?>{'user_id': userId},
              rows: rows,
            );

  Future<List<Map<String, dynamic>>> getAll(int userId) =>
      kIsWeb
          ? _cacheDao.readList(_key(userId))
          : _tableDao.getList(
              table: 'applications',
              scope: <String, Object?>{'user_id': userId},
            );
}
