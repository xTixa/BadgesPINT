import 'package:flutter/material.dart';
import '../consultor_models.dart';
import '../consultor_controller.dart';
import '../../shared/app_theme.dart';

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

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 1100),
        child: Column(
          children: <Widget>[
            _buildSearchBar(context),
            _buildTabBar(context),
            Expanded(child: _buildBadgeGrid(context)),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    final obtained = widget.controller.badges.where((b) => b.isObtained).length;

    final total = widget.controller.badges.length;

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
            const Text(
              'Os Meus Badges',
              style: TextStyle(
                color: Colors.white,
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),

            const SizedBox(height: 8),

            Text(
              '$obtained de $total badges obtidos',
              style: const TextStyle(color: Colors.white70, fontSize: 14),
            ),

            const SizedBox(height: 16),

            LinearProgressIndicator(
              value: obtained / total,
              backgroundColor: Colors.white24,
              valueColor: const AlwaysStoppedAnimation(AppColors.accent),
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
              color: scheme.surfaceContainerHighest.withOpacity(0.5),
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
                  : scheme.surfaceContainerHighest.withOpacity(0.4),
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
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 100),
            itemCount: filtered.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder:
                (context, index) =>
                    _buildBadgeListCard(context, filtered[index]),
          );
        }

        return GridView.builder(
          padding: const EdgeInsets.fromLTRB(16, 4, 16, 100),
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
              color: scheme.surfaceContainerHighest.withOpacity(0.5),
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
        onTap: () {},
        borderRadius: BorderRadius.circular(16),
        child: Ink(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            color:
                Theme.of(context).brightness == Brightness.dark
                    ? scheme.surfaceContainer
                    : colors['background'] as Color,
            border: Border.all(color: scheme.outlineVariant.withOpacity(0.6)),
            boxShadow: <BoxShadow>[
              BoxShadow(
                color: (colors['icon'] as Color).withOpacity(0.08),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              children: <Widget>[
                // Icon
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: (colors['iconBackground'] as Color).withOpacity(
                      0.18,
                    ),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Icon(
                    Icons.workspace_premium_rounded,
                    color: colors['icon'] as Color,
                    size: 28,
                  ),
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
                                  .withOpacity(0.14),
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
        onTap: () {},
        borderRadius: BorderRadius.circular(16),
        child: Ink(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            color:
                Theme.of(context).brightness == Brightness.dark
                    ? scheme.surfaceContainer
                    : colors['background'] as Color,
            border: Border.all(color: scheme.outlineVariant.withOpacity(0.6)),
            boxShadow: <BoxShadow>[
              BoxShadow(
                color: (colors['icon'] as Color).withOpacity(0.08),
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
                    Container(
                      width: 52,
                      height: 52,
                      decoration: BoxDecoration(
                        color: (colors['iconBackground'] as Color).withOpacity(
                          0.18,
                        ),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Icon(
                        Icons.workspace_premium_rounded,
                        color: colors['icon'] as Color,
                        size: 26,
                      ),
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
}
