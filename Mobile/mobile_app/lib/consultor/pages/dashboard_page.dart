import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../consultor_models.dart';
import '../consultor_controller.dart';
import '../widgets/badge_medal.dart';
import '../../shared/app_theme.dart';
import 'badge_detail_page.dart';
import 'gamification_page.dart';
import 'pedidos_page.dart';
import 'timeline_page.dart';
import 'upload_page.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({required this.controller, super.key});

  final ConsultorController controller;

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage>
    with SingleTickerProviderStateMixin {
  late TextEditingController _searchController;
  int _selectedTab = 0; // 0: All, 1: Mine
  String _personalGoal = '';
  String _goalDeadline = '';

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController();
    _loadGoal();
    WidgetsBinding.instance.addPostFrameCallback(
      (_) => _showMilestoneIfNeeded(),
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadGoal() async {
    final prefs = await SharedPreferences.getInstance();
    if (!mounted) return;

    setState(() {
      _personalGoal = prefs.getString('settings_objetivo') ?? '';
      _goalDeadline = prefs.getString('settings_data_limite') ?? '';
    });
  }

  Future<void> _showMilestoneIfNeeded() async {
    final obtained = widget.controller.badges.where((b) => b.isObtained).length;
    if (obtained < 3 || !mounted) return;

    final prefs = await SharedPreferences.getInstance();
    final key = 'milestone_3_badges_shown_${widget.controller.profile?.id ?? 0}';
    if (prefs.getBool(key) == true || !mounted) return;

    await prefs.setBool(key, true);
    if (!mounted) return;
    await showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        icon: const Icon(Icons.celebration_rounded, color: AppColors.primary),
        title: const Text('Marco alcancado'),
        content: const Text(
          'Ja atingiste 3 badges obtidos. Continua a evoluir no teu percurso.',
        ),
        actions: [
          FilledButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Continuar'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 1100),
        child: ListView(
          padding: const EdgeInsets.only(bottom: 100),
          children: <Widget>[
            _buildHeader(context),
            _buildGoalCard(context),
            _buildGamificationShortcut(context),
            _buildTimelineShortcut(context),
            _buildNextActionCard(context),
            _buildLearningPaths(context),
            _buildSpecialAchievements(context),
            _buildRecommendationsAndAlerts(context),
            _buildSearchBar(context),
            _buildTabBar(context),
            _buildBadgeGrid(context),
          ],
        ),
      ),
    );
  }

  Widget _buildGoalCard(BuildContext context) {
    if (_personalGoal.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: const Color(0xFFFFFBEB),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFFDE68A)),
        ),
        child: Row(
          children: [
            const Icon(Icons.flag, color: Color(0xFFD97706)),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Objetivo ativo',
                    style: TextStyle(fontWeight: FontWeight.w800),
                  ),
                  Text(
                    _goalDeadline.isEmpty
                        ? _personalGoal
                        : '$_personalGoal - ate $_goalDeadline',
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTimelineShortcut(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      child: OutlinedButton.icon(
        onPressed: () => Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => TimelinePage(controller: widget.controller),
          ),
        ),
        icon: const Icon(Icons.timeline_rounded),
        label: const Text('Ver timeline profissional'),
      ),
    );
  }

  Widget _buildGamificationShortcut(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      child: FilledButton.tonalIcon(
        onPressed: () => Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => GamificationPage(controller: widget.controller),
          ),
        ),
        icon: const Icon(Icons.stars_rounded),
        label: const Text('Ver gamification'),
      ),
    );
  }

  Widget _buildNextActionCard(BuildContext context) {
    final activePedido = widget.controller.pedidosStatus.where((pedido) {
      final workflow = pedido.workflowStatus.toLowerCase();
      final status = pedido.status.toLowerCase();
      return status != 'obtido' &&
          workflow != 'obtido' &&
          workflow != 'rejeitado' &&
          workflow != 'cancelado';
    }).toList();

    if (activePedido.isNotEmpty) {
      final pedido = activePedido.first;
      return _nextActionShell(
        icon: Icons.upload_file_rounded,
        title: 'Continua o badge ${pedido.badgeName}',
        text: 'Tens uma candidatura ativa. Submete ou acompanha evidencias para avançar.',
        actionLabel: 'Abrir upload',
        onPressed: () async {
          await widget.controller.selectBadge(pedido.badgeId);
          if (!context.mounted) return;
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => UploadPage(controller: widget.controller),
            ),
          );
        },
      );
    }

    if (widget.controller.recommendations.isNotEmpty) {
      final rec = widget.controller.recommendations.first;
      final matches = widget.controller.catalogBadges.where(
        (badge) => badge.id == rec.id,
      );
      return _nextActionShell(
        icon: Icons.auto_awesome_rounded,
        title: 'Proximo badge recomendado',
        text: '${rec.name} - ${rec.reason}',
        actionLabel: 'Ver badge',
        onPressed: matches.isEmpty
            ? null
            : () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => BadgeDetailPage(
                      badge: matches.first,
                      controller: widget.controller,
                    ),
                  ),
                );
              },
      );
    }

    return _nextActionShell(
      icon: Icons.workspace_premium_rounded,
      title: 'Explora novos badges',
      text: 'Consulta o catalogo e escolhe a proxima formacao para desenvolver competencias.',
      actionLabel: 'Ver catalogo',
      onPressed: () => context.go('/app/home'),
    );
  }

  Widget _nextActionShell({
    required IconData icon,
    required String title,
    required String text,
    required String actionLabel,
    required VoidCallback? onPressed,
  }) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.borderLight),
        ),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(icon, color: AppColors.primary),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontWeight: FontWeight.w900),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    text,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(color: Colors.grey.shade700),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 10),
            FilledButton.tonal(
              onPressed: onPressed,
              child: Text(
                actionLabel,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    final obtained = widget.controller.badges.where((b) => b.isObtained).length;
    final total = widget.controller.badges.length;
    final progress = total == 0 ? 0.0 : obtained / total;
    final firstName = widget.controller.profile?.name.trim().split(' ').first;
    final milestoneText =
        obtained >= 3
            ? 'Marco alcancado: ja concluiste pelo menos 3 badges.'
            : 'Proximo marco: conclui 3 badges para desbloquear celebracao.';

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppColors.primary,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${_timeGreeting()}, ${firstName?.isEmpty == false ? firstName : 'Consultor'}',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),

            const SizedBox(height: 8),

            Text(
              '$obtained de $total badges obtidos - ${widget.controller.totalPoints} pontos',
              style: const TextStyle(color: Colors.white70, fontSize: 14),
            ),

            const SizedBox(height: 16),

            LinearProgressIndicator(
              value: progress,
              backgroundColor: Colors.white24,
              valueColor: const AlwaysStoppedAnimation(AppColors.accent),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Icon(
                  obtained >= 3 ? Icons.celebration : Icons.flag_outlined,
                  color: Colors.white,
                  size: 18,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    milestoneText,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.white,
                side: const BorderSide(color: Colors.white70),
              ),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => PedidosPage(controller: widget.controller),
                  ),
                );
              },
              icon: const Icon(Icons.assignment_outlined),
              label: Text(
                '${widget.controller.pedidosStatus.length} pedidos em curso',
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLearningPaths(BuildContext context) {
    final controller = widget.controller;
    final items = controller.learningPaths.take(5).toList();
    if (items.isEmpty) return const SizedBox.shrink();

    return SizedBox(
      height: 132,
      child: ListView.separated(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
        scrollDirection: Axis.horizontal,
        itemCount: items.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (context, index) {
          final path = items[index];
          final value = (path.progress / 100).clamp(0.0, 1.0).toDouble();

          return SizedBox(
            width: 250,
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.route, color: AppColors.primary),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            path.name,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontWeight: FontWeight.w800),
                          ),
                        ),
                      ],
                    ),
                    const Spacer(),
                    LinearProgressIndicator(
                      value: value.clamp(0.0, 1.0).toDouble(),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '${path.obtainedBadges}/${path.totalBadges} badges - ${path.progress}% do learning path',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildSpecialAchievements(BuildContext context) {
    final special = widget.controller.badges
        .where(
          (badge) =>
              badge.isObtained &&
              (badge.name.toLowerCase().contains('especialista') ||
                  badge.name.toLowerCase().contains('lider') ||
                  (badge.area?.toLowerCase().contains('certificacao') ??
                      false)),
        )
        .take(3)
        .toList();

    if (special.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: const Color(0xFFF5F3FF),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFDDD6FE)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.diamond_outlined, color: Color(0xFF6D28D9)),
                SizedBox(width: 8),
                Text(
                  'Conquistas especiais',
                  style: TextStyle(fontWeight: FontWeight.w900),
                ),
              ],
            ),
            const SizedBox(height: 10),
            ...special.map(
              (badge) => Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Row(
                  children: [
                    const Icon(
                      Icons.check_circle,
                      size: 16,
                      color: Color(0xFF6D28D9),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        badge.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _timeGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Bom dia';
    if (hour < 19) return 'Boa tarde';
    return 'Boa noite';
  }

  Widget _buildRecommendationsAndAlerts(BuildContext context) {
    final recommendations = widget.controller.recommendations.take(2).toList();
    final alerts = widget.controller.expiryAlerts.take(2).toList();

    if (recommendations.isEmpty && alerts.isEmpty) {
      return const SizedBox.shrink();
    }

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      child: Column(
        children: [
          ...recommendations.map(
            (item) => _dashboardNotice(
              Icons.auto_awesome,
              'Proximo badge recomendado',
              '${item.name} - ${item.reason}',
            ),
          ),
          ...alerts.map(
            (item) => _dashboardNotice(
              Icons.schedule,
              'Alerta de expiracao',
              '${item.name} expira em ${item.expireInDays} dias',
            ),
          ),
        ],
      ),
    );
  }

  Widget _dashboardNotice(IconData icon, String title, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.borderLight),
        ),
        child: Row(
          children: [
            Icon(icon, color: AppColors.primary),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(fontWeight: FontWeight.w800),
                  ),
                  Text(text, maxLines: 2, overflow: TextOverflow.ellipsis),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchBar(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
      child: Row(
        children: <Widget>[
          Expanded(
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Pesquisar badges...',
                prefixIcon: Icon(Icons.search, color: AppColors.primary),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 13,
                ),
              ),
              onChanged: (_) => setState(() {}),
            ),
          ),
          const SizedBox(width: 10),
          Container(
            decoration: BoxDecoration(
              color: scheme.surfaceContainerHighest.withValues(alpha: 0.5),
              border: Border.all(color: scheme.outlineVariant),
              borderRadius: BorderRadius.circular(14),
            ),
            child: IconButton(
              icon: Icon(Icons.tune_rounded, color: scheme.onSurfaceVariant),
              onPressed: () {},
              tooltip: 'Filtros',
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTabBar(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
      child: Row(
        children: <Widget>[
          _buildTabChip(context, 'Todos', 0),
          const SizedBox(width: 10),
          _buildTabChip(context, 'Os meus', 1),
        ],
      ),
    );
  }

  Widget _buildTabChip(BuildContext context, String label, int index) {
    final scheme = Theme.of(context).colorScheme;
    final isSelected = _selectedTab == index;

    return GestureDetector(
      onTap: () => setState(() => _selectedTab = index),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 9),
        decoration: BoxDecoration(
          color:
              isSelected
                  ? scheme.primary
                  : scheme.surfaceContainerHighest.withValues(alpha: 0.4),
          borderRadius: BorderRadius.circular(999),
          border: Border.all(
            color: isSelected ? scheme.primary : scheme.outlineVariant,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w700,
            color: isSelected ? Colors.white : scheme.onSurfaceVariant,
          ),
        ),
      ),
    );
  }

  Widget _buildBadgeGrid(BuildContext context) {
    final query = _searchController.text.toLowerCase();
    final all = widget.controller.badges;
    final filtered =
        (_selectedTab == 0 ? all : all.where((b) => b.isObtained))
            .where(
              (b) =>
                  b.name.toLowerCase().contains(query) ||
                  (b.area?.toLowerCase().contains(query) ?? false),
            )
            .toList();

    if (filtered.isEmpty) {
      return _buildEmptyState(context);
    }

    return LayoutBuilder(
      builder: (context, constraints) {
        // Mobile: 1 column list-style cards; Tablet+: 2-column grid
        final isWide = constraints.maxWidth > 580;

        if (!isWide) {
          // List style for mobile — more comfortable than a cramped grid
          return ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 0),
            itemCount: filtered.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder:
                (context, index) =>
                    _buildBadgeListCard(context, filtered[index]),
          );
        }

        return GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(16, 4, 16, 0),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 14,
            mainAxisSpacing: 14,
            childAspectRatio: 1.1,
          ),
          itemCount: filtered.length,
          itemBuilder:
              (context, index) => _buildBadgeGridCard(context, filtered[index]),
        );
      },
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: scheme.surfaceContainerHighest.withValues(alpha: 0.5),
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.search_off_rounded,
              size: 40,
              color: scheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            _selectedTab == 0
                ? 'Nenhum curso encontrado'
                : 'Ainda não obteste nenhum curso',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w700,
              color: scheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            _selectedTab == 0
                ? 'Tenta ajustar a pesquisa ou os filtros.'
                : 'Completa os requisitos de um badge para o obter.',
            style: TextStyle(fontSize: 13, color: scheme.onSurfaceVariant),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  /// Mobile: horizontal card with icon on the left
  Widget _buildBadgeListCard(BuildContext context, BadgeItem badge) {
    final colors = _getBadgeCardColor(badge);
    final scheme = Theme.of(context).colorScheme;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => _openBadge(context, badge),
        borderRadius: BorderRadius.circular(16),
        child: Ink(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            color:
                Theme.of(context).brightness == Brightness.dark
                    ? scheme.surfaceContainer
                    : colors['background'] as Color,
            border: Border.all(
              color: scheme.outlineVariant.withValues(alpha: 0.6),
            ),
            boxShadow: <BoxShadow>[
              BoxShadow(
                color: (colors['icon'] as Color).withValues(alpha: 0.08),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              children: <Widget>[
                BadgeMedal(
                  imageUrl: badge.imageUrl,
                  label: badge.isObtained ? 'Obtido' : 'Badge',
                  size: 56,
                ),
                const SizedBox(width: 14),
                // Content
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text(
                        badge.name,
                        style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 15,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      if (badge.area != null) ...<Widget>[
                        const SizedBox(height: 3),
                        Text(
                          badge.area!,
                          style: TextStyle(
                            fontSize: 12,
                            color: scheme.onSurfaceVariant,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                      const SizedBox(height: 8),
                      Row(
                        children: <Widget>[
                          const Icon(
                            Icons.star_rounded,
                            size: 14,
                            color: Color(0xFFFFB800),
                          ),
                          const SizedBox(width: 3),
                          const Text(
                            '4.8',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const Spacer(),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: (colors['iconBackground'] as Color)
                                  .withValues(alpha: 0.14),
                              borderRadius: BorderRadius.circular(999),
                            ),
                            child: Text(
                              '${badge.points} pts',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: colors['icon'] as Color,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                if (badge.isObtained)
                  Icon(
                    Icons.check_circle_rounded,
                    color: Colors.green.shade600,
                    size: 20,
                  )
                else
                  Icon(
                    Icons.chevron_right_rounded,
                    color: scheme.onSurfaceVariant,
                    size: 22,
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  /// Tablet/desktop: vertical grid card
  Widget _buildBadgeGridCard(BuildContext context, BadgeItem badge) {
    final colors = _getBadgeCardColor(badge);
    final scheme = Theme.of(context).colorScheme;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => _openBadge(context, badge),
        borderRadius: BorderRadius.circular(16),
        child: Ink(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            color:
                Theme.of(context).brightness == Brightness.dark
                    ? scheme.surfaceContainer
                    : colors['background'] as Color,
            border: Border.all(
              color: scheme.outlineVariant.withValues(alpha: 0.6),
            ),
            boxShadow: <BoxShadow>[
              BoxShadow(
                color: (colors['icon'] as Color).withValues(alpha: 0.08),
                blurRadius: 12,
                offset: const Offset(0, 5),
              ),
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: <Widget>[
                    BadgeMedal(
                      imageUrl: badge.imageUrl,
                      label: badge.isObtained ? 'Obtido' : 'Badge',
                      size: 52,
                    ),
                    if (badge.isObtained)
                      Icon(
                        Icons.check_circle_rounded,
                        color: Colors.green.shade600,
                        size: 20,
                      ),
                  ],
                ),
                const Spacer(),
                Text(
                  badge.name,
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 14,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                if (badge.area != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 3),
                    child: Text(
                      badge.area!,
                      style: TextStyle(
                        fontSize: 11,
                        color: scheme.onSurfaceVariant,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                const SizedBox(height: 10),
                Row(
                  children: <Widget>[
                    const Icon(
                      Icons.star_rounded,
                      size: 13,
                      color: Color(0xFFFFB800),
                    ),
                    const SizedBox(width: 3),
                    const Text(
                      '4.8',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const Spacer(),
                    Text(
                      '${badge.points} pts',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: colors['icon'] as Color,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Map<String, dynamic> _getBadgeCardColor(BadgeItem badge) {
    if (badge.isObtained) {
      return {
        'background': const Color(0xFFEAF6FF),
        'icon': AppColors.accent,
        'iconBackground': AppColors.accent,
      };
    }

    return {
      'background': Colors.white,
      'icon': AppColors.primary,
      'iconBackground': AppColors.primary,
    };
  }

  void _openBadge(BuildContext context, BadgeItem badge) {
    final catalogBadge = _catalogBadgeFor(badge);
    Navigator.push(
      context,
      MaterialPageRoute(
        builder:
            (_) => BadgeDetailPage(
              badge: catalogBadge,
              controller: widget.controller,
            ),
      ),
    );
  }

  CatalogBadgeItem _catalogBadgeFor(BadgeItem badge) {
    final matches = <CatalogBadgeItem>[
      ...widget.controller.catalogBadges,
      ...widget.controller.preferredAreaBadges,
    ].where((item) => item.id == badge.id);

    if (matches.isNotEmpty) return matches.first;

    return CatalogBadgeItem(
      id: badge.id,
      name: badge.name,
      description: '',
      points: badge.points,
      level: 1,
      levelLabel: 'Nivel 1',
      areaName: badge.area,
      imageUrl: badge.imageUrl,
    );
  }
}
