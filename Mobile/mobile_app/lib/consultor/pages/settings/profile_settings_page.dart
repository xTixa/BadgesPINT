import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../consultor_controller.dart';

class ProfileSettingsPage extends StatefulWidget {
  const ProfileSettingsPage({required this.controller, super.key});

  final ConsultorController controller;

  @override
  State<ProfileSettingsPage> createState() => _ProfileSettingsPageState();
}

class _ProfileSettingsPageState extends State<ProfileSettingsPage> {
  late final TextEditingController _nomeController;
  late final TextEditingController _objetivoController;
  late final TextEditingController _dataLimiteController;

  int? areaPrincipalId;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _nomeController = TextEditingController(
      text: widget.controller.profile?.name ?? '',
    );
    _objetivoController = TextEditingController(
      text: widget.controller.profile?.goalText ?? '',
    );
    _dataLimiteController = TextEditingController(
      text: widget.controller.profile?.goalDeadline ?? '',
    );
    areaPrincipalId = widget.controller.profile?.areaId;
  }

  @override
  void dispose() {
    _nomeController.dispose();
    _objetivoController.dispose();
    _dataLimiteController.dispose();
    super.dispose();
  }

  Future<bool> _save() async {
    final profile = widget.controller.profile;
    final name = _nomeController.text.trim();
    if (profile == null || name.isEmpty) return false;

    final prefs = await SharedPreferences.getInstance();
    if (areaPrincipalId == null) {
      await prefs.remove('settings_area_principal');
    } else {
      await prefs.setInt('settings_area_principal', areaPrincipalId!);
    }
    await prefs.setString('settings_nome', name);
    await prefs.setString('settings_objetivo', _objetivoController.text.trim());
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

    return widget.controller.updatePreferences(
      rgpdPublicationAccepted:
          widget.controller.profile?.rgpdPublicationAccepted ?? false,
      publicProfileEnabled:
          widget.controller.profile?.publicProfileEnabled ?? false,
      linkedinSharingEnabled:
          widget.controller.profile?.linkedinSharingEnabled ?? true,
      goalText: _objetivoController.text.trim(),
      goalDeadline: _dataLimiteController.text.trim(),
    );
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
    return Scaffold(
      appBar: AppBar(title: const Text('Perfil e objetivos')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
        children: <Widget>[
          _buildSectionLabel(context, 'Conta', Icons.person_outline),
          const SizedBox(height: 8),
          Card(
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
                    value: widget.controller.areas
                            .any((area) => area.id == areaPrincipalId)
                        ? areaPrincipalId
                        : null,
                    decoration: const InputDecoration(
                      labelText: 'Área principal',
                      prefixIcon: Icon(Icons.hub_outlined, size: 20),
                    ),
                    hint: const Text('Seleciona a tua area'),
                    selectedItemBuilder: (context) => widget.controller.areas
                        .map(
                          (area) => Text(
                            area.name,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        )
                        .toList(),
                    items: widget.controller.areas
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
                    onChanged: widget.controller.areas.isEmpty
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
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: <Widget>[
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
          Card(
            child: ListTile(
              leading: const Icon(Icons.password),
              title: const Text('Alterar Password'),
              trailing: const Icon(Icons.chevron_right),
              onTap: _openChangePasswordSheet,
            ),
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: FilledButton.icon(
              onPressed: _saving
                  ? null
                  : () async {
                      setState(() => _saving = true);
                      final ok = await _save();
                      if (!context.mounted) return;
                      setState(() => _saving = false);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            ok
                                ? 'Alterações guardadas com sucesso.'
                                : 'Nao foi possivel guardar as alteracoes.',
                          ),
                          backgroundColor: ok
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
}
