import 'package:flutter/material.dart';

import '../consultor_controller.dart';
import '../consultor_models.dart';

class PedidosPage extends StatelessWidget {
  const PedidosPage({required this.controller, super.key});

  final ConsultorController controller;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Pedidos de Badges')),
      body: AnimatedBuilder(
        animation: controller,
        builder: (context, _) {
          final pedidos = controller.pedidosStatus;

          if (pedidos.isEmpty) {
            return const Center(
              child: Padding(
                padding: EdgeInsets.all(24),
                child: Text(
                  'Ainda nao existem pedidos ativos. Candidata-te a um badge no catalogo.',
                  textAlign: TextAlign.center,
                ),
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: controller.refreshRealtimeData,
            child: ListView.separated(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 100),
              itemCount: pedidos.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder:
                  (context, index) => _PedidoCard(pedido: pedidos[index]),
            ),
          );
        },
      ),
    );
  }
}

class _PedidoCard extends StatelessWidget {
  const _PedidoCard({required this.pedido});

  final PedidoBadgeStatus pedido;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final progress = _progressForStatus(pedido.workflowStatus, pedido.status);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  backgroundColor: scheme.primary.withValues(alpha: 0.12),
                  child: Icon(Icons.track_changes, color: scheme.primary),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        pedido.badgeName,
                        style: const TextStyle(fontWeight: FontWeight.w800),
                      ),
                      Text(
                        pedido.submittedAt ?? 'Submetido recentemente',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
                _StatusChip(text: pedido.status),
              ],
            ),
            const SizedBox(height: 14),
            LinearProgressIndicator(value: progress),
            const SizedBox(height: 10),
            Text(
              _labelForStatus(pedido.workflowStatus, pedido.status),
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 4),
            Text(
              'Atualiza automaticamente e tambem podes puxar para atualizar.',
              style: TextStyle(color: scheme.onSurfaceVariant, fontSize: 12),
            ),
            const SizedBox(height: 16),
            _TimelineStep(
              title: 'Candidatura criada',
              value: pedido.createdAt,
              active: true,
              done: true,
            ),
            _TimelineStep(
              title: 'Submetido',
              value: pedido.submittedAt,
              active: pedido.submittedAt != null,
              done: pedido.submittedAt != null,
            ),
            _TimelineStep(
              title: 'Validacao Talent Manager',
              value: pedido.tmValidatedAt,
              comment: pedido.tmComment,
              active:
                  pedido.workflowStatus == 'em_validacao' ||
                  pedido.tmValidatedAt != null,
              done: pedido.tmValidatedAt != null,
            ),
            _TimelineStep(
              title: 'Validacao Service Line',
              value: pedido.slValidatedAt,
              comment: pedido.slComment,
              active:
                  pedido.workflowStatus == 'fechado' ||
                  pedido.slValidatedAt != null,
              done: pedido.slValidatedAt != null,
              isLast: pedido.awardedAt == null,
            ),
            if (pedido.awardedAt != null)
              _TimelineStep(
                title: 'Badge atribuido',
                value: pedido.awardedAt,
                active: true,
                done: true,
                isLast: true,
              ),
          ],
        ),
      ),
    );
  }

  double _progressForStatus(String workflowStatus, String status) {
    final normalized = '${workflowStatus.toLowerCase()} ${status.toLowerCase()}';
    if (normalized.contains('rejeit')) return 1;
    if (normalized.contains('obtido') || normalized.contains('aprov')) return 1;
    if (normalized.contains('validacao')) return 0.66;
    if (normalized.contains('submet')) return 0.33;
    return 0.2;
  }

  String _labelForStatus(String workflowStatus, String status) {
    final normalized = '${workflowStatus.toLowerCase()} ${status.toLowerCase()}';
    if (normalized.contains('rejeit')) return 'Pedido rejeitado';
    if (normalized.contains('obtido') || normalized.contains('aprov')) {
      return 'Badge aprovado';
    }
    if (normalized.contains('validacao')) return 'Em validacao';
    if (normalized.contains('submet')) return 'Submetido';
    return workflowStatus.isEmpty ? status : workflowStatus;
  }
}

class _TimelineStep extends StatelessWidget {
  const _TimelineStep({
    required this.title,
    this.value,
    this.comment,
    required this.active,
    required this.done,
    this.isLast = false,
  });

  final String title;
  final String? value;
  final String? comment;
  final bool active;
  final bool done;
  final bool isLast;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final color =
        done
            ? const Color(0xFF16A34A)
            : active
            ? scheme.primary
            : scheme.outline;

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            children: [
              CircleAvatar(
                radius: 10,
                backgroundColor: color,
                child:
                    done
                        ? const Icon(Icons.check, size: 12, color: Colors.white)
                        : null,
              ),
              if (!isLast)
                Expanded(
                  child: Container(
                    width: 2,
                    color: color.withValues(alpha: 0.35),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(fontWeight: FontWeight.w700),
                  ),
                  Text(
                    value == null ? 'Pendente' : _formatDate(value!),
                    style: TextStyle(
                      fontSize: 12,
                      color: scheme.onSurfaceVariant,
                    ),
                  ),
                  if (comment != null && comment!.trim().isNotEmpty) ...[
                    const SizedBox(height: 6),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: scheme.surfaceContainerHighest.withValues(
                          alpha: 0.45,
                        ),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(comment!),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  static String _formatDate(String raw) {
    final parsed = DateTime.tryParse(raw);
    if (parsed == null) return raw;
    return '${parsed.day.toString().padLeft(2, '0')}/${parsed.month.toString().padLeft(2, '0')}/${parsed.year} ${parsed.hour.toString().padLeft(2, '0')}:${parsed.minute.toString().padLeft(2, '0')}';
  }
}

class _StatusChip extends StatelessWidget {
  const _StatusChip({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Chip(
      label: Text(text.isEmpty ? 'Pendente' : text),
      visualDensity: VisualDensity.compact,
    );
  }
}
