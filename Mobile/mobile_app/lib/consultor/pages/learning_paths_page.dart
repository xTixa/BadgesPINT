import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../shared/app_theme.dart';
import '../consultor_controller.dart';
import '../consultor_models.dart';

class LearningPathsPage extends StatefulWidget {
  const LearningPathsPage({required this.controller, super.key});

  final ConsultorController controller;

  @override
  State<LearningPathsPage> createState() => _LearningPathsPageState();
}

class _LearningPathsPageState extends State<LearningPathsPage> {
  late Future<List<LearningPathItem>> _future;

  @override
  void initState() {
    super.initState();
    _future = widget.controller.repository.getLearningPaths();
  }

  LearningPathProgressItem? _progressFor(int id) {
    for (final item in widget.controller.learningPaths) {
      if (item.id == id) return item;
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Learning Paths')),
      body: FutureBuilder<List<LearningPathItem>>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          final paths = snapshot.data ?? const <LearningPathItem>[];
          if (paths.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Text(
                  'Ainda nao ha learning paths disponiveis.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey.shade600),
                ),
              ),
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
            itemCount: paths.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final path = paths[index];
              final progress = _progressFor(path.id);
              return _LearningPathCard(path: path, progress: progress);
            },
          );
        },
      ),
    );
  }
}

class _LearningPathCard extends StatelessWidget {
  const _LearningPathCard({required this.path, this.progress});

  final LearningPathItem path;
  final LearningPathProgressItem? progress;

  @override
  Widget build(BuildContext context) {
    final value = progress == null
        ? null
        : (progress!.progress / 100).clamp(0.0, 1.0).toDouble();

    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: () => context.push(
        '/learning-paths/${path.id}/service-lines',
        extra: path.name,
      ),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.borderLight),
        ),
        padding: const EdgeInsets.all(16),
        child: Row(
          children: <Widget>[
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.route_rounded, color: AppColors.primary),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(
                    path.name,
                    style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
                  ),
                  if ((path.description ?? '').isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Text(
                        path.description!,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                      ),
                    ),
                  if (value != null) ...<Widget>[
                    const SizedBox(height: 10),
                    LinearProgressIndicator(value: value),
                    const SizedBox(height: 6),
                    Text(
                      '${progress!.obtainedBadges}/${progress!.totalBadges} badges - ${progress!.progress}%',
                      style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(width: 8),
            const Icon(Icons.chevron_right_rounded, color: Colors.grey),
          ],
        ),
      ),
    );
  }
}
