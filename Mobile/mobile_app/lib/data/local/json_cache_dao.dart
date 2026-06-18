import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:sqflite/sqflite.dart';

import '../../core/database/database_helper.dart';

class JsonCacheDao {
  JsonCacheDao({DatabaseHelper? databaseHelper})
      : _databaseHelper = databaseHelper ?? DatabaseHelper.instance;

  final DatabaseHelper _databaseHelper;
  static final Map<String, String> _webCache = <String, String>{};

  Future<void> write(String key, Object? value) async {
    if (kIsWeb) {
      _webCache[key] = jsonEncode(value);
      return;
    }

    final db = await _databaseHelper.database;
    await db.insert(
      'cache_records',
      <String, Object?>{
        'cache_key': key,
        'json_data': jsonEncode(value),
        'updated_at': DateTime.now().millisecondsSinceEpoch,
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<dynamic> read(String key) async {
    if (kIsWeb) {
      final raw = _webCache[key];
      return raw == null ? null : jsonDecode(raw);
    }

    final db = await _databaseHelper.database;
    final rows = await db.query(
      'cache_records',
      columns: <String>['json_data'],
      where: 'cache_key = ?',
      whereArgs: <Object?>[key],
      limit: 1,
    );

    if (rows.isEmpty) return null;
    return jsonDecode(rows.first['json_data'] as String);
  }

  Future<List<Map<String, dynamic>>> readList(String key) async {
    final payload = await read(key);
    if (payload is List) return payload.whereType<Map<String, dynamic>>().toList();
    return <Map<String, dynamic>>[];
  }

  Future<Map<String, dynamic>?> readMap(String key) async {
    final payload = await read(key);
    return payload is Map<String, dynamic> ? payload : null;
  }
}
