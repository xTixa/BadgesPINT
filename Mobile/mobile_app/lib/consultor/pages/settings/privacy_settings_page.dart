import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../consultor_controller.dart';

class PrivacySettingsPage extends StatefulWidget {
  const PrivacySettingsPage({required this.controller, super.key});

  final ConsultorController controller;

  @override
  State<PrivacySettingsPage> createState() => _PrivacySettingsPageState();
}

class _PrivacySettingsPageState extends State<PrivacySettingsPage> {
  bool rgpdPublicacao = false;
  bool permitirGaleriaPublica = false;
  bool partilhaLinkedin = true;
  bool assinaturaEmail = false;
  bool _loading = true;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    if (!mounted) return;
    setState(() {
      rgpdPublicacao = widget.controller.profile?.rgpdPublicationAccepted ??
          prefs.getBool('settings_rgpd_publicacao') ??
          false;
      permitirGaleriaPublica =
          widget.controller.profile?.publicProfileEnabled ??
              prefs.getBool('settings_galeria_publica') ??
              false;
      partilhaLinkedin = widget.controller.profile?.linkedinSharingEnabled ??
          prefs.getBool('settings_partilha_linkedin') ??
          true;
      assinaturaEmail = prefs.getBool('settings_assinatura_email') ?? false;
      _loading = false;
    });
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('settings_rgpd_publicacao', rgpdPublicacao);
    await prefs.setBool('settings_galeria_publica', permitirGaleriaPublica);
    await prefs.setBool('settings_partilha_linkedin', partilhaLinkedin);
    await prefs.setBool('settings_assinatura_email', assinaturaEmail);

    final ok = await widget.controller.updatePreferences(
      rgpdPublicationAccepted: rgpdPublicacao,
      publicProfileEnabled: permitirGaleriaPublica,
      linkedinSharingEnabled: partilhaLinkedin,
      goalText: widget.controller.profile?.goalText,
      goalDeadline: widget.controller.profile?.goalDeadline,
    );

    if (!mounted) return;
    setState(() => _saving = false);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          ok
              ? 'Preferências guardadas com sucesso.'
              : 'Nao foi possivel guardar as preferencias.',
        ),
        backgroundColor:
            ok ? const Color(0xFF065F46) : const Color(0xFF991B1B),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(title: const Text('Privacidade')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
              children: <Widget>[
                _buildSectionLabel(
                    context, 'Showcase de Badges', Icons.lock_outline_rounded),
                const SizedBox(height: 8),
                Card(
                  child: Column(
                    children: <Widget>[
                      _buildSwitchTile(
                        value: permitirGaleriaPublica,
                        onChanged: (v) =>
                            setState(() => permitirGaleriaPublica = v),
                        title: 'Galeria pública de badges',
                        subtitle: 'Torna o teu perfil de badges visível.',
                        icon: Icons.photo_library_outlined,
                        scheme: scheme,
                        isFirst: true,
                      ),
                      _buildSwitchTile(
                        value: partilhaLinkedin,
                        onChanged: (v) =>
                            setState(() => partilhaLinkedin = v),
                        title: 'Partilha no LinkedIn',
                        subtitle:
                            'Ação rápida de partilha nos badges obtidos.',
                        icon: Icons.share_outlined,
                        scheme: scheme,
                      ),
                      _buildSwitchTile(
                        value: assinaturaEmail,
                        onChanged: (v) =>
                            setState(() => assinaturaEmail = v),
                        title: 'Badges na assinatura de email',
                        subtitle: 'Exibe badges na tua assinatura.',
                        icon: Icons.alternate_email_rounded,
                        scheme: scheme,
                        isLast: true,
                      ),
                    ],
                  ),
                ),
                Card(
                  child: ListTile(
                    leading: const Icon(Icons.edit_note_rounded),
                    title: const Text('Configurar assinatura de email'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => context.push('/email-signature'),
                  ),
                ),
                const SizedBox(height: 20),
                _buildSectionLabel(
                    context, 'Privacidade', Icons.privacy_tip_outlined),
                const SizedBox(height: 8),
                Card(
                  child: Column(
                    children: [
                      _buildSwitchTile(
                        value: rgpdPublicacao,
                        onChanged: (v) =>
                            setState(() => rgpdPublicacao = v),
                        title: 'Aceito os termos RGPD',
                        subtitle:
                            'Permite publicação de badges no exterior.',
                        icon: Icons.gavel_rounded,
                        scheme: scheme,
                        isFirst: true,
                      ),
                      Divider(
                        height: 1,
                        indent: 16,
                        endIndent: 16,
                        color: scheme.outlineVariant.withValues(alpha: 0.5),
                      ),
                      ListTile(
                        leading: const Icon(Icons.description_outlined),
                        title: const Text('Ver termos RGPD completos'),
                        trailing: const Icon(Icons.chevron_right),
                        onTap: () => context.push('/rgpd-terms'),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton.icon(
                    onPressed: _saving ? null : _save,
                    icon: const Icon(Icons.save_rounded, size: 18),
                    label: Text(_saving ? 'A guardar...' : 'Guardar alterações'),
                    style: FilledButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 15),
                    ),
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildSectionLabel(BuildContext context, String label, IconData icon) {
    final scheme = Theme.of(context).colorScheme;
    return Row(
      children: <Widget>[
        Icon(icon, size: 16, color: scheme.primary),
        const SizedBox(width: 8),
        Text(
          label,
          style: Theme.of(context).textTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.w800,
            color: scheme.onSurface,
            letterSpacing: 0.1,
          ),
        ),
      ],
    );
  }

  Widget _buildSwitchTile({
    required bool value,
    required ValueChanged<bool> onChanged,
    required String title,
    required String subtitle,
    required IconData icon,
    required ColorScheme scheme,
    bool isFirst = false,
    bool isLast = false,
  }) {
    return Column(
      children: <Widget>[
        if (!isFirst)
          Divider(
            height: 1,
            indent: 16,
            endIndent: 16,
            color: scheme.outlineVariant.withValues(alpha: 0.5),
          ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
          child: Row(
            children: <Widget>[
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: scheme.primary.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, size: 18, color: scheme.primary),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      title,
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 13,
                      ),
                    ),
                    Text(
                      subtitle,
                      style: TextStyle(
                        fontSize: 11,
                        color: scheme.onSurfaceVariant,
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),
              Switch(
                value: value,
                onChanged: onChanged,
                materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
            ],
          ),
        ),
      ],
    );
  }
}
