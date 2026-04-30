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
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 100),
      children: <Widget>[
        // Header
        _buildHeader(context, scheme),
        const SizedBox(height: 12),

        // Info card
        _buildInfoCard(context, scheme),
        const SizedBox(height: 14),

        // Badge selector
        _buildBadgeSelector(context, scheme),
        const SizedBox(height: 14),

        // Submit button
        if (controller.selectedBadgeId != null) ...<Widget>[
          _buildSubmitButton(context),
          const SizedBox(height: 14),
        ],

        // Requirements
        if (controller.uploadLoading)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 40),
            child: Center(child: CircularProgressIndicator()),
          )
        else if (controller.requirements.isEmpty &&
            controller.selectedBadgeId != null)
          _buildNoRequirements(context, scheme)
        else
          ...controller.requirements.map(
            (RequirementItem req) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: RequirementEvidenceTile(
                requirement: req,
                latestEvidence:
                    controller.latestEvidenceForRequirement(req.id),
                onSubmit: (String url, String notes) =>
                    controller.submitEvidence(
                  requirementId: req.id,
                  evidenceUrl: url,
                  notes: notes,
                ),
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildHeader(BuildContext context, ColorScheme scheme) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(22),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: <Color>[
            scheme.primary.withOpacity(0.92),
            scheme.tertiary.withOpacity(0.85),
          ],
        ),
        boxShadow: <BoxShadow>[
          BoxShadow(
            color: scheme.primary.withOpacity(0.25),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        children: <Widget>[
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Icon(Icons.cloud_upload_rounded,
                color: Colors.white, size: 26),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  'Submeter Evidências',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w900,
                        letterSpacing: -0.3,
                      ),
                ),
                Text(
                  'Candidata-te a badges com as tuas provas',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.8),
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoCard(BuildContext context, ColorScheme scheme) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(14),
        color: scheme.primary.withOpacity(0.08),
        border: Border.all(color: scheme.primary.withOpacity(0.2)),
      ),
      child: Row(
        children: <Widget>[
          Icon(Icons.info_outline_rounded, color: scheme.primary, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              'Seleciona um badge e submete evidências para cada requisito.',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 13,
                color: scheme.primary,
                height: 1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBadgeSelector(BuildContext context, ColorScheme scheme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Text(
          'Badge a candidatar',
          style: Theme.of(context).textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.w800,
              ),
        ),
        const SizedBox(height: 8),
        DropdownButtonFormField<int>(
          value: controller.selectedBadgeId,
          hint: const Text('Selecionar badge...'),
          decoration: InputDecoration(
            prefixIcon: const Icon(Icons.workspace_premium_rounded),
            border:
                OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
          ),
          items: controller.badges
              .map(
                (BadgeItem badge) => DropdownMenuItem<int>(
                  value: badge.id,
                  child: Text(
                    badge.name,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              )
              .toList(),
          onChanged: (int? badgeId) {
            if (badgeId != null) controller.selectBadge(badgeId);
          },
        ),
      ],
    );
  }

  Widget _buildSubmitButton(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: FilledButton.icon(
        onPressed: () async {
          final success = await controller.submitPedido();
          if (!context.mounted) return;
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                success
                    ? 'Pedido submetido com sucesso.'
                    : 'Não foi possível submeter o pedido.',
              ),
            ),
          );
        },
        icon: const Icon(Icons.send_rounded, size: 18),
        label: const Text('Submeter candidatura'),
        style: FilledButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 15),
        ),
      ),
    );
  }

  Widget _buildNoRequirements(BuildContext context, ColorScheme scheme) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: scheme.outlineVariant),
        color: scheme.surfaceContainer.withOpacity(0.5),
      ),
      child: Center(
        child: Text(
          'Este badge não tem requisitos definidos.',
          style: TextStyle(color: scheme.onSurfaceVariant),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// RequirementEvidenceTile — cleaned up & mobile-friendly
// ---------------------------------------------------------------------------
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
  bool _expanded = true; // default: expanded

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

    final Color statusColor;
    final Color statusBg;
    final IconData statusIcon;

    if (status == 'aprovado') {
      statusColor = const Color(0xFF065F46);
      statusBg = const Color(0xFFD1FAE5);
      statusIcon = Icons.check_circle_rounded;
    } else if (status == 'rejeitado') {
      statusColor = const Color(0xFFB91C1C);
      statusBg = const Color(0xFFFEE2E2);
      statusIcon = Icons.cancel_rounded;
    } else {
      statusColor = const Color(0xFF92400E);
      statusBg = const Color(0xFFFEF3C7);
      statusIcon = Icons.hourglass_top_rounded;
    }

    return Card(
      clipBehavior: Clip.hardEdge,
      child: Column(
        children: <Widget>[
          // Header — always visible
          InkWell(
            onTap: () => setState(() => _expanded = !_expanded),
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  // Code chip
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: scheme.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      widget.requirement.code,
                      style: TextStyle(
                        fontWeight: FontWeight.w800,
                        color: scheme.primary,
                        fontSize: 11,
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      widget.requirement.title,
                      style: const TextStyle(
                          fontWeight: FontWeight.w700, fontSize: 14),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 8),
                  // Status badge (if any)
                  if (evidence != null)
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: statusBg,
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: <Widget>[
                          Icon(statusIcon, size: 12, color: statusColor),
                          const SizedBox(width: 4),
                          Text(
                            evidence.status,
                            style: TextStyle(
                              fontWeight: FontWeight.w700,
                              color: statusColor,
                              fontSize: 11,
                            ),
                          ),
                        ],
                      ),
                    ),
                  const SizedBox(width: 6),
                  Icon(
                    _expanded
                        ? Icons.keyboard_arrow_up_rounded
                        : Icons.keyboard_arrow_down_rounded,
                    color: scheme.onSurfaceVariant,
                    size: 20,
                  ),
                ],
              ),
            ),
          ),

          // Expandable body
          AnimatedSize(
            duration: const Duration(milliseconds: 200),
            curve: Curves.easeInOut,
            child: _expanded
                ? Padding(
                    padding:
                        const EdgeInsets.fromLTRB(14, 0, 14, 14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        // Description
                        Text(
                          widget.requirement.description,
                          style: TextStyle(
                            fontSize: 13,
                            color: scheme.onSurfaceVariant,
                            height: 1.5,
                          ),
                        ),

                        // Image
                        if (widget.requirement.imageUrl != null) ...<Widget>[
                          const SizedBox(height: 10),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(10),
                            child: Image.network(
                              widget.requirement.imageUrl!,
                              height: 120,
                              width: double.infinity,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) =>
                                  const SizedBox.shrink(),
                            ),
                          ),
                        ],

                        // Latest evidence link
                        if (evidence != null) ...<Widget>[
                          const SizedBox(height: 10),
                          GestureDetector(
                            onTap: () {
                              Clipboard.setData(
                                ClipboardData(
                                    text: evidence.evidenceUrl),
                              );
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text(
                                      'URL da evidência copiado.'),
                                ),
                              );
                            },
                            child: Row(
                              children: <Widget>[
                                Icon(Icons.link_rounded,
                                    size: 14, color: scheme.primary),
                                const SizedBox(width: 6),
                                Text(
                                  'Ver última evidência',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: scheme.primary,
                                    fontWeight: FontWeight.w600,
                                    decoration: TextDecoration.underline,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],

                        const SizedBox(height: 14),
                        const Divider(height: 1),
                        const SizedBox(height: 14),

                        // URL field
                        TextField(
                          controller: _urlController,
                          keyboardType: TextInputType.url,
                          decoration: const InputDecoration(
                            labelText: 'URL da evidência *',
                            prefixIcon: Icon(Icons.link_rounded, size: 20),
                            hintText: 'https://...',
                          ),
                        ),
                        const SizedBox(height: 10),

                        // Notes field
                        TextField(
                          controller: _notesController,
                          maxLines: 2,
                          decoration: const InputDecoration(
                            labelText: 'Notas (opcional)',
                            prefixIcon: Padding(
                              padding: EdgeInsets.only(bottom: 20),
                              child: Icon(Icons.notes_rounded, size: 20),
                            ),
                            alignLabelWithHint: true,
                          ),
                        ),
                        const SizedBox(height: 12),

                        // Submit button
                        SizedBox(
                          width: double.infinity,
                          child: FilledButton.icon(
                            onPressed: _submitting ? null : _handleSubmit,
                            icon: _submitting
                                ? const SizedBox(
                                    width: 16,
                                    height: 16,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Colors.white,
                                    ),
                                  )
                                : const Icon(Icons.upload_rounded, size: 18),
                            label: Text(
                                _submitting ? 'A enviar...' : 'Enviar evidência'),
                          ),
                        ),
                      ],
                    ),
                  )
                : const SizedBox.shrink(),
          ),
        ],
      ),
    );
  }

  Future<void> _handleSubmit() async {
    final messenger = ScaffoldMessenger.of(context);
    final url = _urlController.text.trim();

    if (url.isEmpty) {
      messenger.showSnackBar(
        const SnackBar(content: Text('Insere a URL da evidência.')),
      );
      return;
    }

    setState(() => _submitting = true);
    final success =
        await widget.onSubmit(url, _notesController.text.trim());
    if (!mounted) return;
    setState(() => _submitting = false);

    messenger.showSnackBar(
      SnackBar(
        content: Text(
          success ? 'Evidência enviada com sucesso.' : 'Falha ao enviar evidência.',
        ),
        backgroundColor: success ? Colors.green.shade700 : Colors.red.shade700,
      ),
    );

    if (success) {
      _urlController.clear();
      _notesController.clear();
      setState(() => _expanded = false);
    }
  }
}