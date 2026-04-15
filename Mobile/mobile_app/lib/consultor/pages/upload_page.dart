import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../consultor_models.dart';
import '../consultor_controller.dart';

class UploadPage extends StatelessWidget {
  const UploadPage({required this.controller, super.key});

  final ConsultorController controller;

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
              const Icon(Icons.cloud_upload_rounded, color: Colors.white),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  'Upload de Evidencias',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 8),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: <Widget>[
                Icon(Icons.info_outline_rounded, color: scheme.primary),
                const SizedBox(width: 10),
                const Expanded(
                  child: Text(
                    'Seleciona um badge e submete evidencias para cada requisito.',
                    style: TextStyle(fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 10),
        DropdownButtonFormField<int>(
          value: controller.selectedBadgeId,
          hint: const Text('Selecionar badge'),
          items:
              controller.badges
                  .map(
                    (BadgeItem badge) => DropdownMenuItem<int>(
                      value: badge.id,
                      child: Text(badge.name),
                    ),
                  )
                  .toList(),
          onChanged: (int? badgeId) {
            if (badgeId != null) {
              controller.selectBadge(badgeId);
            }
          },
        ),
        const SizedBox(height: 10),
        Align(
          alignment: Alignment.centerRight,
          child: FilledButton.tonal(
            onPressed:
                controller.selectedBadgeId == null
                    ? null
                    : () async {
                      final success = await controller.submitPedido();
                      if (!context.mounted) return;
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            success
                                ? 'Pedido submetido com sucesso.'
                                : 'Nao foi possivel submeter o pedido.',
                          ),
                        ),
                      );
                    },
            child: const Text('Submeter candidatura'),
          ),
        ),
        const SizedBox(height: 10),
        if (controller.uploadLoading)
          const Center(child: CircularProgressIndicator())
        else
          ...controller.requirements.map(
            (RequirementItem requirement) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: RequirementEvidenceTile(
                requirement: requirement,
                latestEvidence: controller.latestEvidenceForRequirement(
                  requirement.id,
                ),
                onSubmit: (String url, String notes) {
                  return controller.submitEvidence(
                    requirementId: requirement.id,
                    evidenceUrl: url,
                    notes: notes,
                  );
                },
              ),
            ),
          ),
        if (!controller.uploadLoading && controller.requirements.isEmpty)
          const Card(
            child: Padding(
              padding: EdgeInsets.all(12),
              child: Text('Este badge nao tem requisitos definidos.'),
            ),
          ),
      ],
    );
  }
}

class RequirementEvidenceTile extends StatefulWidget {
  const RequirementEvidenceTile({
    required this.requirement,
    required this.latestEvidence,
    required this.onSubmit,
    super.key,
  });

  final RequirementItem requirement;
  final EvidenceItem? latestEvidence;
  final Future<bool> Function(String url, String notes) onSubmit;

  @override
  State<RequirementEvidenceTile> createState() =>
      _RequirementEvidenceTileState();
}

class _RequirementEvidenceTileState extends State<RequirementEvidenceTile> {
  final TextEditingController _urlController = TextEditingController();
  final TextEditingController _notesController = TextEditingController();
  bool _submitting = false;

  @override
  void dispose() {
    _urlController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final evidence = widget.latestEvidence;
    final status = evidence?.status.toLowerCase();
    final statusColor =
        status == 'aprovado'
            ? const Color(0xFF065F46)
            : status == 'rejeitado'
            ? const Color(0xFFB91C1C)
            : const Color(0xFF92400E);
    final statusBg =
        status == 'aprovado'
            ? const Color(0xFFD1FAE5)
            : status == 'rejeitado'
            ? const Color(0xFFFEE2E2)
            : const Color(0xFFFEF3C7);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: scheme.primary.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text(
                          widget.requirement.code,
                          style: TextStyle(
                            fontWeight: FontWeight.w700,
                            color: scheme.primary,
                            fontSize: 12,
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        widget.requirement.title,
                        style: const TextStyle(fontWeight: FontWeight.w700),
                      ),
                      const SizedBox(height: 6),
                      Text(widget.requirement.description),
                    ],
                  ),
                ),
                if (widget.requirement.imageUrl != null)
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.network(
                      widget.requirement.imageUrl!,
                      width: 56,
                      height: 56,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => const SizedBox.shrink(),
                    ),
                  ),
              ],
            ),
            if (evidence != null)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: <Widget>[
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 5,
                      ),
                      decoration: BoxDecoration(
                        color: statusBg,
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        evidence.status,
                        style: TextStyle(
                          fontWeight: FontWeight.w700,
                          color: statusColor,
                        ),
                      ),
                    ),
                    GestureDetector(
                      onTap: () {
                        Clipboard.setData(
                          ClipboardData(text: evidence.evidenceUrl),
                        );
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('URL da ultima evidencia copiado.'),
                          ),
                        );
                      },
                      child: const Text(
                        'Ultima evidencia: ver',
                        style: TextStyle(
                          color: Color(0xFF0369A1),
                          decoration: TextDecoration.underline,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 10),
            TextField(
              controller: _urlController,
              decoration: const InputDecoration(labelText: 'URL da evidencia'),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _notesController,
              decoration: const InputDecoration(labelText: 'Notas (opcional)'),
            ),
            const SizedBox(height: 10),
            Align(
              alignment: Alignment.centerRight,
              child: FilledButton(
                onPressed:
                    _submitting
                        ? null
                        : () async {
                          final messenger = ScaffoldMessenger.of(context);
                          final url = _urlController.text.trim();
                          if (url.isEmpty) {
                            messenger.showSnackBar(
                              const SnackBar(
                                content: Text('Insere a URL da evidencia.'),
                              ),
                            );
                            return;
                          }

                          setState(() => _submitting = true);
                          final success = await widget.onSubmit(
                            url,
                            _notesController.text.trim(),
                          );
                          if (!mounted) return;
                          setState(() => _submitting = false);

                          messenger.showSnackBar(
                            SnackBar(
                              content: Text(
                                success
                                    ? 'Evidencia enviada.'
                                    : 'Falha ao enviar evidencia.',
                              ),
                            ),
                          );

                          if (success) {
                            _urlController.clear();
                            _notesController.clear();
                          }
                        },
                child: Text(_submitting ? 'A enviar...' : 'Submeter evidencia'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
