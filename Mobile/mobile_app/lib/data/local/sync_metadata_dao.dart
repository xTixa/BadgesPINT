import 'package:flutter/foundation.dart';
import 'package:sqflite/sqflite.dart';

import '../../core/database/database_helper.dart';

class SyncMetadataDao {
  SyncMetadataDao({DatabaseHelper? databaseHelper})
      : _databaseHelper = databaseHelper ?? DatabaseHelper.instance;

  final DatabaseHelper _databaseHelper;
  static final Map<String, Map<String, Object?>> _webMetadata =
      <String, Map<String, Object?>>{};

  Future<void> markSuccess(String key) async {
    if (kIsWeb) {
      _webMetadata[key] = <String, Object?>{
        'sync_key': key,
        'last_synced_at': DateTime.now().millisecondsSinceEpoch,
        'status': 'success',
        'error_message': null,
      };
      return;
    }

    final db = await _databaseHelper.database;
    await db.insert(
      'sync_metadata',
      <String, Object?>{
        'sync_key': key,
        'last_synced_at': DateTime.now().millisecondsSinceEpoch,
        'status': 'success',
        'error_message': null,
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<void> markError(String key, Object error) async {
    if (kIsWeb) {
      _webMetadata[key] = <String, Object?>{
        'sync_key': key,
        'last_synced_at': DateTime.now().millisecondsSinceEpoch,
        'status': 'error',
        'error_message': error.toString(),
      };
      return;
    }

    final db = await _databaseHelper.database;
    await db.insert(
      'sync_metadata',
      <String, Object?>{
        'sync_key': key,
        'last_synced_at': DateTime.now().millisecondsSinceEpoch,
        'status': 'error',
        'error_message': error.toString(),
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }
}
