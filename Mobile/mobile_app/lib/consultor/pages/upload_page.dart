import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'dart:typed_data';
import '../consultor_models.dart';
import '../consultor_controller.dart';
import '../widgets/app_header.dart';

class UploadPage extends StatelessWidget {
  const UploadPage({required this.controller, super.key});

  final ConsultorController controller;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;

    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        const AppHeader(
          title: "Submeter Evidências",
          subtitle: "Envia provas para obter badges",
          icon: Icons.cloud_upload,
        ),
        const SizedBox(height: 20),

        _buildInfoCard(context, scheme),
        const SizedBox(height: 20),

        _buildBadgeSelector(context),
        const SizedBox(height: 20),

        _buildRequirements(context),
      ],
    );
  }

  Widget _buildInfoCard(BuildContext context, ColorScheme scheme) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: scheme.primary.withOpacity(0.08),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          Icon(Icons.info_outline, color: scheme.primary),
          const SizedBox(width: 10),
          const Expanded(
            child: Text(
              "Seleciona um badge e submete evidências para cada requisito.",
              style: TextStyle(fontWeight: FontWeight.w500),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBadgeSelector(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "Badge",
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),

        const SizedBox(height: 8),

        DropdownButtonFormField<int>(
          value: controller.selectedBadgeId,
          hint: const Text('Seleciona um badge em progresso'),
          decoration: InputDecoration(
            filled: true,
            fillColor: Colors.grey.shade100,
            prefixIcon: const Icon(Icons.workspace_premium),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          ),
          items:
              controller.badges
                  .map(
                    (b) => DropdownMenuItem(value: b.id, child: Text(b.name)),
                  )
                  .toList(),
          onChanged: (id) {
            if (id != null) {
              controller.selectBadge(id);
            }
          },
        ),
      ],
    );
  }

  Widget _buildRequirements(BuildContext context) {
    if (controller.uploadLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (controller.selectedBadgeId == null) {
      return Container(
        padding: const EdgeInsets.all(32),
        child: Column(
          children: [
            Icon(
              Icons.workspace_premium_outlined,
              size: 80,
              color: Colors.grey.shade400,
            ),

            const SizedBox(height: 16),

            const Text(
              "Seleciona um badge",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),

            const SizedBox(height: 8),

            Text(
              "Escolhe um badge para veres os requisitos e submeter evidências.",
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey.shade600),
            ),
          ],
        ),
      );
    }

    if (controller.requirements.isEmpty) {
      return Center(
        child: Column(
          children: [
            Icon(Icons.assignment_outlined, size: 80),
            SizedBox(height: 12),
            Text("Este badge não possui requisitos."),
          ],
        ),
      );
    }

    return Column(
      children:
          controller.requirements
              .map(
                (req) => RequirementTile(
                  requirement: req,
                  latestEvidence: controller.latestEvidenceForRequirement(
                    req.id,
                  ),
                  onSubmit:
                      (fileName, bytes, notes) async {
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
                ),
              )
              .toList(),
    );
  }
}

class RequirementTile extends StatefulWidget {
  const RequirementTile({
    required this.requirement,
    required this.latestEvidence,
    required this.onSubmit,
    super.key,
  });

  final RequirementItem requirement;
  final EvidenceItem? latestEvidence;
  final Future<bool> Function(String fileName, Uint8List bytes, String notes)
  onSubmit;

  @override
  State<RequirementTile> createState() => _RequirementTileState();
}

