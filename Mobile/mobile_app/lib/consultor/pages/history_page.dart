import 'package:flutter/material.dart';

import '../consultor_models.dart';
import '../consultor_controller.dart';

class HistoryPage extends StatelessWidget {
  const HistoryPage({required this.controller, super.key});

  final ConsultorController controller;

  Future<void> _showBadgeRequirements(
    BuildContext context,
    CatalogBadgeItem badge,
  ) async {
    final requirements = await controller.repository.getRequirementsByBadge(
      badge.id,
    );
    if (!context.mounted) return;

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (BuildContext context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  badge.name,
                  style: Theme.of(
                    context,
                  ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 6),
                Text('Competencias certificadas: ${badge.description}'),
                const SizedBox(height: 12),
                const Text(
                  'Requisitos',
                  style: TextStyle(fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 8),
                if (requirements.isEmpty)
                  const Text('Sem requisitos definidos para este badge.')
                else
                  ...requirements.map((RequirementItem req) {
                    return ListTile(
                      contentPadding: EdgeInsets.zero,
                      title: Text('${req.code} - ${req.title}'),
                      subtitle: Text(req.description),
                    );
                  }),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 90),
      children: <Widget>[
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(22),
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: <Color>[
                scheme.primary.withValues(alpha: 0.9),
                scheme.tertiary.withValues(alpha: 0.85),
              ],
            ),
          ),
          child: Row(
            children: <Widget>[
              const Icon(Icons.timeline_rounded, color: Colors.white),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  'Historico de Badges',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              IconButton.filledTonal(
                tooltip: 'Atualizar estado dos pedidos',
                onPressed: controller.refreshRealtimeData,
                icon: const Icon(Icons.refresh),
              ),
            ],
          ),
        ),
        const SizedBox(height: 8),
        Card(
          child:
              controller.badges.isEmpty
                  ? const Padding(
                    padding: EdgeInsets.all(14),
                    child: Text('Sem badges no historico de momento.'),
                  )
                  : Column(
                    children:
                        controller.badges.asMap().entries.map((entry) {
                          final index = entry.key;
                          final badge = entry.value;

                          return Container(
                            decoration: BoxDecoration(
                              border: Border(
                                bottom:
                                    index == controller.badges.length - 1
                                        ? BorderSide.none
                                        : const BorderSide(
                                          color: Color(0xFFF1F5F9),
                                        ),
                              ),
                            ),
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 12,
                            ),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: <Widget>[
                                Icon(
                                  Icons.workspace_premium,
                                  color: scheme.primary,
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: <Widget>[
                                      Text(
                                        badge.name,
                                        style: const TextStyle(
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        badge.status,
                                        style: TextStyle(
                                          fontWeight: FontWeight.w600,
                                          color:
                                              badge.isObtained
                                                  ? const Color(0xFF059669)
                                                  : const Color(0xFFD97706),
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        '${badge.points} pontos',
                                        style: const TextStyle(
                                          color: Color(0xFF64748B),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: <Widget>[
                                    Text(
                                      badge.isObtained
                                          ? 'Concluido'
                                          : 'Em progresso',
                                      style: const TextStyle(
                                        fontSize: 12,
                                        color: Color(0xFF64748B),
                                      ),
                                    ),
                                    if (badge.isObtained)
                                      TextButton.icon(
                                        onPressed: () async {
                                          final messenger =
                                              ScaffoldMessenger.of(context);
                                          final ok = await controller
                                              .downloadCertificate(badge.id);
                                          if (!context.mounted) return;
                                          messenger.showSnackBar(
                                            SnackBar(
                                              content: Text(
                                                ok
                                                    ? 'Download do certificado iniciado.'
                                                    : 'Nao foi possivel descarregar certificado neste dispositivo.',
                                              ),
                                            ),
                                          );
                                        },
                                        icon: const Icon(
                                          Icons.picture_as_pdf_outlined,
                                          size: 16,
                                        ),
                                        label: const Text('Certificado'),
                                      ),
                                  ],
                                ),
                              ],
                            ),
                          );
                        }).toList(),
                  ),
        ),
        const SizedBox(height: 14),
        Text(
          'Status dos pedidos (tempo real)',
          style: Theme.of(
            context,
          ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 8),
        if (controller.pedidosStatus.isEmpty)
          const Card(
            child: Padding(
              padding: EdgeInsets.all(14),
              child: Text('Sem pedidos ativos de momento.'),
            ),
          )
        else
          ...controller.pedidosStatus.map((PedidoBadgeStatus pedido) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Card(
                child: ListTile(
                  leading: const Icon(Icons.track_changes),
                  title: Text(pedido.badgeName),
                  subtitle: Text('Workflow: ${pedido.workflowStatus}'),
                  trailing: Chip(
                    label: Text(pedido.status),
                    backgroundColor: const Color(0xFFE0F2FE),
                  ),
                ),
              ),
            );
          }),
        const SizedBox(height: 14),
        Text(
          'Catalogo de badges disponiveis',
          style: Theme.of(
            context,
          ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 8),
        LayoutBuilder(
          builder: (BuildContext context, BoxConstraints constraints) {
            final width = constraints.maxWidth;
            final crossAxisCount =
                width >= 900
                    ? 3
                    : width >= 580
                    ? 2
                    : 1;

            return GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: controller.catalogBadges.length,
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: crossAxisCount,
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
                childAspectRatio: 1.15,
              ),
              itemBuilder: (BuildContext context, int index) {
                final badge = controller.catalogBadges[index];
                return InkWell(
                  borderRadius: BorderRadius.circular(16),
                  onTap: () => _showBadgeRequirements(context, badge),
                  child: Ink(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(16),
                      gradient: const LinearGradient(
                        colors: <Color>[Color(0xFFF7FBFF), Color(0xFFEAF3FF)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      border: Border.all(color: const Color(0xFFD1E3F8)),
                      boxShadow: const <BoxShadow>[
                        BoxShadow(
                          color: Color(0x12000000),
                          blurRadius: 8,
                          offset: Offset(0, 3),
                        ),
                      ],
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          Row(
                            children: <Widget>[
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: scheme.primary.withValues(alpha: 0.12),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Icon(
                                  Icons.verified_outlined,
                                  color: scheme.primary,
                                ),
                              ),
                              const Spacer(),
                              Chip(
                                visualDensity: VisualDensity.compact,
                                label: Text('${badge.points} pts'),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          Text(
                            badge.name,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontWeight: FontWeight.w800,
                              fontSize: 15,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Expanded(
                            child: Text(
                              badge.description.isEmpty
                                  ? 'Sem descricao'
                                  : badge.description,
                              maxLines: 3,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(color: Colors.blueGrey.shade700),
                            ),
                          ),
                          const SizedBox(height: 8),
                          Align(
                            alignment: Alignment.centerRight,
                            child: FilledButton.tonalIcon(
                              onPressed:
                                  () => _showBadgeRequirements(context, badge),
                              icon: const Icon(
                                Icons.menu_book_outlined,
                                size: 18,
                              ),
                              label: const Text('Ver requisitos'),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            );
          },
        ),
      ],
    );
  }
}
