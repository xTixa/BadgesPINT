import 'package:flutter/material.dart';

import '../../shared/app_theme.dart';
import '../consultor_controller.dart';
import '../consultor_models.dart';

class LearningPathServiceLinesPage extends StatefulWidget {
  const LearningPathServiceLinesPage({
    required this.controller,
    required this.learningPathId,
    this.learningPathName,
    super.key,
  });

  final ConsultorController controller;
  final int learningPathId;
  final String? learningPathName;

  @override
  State<LearningPathServiceLinesPage> createState() =>
      _LearningPathServiceLinesPageState();
}

class _LearningPathServiceLinesPageState
    extends State<LearningPathServiceLinesPage> {
  late Future<List<ServiceLineItem>> _future;

  @override
  void initState() {
    super.initState();
    _future = widget.controller.repository.getServiceLinesByLearningPath(
      widget.learningPathId,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.learningPathName ?? 'Service Lines'),
      ),
      body: FutureBuilder<List<ServiceLineItem>>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          final lines = snapshot.data ?? const <ServiceLineItem>[];
          if (lines.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Text(
                  'Sem service lines associadas a este learning path.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey.shade600),
                ),
              ),
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
            itemCount: lines.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final line = lines[index];
              return Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.borderLight),
                ),
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: <Widget>[
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.hub_outlined, color: AppColors.primary),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          Text(
                            line.name,
                            style: const TextStyle(
                                fontWeight: FontWeight.w800, fontSize: 14),
                          ),
                          if ((line.description ?? '').isNotEmpty)
                            Padding(
                              padding: const EdgeInsets.only(top: 4),
                              child: Text(
                                line.description!,
                                maxLines: 3,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                    fontSize: 12, color: Colors.grey.shade600),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          );
        },
      ),
    );
  }
}
