import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class HelpSettingsPage extends StatelessWidget {
  const HelpSettingsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Ajuda e recursos')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
        children: <Widget>[
          Card(
            child: Column(
              children: <Widget>[
                ListTile(
                  leading: const Icon(Icons.photo_library_outlined),
                  title: const Text('Ver galeria pública'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => context.push('/gallery'),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.route_outlined),
                  title: const Text('Learning Paths'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => context.push('/learning-paths'),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.help_outline_rounded),
                  title: const Text('Perguntas frequentes'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => context.push('/faq'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
