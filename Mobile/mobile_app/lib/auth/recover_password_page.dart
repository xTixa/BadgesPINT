import 'package:flutter/material.dart';

import '../shared/app_theme.dart';

class RecoverPasswordPage extends StatefulWidget {
  const RecoverPasswordPage({
    required this.onRecover,
    required this.onBack,
    super.key,
  });

  final Future<String?> Function(String email) onRecover;
  final VoidCallback onBack;

  @override
  State<RecoverPasswordPage> createState() => _RecoverPasswordPageState();
}

class _RecoverPasswordPageState extends State<RecoverPasswordPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  bool _submitting = false;
  bool _sent = false;
  String? _error;

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _submitting = true;
      _error = null;
    });

    final error = await widget.onRecover(_emailController.text.trim());

    if (!mounted) return;
    setState(() {
      _submitting = false;
      if (error == null) {
        _sent = true;
      } else {
        _error = error;
      }
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
                    borderRadius: BorderRadius.circular(24),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(28),
                    child: _sent ? _buildSuccess() : _buildForm(),
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
            Icons.lock_reset_outlined,
            size: 48,
            color: AppColors.primary,
          ),
          const SizedBox(height: 12),
          Text(
            'Recuperar password',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Indica o teu email e enviamos as instrucoes para recuperar a password.',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: const Color(0xFF5B6B7F),
            ),
          ),
          const SizedBox(height: 24),
          TextFormField(
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
            decoration: const InputDecoration(
              labelText: 'Email',
              hintText: 'exemplo@softinsa.pt',
              prefixIcon: Icon(Icons.mail_outline_rounded),
            ),
            validator: (value) {
              final text = (value ?? '').trim();
              if (text.isEmpty) return 'Indica o teu email';
              if (!text.contains('@')) return 'Email invalido';
              return null;
            },
          ),
          if (_error != null) ...<Widget>[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF1F2),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFFECACA)),
              ),
              child: Text(
                _error!,
                style: const TextStyle(color: Color(0xFFB91C1C)),
              ),
            ),
          ],
          const SizedBox(height: 20),
          FilledButton(
            onPressed: _submitting ? null : _submit,
            child: Text(_submitting ? 'A enviar...' : 'Enviar instrucoes'),
          ),
          const SizedBox(height: 12),
          OutlinedButton(
            onPressed: widget.onBack,
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
          'Email enviado!',
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.w900,
            color: const Color(0xFF065F46),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Verifica a tua caixa de entrada em ${_emailController.text.trim()} e segue as instrucoes para redefinir a password.',
          textAlign: TextAlign.center,
          style: Theme.of(
            context,
          ).textTheme.bodyMedium?.copyWith(color: const Color(0xFF5B6B7F)),
        ),
        const SizedBox(height: 24),
        FilledButton(
          onPressed: widget.onBack,
          child: const Text('Voltar ao login'),
        ),
      ],
    );
  }
}
