import 'package:flutter/material.dart';

import '../../data/models/consultor_models.dart';
import '../controllers/consultor_controller.dart';

class UploadPage extends StatelessWidget {
  const UploadPage({required this.controller, super.key});

  final ConsultorController controller;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 90),
      children: <Widget>[
        DropdownButtonFormField<int>(
          value: controller.selectedBadgeId,
          hint: const Text('Selecionar badge'),
          items: controller.badges
              .map((BadgeItem badge) => DropdownMenuItem<int>(
                    value: badge.id,
                    child: Text(badge.name),
                  ))
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
            onPressed: controller.selectedBadgeId == null
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
                latestEvidence: controller.latestEvidenceForRequirement(requirement.id),
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
          const Text('Este badge nao tem requisitos definidos.'),
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
  State<RequirementEvidenceTile> createState() => _RequirementEvidenceTileState();
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
    final evidence = widget.latestEvidence;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Text(
              '${widget.requirement.title} (${widget.requirement.code})',
              style: const TextStyle(fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 6),
            Text(widget.requirement.description),
            if (evidence != null)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Text(
                  'Estado atual: ${evidence.status}',
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
              ),
            const SizedBox(height: 10),
            TextField(
              controller: _urlController,
              decoration: const InputDecoration(
                labelText: 'URL da evidencia',
              ),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _notesController,
              decoration: const InputDecoration(
                labelText: 'Notas',
              ),
            ),
            const SizedBox(height: 10),
            Align(
              alignment: Alignment.centerRight,
              child: FilledButton(
                onPressed: _submitting
                    ? null
                    : () async {
                        final messenger = ScaffoldMessenger.of(context);
                        final url = _urlController.text.trim();
                        if (url.isEmpty) {
                          messenger.showSnackBar(
                            const SnackBar(content: Text('Insere a URL da evidencia.')),
                          );
                          return;
                        }

                        setState(() => _submitting = true);
                        final success = await widget.onSubmit(url, _notesController.text.trim());
                        if (!mounted) return;
                        setState(() => _submitting = false);

                        messenger.showSnackBar(
                          SnackBar(
                            content: Text(
                              success ? 'Evidencia enviada.' : 'Falha ao enviar evidencia.',
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
