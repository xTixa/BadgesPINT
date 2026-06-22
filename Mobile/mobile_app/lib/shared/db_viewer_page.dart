import 'package:flutter/material.dart';

import '../core/database/database_helper.dart';

class DbViewerPage extends StatefulWidget {
  const DbViewerPage({super.key});

  @override
  State<DbViewerPage> createState() => _DbViewerPageState();
}

class _DbViewerPageState extends State<DbViewerPage> {
  List<String> _tables = <String>[];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadTables();
  }

  Future<void> _loadTables() async {
    final db = await DatabaseHelper.instance.database;
    final rows = await db.rawQuery(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
    );
    setState(() {
      _tables = rows.map((r) => r['name'] as String).toList();
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Base de Dados')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView.separated(
              itemCount: _tables.length,
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemBuilder: (context, i) {
                final table = _tables[i];
                return ListTile(
                  leading: const Icon(Icons.table_chart_outlined),
                  title: Text(table),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute<void>(
                      builder: (_) => _TableContentPage(tableName: table),
                    ),
                  ),
                );
              },
            ),
    );
  }
}

class _TableContentPage extends StatefulWidget {
  const _TableContentPage({required this.tableName});

  final String tableName;

  @override
  State<_TableContentPage> createState() => _TableContentPageState();
}

class _TableContentPageState extends State<_TableContentPage> {
  List<Map<String, Object?>> _rows = <Map<String, Object?>>[];
  List<String> _columns = <String>[];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final db = await DatabaseHelper.instance.database;
    final rows = await db.query(widget.tableName, limit: 200);
    setState(() {
      _rows = rows;
      _columns = rows.isNotEmpty ? rows.first.keys.toList() : <String>[];
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.tableName),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: Center(
              child: Text(
                '${_rows.length} registos',
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ),
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _rows.isEmpty
          ? const Center(child: Text('Tabela vazia'))
          : ListView.separated(
              itemCount: _rows.length,
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemBuilder: (context, i) {
                final row = _rows[i];
                return ListTile(
                  title: Text(
                    _columns.isNotEmpty ? '${row[_columns.first]}' : '#$i',
                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                  ),
                  subtitle: Text(
                    _columns.skip(1).map((c) => '$c: ${row[c]}').join('\n'),
                    style: const TextStyle(fontSize: 11),
                  ),
                  isThreeLine: _columns.length > 2,
                  onTap: () => _showDetail(context, row),
                );
              },
            ),
    );
  }

  void _showDetail(BuildContext context, Map<String, Object?> row) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (_) => DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.6,
        maxChildSize: 0.95,
        builder: (_, controller) => ListView(
          controller: controller,
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
          children: <Widget>[
            Center(
              child: Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            ...row.entries.map(
              (e) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 6),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      e.key,
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: Colors.grey,
                      ),
                    ),
                    const SizedBox(height: 2),
                    SelectableText(
                      '${e.value ?? 'null'}',
                      style: const TextStyle(fontSize: 13),
                    ),
                    const Divider(height: 16),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
