import 'package:flutter/material.dart';

import '../../shared/api_client.dart';

class RgpdTermsPage extends StatefulWidget {
  const RgpdTermsPage({super.key});

  @override
  State<RgpdTermsPage> createState() => _RgpdTermsPageState();
}

class _RgpdTermsPageState extends State<RgpdTermsPage> {
  bool _loading = true;
  String? _error;
  String _text = '';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final payload = await ApiClient().get('/api/public/rgpd-text');
      if (!mounted) return;
      setState(() {
        _text = (payload is Map<String, dynamic>)
            ? (payload['rgpd_consent_text'] ?? '').toString()
            : '';
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _error = 'Nao foi possivel carregar os termos RGPD.';
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Termos RGPD')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(20),
              children: <Widget>[
                const Text(
                  'Termos e condicoes RGPD',
                  style: TextStyle(fontWeight: FontWeight.w900, fontSize: 20),
                ),
                const SizedBox(height: 6),
                Text(
                  'Consulta como os teus dados e badges podem ser usados.',
                  style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                ),
                const Divider(height: 32),
                if (_error != null)
                  Text(
                    _error!,
                    style: const TextStyle(
                      color: Color(0xFF991B1B),
                      fontWeight: FontWeight.w600,
                    ),
                  )
                else if (_text.isEmpty)
                  Text(
                    'Ainda nao existe texto RGPD configurado.',
                    style: TextStyle(color: Colors.grey.shade600),
                  )
                else
                  Text(
                    _text,
                    style: const TextStyle(fontSize: 13.5, height: 1.5),
                  ),
              ],
            ),
    );
  }
}
