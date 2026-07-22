import 'dart:typed_data';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';

import '../consultor_controller.dart';
import '../consultor_models.dart';
import '../widgets/app_header.dart';

class UploadPage extends StatelessWidget {
  const UploadPage({required this.controller, super.key});

  final ConsultorController controller;

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: controller,
      builder: (context, _) {
        final scheme = Theme.of(context).colorScheme;
        return ListView(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 112),
          children: [
            const AppHeader(
              title: 'Submeter Evidencias',
              subtitle: 'Envia provas para cumprir requisitos',
              icon: Icons.cloud_upload_rounded,
            ),
            const SizedBox(height: 16),
            _buildInfoCard(scheme),
            const SizedBox(height: 18),
            _buildBadgeSelector(context),
            const SizedBox(height: 18),
            _buildPedidoBanner(context),
            _buildRequirements(context),
          ],
        );
      },
    );
  }

  Widget _buildInfoCard(ColorScheme scheme) {
    final offline = !controller.isOnline;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: offline ? const Color(0xFFFFF7ED) : const Color(0xFFEFF4FF),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: offline ? const Color(0xFFFED7AA) : const Color(0xFFDBEAFE),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            offline ? Icons.wifi_off_rounded : Icons.info_outline_rounded,
            color: offline ? const Color(0xFFC2410C) : scheme.primary,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              offline
                  ? 'Estás offline. Podes consultar dados guardados, mas o envio de ficheiros precisa de ligação.'
                  : 'Seleciona um badge e envia uma evidencia para cada requisito. A validação é feita pela equipa responsável.',
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBadgeSelector(BuildContext context) {
    final Map<int, BadgeItem> badgesById = <int, BadgeItem>{};
    for (final badge in controller.badges) {
      badgesById[badge.id] = badge;
    }

    final badges = badgesById.values.toList();
    final selectedBadgeId = badgesById.containsKey(controller.selectedBadgeId)
        ? controller.selectedBadgeId
        : null;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Badge',
          style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16),
        ),
        const SizedBox(height: 8),
        DropdownButtonFormField<int>(
          value: selectedBadgeId,
          isExpanded: true,
          hint: const Text(
            'Seleciona um badge em progresso',
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          decoration: InputDecoration(
            filled: true,
            fillColor: Colors.white,
            prefixIcon: const Icon(Icons.workspace_premium_rounded),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          ),
          items: badges.map((badge) {
            return DropdownMenuItem<int>(
              value: badge.id,
              child: Text(
                badge.name,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            );
          }).toList(),
          selectedItemBuilder: (context) => badges.map((badge) {
            return Align(
              alignment: Alignment.centerLeft,
              child: Text(
                badge.name,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            );
          }).toList(),
          onChanged: (id) {
            if (id != null) controller.selectBadge(id);
          },
        ),
      ],
    );
  }

  Widget _buildPedidoBanner(BuildContext context) {
    final matches = controller.pedidosStatus.where(
      (p) => p.badgeId == controller.selectedBadgeId,
    );
    if (matches.isEmpty) return const SizedBox.shrink();

    final pedido = matches.first;
    final Color color;
    if (pedido.status == 'obtido') {
      color = const Color(0xFF16A34A);
    } else if (pedido.status == 'rejeitado') {
      color = const Color(0xFFDC2626);
    } else if (pedido.needsResubmission) {
      color = const Color(0xFFC2410C);
    } else {
      color = const Color(0xFF0F62FE);
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 18),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withValues(alpha: 0.35)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            pedido.statusLabel,
            style: TextStyle(fontWeight: FontWeight.w800, color: color),
          ),
          if ((pedido.latestComment ?? '').trim().isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(
              pedido.latestComment!,
              style: TextStyle(color: color.withValues(alpha: 0.9)),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildRequirements(BuildContext context) {
    if (controller.uploadLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    final selectedBadgeIsAvailable =
        controller.selectedBadgeId != null &&
        controller.badges.any((badge) => badge.id == controller.selectedBadgeId);

    if (!selectedBadgeIsAvailable) {
      return _emptyState(
        icon: Icons.workspace_premium_outlined,
        title: 'Seleciona um badge',
        text: 'Escolhe um badge para veres requisitos e submeter evidencias.',
      );
    }

    if (controller.requirements.isEmpty) {
      return _emptyState(
        icon: Icons.assignment_outlined,
        title: 'Sem requisitos',
        text: 'Este badge ainda nao tem requisitos registados.',
      );
    }

    return Column(
      children: controller.requirements.map((req) {
        return RequirementTile(
          isOnline: controller.isOnline,
          requirement: req,
          latestEvidence: controller.latestEvidenceForRequirement(req.id),
          onSubmit: (fileName, bytes, notes) async {
            final url = await controller.uploadEvidenceFile(
              fileName: fileName,
              bytes: bytes,
            );
            if (url == null) return false;

            return controller.submitEvidence(
              requirementId: req.id,
              evidenceUrl: url,
              notes: notes,
            );
          },
        );
      }).toList(),
    );
  }

  Widget _emptyState({
    required IconData icon,
    required String title,
    required String text,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.black12),
      ),
      child: Column(
        children: [
          Icon(icon, size: 58, color: Colors.grey.shade400),
          const SizedBox(height: 14),
          Text(
            title,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 6),
          Text(
            text,
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.grey.shade700),
          ),
        ],
      ),
    );
  }
}

