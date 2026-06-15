import 'package:flutter/material.dart';

import '../consultor/consultor_models.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({
    required this.areas,
    required this.onRegister,
    required this.onBackToLogin,
    super.key,
  });

  final List<AreaItem> areas;
  final Future<String?> Function({
    required String name,
    required String email,
    int? areaId,
    required bool acceptedRgpd,
  })
  onRegister;
  final VoidCallback onBackToLogin;

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();

  int? _selectedAreaId;
  bool _acceptedRgpd = false;
  bool _submitting = false;
  String? _message;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_nameController.text.trim().isEmpty ||
        _emailController.text.trim().isEmpty) {
      setState(() {
        _message = 'Preenche nome e email.';
      });
      return;
    }

    if (_selectedAreaId == null) {
      setState(() {
        _message = 'Escolhe a tua area principal.';
      });
      return;
    }

    if (!_acceptedRgpd) {
      setState(() {
        _message = 'Tens de aceitar os termos RGPD.';
      });
      return;
    }

    setState(() {
      _submitting = true;
      _message = null;
    });

    final result = await widget.onRegister(
      name: _nameController.text.trim(),
      email: _emailController.text.trim(),
      areaId: _selectedAreaId,
      acceptedRgpd: _acceptedRgpd,
    );

    if (!mounted) return;

    setState(() {
      _submitting = false;
      _message =
          result ?? 'Conta criada com sucesso. Confirma o email e faz login.';
    });
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Criar Conta'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: widget.onBackToLogin,
        ),
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 500),
          child: ListView(
            padding: const EdgeInsets.all(20),
            children: <Widget>[
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: <Color>[Color(0xFF0A5D8F), Color(0xFF0B3B73)],
                  ),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      'Registo de Consultor',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w900,
                        letterSpacing: -0.4,
                        color: Colors.white,
                      ),
                    ),
                    SizedBox(height: 6),
                    Text(
                      'Cria o teu acesso para submeter evidencias e acompanhar badges.',
                      style: TextStyle(color: Color(0xFFE2E8F0)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 18),
              Card(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                  side: BorderSide(
                    color: scheme.primary.withValues(alpha: 0.2),
                  ),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: <Widget>[
                      TextField(
                        controller: _nameController,
                        decoration: const InputDecoration(
                          labelText: 'Nome',
                          prefixIcon: Icon(Icons.person_outline),
                        ),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _emailController,
                        keyboardType: TextInputType.emailAddress,
                        decoration: const InputDecoration(
                          labelText: 'Email',
                          prefixIcon: Icon(Icons.mail_outline),
                        ),
                      ),
                      const SizedBox(height: 12),
                      DropdownButtonFormField<int>(
                        value: _selectedAreaId,
                        decoration: const InputDecoration(
                          labelText: 'Area principal',
                          prefixIcon: Icon(Icons.category_outlined),
                        ),
                        items:
                            widget.areas
                                .map(
                                  (AreaItem area) => DropdownMenuItem<int>(
                                    value: area.id,
                                    child: Text(area.name),
                                  ),
                                )
                                .toList(),
                        onChanged: (int? value) {
                          setState(() => _selectedAreaId = value);
                        },
                      ),
                      const SizedBox(height: 10),
                      CheckboxListTile(
                        value: _acceptedRgpd,
                        onChanged: (bool? value) {
                          setState(() => _acceptedRgpd = value ?? false);
                        },
                        title: const Text(
                          'Aceito os termos RGPD para partilha/publicacao de badges.',
                        ),
                        contentPadding: EdgeInsets.zero,
                        controlAffinity: ListTileControlAffinity.leading,
                      ),
                      const SizedBox(height: 10),
                      SizedBox(
                        width: double.infinity,
                        child: FilledButton(
                          onPressed: _submitting ? null : _submit,
                          child: Text(_submitting ? 'A criar...' : 'Registar'),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              if (_message != null) ...<Widget>[
                const SizedBox(height: 12),
                Text(
                  _message!,
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontWeight: FontWeight.w700),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