class _RequirementTileState extends State<RequirementTile>
    with SingleTickerProviderStateMixin {
  bool expanded = false;
  bool loading = false;

  final notesCtrl = TextEditingController();

  late AnimationController _controller;
  late Animation<double> _fade;
  late Animation<Offset> _slide;

  String? selectedFileName;
  Uint8List? selectedFileBytes;

  Future<void> pickFile() async {
    final result = await FilePicker.platform.pickFiles(
      allowMultiple: false,
      withData: true,
      type: FileType.custom,
      allowedExtensions: const <String>['pdf', 'png', 'jpg', 'jpeg', 'doc', 'docx'],
    );

    if (result != null) {
      final file = result.files.single;
      setState(() {
        selectedFileName = file.name;
        selectedFileBytes = file.bytes;
      });
    }
  }

  @override
  void initState() {
    super.initState();

    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 250),
    );

    _fade = CurvedAnimation(parent: _controller, curve: Curves.easeIn);

    _slide = Tween<Offset>(
      begin: const Offset(0, -0.1),
      end: Offset.zero,
    ).animate(_controller);
  }

  @override
  void dispose() {
    _controller.dispose();
    notesCtrl.dispose();
    super.dispose();
  }

  void toggle() {
    setState(() {
      expanded = !expanded;
    });

    if (expanded) {
      _controller.forward();
    } else {
      _controller.reverse();
    }
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color:
              expanded
                  ? scheme.primary.withOpacity(0.5)
                  : scheme.outlineVariant,
        ),
        boxShadow:
            expanded
                ? [
                  BoxShadow(
                    color: scheme.primary.withOpacity(0.1),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ]
                : [],
      ),
      child: Column(
        children: [
          InkWell(
            onTap: toggle,
            borderRadius: BorderRadius.circular(14),
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: scheme.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      widget.requirement.code,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: scheme.primary,
                      ),
                    ),
                  ),

                  const SizedBox(width: 10),

                  Expanded(
                    child: Text(
                      widget.requirement.title,
                      style: const TextStyle(fontWeight: FontWeight.w600),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),

                  AnimatedRotation(
                    turns: expanded ? 0.5 : 0,
                    duration: const Duration(milliseconds: 200),
                    child: const Icon(Icons.expand_more),
                  ),
                ],
              ),
            ),
          ),

          SizeTransition(
            sizeFactor: _fade,
            child: FadeTransition(
              opacity: _fade,
              child: SlideTransition(
                position: _slide,
                child:
                    expanded
                        ? Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                widget.requirement.description,
                                style: TextStyle(
                                  color: scheme.onSurfaceVariant,
                                ),
                              ),

                              const SizedBox(height: 12),

                              if (widget.latestEvidence != null)
                                Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: Colors.green.shade50,
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(
                                      color: Colors.green.shade200,
                                    ),
                                  ),
                                  child: Row(
                                    children: [
                                      const Icon(
                                        Icons.check_circle,
                                        color: Colors.green,
                                      ),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Text(
                                          "Evidência já submetida",
                                          style: TextStyle(
                                            color: Colors.green.shade800,
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                )
                              else
                                Column(
                                  children: [
                                    OutlinedButton.icon(
                                      onPressed: pickFile,
                                      icon: const Icon(Icons.attach_file),
                                      label: const Text("Selecionar ficheiro"),
                                    ),

                                    if (selectedFileName != null) ...[
                                      const SizedBox(height: 8),

                                      Container(
                                        padding: const EdgeInsets.all(10),
                                        decoration: BoxDecoration(
                                          color: Colors.green.shade50,
                                          borderRadius: BorderRadius.circular(
                                            10,
                                          ),
                                        ),
                                        child: Row(
                                          children: [
                                            const Icon(
                                              Icons.description,
                                              color: Colors.green,
                                            ),

                                            const SizedBox(width: 8),

                                            Expanded(
                                              child: Text(
                                                selectedFileName!,
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],

                                    const SizedBox(height: 10),

                                    TextField(
                                      controller: notesCtrl,
                                      maxLines: 3,
                                      decoration: InputDecoration(
                                        labelText: "Notas",
                                        filled: true,
                                        fillColor: Colors.grey.shade100,
                                        border: OutlineInputBorder(
                                          borderRadius: BorderRadius.circular(
                                            10,
                                          ),
                                          borderSide: BorderSide.none,
                                        ),
                                      ),
                                    ),

                                    const SizedBox(height: 12),

                                    SizedBox(
                                      width: double.infinity,
                                      child: ElevatedButton(
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: const Color(
                                            0xFF0F62FE,
                                          ),
                                          padding: const EdgeInsets.symmetric(
                                            vertical: 14,
                                          ),
                                          shape: RoundedRectangleBorder(
                                            borderRadius: BorderRadius.circular(
                                              10,
                                            ),
                                          ),
                                        ),
                                        onPressed:
                                            loading
                                                ? null
                                                : () async {
                                                  if (selectedFileName ==
                                                          null ||
                                                      selectedFileBytes ==
                                                          null) {
                                                    ScaffoldMessenger.of(
                                                      context,
                                                    ).showSnackBar(
                                                      const SnackBar(
                                                        content: Text(
                                                          "Seleciona um ficheiro primeiro",
                                                        ),
                                                      ),
                                                    );
                                                    return;
                                                  }

                                                  setState(
                                                    () => loading = true,
                                                  );

                                                  final messenger =
                                                      ScaffoldMessenger.of(
                                                        context,
                                                      );
                                                  final ok = await widget
                                                      .onSubmit(
                                                        selectedFileName!,
                                                        selectedFileBytes!,
                                                        notesCtrl.text,
                                                      );

                                                  if (!mounted) return;

                                                  setState(
                                                    () => loading = false,
                                                  );

                                                  messenger.showSnackBar(
                                                    SnackBar(
                                                      content: Text(
                                                        ok
                                                            ? "✔ Enviado com sucesso"
                                                            : "❌ Erro ao enviar",
                                                      ),
                                                      backgroundColor:
                                                          ok
                                                              ? Colors.green
                                                              : Colors.red,
                                                    ),
                                                  );

                                                  if (ok) {
                                                    notesCtrl.clear();
                                                    setState(() {
                                                      selectedFileName = null;
                                                      selectedFileBytes = null;
                                                    });
                                                  }
                                                },
                                        child:
                                            loading
                                                ? const SizedBox(
                                                  height: 18,
                                                  width: 18,
                                                  child:
                                                      CircularProgressIndicator(
                                                        strokeWidth: 2,
                                                      ),
                                                )
                                                : const Text(
                                                  "Enviar evidência",
                                                ),
                                      ),
                                    ),
                                  ],
                                ),
                            ],
                          ),
                        )
                        : const SizedBox(),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
