import 'package:flutter/material.dart';

import '../../shared/app_config.dart';

class BadgeMedal extends StatelessWidget {
  const BadgeMedal({
    this.imageUrl,
    this.badgeId,
    this.label,
    this.size = 64,
    super.key,
  });

  final String? imageUrl;
  final int? badgeId;
  final String? label;
  final double size;

  // O flutter_svg/vector_graphics tem um bug de renderizacao nao
  // deterministico com os SVGs vetoriais dos badges em alguns dispositivos
  // Android (aparecem com blocos de estatica que mudam a cada abertura).
  // Por isso, quando conhecemos o id do badge, pedimos ao backend a versao
  // ja rasterizada em PNG (GET /badges/:id/image.png) em vez de tentar
  // renderizar o SVG original no dispositivo.
  String? get _resolvedImageUrl {
    if (badgeId != null) {
      final base = AppConfig.apiBaseUrl.replaceAll(RegExp(r'/$'), '');
      return '$base/badges/$badgeId/image.png';
    }

    final url = imageUrl?.trim();
    if (url == null || url.isEmpty) return null;
    if (url.toLowerCase().endsWith('.svg')) return null;
    return url;
  }

  bool get _hasImage {
    final url = _resolvedImageUrl;
    if (url == null || url.isEmpty) return false;

    final lowerUrl = url.toLowerCase();
    if (lowerUrl.contains('localhost') || lowerUrl.contains('127.0.0.1')) {
      return false;
    }
    if (lowerUrl.contains('via.placeholder.com') ||
        lowerUrl.contains('placeholder.com')) {
      return false;
    }

    return true;
  }

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(size * 0.28),
      child: SizedBox(
        width: size,
        height: size,
        child:
            _hasImage
                ? Image.network(
                    _resolvedImageUrl!,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => _fallbackContent(),
                  )
                : _fallbackContent(),
      ),
    );
  }

  Widget _fallbackContent() {
    final text = (label ?? 'Badge').trim();
    return Container(
      alignment: Alignment.center,
      padding: EdgeInsets.all(size * 0.12),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF020617), Color(0xFF0F62FE), Color(0xFF00AEEF)],
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.star_rounded,
            color: const Color(0xFFFFE08A),
            size: size * 0.34,
          ),
          if (size >= 62 && text.isNotEmpty) ...[
            SizedBox(height: size * 0.04),
            Text(
              text,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.white,
                fontSize: size * 0.105,
                fontWeight: FontWeight.w900,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
