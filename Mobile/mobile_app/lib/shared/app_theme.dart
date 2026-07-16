import 'package:flutter/material.dart';

/// ------------------------------------------------------------
///  SOFTINSA DESIGN TOKENS
/// ------------------------------------------------------------
class AppColors {
  // Softinsa brand colors — reservados para acentos (botões, ícones, progresso)
  static const Color primary = Color(0xFF0F62FE); // Azul escuro
  static const Color primaryDeep = Color(0xFF0B3D91); // Azul mais escuro
  static const Color accent = Color(0xFF00AEEF); // Azul claro

  // Light mode surfaces
  static const Color lightBackground = Color(0xFFF7F8FC);
  static const Color lightSurface = Colors.white;
  static const Color lightCard = Colors.white;

  // Neutral palette
  static const Color textDark = Color(0xFF1E293B);
  static const Color borderLight = Color(0xFFE4E9F2);

  // Paleta pastel multi-cor — usada em headers, tags de estado e destaques
  // suaves. O azul de marca continua a ser o "acento" principal (botões,
  // links, ícones em uso); estes tons são fundo/superfície, não texto.
  static const Color pastelBlue = Color(0xFFEAF2FF);
  static const Color pastelBlueBorder = Color(0xFFCFE0FB);
  static const Color pastelMint = Color(0xFFE6F7EF);
  static const Color pastelMintBorder = Color(0xFFC3EBD8);
  static const Color pastelLilac = Color(0xFFF1EBFB);
  static const Color pastelLilacBorder = Color(0xFFDECBF5);
  static const Color pastelPeach = Color(0xFFFDF0E6);
  static const Color pastelPeachBorder = Color(0xFFF6D9BE);
  static const Color pastelRose = Color(0xFFFCEAEF);
  static const Color pastelRoseBorder = Color(0xFFF6CEDA);

  // Card shadow (substitui a borda cinza uniforme)
  static List<BoxShadow> cardShadow = <BoxShadow>[
    BoxShadow(
      color: primary.withValues(alpha: 0.05),
      blurRadius: 16,
      offset: const Offset(0, 4),
    ),
  ];
}

/// ------------------------------------------------------------
///  RADIUS HIERARQUICO — varia por escala do elemento em vez de
///  usar sempre o mesmo valor para tudo.
/// ------------------------------------------------------------
class AppRadius {
  static const double header = 24; // headers de página, hero cards
  static const double card = 16; // cards de conteúdo padrão
  static const double control = 12; // inputs, botões
  static const double chip = 10; // chips, tags, badges pequenos
  static const double pill = 999; // elementos totalmente arredondados
}

/// ------------------------------------------------------------
///  SOFTINSA THEME
/// ------------------------------------------------------------
class AppTheme {
  static ThemeData light() {
    final ColorScheme scheme = ColorScheme.fromSeed(
      seedColor: AppColors.primary,
      brightness: Brightness.light,
      primary: AppColors.primary,
      secondary: AppColors.accent,
      background: AppColors.lightBackground,
      surface: AppColors.lightSurface,
    );

    final textTheme = Typography.material2021().black.apply(
      bodyColor: AppColors.textDark,
      displayColor: AppColors.textDark,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      textTheme: textTheme,
      scaffoldBackgroundColor: AppColors.lightBackground,

      /// ---------------- APP BAR ----------------
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        foregroundColor: Color(0xFF0F172A),
        elevation: 0,
        centerTitle: false,
      ),

      /// ---------------- CARDS ----------------
      cardTheme: CardThemeData(
        color: AppColors.lightCard,
        elevation: 1.5,
        shadowColor: AppColors.primary.withValues(alpha: 0.08),
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.card),
        ),
      ),

      /// ---------------- INPUTS ----------------
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.control),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.control),
          borderSide: const BorderSide(color: AppColors.borderLight),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.control),
          borderSide: const BorderSide(color: AppColors.primary, width: 1.6),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 14,
          vertical: 14,
        ),
      ),

      /// ---------------- BUTTONS ----------------
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          disabledBackgroundColor: AppColors.primary.withValues(alpha: 0.4),
          elevation: 0,
          shadowColor: AppColors.primary.withValues(alpha: 0.25),
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
          textStyle: const TextStyle(
            fontWeight: FontWeight.w700,
            letterSpacing: 0.2,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadius.control),
          ),
        ).copyWith(
          elevation: const WidgetStatePropertyAll<double>(2),
        ),
      ),

      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          disabledBackgroundColor: AppColors.primary.withValues(alpha: 0.4),
          elevation: 2,
          shadowColor: AppColors.primary.withValues(alpha: 0.25),
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadius.control),
          ),
        ),
      ),

      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.primary,
          side: const BorderSide(color: AppColors.primary),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadius.control),
          ),
        ),
      ),

      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.primary,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadius.control),
          ),
        ),
      ),

      /// ---------------- NAVIGATION BAR ----------------
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: Colors.white.withValues(alpha: 0.92),
        indicatorColor: AppColors.accent.withValues(alpha: 0.20),
        elevation: 0,
        iconTheme: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const IconThemeData(color: AppColors.primary, size: 24);
          }
          return const IconThemeData(color: Color(0xFF64748B), size: 23);
        }),
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const TextStyle(
              fontWeight: FontWeight.w700,
              color: AppColors.primary,
            );
          }
          return const TextStyle(
            fontWeight: FontWeight.w500,
            color: Color(0xFF64748B),
          );
        }),
      ),

      /// ---------------- HOVER EFFECTS (WEB) ----------------
      hoverColor: AppColors.accent.withValues(alpha: 0.08),
      splashFactory: InkSparkle.splashFactory,
    );
  }
}
