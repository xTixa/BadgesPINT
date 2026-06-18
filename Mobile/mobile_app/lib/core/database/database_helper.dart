import 'package:path/path.dart' as p;
import 'package:sqflite/sqflite.dart';
import 'package:flutter/foundation.dart';

class DatabaseHelper {
  DatabaseHelper._();

  static final DatabaseHelper instance = DatabaseHelper._();

  Database? _database;

  Future<Database> get database async {
    if (kIsWeb) {
      throw UnsupportedError('sqflite is not available on Flutter Web.');
    }

    final current = _database;
    if (current != null) return current;

    final dbPath = await getDatabasesPath();
    final db = await openDatabase(
      p.join(dbPath, 'badges_pint.db'),
      version: 2,
      onCreate: (Database db, int version) async {
        await _createTables(db);
      },
      onUpgrade: (Database db, int oldVersion, int newVersion) async {
        await _createTables(db);
      },
    );

    _database = db;
    return db;
  }

  Future<void> _createTables(Database db) async {
    await db.execute('''
      CREATE TABLE IF NOT EXISTS cache_records (
        cache_key TEXT PRIMARY KEY,
        json_data TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      )
    ''');

    await db.execute('''
      CREATE TABLE IF NOT EXISTS sync_metadata (
        sync_key TEXT PRIMARY KEY,
        last_synced_at INTEGER NOT NULL,
        status TEXT NOT NULL,
        error_message TEXT
      )
    ''');

    await db.execute('''
      CREATE TABLE IF NOT EXISTS pending_mutations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mutation_key TEXT NOT NULL,
        endpoint TEXT NOT NULL,
        method TEXT NOT NULL,
        json_body TEXT,
        created_at INTEGER NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0
      )
    ''');
  }

  Future<void> clearUserData() async {
    final db = await database;
    await db.delete('cache_records');
    await db.delete('sync_metadata');
    await db.delete('pending_mutations');
  }
}
