import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

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

        if (controller.selectedBadgeId != null) _buildSubmitButton(context),

        const SizedBox(height: 20),

        _buildRequirements(context),
      ],
    );
  }

  // 🔵 HEADER
  Widget _buildHeader(BuildContext context, ColorScheme scheme) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: scheme.primary,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.cloud_upload, color: Colors.white),
          ),
          const SizedBox(width: 16),
          const Expanded(
            child: Text(
              "Submeter Evidências",
              style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // 🔵 INFO CARD
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

  // 🔵 DROPDOWN
  Widget _buildBadgeSelector(BuildContext context) {
    return DropdownButtonFormField<int>(
      value: controller.selectedBadgeId,
      hint: const Text('Selecionar badge...'),
      decoration: InputDecoration(
        filled: true,
        fillColor: Colors.grey.shade100,
        prefixIcon: const Icon(Icons.workspace_premium),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
      ),
      items:
          controller.badges
              .map((b) => DropdownMenuItem(value: b.id, child: Text(b.name)))
              .toList(),
      onChanged: (id) {
        if (id != null) controller.selectBadge(id);
      },
    );
  }

  // 🔵 BOTÃO
  Widget _buildSubmitButton(BuildContext context) {
    return FilledButton(
      style: FilledButton.styleFrom(
        padding: const EdgeInsets.symmetric(vertical: 16),
        backgroundColor: const Color(0xFF0F62FE),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
      onPressed: () async {
        final success = await controller.submitPedido();

        if (!context.mounted) return;

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              success ? 'Pedido submetido com sucesso' : 'Erro ao submeter',
            ),
          ),
        );
      },
      child: const Text("Submeter candidatura"),
    );
  }

  // 🔵 LISTA DE REQUISITOS
  Widget _buildRequirements(BuildContext context) {
    if (controller.uploadLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (controller.selectedBadgeId == null) {
      return const SizedBox();
    }

    if (controller.requirements.isEmpty) {
      return const Text("Sem requisitos.");
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
                      (url, notes) => controller.submitEvidence(
                        requirementId: req.id,
                        evidenceUrl: url,
                        notes: notes,
                      ),
                ),
              )
              .toList(),
    );
  }
}

// ============================================================
// 🔥 TILE PROFISSIONAL
// ============================================================

class RequirementTile extends StatefulWidget {
  const RequirementTile({
    required this.requirement,
    required this.latestEvidence,
    required this.onSubmit,
    super.key,
  });

  final RequirementItem requirement;
  final EvidenceItem? latestEvidence;
  final Future<bool> Function(String url, String notes) onSubmit;

  @override
  State<RequirementTile> createState() => _RequirementTileState();
}

class _RequirementTileState extends State<RequirementTile>
    with SingleTickerProviderStateMixin {
  bool expanded = false;
  bool loading = false;

  final urlCtrl = TextEditingController();
  final notesCtrl = TextEditingController();

  late AnimationController _controller;
  late Animation<double> _fade;
  late Animation<Offset> _slide;

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
    urlCtrl.dispose();
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
          // 🔹 HEADER
          InkWell(
            onTap: toggle,
            borderRadius: BorderRadius.circular(14),
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Row(
                children: [
                  // código
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

                  // título
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

          // 🔹 CONTEÚDO ANIMADO
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

                              TextField(
                                controller: urlCtrl,
                                decoration: InputDecoration(
                                  labelText: "URL da evidência",
                                  filled: true,
                                  fillColor: Colors.grey.shade100,
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(10),
                                    borderSide: BorderSide.none,
                                  ),
                                ),
                              ),

                              const SizedBox(height: 10),

                              TextField(
                                controller: notesCtrl,
                                decoration: InputDecoration(
                                  labelText: "Notas",
                                  filled: true,
                                  fillColor: Colors.grey.shade100,
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(10),
                                    borderSide: BorderSide.none,
                                  ),
                                ),
                              ),

                              const SizedBox(height: 12),

                              // 🔥 BOTÃO COM LOADING
                              SizedBox(
                                width: double.infinity,
                                child: ElevatedButton(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF0F62FE),
                                    padding: const EdgeInsets.symmetric(
                                      vertical: 14,
                                    ),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                  ),
                                  onPressed:
                                      loading
                                          ? null
                                          : () async {
                                            if (urlCtrl.text.isEmpty) return;

                                            setState(() => loading = true);

                                            final ok = await widget.onSubmit(
                                              urlCtrl.text,
                                              notesCtrl.text,
                                            );

                                            if (!mounted) return;

                                            setState(() => loading = false);

                                            ScaffoldMessenger.of(
                                              context,
                                            ).showSnackBar(
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
                                              urlCtrl.clear();
                                              notesCtrl.clear();
                                              toggle();
                                            }
                                          },
                                  child:
                                      loading
                                          ? const SizedBox(
                                            height: 18,
                                            width: 18,
                                            child: CircularProgressIndicator(
                                              strokeWidth: 2,
                                            ),
                                          )
                                          : const Text("Enviar evidência"),
                                ),
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
