import 'package:flutter/foundation.dart';

import 'json_cache_dao.dart';
import 'local_table_dao.dart';

class RequirementDao {
  RequirementDao({JsonCacheDao? cacheDao, LocalTableDao? tableDao})
      : _cacheDao = cacheDao ?? JsonCacheDao(),
        _tableDao = tableDao ?? LocalTableDao();

  final JsonCacheDao _cacheDao;
  final LocalTableDao _tableDao;

  Future<void> saveForBadge(int badgeId, List<Map<String, dynamic>> rows) =>
      kIsWeb
          ? _cacheDao.write('requirements_$badgeId', rows)
          : _tableDao.replaceList(
              table: 'requirements',
              scope: <String, Object?>{'badge_id': badgeId},
              rows: rows,
            );

  Future<List<Map<String, dynamic>>> getForBadge(int badgeId) =>
      kIsWeb
          ? _cacheDao.readList('requirements_$badgeId')
          : _tableDao.getList(
              table: 'requirements',
              scope: <String, Object?>{'badge_id': badgeId},
            );
}