class RequirementTile extends StatefulWidget {
  const RequirementTile({
    required this.requirement,
    required this.latestEvidence,
    required this.onSubmit,
    required this.isOnline,
    super.key,
  });

  final RequirementItem requirement;
  final EvidenceItem? latestEvidence;
  final bool isOnline;
  final Future<bool> Function(String fileName, Uint8List bytes, String notes)
      onSubmit;

  @override
  State<RequirementTile> createState() => _RequirementTileState();
}

class _RequirementTileState extends State<RequirementTile> {
  bool expanded = false;
  bool loading = false;
  String? selectedFileName;
  Uint8List? selectedFileBytes;
  late final TextEditingController notesCtrl;

  @override
  void initState() {
    super.initState();
    notesCtrl = TextEditingController();
  }

  @override
  void dispose() {
    notesCtrl.dispose();
    super.dispose();
  }

  Future<void> pickFile() async {
    final result = await FilePicker.platform.pickFiles(
      allowMultiple: false,
      withData: true,
      type: FileType.custom,
      allowedExtensions: const ['pdf', 'png', 'jpg', 'jpeg', 'doc', 'docx'],
    );

    final file = result?.files.single;
    final bytes = file?.bytes;
    if (file == null || bytes == null) return;

    if (bytes.length > 8 * 1024 * 1024) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Escolhe um ficheiro com menos de 8 MB.')),
      );
      return;
    }

    setState(() {
      selectedFileName = file.name;
      selectedFileBytes = bytes;
    });
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final evidence = widget.latestEvidence;
    final status = (evidence?.status ?? '').toLowerCase();
    final hasEvidence = evidence != null;
    final approved = status == 'aprovado' || status == 'approved';
    final rejected = status == 'rejeitado' || status == 'rejected';
    final canSubmit = widget.isOnline && !loading && !approved;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: expanded
              ? scheme.primary.withValues(alpha: 0.45)
              : Colors.black12,
        ),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        children: [
          InkWell(
            onTap: () => setState(() => expanded = !expanded),
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Row(
                children: [
                  _statusIcon(approved: approved, rejected: rejected),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            _codeChip(widget.requirement.code),
                            const SizedBox(width: 8),
                            _evidenceStatusChip(evidence),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          widget.requirement.title,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontWeight: FontWeight.w900),
                        ),
                      ],
                    ),
                  ),
                  AnimatedRotation(
                    turns: expanded ? 0.5 : 0,
                    duration: const Duration(milliseconds: 180),
                    child: const Icon(Icons.expand_more_rounded),
                  ),
                ],
              ),
            ),
          ),
          AnimatedCrossFade(
            firstChild: const SizedBox.shrink(),
            secondChild: Padding(
              padding: const EdgeInsets.fromLTRB(14, 0, 14, 14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if ((widget.requirement.imageUrl ?? '').isNotEmpty) ...[
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.network(
                        widget.requirement.imageUrl!,
                        height: 130,
                        width: double.infinity,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => const SizedBox.shrink(),
                      ),
                    ),
                    const SizedBox(height: 12),
                  ],
                  if (widget.requirement.description.isNotEmpty)
                    Text(
                      widget.requirement.description,
                      style: TextStyle(color: scheme.onSurfaceVariant),
                    ),
                  if (hasEvidence) ...[
                    const SizedBox(height: 12),
                    _submittedEvidenceBox(evidence),
                  ],
                  if (!approved) ...[
                    const SizedBox(height: 12),
                    OutlinedButton.icon(
                      onPressed: canSubmit ? pickFile : null,
                      icon: const Icon(Icons.attach_file_rounded),
                      label: Text(
                        selectedFileName == null
                            ? 'Selecionar ficheiro'
                            : 'Trocar ficheiro',
                      ),
                    ),
                    if (selectedFileName != null) ...[
                      const SizedBox(height: 8),
                      _selectedFileBox(selectedFileName!),
                    ],
                    const SizedBox(height: 10),
                    TextField(
                      controller: notesCtrl,
                      enabled: canSubmit,
                      maxLines: 3,
                      decoration: InputDecoration(
                        labelText: 'Notas para validação',
                        filled: true,
                        fillColor: Colors.grey.shade100,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide.none,
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      child: FilledButton.icon(
                        onPressed: canSubmit ? _submit : null,
                        icon: loading
                            ? const SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              )
                            : const Icon(Icons.send_rounded),
                        label: Text(
                          widget.isOnline
                              ? 'Enviar evidencia'
                              : 'Envio indisponivel offline',
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
            crossFadeState:
                expanded ? CrossFadeState.showSecond : CrossFadeState.showFirst,
            duration: const Duration(milliseconds: 180),
          ),
        ],
      ),
    );
  }

  Future<void> _submit() async {
    if (selectedFileName == null || selectedFileBytes == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Seleciona um ficheiro primeiro.')),
      );
      return;
    }

    setState(() => loading = true);
    final messenger = ScaffoldMessenger.of(context);
    final ok = await widget.onSubmit(
      selectedFileName!,
      selectedFileBytes!,
      notesCtrl.text.trim(),
    );

    if (!mounted) return;
    setState(() => loading = false);
    messenger.showSnackBar(
      SnackBar(
        content: Text(ok ? 'Evidencia enviada com sucesso.' : 'Erro ao enviar.'),
        backgroundColor: ok ? Colors.green : Colors.red,
      ),
    );

    if (ok) {
      notesCtrl.clear();
      setState(() {
        selectedFileName = null;
        selectedFileBytes = null;
        expanded = false;
      });
    }
  }

  Widget _statusIcon({required bool approved, required bool rejected}) {
    final color = approved
        ? Colors.green
        : rejected
            ? Colors.red
            : Colors.orange;
    final icon = approved
        ? Icons.check_rounded
        : rejected
            ? Icons.close_rounded
            : Icons.schedule_rounded;

    return CircleAvatar(
      radius: 18,
      backgroundColor: color.withValues(alpha: 0.12),
      child: Icon(icon, color: color, size: 20),
    );
  }

  Widget _codeChip(String code) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: const Color(0xFFEFF4FF),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        code,
        style: const TextStyle(
          color: Color(0xFF0F62FE),
          fontSize: 11,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }

  Widget _evidenceStatusChip(EvidenceItem? evidence) {
    final raw = (evidence?.status ?? '').toLowerCase();
    final label = evidence == null
        ? 'Por submeter'
        : raw == 'aprovado'
            ? 'Aprovado'
            : raw == 'rejeitado'
                ? 'Rejeitado'
                : 'Em validacao';
    final color = evidence == null
        ? Colors.orange
        : raw == 'aprovado'
            ? Colors.green
            : raw == 'rejeitado'
                ? Colors.red
                : Colors.blue;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontSize: 11,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }

  Widget _submittedEvidenceBox(EvidenceItem evidence) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.black12),
      ),
      child: Row(
        children: [
          const Icon(Icons.description_outlined, color: Color(0xFF0F62FE)),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              evidence.evidenceUrl,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  Widget _selectedFileBox(String name) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Colors.green.shade50,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          const Icon(Icons.insert_drive_file_outlined, color: Colors.green),
          const SizedBox(width: 8),
          Expanded(
            child: Text(name, maxLines: 1, overflow: TextOverflow.ellipsis),
          ),
        ],
      ),
    );
  }
}
