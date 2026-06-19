import 'package:flutter/material.dart';

import '../consultor_controller.dart';
import '../consultor_models.dart';
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
    final name = controller.profile?.name ?? 'Consultor';
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
      backgroundColor: const Color(0xFFF4F4F4),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _hero(context, scheme, name),
            const SizedBox(height: 20),
            TextField(
              controller: _searchController,
              onChanged: (_) => setState(() {}),
              decoration: InputDecoration(
                hintText: 'Pesquisar badges...',
                prefixIcon: const Icon(Icons.search),
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(18),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
            const SizedBox(height: 12),
            _filters(areas),
            const SizedBox(height: 24),
            const Text(
              'Recomendados para Ti',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            SizedBox(
              height: 210,
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
            const SizedBox(height: 24),
            Row(
              children: [
                const Expanded(
                  child: Text(
                    'Explorar Todos',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                ),
                Text('${filteredCatalog.length} resultados'),
              ],
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
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: filteredCatalog.length,
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 0.75,
                ),
                itemBuilder: (context, index) {
                  return _smallBadgeCard(
                    context,
                    filteredCatalog[index],
                    scheme,
                  );
                },
              ),
          ],
        ),
      ),
    );
  }

  Widget _hero(BuildContext context, ColorScheme scheme, String name) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: scheme.primary,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Ola, $name!',
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Continua a desenvolver as tuas competencias',
                      style: TextStyle(color: Colors.white70),
                    ),
                  ],
                ),
              ),
              CircleAvatar(
                radius: 30,
                backgroundColor: Colors.white24,
                child: Text(
                  name.isNotEmpty ? name[0].toUpperCase() : '?',
                  style: const TextStyle(
                    fontSize: 26,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: _heroStat(controller.totalPoints.toString(), 'Pontos'),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: _heroStat(
                  controller.catalogBadges.length.toString(),
                  'Badges',
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
        width: 280,
        margin: const EdgeInsets.only(right: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.07),
              blurRadius: 14,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(24),
              ),
              child: _badgeImage(
                badge,
                height: 92,
                width: double.infinity,
                iconSize: 34,
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
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 10,
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(18),
              ),
              child: _badgeImage(
                badge,
                height: 76,
                width: double.infinity,
                iconSize: 28,
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
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => BadgeDetailPage(badge: badge, controller: controller),
      ),
    );
  }

  Widget _badgeImage(
    CatalogBadgeItem badge, {
    required double height,
    required double width,
    required double iconSize,
    required Color backgroundColor,
  }) {
    final imageUrl = badge.imageUrl;
    if (imageUrl != null && imageUrl.isNotEmpty) {
      return Image.network(
        imageUrl,
        height: height,
        width: width,
        fit: BoxFit.cover,
        errorBuilder: (_, __, ___) => _badgeImageFallback(
          height: height,
          width: width,
          iconSize: iconSize,
          backgroundColor: backgroundColor,
        ),
      );
    }

    return _badgeImageFallback(
      height: height,
      width: width,
      iconSize: iconSize,
      backgroundColor: backgroundColor,
    );
  }

  Widget _badgeImageFallback({
    required double height,
    required double width,
    required double iconSize,
    required Color backgroundColor,
  }) {
    return Container(
      height: height,
      width: width,
      color: backgroundColor.withValues(alpha: 0.12),
      child: Icon(
        Icons.workspace_premium_rounded,
        color: backgroundColor,
        size: iconSize,
      ),
    );
  }

  Widget _heroStat(String value, String label) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          value,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(color: Colors.white70),
        ),
      ],
    );
  }
}
