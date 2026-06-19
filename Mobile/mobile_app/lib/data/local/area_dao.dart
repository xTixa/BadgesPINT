import 'package:flutter/foundation.dart';

import 'json_cache_dao.dart';
import 'local_table_dao.dart';

class AreaDao {
  AreaDao({JsonCacheDao? cacheDao, LocalTableDao? tableDao})
      : _cacheDao = cacheDao ?? JsonCacheDao(),
        _tableDao = tableDao ?? LocalTableDao();

  final JsonCacheDao _cacheDao;
  final LocalTableDao _tableDao;

  Future<void> saveAll(List<Map<String, dynamic>> rows) {
    if (kIsWeb) return _cacheDao.write('areas', rows);
    return _tableDao.replaceList(
      table: 'areas',
      scope: const <String, Object?>{},
      rows: rows,
    );
  }

  Future<List<Map<String, dynamic>>> getAll() {
    if (kIsWeb) return _cacheDao.readList('areas');
    return _tableDao.getList(
      table: 'areas',
      scope: const <String, Object?>{},
    );
  }
}
