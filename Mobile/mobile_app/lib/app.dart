import 'package:flutter/material.dart';

import 'core/theme/app_theme.dart';
import 'features/consultor/data/consultor_repository.dart';
import 'features/consultor/presentation/controllers/consultor_controller.dart';
import 'features/consultor/presentation/pages/consultor_shell_page.dart';

class BadgesPintApp extends StatelessWidget {
  const BadgesPintApp({super.key});

  @override
  Widget build(BuildContext context) {
    final repository = ConsultorRepository();

    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Badges PINT',
      theme: AppTheme.light(),
      home: ConsultorShellPage(
        controller: ConsultorController(repository: repository)..initialize(),
      ),
    );
  }
}
