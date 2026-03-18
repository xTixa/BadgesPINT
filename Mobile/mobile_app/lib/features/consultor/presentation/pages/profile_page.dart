import 'package:flutter/material.dart';

import '../controllers/consultor_controller.dart';
import '../widgets/section_card.dart';

class ProfilePage extends StatelessWidget {
  const ProfilePage({required this.controller, super.key});

  final ConsultorController controller;

  @override
  Widget build(BuildContext context) {
    final profile = controller.profile;
    final fullName = profile?.name ?? 'Consultor';

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 90),
      children: <Widget>[
        Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(18),
            gradient: const LinearGradient(
              colors: <Color>[Color(0xFF16558C), Color(0xFF1D4ED8)],
            ),
          ),
          padding: const EdgeInsets.all(16),
          child: Row(
            children: <Widget>[
              const CircleAvatar(
                radius: 30,
                backgroundColor: Colors.white,
                child: Icon(Icons.person, size: 34, color: Color(0xFF16558C)),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      fullName,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      profile?.role ?? 'consultant',
                      style: TextStyle(color: Colors.white.withValues(alpha: 0.85)),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        SectionCard(
          title: 'Informacao pessoal',
          child: Column(
            children: <Widget>[
              _line('Email', profile?.email ?? 'sem email'),
              const SizedBox(height: 8),
              _line('Localizacao', profile?.location ?? 'Nao definida'),
            ],
          ),
        ),
        const SizedBox(height: 12),
        SectionCard(
          title: 'Resumo',
          child: Column(
            children: <Widget>[
              _line('Pontos totais', controller.totalPoints.toString()),
              const SizedBox(height: 8),
              _line('Badges obtidos', controller.badgesObtidos.toString()),
              const SizedBox(height: 8),
              _line('Progresso global', '${controller.globalProgress}%'),
            ],
          ),
        ),
        const SizedBox(height: 12),
        SectionCard(
          title: 'Atividade recente',
          child: Column(
            children: const <Widget>[
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: Icon(Icons.check_circle_outline, color: Color(0xFF059669)),
                title: Text('Conquistou o badge DevOps Intermedio'),
                subtitle: Text('Ha 2 dias'),
              ),
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: Icon(Icons.upload_file, color: Color(0xFF0284C7)),
                title: Text('Submeteu evidencias para Outsystems'),
                subtitle: Text('Ha 5 dias'),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _line(String label, String value) {
    return Row(
      children: <Widget>[
        Expanded(
          child: Text(
            label,
            style: const TextStyle(color: Color(0xFF475569)),
          ),
        ),
        Text(
          value,
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
      ],
    );
  }
}
