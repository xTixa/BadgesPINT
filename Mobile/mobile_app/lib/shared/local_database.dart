import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:sqflite/sqflite.dart';

import '../core/database/database_helper.dart';

class LocalDatabase {
  LocalDatabase._();

  static final LocalDatabase instance = LocalDatabase._();
  static final Map<String, String> _webCache = <String, String>{};

  Future<void> writeJson(String key, Object? value) async {
    if (kIsWeb) {
      _webCache[key] = jsonEncode(value);
      return;
    }

    final db = await DatabaseHelper.instance.database;
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

  Future<dynamic> readJson(String key) async {
    if (kIsWeb) {
      final raw = _webCache[key];
      return raw == null ? null : jsonDecode(raw);
    }

    final db = await DatabaseHelper.instance.database;
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

  Future<void> clearUserData() async {
    if (kIsWeb) {
      _webCache.clear();
      return;
    }

    await DatabaseHelper.instance.clearUserData();
  }
}
