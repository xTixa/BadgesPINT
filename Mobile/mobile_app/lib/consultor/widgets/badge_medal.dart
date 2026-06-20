import 'package:flutter/material.dart';

class BadgeMedal extends StatelessWidget {
  const BadgeMedal({
    this.imageUrl,
    this.label,
    this.size = 64,
    super.key,
  });

  final String? imageUrl;
  final String? label;
  final double size;

  bool get _hasImage => imageUrl != null && imageUrl!.trim().isNotEmpty;

  @override
  Widget build(BuildContext context) {
    final ribbonHeight = size * 0.24;
    return SizedBox(
      width: size,
      height: size + ribbonHeight,
      child: Stack(
        clipBehavior: Clip.none,
        alignment: Alignment.topCenter,
        children: [
          Positioned(
            bottom: 0,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Transform(
                  alignment: Alignment.center,
                  transform: Matrix4.skewX(-0.28),
                  child: Container(
                    width: size * 0.18,
                    height: ribbonHeight,
                    decoration: const BoxDecoration(
                      color: Color(0xFF0F62FE),
                      borderRadius: BorderRadius.vertical(
                        bottom: Radius.circular(4),
                      ),
                    ),
                  ),
                ),
                SizedBox(width: size * 0.03),
                Transform(
                  alignment: Alignment.center,
                  transform: Matrix4.skewX(0.28),
                  child: Container(
                    width: size * 0.18,
                    height: ribbonHeight,
                    decoration: const BoxDecoration(
                      color: Color(0xFF00AEEF),
                      borderRadius: BorderRadius.vertical(
                        bottom: Radius.circular(4),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          Container(
            width: size,
            height: size,
            padding: EdgeInsets.all(size * 0.075),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Color(0xFFFFF4BF),
                  Color(0xFFF59E0B),
                  Color(0xFFB45309),
                ],
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.18),
                  blurRadius: size * 0.16,
                  offset: Offset(0, size * 0.07),
                ),
              ],
            ),
            child: Container(
              clipBehavior: Clip.antiAlias,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: const LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Color(0xFF111827),
                    Color(0xFF0F62FE),
                    Color(0xFF00AEEF),
                  ],
                ),
                border: Border.all(
                  color: const Color(0xFFFFF7D6),
                  width: size * 0.035,
                ),
              ),
              child: _hasImage
                  ? Image.network(
                      imageUrl!,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => _fallbackContent(),
                    )
                  : _fallbackContent(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _fallbackContent() {
    final text = (label ?? 'Badge').trim();
    return Container(
      alignment: Alignment.center,
      padding: EdgeInsets.all(size * 0.12),
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
