import 'dart:convert';
import 'package:flutter/foundation.dart';
import '../../core/database/database_helper.dart';

class PendingMutation {
  const PendingMutation({
    required this.id,
    required this.mutationKey,
    required this.endpoint,
    required this.method,
    this.jsonBody,
    required this.attempts,
  });

  final int id;
  final String mutationKey;
  final String endpoint;
  final String method;
  final Map<String, dynamic>? jsonBody;
  final int attempts;
}

class PendingMutationDao {
  static const int _maxAttempts = 5;

  Future<void> enqueue({
    required String mutationKey,
    required String endpoint,
    required String method,
    Map<String, dynamic>? body,
  }) async {
    if (kIsWeb) return;
    final db = await DatabaseHelper.instance.database;
    await db.insert('pending_mutations', <String, dynamic>{
      'mutation_key': mutationKey,
      'endpoint': endpoint,
      'method': method,
      'json_body': body != null ? jsonEncode(body) : null,
      'created_at': DateTime.now().millisecondsSinceEpoch,
      'attempts': 0,
    });
  }

  Future<List<PendingMutation>> getAll() async {
    if (kIsWeb) return <PendingMutation>[];
    final db = await DatabaseHelper.instance.database;
    final rows = await db.query(
      'pending_mutations',
      where: 'attempts < ?',
      whereArgs: <int>[_maxAttempts],
      orderBy: 'created_at ASC',
    );
    return rows.map((Map<String, Object?> r) => PendingMutation(
      id: r['id'] as int,
      mutationKey: r['mutation_key'] as String,
      endpoint: r['endpoint'] as String,
      method: r['method'] as String,
      jsonBody: r['json_body'] != null
          ? jsonDecode(r['json_body'] as String) as Map<String, dynamic>
          : null,
      attempts: r['attempts'] as int,
    )).toList();
  }

  Future<void> delete(int id) async {
    if (kIsWeb) return;
    final db = await DatabaseHelper.instance.database;
    await db.delete('pending_mutations', where: 'id = ?', whereArgs: <int>[id]);
  }

  Future<void> incrementAttempts(int id) async {
    if (kIsWeb) return;
    final db = await DatabaseHelper.instance.database;
    await db.rawUpdate(
      'UPDATE pending_mutations SET attempts = attempts + 1 WHERE id = ?',
      <int>[id],
    );
  }

  Future<void> clear() async {
    if (kIsWeb) return;
    final db = await DatabaseHelper.instance.database;
    await db.delete('pending_mutations');
  }
}
