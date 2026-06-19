import 'package:flutter/foundation.dart';

import 'json_cache_dao.dart';
import 'local_table_dao.dart';

class BadgeDao {
  BadgeDao({JsonCacheDao? cacheDao, LocalTableDao? tableDao})
      : _cacheDao = cacheDao ?? JsonCacheDao(),
        _tableDao = tableDao ?? LocalTableDao();

  final JsonCacheDao _cacheDao;
  final LocalTableDao _tableDao;

  String _userKey(int userId, String key) => 'user_${userId}_$key';

  Future<void> saveMyBadges(int userId, List<Map<String, dynamic>> rows) =>
      _saveUserList(userId, 'my_badges', _userKey(userId, 'my_badges'), rows);

  Future<List<Map<String, dynamic>>> getMyBadges(int userId) =>
      _getUserList(userId, 'my_badges', _userKey(userId, 'my_badges'));

  Future<void> saveProgress(int userId, List<Map<String, dynamic>> rows) =>
      _saveUserList(
        userId,
        'badge_progress',
        _userKey(userId, 'badges_progress'),
        rows,
      );

  Future<List<Map<String, dynamic>>> getProgress(int userId) =>
      _getUserList(userId, 'badge_progress', _userKey(userId, 'badges_progress'));

  Future<void> saveCatalog(int userId, List<Map<String, dynamic>> rows) =>
      _saveUserList(userId, 'catalog_badges', _userKey(userId, 'catalog_badges'), rows);

  Future<List<Map<String, dynamic>>> getCatalog(int userId) =>
      _getUserList(userId, 'catalog_badges', _userKey(userId, 'catalog_badges'));

  Future<void> saveByArea(int areaId, List<Map<String, dynamic>> rows) =>
      kIsWeb
          ? _cacheDao.write('badges_by_area_$areaId', rows)
          : _tableDao.replaceList(
              table: 'badges_by_area',
              scope: <String, Object?>{'area_id': areaId},
              rows: rows,
            );

  Future<List<Map<String, dynamic>>> getByArea(int areaId) =>
      kIsWeb
          ? _cacheDao.readList('badges_by_area_$areaId')
          : _tableDao.getList(
              table: 'badges_by_area',
              scope: <String, Object?>{'area_id': areaId},
            );

  Future<void> _saveUserList(
    int userId,
    String table,
    String cacheKey,
    List<Map<String, dynamic>> rows,
  ) {
    if (kIsWeb) return _cacheDao.write(cacheKey, rows);
    return _tableDao.replaceList(
      table: table,
      scope: <String, Object?>{'user_id': userId},
      rows: rows,
    );
  }

  Future<List<Map<String, dynamic>>> _getUserList(
    int userId,
    String table,
    String cacheKey,
  ) {
    if (kIsWeb) return _cacheDao.readList(cacheKey);
    return _tableDao.getList(
      table: table,
      scope: <String, Object?>{'user_id': userId},
    );
  }
}
