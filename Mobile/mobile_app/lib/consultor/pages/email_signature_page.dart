import 'package:flutter/material.dart';

import '../../shared/app_theme.dart';
import '../consultor_controller.dart';
import '../consultor_models.dart';

class EmailSignaturePage extends StatefulWidget {
  const EmailSignaturePage({required this.controller, super.key});

  final ConsultorController controller;

  @override
  State<EmailSignaturePage> createState() => _EmailSignaturePageState();
}

class _EmailSignaturePageState extends State<EmailSignaturePage> {
  static const int _maxBadges = 6;

  EmailSignatureData? _signature;
  bool _loading = true;
  bool _saving = false;
  bool _enabled = false;
  List<int> _selected = <int>[];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final data = await widget.controller.repository.getEmailSignature();
    if (!mounted) return;
    setState(() {
      _signature = data;
      _enabled = data?.enabled ?? false;
      _selected = List<int>.from(data?.selectedBadgeIds ?? const <int>[]);
      _loading = false;
    });
  }

  Future<void> _toggleBadge(int badgeId) async {
    final next = List<int>.from(_selected);
    if (next.contains(badgeId)) {
      next.remove(badgeId);
    } else {
      if (next.length >= _maxBadges) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Podes escolher no maximo 6 badges.'),
          ),
        );
        return;
      }
      next.add(badgeId);
    }

    setState(() => _selected = next);

    final preview = await widget.controller.repository.previewEmailSignature(
      next,
    );
    if (!mounted || preview == null) return;
    setState(() => _signature = preview);
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    final result = await widget.controller.repository.updateEmailSignature(
      enabled: _enabled,
      badgeIds: _selected,
    );
    if (!mounted) return;
    setState(() {
      _saving = false;
      if (result != null) {
        _signature = result;
        _selected = List<int>.from(result.selectedBadgeIds);
      }
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          result != null
              ? 'Assinatura de email guardada com sucesso.'
              : 'Nao foi possivel guardar a assinatura.',
        ),
        backgroundColor: result != null
            ? const Color(0xFF065F46)
            : const Color(0xFF991B1B),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Assinatura de email')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
              children: <Widget>[
                Card(
                  child: SwitchListTile(
                    value: _enabled,
                    onChanged: (value) => setState(() => _enabled = value),
                    title: const Text(
                      'Mostrar badges na assinatura',
                      style: TextStyle(fontWeight: FontWeight.w700),
                    ),
                    subtitle: const Text(
                      'Ativa para incluir os teus badges nos emails que envias.',
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: <Widget>[
                    const Text(
                      'Escolhe os badges',
                      style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
                    ),
                    const Spacer(),
                    Text(
                      '${_selected.length}/$_maxBadges',
                      style: TextStyle(color: Colors.grey.shade600),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                if ((_signature?.availableBadges ?? const []).isEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 24),
                    child: Center(
                      child: Text(
                        'Ainda nao tens badges obtidos para usar na assinatura.',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Colors.grey.shade600),
                      ),
                    ),
                  )
                else
                  Card(
                    child: Column(
                      children: <Widget>[
                        for (final badge in _signature!.availableBadges)
                          _buildBadgeTile(badge),
                      ],
                    ),
                  ),
                const SizedBox(height: 20),
                const Text(
                  'Pre-visualizacao',
                  style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
                ),
                const SizedBox(height: 8),
                _buildPreview(),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton.icon(
                    onPressed: _saving ? null : _save,
                    icon: const Icon(Icons.save_rounded, size: 18),
                    label: Text(_saving ? 'A guardar...' : 'Guardar alteracoes'),
                    style: FilledButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 15),
                    ),
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildBadgeTile(EmailSignatureBadgeOption badge) {
    final selected = _selected.contains(badge.id);
    return CheckboxListTile(
      value: selected,
      onChanged: (_) => _toggleBadge(badge.id),
      secondary: CircleAvatar(
        radius: 18,
        backgroundColor: AppColors.primary.withValues(alpha: 0.1),
        backgroundImage: (badge.imageUrl ?? '').isNotEmpty
            ? NetworkImage(badge.imageUrl!)
            : null,
        child: (badge.imageUrl ?? '').isEmpty
            ? const Icon(Icons.workspace_premium_rounded,
                size: 18, color: AppColors.primary)
            : null,
      ),
      title: Text(badge.name, style: const TextStyle(fontWeight: FontWeight.w600)),
      subtitle: badge.level != null ? Text(badge.level!) : null,
    );
  }

  Widget _buildPreview() {
    final signature = _signature;
    final selectedBadges = (signature?.availableBadges ?? const [])
        .where((badge) => _selected.contains(badge.id))
        .toList();

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Container(
            padding: const EdgeInsets.only(top: 4),
            decoration: const BoxDecoration(
              border: Border(top: BorderSide(color: AppColors.primary, width: 2)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  widget.controller.profile?.name ?? 'Consultor',
                  style: const TextStyle(fontWeight: FontWeight.w800),
                ),
                Text(
                  widget.controller.profile?.email ?? '',
                  style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          if (!_enabled)
            Text(
              'A assinatura esta desativada.',
              style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
            )
          else if (selectedBadges.isEmpty)
            Text(
              'Sem badges publicados na assinatura.',
              style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
            )
          else ...<Widget>[
            const Text(
              'Badges conquistados',
              style: TextStyle(fontSize: 11, color: Colors.grey),
            ),
            const SizedBox(height: 6),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: selectedBadges
                  .map(
                    (badge) => Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FBFF),
                        borderRadius: BorderRadius.circular(999),
                        border: Border.all(
                          color: AppColors.primary.withValues(alpha: 0.25),
                        ),
                      ),
                      child: Text(
                        badge.level != null
                            ? '${badge.name} · ${badge.level}'
                            : badge.name,
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF16558C),
                        ),
                      ),
                    ),
                  )
                  .toList(),
            ),
          ],
        ],
      ),
    );
  }
}
