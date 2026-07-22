import 'package:flutter/material.dart';

import '../consultor/consultor_models.dart';
import '../shared/app_theme.dart';

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
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  late final TextEditingController _nameController;
  late final TextEditingController _emailController;

  int? _selectedAreaId;
  bool _acceptedRgpd = false;
  bool _submitting = false;
  bool _success = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController();
    _emailController = TextEditingController();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    if (_selectedAreaId == null) {
      setState(() {
        _error = 'Escolhe a tua area principal.';
      });
      return;
    }

    if (!_acceptedRgpd) {
      setState(() {
        _error = 'Tens de aceitar os termos RGPD.';
      });
      return;
    }

    setState(() {
      _submitting = true;
      _error = null;
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
      _success = result == null;
      _error = result;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: <Color>[Color(0xFFF6FAFF), Color(0xFFEAF2FB)],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 460),
                child: Card(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(AppRadius.header),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(28),
                    child: _success ? _buildSuccess() : _buildForm(),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildForm() {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          const Icon(
            Icons.person_add_alt_1_outlined,
            size: 48,
            color: AppColors.primary,
          ),
          const SizedBox(height: 12),
          Text(
            'Criar Conta',
            textAlign: TextAlign.center,
            style: Theme.of(
              context,
            ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 8),
          Text(
            'Cria o teu acesso para submeter evidencias e acompanhar badges.',
            textAlign: TextAlign.center,
            style: Theme.of(
              context,
            ).textTheme.bodyMedium?.copyWith(color: const Color(0xFF5B6B7F)),
          ),
          const SizedBox(height: 24),
          TextFormField(
            controller: _nameController,
            decoration: const InputDecoration(
              labelText: 'Nome',
              prefixIcon: Icon(Icons.person_outline),
            ),
            validator: (String? value) {
              if ((value ?? '').trim().isEmpty) return 'Indica o teu nome';
              return null;
            },
          ),
          const SizedBox(height: 14),
          TextFormField(
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
            decoration: const InputDecoration(
              labelText: 'Email',
              hintText: 'exemplo@softinsa.pt',
              prefixIcon: Icon(Icons.mail_outline_rounded),
            ),
            validator: (String? value) {
              final String text = (value ?? '').trim();
              if (text.isEmpty) return 'Indica o teu email';
              if (!text.contains('@')) return 'Email invalido';
              return null;
            },
          ),
          const SizedBox(height: 14),
          DropdownButtonFormField<int>(
            value: _selectedAreaId,
            isExpanded: true,
            decoration: const InputDecoration(
              labelText: 'Area principal',
              prefixIcon: Icon(Icons.category_outlined),
            ),
            items:
                widget.areas
                    .map(
                      (AreaItem area) => DropdownMenuItem<int>(
                        value: area.id,
                        child: Text(
                          area.name,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    )
                    .toList(),
            onChanged: (int? value) {
              setState(() => _selectedAreaId = value);
            },
          ),
          const SizedBox(height: 8),
          InkWell(
            borderRadius: BorderRadius.circular(AppRadius.control),
            onTap: () {
              setState(() => _acceptedRgpd = !_acceptedRgpd);
            },
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: <Widget>[
                Checkbox(
                  value: _acceptedRgpd,
                  onChanged: (bool? value) {
                    setState(() => _acceptedRgpd = value ?? false);
                  },
                ),
                const Expanded(
                  child: Text(
                    'Aceito os termos RGPD para partilha/publicacao de badges.',
                    style: TextStyle(fontSize: 13.5, color: AppColors.textDark),
                  ),
                ),
              ],
            ),
          ),
          if (_error != null) ...<Widget>[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF1F2),
                borderRadius: BorderRadius.circular(AppRadius.control),
                border: Border.all(color: const Color(0xFFFECACA)),
              ),
              child: Text(
                _error!,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Color(0xFFB91C1C),
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ],
          const SizedBox(height: 20),
          FilledButton(
            onPressed: _submitting ? null : _submit,
            child: Text(_submitting ? 'A criar...' : 'Registar'),
          ),
          const SizedBox(height: 12),
          OutlinedButton(
            onPressed: widget.onBackToLogin,
            child: const Text('Voltar ao login'),
          ),
        ],
      ),
    );
  }

  Widget _buildSuccess() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: <Widget>[
        const Icon(
          Icons.mark_email_read_outlined,
          size: 56,
          color: Color(0xFF065F46),
        ),
        const SizedBox(height: 16),
        Text(
          'Conta criada!',
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.w900,
            color: const Color(0xFF065F46),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Confirma o email e faz login para acederes ao portal.',
          textAlign: TextAlign.center,
          style: Theme.of(
            context,
          ).textTheme.bodyMedium?.copyWith(color: const Color(0xFF5B6B7F)),
        ),
        const SizedBox(height: 24),
        FilledButton(
          onPressed: widget.onBackToLogin,
          child: const Text('Voltar ao login'),
        ),
      ],
    );
  }
}
