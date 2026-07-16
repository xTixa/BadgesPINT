import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../shared/app_theme.dart';
import '../consultor_controller.dart';
import '../consultor_models.dart';

const Map<String, Color> _levelColors = {
  'Junior': Color(0xFF10B981),
  'Intermedio': Color(0xFF2563EB),
  'Senior': Color(0xFF7C3AED),
  'Especialista': Color(0xFFD97706),
  'Lider': Color(0xFFE11D48),
};

class GalleryPage extends StatefulWidget {
  const GalleryPage({required this.controller, super.key});

  final ConsultorController controller;

  @override
  State<GalleryPage> createState() => _GalleryPageState();
}

class _GalleryPageState extends State<GalleryPage> {
  late Future<List<PublicGalleryEntry>> _future;
  final TextEditingController _searchController = TextEditingController();
  String _search = '';
  String _selectedArea = 'Todas';

  @override
  void initState() {
    super.initState();
    _future = widget.controller.repository.getPublicGallery();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Galeria publica')),
      body: FutureBuilder<List<PublicGalleryEntry>>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          final entries = snapshot.data ?? const <PublicGalleryEntry>[];
          final areas = <String>{
            for (final entry in entries)
              if ((entry.areaName ?? '').isNotEmpty) entry.areaName!,
          }.toList()
            ..sort();

          final filtered = entries.where((entry) {
            final matchesSearch = _search.isEmpty ||
                entry.name.toLowerCase().contains(_search.toLowerCase());
            final matchesArea =
                _selectedArea == 'Todas' || entry.areaName == _selectedArea;
            return matchesSearch && matchesArea;
          }).toList();

          return ListView(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
            children: [
              TextField(
                controller: _searchController,
                decoration: const InputDecoration(
                  hintText: 'Pesquisar consultor...',
                  prefixIcon: Icon(Icons.search),
                ),
                onChanged: (value) => setState(() => _search = value),
              ),
              const SizedBox(height: 12),
              if (areas.isNotEmpty)
                SizedBox(
                  height: 40,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    children: [
                      _areaChip('Todas'),
                      for (final area in areas) _areaChip(area),
                    ],
                  ),
                ),
              const SizedBox(height: 16),
              if (entries.isEmpty)
                const Padding(
                  padding: EdgeInsets.only(top: 60),
                  child: Center(
                    child: Text(
                      'Ainda nao ha perfis publicos disponiveis.',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.grey),
                    ),
                  ),
                )
              else if (filtered.isEmpty)
                const Padding(
                  padding: EdgeInsets.only(top: 60),
                  child: Center(
                    child: Text(
                      'Sem resultados para os filtros escolhidos.',
                      style: TextStyle(color: Colors.grey),
                    ),
                  ),
                )
              else
                GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                    childAspectRatio: 0.66,
                  ),
                  itemCount: filtered.length,
                  itemBuilder: (context, index) => _GalleryCard(entry: filtered[index]),
                ),
            ],
          );
        },
      ),
    );
  }

  Widget _areaChip(String area) {
    final selected = _selectedArea == area;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Text(area),
        selected: selected,
        onSelected: (_) => setState(() => _selectedArea = area),
      ),
    );
  }
}

class _GalleryCard extends StatelessWidget {
  const _GalleryCard({required this.entry});

  final PublicGalleryEntry entry;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: () => context.push('/consultants/${entry.id}'),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.borderLight),
        ),
        padding: const EdgeInsets.all(10),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            CircleAvatar(
              radius: 26,
              backgroundColor: AppColors.primary.withValues(alpha: 0.12),
              backgroundImage: (entry.avatarUrl ?? '').isNotEmpty
                  ? NetworkImage(entry.avatarUrl!)
                  : null,
              child: (entry.avatarUrl ?? '').isEmpty
                  ? Text(
                      entry.name.isEmpty ? '?' : entry.name[0].toUpperCase(),
                      style: const TextStyle(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w900,
                      ),
                    )
                  : null,
            ),
            const SizedBox(height: 8),
            Text(
              entry.name,
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13),
            ),
            if ((entry.areaName ?? '').isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 2),
                child: Text(
                  entry.areaName!,
                  textAlign: TextAlign.center,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                ),
              ),
            const SizedBox(height: 6),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _stat('${entry.badgeCount}', 'Badges'),
                _stat('${entry.pointsTotal}', 'Pontos'),
              ],
            ),
            const SizedBox(height: 6),
            if (entry.topBadges.isNotEmpty)
              Wrap(
                spacing: 4,
                runSpacing: 4,
                alignment: WrapAlignment.center,
                children: entry.topBadges
                    .take(2)
                    .map(
                      (badge) => Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: (_levelColors[badge.level] ?? Colors.grey)
                              .withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text(
                          badge.name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: _levelColors[badge.level] ?? Colors.grey.shade700,
                          ),
                        ),
                      ),
                    )
                    .toList(),
              )
            else
              Text(
                'Sem badges publicos',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 10, color: Colors.grey.shade400),
              ),
          ],
        ),
      ),
    );
  }

  Widget _stat(String value, String label) {
    return Column(
      children: [
        Text(value, style: const TextStyle(fontWeight: FontWeight.w900)),
        Text(label, style: TextStyle(fontSize: 10, color: Colors.grey.shade600)),
      ],
    );
  }
}
