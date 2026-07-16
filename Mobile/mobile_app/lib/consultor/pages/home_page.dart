import 'package:flutter/material.dart';

import '../consultor_controller.dart';
import '../consultor_models.dart';
import '../widgets/badge_medal.dart';
import '../../shared/app_theme.dart';
import 'badge_detail_page.dart';

class HomePage extends StatefulWidget {
  const HomePage({required this.controller, super.key});

  final ConsultorController controller;

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  late final TextEditingController _searchController;
  String _selectedArea = 'Todas';
  int? _selectedLevel;
  bool _preferredOnly = false;

  ConsultorController get controller => widget.controller;

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

  List<CatalogBadgeItem> get _filteredCatalog {
    final query = _searchController.text.trim().toLowerCase();
    final preferredIds =
        controller.preferredAreaBadges.map((badge) => badge.id).toSet();

    return controller.catalogBadges.where((badge) {
      final matchesQuery =
          query.isEmpty ||
          badge.name.toLowerCase().contains(query) ||
          badge.description.toLowerCase().contains(query) ||
          (badge.areaName?.toLowerCase().contains(query) ?? false);
      final matchesArea =
          _selectedArea == 'Todas' || badge.areaName == _selectedArea;
      final matchesLevel =
          _selectedLevel == null || badge.level == _selectedLevel;
      final matchesPreferred =
          !_preferredOnly || preferredIds.contains(badge.id);

      return matchesQuery && matchesArea && matchesLevel && matchesPreferred;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final recommended =
        controller.preferredAreaBadges.isNotEmpty
            ? controller.preferredAreaBadges
            : controller.catalogBadges.take(6).toList();
    final filteredCatalog = _filteredCatalog;
    final areas =
        <String>{
          'Todas',
          ...controller.catalogBadges
              .map((badge) => badge.areaName)
              .whereType<String>()
              .where((area) => area.isNotEmpty),
        }.toList();

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 1100),
            child: ListView(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
              children: [
                _catalogHeader(context, scheme),
                const SizedBox(height: 16),
                TextField(
                  controller: _searchController,
                  onChanged: (_) => setState(() {}),
                  decoration: const InputDecoration(
                    hintText: 'Pesquisar badges...',
                    prefixIcon: Icon(Icons.search),
                  ),
                ),
                const SizedBox(height: 12),
                _filters(areas),
                const SizedBox(height: 20),
                _sectionTitle(
                  context,
                  'Recomendados para ti',
                  '${recommended.length} sugestoes',
                ),
                const SizedBox(height: 12),
                SizedBox(
                  height: 216,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: recommended.length,
                    itemBuilder: (context, index) {
                      return _featuredBadgeCard(
                        context,
                        recommended[index],
                        scheme,
                      );
                    },
                  ),
                ),
                const SizedBox(height: 22),
                _sectionTitle(
                  context,
                  'Explorar todos',
                  '${filteredCatalog.length} resultados',
                ),
                const SizedBox(height: 12),
                if (filteredCatalog.isEmpty)
                  const Card(
                    child: Padding(
                      padding: EdgeInsets.all(20),
                      child: Text('Nenhum badge encontrado com estes filtros.'),
                    ),
                  )
                else
                  LayoutBuilder(
                    builder: (context, constraints) {
                      final columns = constraints.maxWidth > 580 ? 3 : 2;
                      return GridView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: filteredCatalog.length,
                        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: columns,
                          crossAxisSpacing: 12,
                          mainAxisSpacing: 12,
                          mainAxisExtent: 226,
                        ),
                        itemBuilder: (context, index) {
                          return _smallBadgeCard(
                            context,
                            filteredCatalog[index],
                            scheme,
                          );
                        },
                      );
                    },
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _sectionTitle(BuildContext context, String title, String trailing) {
    return Row(
      children: [
        Expanded(
          child: Text(
            title,
            style: Theme.of(
              context,
            ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w900),
          ),
        ),
        Text(
          trailing,
          style: TextStyle(
            color: Colors.grey.shade700,
            fontSize: 13,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
    );
  }

  Widget _catalogHeader(BuildContext context, ColorScheme scheme) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.pastelBlue,
        borderRadius: BorderRadius.circular(AppRadius.header),
        border: Border.all(color: AppColors.pastelBlueBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(
                Icons.workspace_premium_rounded,
                color: AppColors.primary,
                size: 24,
              ),
              SizedBox(width: 10),
              Expanded(
                child: Text(
                  'Catalogo de badges',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: AppColors.textDark,
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Pesquisa, filtra e escolhe o proximo badge para evoluir.',
            style: TextStyle(
              color: AppColors.textDark.withValues(alpha: 0.65),
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _catalogMetric(
                  controller.catalogBadges.length.toString(),
                  'badges disponiveis',
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _catalogMetric(
                  controller.preferredAreaBadges.length.toString(),
                  'da tua area',
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              const Icon(Icons.star_rounded, color: AppColors.primary, size: 18),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  '${controller.totalPoints} pontos acumulados',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: AppColors.textDark,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _filters(List<String> areas) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        DropdownMenu<String>(
          initialSelection: _selectedArea,
          width: 160,
          label: const Text('Area'),
          dropdownMenuEntries:
              areas
                  .map((area) => DropdownMenuEntry(value: area, label: area))
                  .toList(),
          onSelected: (value) {
            if (value == null) return;
            setState(() => _selectedArea = value);
          },
        ),
        DropdownMenu<int?>(
          initialSelection: _selectedLevel,
          width: 140,
          label: const Text('Nivel'),
          dropdownMenuEntries: const [
            DropdownMenuEntry<int?>(value: null, label: 'Todos'),
            DropdownMenuEntry<int?>(value: 1, label: 'Junior'),
            DropdownMenuEntry<int?>(value: 2, label: 'Intermedio'),
            DropdownMenuEntry<int?>(value: 3, label: 'Senior'),
            DropdownMenuEntry<int?>(value: 4, label: 'Especialista'),
            DropdownMenuEntry<int?>(value: 5, label: 'Lider'),
          ],
          onSelected: (value) => setState(() => _selectedLevel = value),
        ),
        FilterChip(
          selected: _preferredOnly,
          label: const Text('Da minha area'),
          avatar: const Icon(Icons.auto_awesome, size: 18),
          onSelected: (value) => setState(() => _preferredOnly = value),
        ),
      ],
    );
  }

  Widget _featuredBadgeCard(
    BuildContext context,
    CatalogBadgeItem badge,
    ColorScheme scheme,
  ) {
    return GestureDetector(
      onTap: () => _openBadge(context, badge),
      child: Container(
        width: 260,
        margin: const EdgeInsets.only(right: 12),
        decoration: BoxDecoration(
          color: AppColors.lightCard,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.borderLight),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(16),
              ),
              child: _badgeImage(
                badge,
                height: 84,
                width: double.infinity,
                backgroundColor: scheme.primary,
              ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      badge.name,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      badge.description,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        color: Colors.grey.shade700,
                        fontSize: 12,
                      ),
                    ),
                    const Spacer(),
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            badge.areaName ?? 'Area Geral',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              color: Colors.grey.shade600,
                              fontSize: 12,
                            ),
                          ),
                        ),
                        Text(
                          '${badge.points} pts',
                          style: TextStyle(
                            color: scheme.primary,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ],
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

  Widget _smallBadgeCard(
    BuildContext context,
    CatalogBadgeItem badge,
    ColorScheme scheme,
  ) {
    return InkWell(
      borderRadius: BorderRadius.circular(18),
      onTap: () => _openBadge(context, badge),
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.lightCard,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.borderLight),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(16),
              ),
              child: _badgeImage(
                badge,
                height: 72,
                width: double.infinity,
                backgroundColor: scheme.primary,
              ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      badge.name,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      badge.description,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        color: Colors.grey.shade600,
                        fontSize: 12,
                      ),
                    ),
                    const Spacer(),
                    Text(
                      '${badge.points} pts',
                      style: TextStyle(
                        color: scheme.primary,
                        fontWeight: FontWeight.w600,
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

  void _openBadge(BuildContext context, CatalogBadgeItem badge) {
    Navigator.of(context, rootNavigator: true).push(
      MaterialPageRoute(
        builder: (_) => BadgeDetailPage(badge: badge, controller: controller),
      ),
    );
  }

  Widget _badgeImage(
    CatalogBadgeItem badge, {
    required double height,
    required double width,
    required Color backgroundColor,
  }) {
    return Container(
      height: height,
      width: width,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: backgroundColor.withValues(alpha: 0.08),
        border: const Border(bottom: BorderSide(color: AppColors.borderLight)),
      ),
      child: BadgeMedal(
        imageUrl: badge.imageUrl,
        badgeId: badge.id,
        label: badge.levelLabel,
        size: height >= 80 ? 64 : 54,
      ),
    );
  }

  Widget _catalogMetric(String value, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppRadius.control),
        border: Border.all(color: AppColors.pastelBlueBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            value,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              color: AppColors.primary,
              fontSize: 20,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              color: AppColors.textDark.withValues(alpha: 0.6),
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }
}
