import 'package:flutter/material.dart';

import '../../shared/app_theme.dart';
import '../consultor_controller.dart';
import '../consultor_models.dart';

class TimelinePage extends StatelessWidget {
  const TimelinePage({required this.controller, super.key});

  final ConsultorController controller;

  @override
  Widget build(BuildContext context) {
    final profile = controller.profile;
    final goalText = (profile?.goalText ?? '').trim();
    final certificates = controller.certificates;
    final recommendations = controller.recommendations;
    final expiryAlerts = controller.expiryAlerts;

    return Scaffold(
      appBar: AppBar(title: const Text('Timeline profissional')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
        children: [
          _summaryCard(goalText, profile?.goalDeadline),
          const SizedBox(height: 12),
          _learningPathCard(),
          const SizedBox(height: 12),
          if (recommendations.isNotEmpty)
            _timelineStep(
              icon: Icons.auto_awesome_rounded,
              title: 'Proximo passo recomendado',
              text:
                  '${recommendations.first.name} - ${recommendations.first.reason}',
              tone: const Color(0xFF0F62FE),
            ),
          if (expiryAlerts.isNotEmpty)
            _timelineStep(
              icon: Icons.schedule_rounded,
              title: 'Alerta de expiracao',
              text:
                  '${expiryAlerts.first.name} expira em ${expiryAlerts.first.expireInDays} dias.',
              tone: const Color(0xFFB45309),
            ),
          if (certificates.isEmpty)
            _emptyState()
          else
            ...certificates.map(_certificateStep),
        ],
      ),
    );
  }

  Widget _summaryCard(String goalText, String? deadline) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.pastelPeach,
        borderRadius: BorderRadius.circular(AppRadius.header),
        border: Border.all(color: AppColors.pastelPeachBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Objetivo atual',
            style: TextStyle(
              color: AppColors.textDark,
              fontSize: 18,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            goalText.isEmpty ? 'Define um objetivo nas definicoes.' : goalText,
            style: const TextStyle(color: AppColors.textDark, fontSize: 15),
          ),
          if ((deadline ?? '').isNotEmpty) ...[
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.event_rounded, color: Color(0xFFC2760F), size: 18),
                const SizedBox(width: 8),
                Text(
                  'Ate $deadline',
                  style: TextStyle(
                    color: AppColors.textDark.withValues(alpha: 0.7),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _learningPathCard() {
    if (controller.learningPaths.isEmpty) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Progresso por learning path',
            style: TextStyle(fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 12),
          ...controller.learningPaths.map(_pathProgress),
        ],
      ),
    );
  }

  Widget _pathProgress(LearningPathProgressItem path) {
    final value = (path.progress / 100).clamp(0.0, 1.0).toDouble();
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  path.name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontWeight: FontWeight.w800),
                ),
              ),
              Text('${path.progress}%'),
            ],
          ),
          const SizedBox(height: 6),
          LinearProgressIndicator(value: value, minHeight: 7),
          const SizedBox(height: 4),
          Text(
            '${path.obtainedBadges}/${path.totalBadges} badges concluidos',
            style: TextStyle(color: Colors.grey.shade700, fontSize: 12),
          ),
        ],
      ),
    );
  }

  Widget _certificateStep(CertificateItem certificate) {
    return _timelineStep(
      icon: Icons.workspace_premium_rounded,
      title: certificate.badgeName,
      text:
          'Certificado obtido${_formatDate(certificate.awardedAt).isEmpty ? '' : ' em ${_formatDate(certificate.awardedAt)}'}'
          '${(certificate.areaName ?? '').isEmpty ? '' : ' - ${certificate.areaName}'}',
      tone: const Color(0xFF16A34A),
    );
  }

  Widget _timelineStep({
    required IconData icon,
    required String title,
    required String text,
    required Color tone,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: tone.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: tone),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.borderLight),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(fontWeight: FontWeight.w900),
                  ),
                  const SizedBox(height: 4),
                  Text(text, style: TextStyle(color: Colors.grey.shade700)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _emptyState() {
    return _timelineStep(
      icon: Icons.flag_outlined,
      title: 'Primeiro certificado',
      text: 'Conclui um badge para comecar a preencher a tua timeline.',
      tone: AppColors.primary,
    );
  }

  String _formatDate(String? value) {
    if (value == null || value.isEmpty) return '';
    final date = DateTime.tryParse(value);
    if (date == null) return value;
    return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';
  }
}
