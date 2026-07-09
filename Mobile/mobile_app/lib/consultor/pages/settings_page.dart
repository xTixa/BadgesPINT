import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../shared/notification_service.dart';
import '../consultor_controller.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({required this.controller, super.key});

  final ConsultorController controller;

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  late final TextEditingController _nomeController;
  late final TextEditingController _objetivoController;
  late final TextEditingController _dataLimiteController;

  bool emailConfirmacao = true;
  bool notificacoesAprovacao = true;
  bool alertasExpiracao = true;
  bool lembretesTimeline = false;
  bool recomendacoesBadges = true;
  bool rgpdPublicacao = false;
  bool permitirGaleriaPublica = false;
  bool partilhaLinkedin = true;
  bool assinaturaEmail = false;
  bool _saving = false;

  int? areaPrincipalId;

  @override
  void initState() {
    super.initState();
    _nomeController = TextEditingController();
    _objetivoController = TextEditingController();
    _dataLimiteController = TextEditingController();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    if (!mounted) return;

    setState(() {
      emailConfirmacao = prefs.getBool('settings_email_confirmacao') ?? true;
      notificacoesAprovacao =
          prefs.getBool('settings_notificacoes_aprovacao') ?? true;
      alertasExpiracao = prefs.getBool('settings_alertas_expiracao') ?? true;
      lembretesTimeline = prefs.getBool('settings_lembretes_timeline') ?? false;
      recomendacoesBadges =
          prefs.getBool('settings_recomendacoes_badges') ?? true;
      rgpdPublicacao =
          widget.controller.profile?.rgpdPublicationAccepted ??
          prefs.getBool('settings_rgpd_publicacao') ??
          false;
      permitirGaleriaPublica =
          widget.controller.profile?.publicProfileEnabled ??
          prefs.getBool('settings_galeria_publica') ??
          false;
      partilhaLinkedin =
          widget.controller.profile?.linkedinSharingEnabled ??
          prefs.getBool('settings_partilha_linkedin') ??
          true;
      assinaturaEmail = prefs.getBool('settings_assinatura_email') ?? false;
      areaPrincipalId =
          widget.controller.profile?.areaId ??
          prefs.getInt('settings_area_principal');
      _nomeController.text =
          widget.controller.profile?.name ??
          prefs.getString('settings_nome') ??
          '';
      _objetivoController.text =
          widget.controller.profile?.goalText ??
          prefs.getString('settings_objetivo') ??
          '';
      _dataLimiteController.text =
          widget.controller.profile?.goalDeadline ??
          prefs.getString('settings_data_limite') ??
          '';
    });
  }

  Future<bool> _saveSettings() async {
    try {
      final profile = widget.controller.profile;
      final name = _nomeController.text.trim();
      if (profile == null || name.isEmpty) return false;

      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('settings_email_confirmacao', emailConfirmacao);
      await prefs.setBool(
        'settings_notificacoes_aprovacao',
        notificacoesAprovacao,
      );
      await prefs.setBool('settings_alertas_expiracao', alertasExpiracao);
      await prefs.setBool('settings_lembretes_timeline', lembretesTimeline);
      await prefs.setBool('settings_recomendacoes_badges', recomendacoesBadges);
      await prefs.setBool('settings_rgpd_publicacao', rgpdPublicacao);
      await prefs.setBool('settings_galeria_publica', permitirGaleriaPublica);
      await prefs.setBool('settings_partilha_linkedin', partilhaLinkedin);
      await prefs.setBool('settings_assinatura_email', assinaturaEmail);
      if (areaPrincipalId == null) {
        await prefs.remove('settings_area_principal');
      } else {
        await prefs.setInt('settings_area_principal', areaPrincipalId!);
      }
      await prefs.setString('settings_nome', name);
      await prefs.setString(
        'settings_objetivo',
        _objetivoController.text.trim(),
      );
      await prefs.setString(
        'settings_data_limite',
        _dataLimiteController.text.trim(),
      );

      final profileUpdated = await widget.controller.updateProfile(
        name: name,
        email: profile.email,
        areaId: areaPrincipalId,
        avatarUrl: profile.avatarUrl,
      );
      if (!profileUpdated) return false;

      final result = await widget.controller.updatePreferences(
        rgpdPublicationAccepted: rgpdPublicacao,
        publicProfileEnabled: permitirGaleriaPublica,
        linkedinSharingEnabled: partilhaLinkedin,
        goalText: _objetivoController.text.trim(),
        goalDeadline: _dataLimiteController.text.trim(),
      );

      if (!alertasExpiracao) NotificationService.cancelExpiryReminders();
      if (!lembretesTimeline) NotificationService.cancelGoalReminder();

      return result;
    } catch (_) {
      return false;
    }
  }

  @override
  void dispose() {
    _nomeController.dispose();
    _objetivoController.dispose();
    _dataLimiteController.dispose();
    super.dispose();
  }

  Future<void> _openChangePasswordSheet() async {
    final currentCtrl = TextEditingController();
    final newCtrl = TextEditingController();
    final confirmCtrl = TextEditingController();

    final error = await showModalBottomSheet<String?>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        bool saving = false;
        return StatefulBuilder(
          builder: (ctx, setSheet) => Padding(
            padding: EdgeInsets.fromLTRB(
              16, 16, 16, MediaQuery.of(ctx).viewInsets.bottom + 16,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: <Widget>[
                Row(
                  children: <Widget>[
                    const Expanded(
                      child: Text(
                        'Alterar password',
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800),
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.pop(ctx),
                      icon: const Icon(Icons.close),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: currentCtrl,
                  obscureText: true,
                  textInputAction: TextInputAction.next,
                  decoration: const InputDecoration(
                    labelText: 'Password atual',
                    prefixIcon: Icon(Icons.lock_outline),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: newCtrl,
                  obscureText: true,
                  textInputAction: TextInputAction.next,
                  decoration: const InputDecoration(
                    labelText: 'Nova password',
                    prefixIcon: Icon(Icons.lock_reset_outlined),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: confirmCtrl,
                  obscureText: true,
                  decoration: const InputDecoration(
                    labelText: 'Confirmar nova password',
                    prefixIcon: Icon(Icons.verified_user_outlined),
                  ),
                ),
                const SizedBox(height: 16),
                FilledButton.icon(
                  onPressed: saving
                      ? null
                      : () async {
                          final current = currentCtrl.text;
                          final next = newCtrl.text;
                          final confirm = confirmCtrl.text;
                          final messenger = ScaffoldMessenger.of(ctx);
                          if (current.isEmpty || next.length < 6) {
                            messenger.showSnackBar(const SnackBar(
                              content: Text(
                                'Indica a password atual e uma nova com pelo menos 6 caracteres.',
                              ),
                            ));
                            return;
                          }
                          if (next != confirm) {
                            messenger.showSnackBar(const SnackBar(
                              content: Text('As passwords nao coincidem.'),
                            ));
                            return;
                          }
                          setSheet(() => saving = true);
                          final err = await widget.controller.changePassword(
                            currentPassword: current,
                            newPassword: next,
                          );
                          if (!ctx.mounted) return;
                          Navigator.pop(ctx, err ?? '');
                        },
                  icon: const Icon(Icons.save_outlined),
                  label: Text(saving ? 'A guardar...' : 'Guardar'),
                ),
              ],
            ),
          ),
        );
      },
    );

    if (!mounted || error == null) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(error.isEmpty ? 'Password alterada com sucesso.' : error),
        backgroundColor: error.isEmpty ? const Color(0xFF065F46) : const Color(0xFF991B1B),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(title: const Text("Definições"), centerTitle: false),

      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 100),
        children: <Widget>[
          // Header
          _buildHeader(context, scheme),
          const SizedBox(height: 20),

          // Profile
          _buildSectionLabel(context, 'Conta', Icons.person_outline),
          const SizedBox(height: 8),
          _buildCard(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: <Widget>[
                  TextField(
                    controller: _nomeController,
                    decoration: const InputDecoration(
                      labelText: 'Nome',
                      prefixIcon: Icon(Icons.person_outline, size: 20),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    initialValue: widget.controller.profile?.email ?? '',
                    enabled: false,
                    decoration: const InputDecoration(
                      labelText: 'Email',
                      prefixIcon: Icon(Icons.email_outlined),
                    ),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<int>(
                    isExpanded: true,
                    value:
                        widget.controller.areas.any(
                              (area) => area.id == areaPrincipalId,
                            )
                            ? areaPrincipalId
                            : null,
                    decoration: const InputDecoration(
                      labelText: 'Área principal',
                      prefixIcon: Icon(Icons.hub_outlined, size: 20),
                    ),
                    hint: const Text('Seleciona a tua area'),
                    selectedItemBuilder:
                        (context) =>
                            widget.controller.areas
                                .map(
                                  (area) => Text(
                                    area.name,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                )
                                .toList(),
                    items:
                        widget.controller.areas
                            .map(
                              (area) => DropdownMenuItem<int>(
                                value: area.id,
                                child: Text(
                                  area.name,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            )
                            .toList(),
                    onChanged:
                        widget.controller.areas.isEmpty
                            ? null
                            : (int? value) {
                              if (value == null) return;
                              setState(() => areaPrincipalId = value);
                            },
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 20),

          _buildSectionLabel(context, 'Objetivos', Icons.flag_outlined),
          const SizedBox(height: 8),
          _buildCard(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  TextField(
                    controller: _objetivoController,
                    decoration: const InputDecoration(
                      labelText: 'Objetivo pessoal',
                      hintText: 'Ex: obter 3 badges ate dezembro',
                      prefixIcon: Icon(Icons.flag_outlined),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _dataLimiteController,
                    decoration: const InputDecoration(
                      labelText: 'Data limite',
                      hintText: 'Ex: 31/12/2026',
                      prefixIcon: Icon(Icons.event_outlined),
                    ),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 20),

          _buildSectionLabel(
            context,
            'Notificações',
            Icons.notifications_outlined,
          ),
          const SizedBox(height: 8),
          _buildCard(
            child: Column(
              children: <Widget>[
                _buildSwitchTile(
                  value: emailConfirmacao,
                  onChanged: (v) => setState(() => emailConfirmacao = v),
                  title: 'Email de confirmação',
                  subtitle: 'Recebe confirmação ao submeter um pedido.',
                  icon: Icons.email_outlined,
                  scheme: scheme,
                  isFirst: true,
                ),
                _buildSwitchTile(
                  value: notificacoesAprovacao,
                  onChanged: (v) => setState(() => notificacoesAprovacao = v),
                  title: 'Aprovação / Rejeição',
                  subtitle: 'Notificação ao ser aprovado ou rejeitado.',
                  icon: Icons.check_circle_outline,
                  scheme: scheme,
                ),
                _buildSwitchTile(
                  value: alertasExpiracao,
                  onChanged: (v) => setState(() => alertasExpiracao = v),
                  title: 'Alertas de expiração',
                  subtitle: 'Aviso antecipado de badges a expirar.',
                  icon: Icons.timer_outlined,
                  scheme: scheme,
                ),
                _buildSwitchTile(
                  value: lembretesTimeline,
                  onChanged: (v) => setState(() => lembretesTimeline = v),
                  title: 'Lembretes da timeline',
                  subtitle: 'Lembretes das tuas metas e objetivos.',
                  icon: Icons.calendar_today_outlined,
                  scheme: scheme,
                  isLast: true,
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Privacy
          _buildSectionLabel(
            context,
            'Showcase de Badges',
            Icons.lock_outline_rounded,
          ),
          const SizedBox(height: 8),
          _buildCard(
            child: Column(
              children: <Widget>[
                _buildSwitchTile(
                  value: recomendacoesBadges,
                  onChanged: (v) => setState(() => recomendacoesBadges = v),
                  title: 'Sugestões de novos badges',
                  subtitle: 'Receber recomendações baseadas no teu perfil.',
                  icon: Icons.auto_awesome_outlined,
                  scheme: scheme,
                  isFirst: true,
                ),
                _buildSwitchTile(
                  value: permitirGaleriaPublica,
                  onChanged: (v) => setState(() => permitirGaleriaPublica = v),
                  title: 'Galeria pública de badges',
                  subtitle: 'Torna o teu perfil de badges visível.',
                  icon: Icons.photo_library_outlined,
                  scheme: scheme,
                ),
                _buildSwitchTile(
                  value: partilhaLinkedin,
                  onChanged: (v) => setState(() => partilhaLinkedin = v),
                  title: 'Partilha no LinkedIn',
                  subtitle: 'Ação rápida de partilha nos badges obtidos.',
                  icon: Icons.share_outlined,
                  scheme: scheme,
                ),
                _buildSwitchTile(
                  value: assinaturaEmail,
                  onChanged: (v) => setState(() => assinaturaEmail = v),
                  title: 'Badges na assinatura de email',
                  subtitle: 'Exibe badges na tua assinatura.',
                  icon: Icons.alternate_email_rounded,
                  scheme: scheme,
                  isLast: true,
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          _buildSectionLabel(
            context,
            'Privacidade',
            Icons.privacy_tip_outlined,
          ),
          _buildCard(
            child: Column(
              children: [
                _buildSwitchTile(
                  value: rgpdPublicacao,
                  onChanged: (v) => setState(() => rgpdPublicacao = v),
                  title: 'Aceito os termos RGPD',
                  subtitle: 'Permite publicação de badges no exterior.',
                  icon: Icons.gavel_rounded,
                  scheme: scheme,
                  isFirst: true,
                  isLast: true,
                ),
              ],
            ),
          ),
          _buildCard(
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.password),
                  title: const Text("Alterar Password"),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => _openChangePasswordSheet(),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Save button
          SizedBox(
            width: double.infinity,
            child: FilledButton.icon(
              onPressed:
                  _saving
                      ? null
                      : () async {
                        setState(() => _saving = true);
                        final ok = await _saveSettings();
                        if (!context.mounted) return;
                        setState(() => _saving = false);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              ok
                                  ? 'Definições guardadas com sucesso.'
                                  : 'Nao foi possivel guardar as definicoes.',
                            ),
                            backgroundColor:
                                ok
                                    ? const Color(0xFF065F46)
                                    : const Color(0xFF991B1B),
                          ),
                        );
                      },
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

  Widget _buildHeader(BuildContext context, ColorScheme scheme) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        gradient: const LinearGradient(
          colors: [Color(0xFF0F62FE), Color(0xFF4589FF)],
        ),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 28,
            backgroundColor: Colors.white,
            child: Text(
              "",
              style: TextStyle(
                color: scheme.primary,
                fontWeight: FontWeight.bold,
                fontSize: 20,
              ),
            ),
          ),

          const SizedBox(width: 14),

          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "Definições",
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 22,
                  ),
                ),

                SizedBox(height: 2),

                Text(
                  "Conta, notificações e privacidade",
                  style: TextStyle(color: Colors.white70, fontSize: 12),
                ),
              ],
            ),
          ),

          const Icon(Icons.settings, color: Colors.white),
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

  Widget _buildCard({required Widget child}) {
    return Card(child: child);
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
