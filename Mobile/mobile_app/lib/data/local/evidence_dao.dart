import 'package:flutter/foundation.dart';

import 'json_cache_dao.dart';
import 'local_table_dao.dart';

class EvidenceDao {
  EvidenceDao({JsonCacheDao? cacheDao, LocalTableDao? tableDao})
      : _cacheDao = cacheDao ?? JsonCacheDao(),
        _tableDao = tableDao ?? LocalTableDao();

  final JsonCacheDao _cacheDao;
  final LocalTableDao _tableDao;

  String _key(int userId, int badgeId) => 'user_${userId}_evidences_$badgeId';

  Future<void> saveForBadge(int userId, int badgeId, List<Map<String, dynamic>> rows) =>
      kIsWeb
          ? _cacheDao.write(_key(userId, badgeId), rows)
          : _tableDao.replaceList(
              table: 'evidences',
              scope: <String, Object?>{
                'user_id': userId,
                'badge_id': badgeId,
              },
              rows: rows,
            );

  Future<List<Map<String, dynamic>>> getForBadge(int userId, int badgeId) =>
      kIsWeb
          ? _cacheDao.readList(_key(userId, badgeId))
          : _tableDao.getList(
              table: 'evidences',
              scope: <String, Object?>{
                'user_id': userId,
                'badge_id': badgeId,
              },
            );
}
