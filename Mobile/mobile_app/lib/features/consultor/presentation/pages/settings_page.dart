import 'package:flutter/material.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  bool emailConfirmacao = true;
  bool alertasExpiracao = true;
  bool lembretesTimeline = false;
  bool permitirGaleriaPublica = false;
  bool partilhaLinkedin = true;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 90),
      children: <Widget>[
        Card(
          child: Column(
            children: <Widget>[
              SwitchListTile(
                value: emailConfirmacao,
                onChanged: (bool value) => setState(() => emailConfirmacao = value),
                title: const Text('Email de confirmacao de candidatura'),
              ),
              SwitchListTile(
                value: alertasExpiracao,
                onChanged: (bool value) => setState(() => alertasExpiracao = value),
                title: const Text('Alertas de expiracao de badges'),
              ),
              SwitchListTile(
                value: lembretesTimeline,
                onChanged: (bool value) => setState(() => lembretesTimeline = value),
                title: const Text('Lembretes da timeline e objetivos'),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        Card(
          child: Column(
            children: <Widget>[
              SwitchListTile(
                value: permitirGaleriaPublica,
                onChanged: (bool value) => setState(() => permitirGaleriaPublica = value),
                title: const Text('Permitir galeria publica de badges'),
              ),
              SwitchListTile(
                value: partilhaLinkedin,
                onChanged: (bool value) => setState(() => partilhaLinkedin = value),
                title: const Text('Ativar partilha no LinkedIn'),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        FilledButton.icon(
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Alteracoes guardadas (mock).')),
            );
          },
          icon: const Icon(Icons.save),
          label: const Text('Guardar alteracoes'),
        ),
      ],
    );
  }
}
