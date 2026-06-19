import 'dart:convert';

import 'package:sqflite/sqflite.dart';

import '../../core/database/database_helper.dart';

class LocalTableDao {
  LocalTableDao({DatabaseHelper? databaseHelper})
      : _databaseHelper = databaseHelper ?? DatabaseHelper.instance;

  final DatabaseHelper _databaseHelper;

  Future<void> saveMap({
    required String table,
    required String idColumn,
    required int id,
    required Map<String, dynamic> row,
  }) async {
    final db = await _databaseHelper.database;
    await db.insert(
      table,
      <String, Object?>{
        idColumn: id,
        'json_data': jsonEncode(row),
        'updated_at': DateTime.now().millisecondsSinceEpoch,
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<Map<String, dynamic>?> getMap({
    required String table,
    required String idColumn,
    required int id,
  }) async {
    final db = await _databaseHelper.database;
    final rows = await db.query(
      table,
      columns: <String>['json_data'],
      where: '$idColumn = ?',
      whereArgs: <Object?>[id],
      limit: 1,
    );
    if (rows.isEmpty) return null;
    return jsonDecode(rows.first['json_data'] as String) as Map<String, dynamic>;
  }

  Future<void> replaceList({
    required String table,
    required Map<String, Object?> scope,
    required List<Map<String, dynamic>> rows,
  }) async {
    final db = await _databaseHelper.database;
    final where = _whereClause(scope.keys);
    final whereArgs = scope.values.toList();
    final now = DateTime.now().millisecondsSinceEpoch;

    await db.transaction((txn) async {
      await txn.delete(
        table,
        where: where,
        whereArgs: where == null ? null : whereArgs,
      );
      for (var i = 0; i < rows.length; i++) {
        await txn.insert(
          table,
          <String, Object?>{
            ...scope,
            'row_order': i,
            'json_data': jsonEncode(rows[i]),
            'updated_at': now,
          },
          conflictAlgorithm: ConflictAlgorithm.replace,
        );
      }
    });
  }

  Future<List<Map<String, dynamic>>> getList({
    required String table,
    required Map<String, Object?> scope,
  }) async {
    final db = await _databaseHelper.database;
    final rows = await db.query(
      table,
      columns: <String>['json_data'],
      where: _whereClause(scope.keys),
      whereArgs: scope.isEmpty ? null : scope.values.toList(),
      orderBy: 'row_order ASC',
    );

    return rows
        .map((row) => jsonDecode(row['json_data'] as String) as Map<String, dynamic>)
        .toList();
  }

  String? _whereClause(Iterable<String> columns) {
    if (columns.isEmpty) return null;
    return columns.map((column) => '$column = ?').join(' AND ');
  }
}
