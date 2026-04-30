import 'package:flutter/material.dart';

/// ------------------------------------------------------------
///  SOFTINSA DESIGN TOKENS
/// ------------------------------------------------------------
class AppColors {
  // Softinsa brand colors
  static const Color primary = Color(0xFF003A70); // Azul escuro
  static const Color accent = Color(0xFF00AEEF); // Azul claro

  // Light mode surfaces
  static const Color lightBackground = Color(0xFFF6F9FC);
  static const Color lightSurface = Colors.white;
  static const Color lightCard = Color(0xFFFDFEFF);

  // Dark mode surfaces
  static const Color darkBackground = Color(0xFF0E1622);
  static const Color darkSurface = Color(0xFF182230);
  static const Color darkCard = Color(0xFF1F2C3A);

  // Neutral palette
  static const Color textDark = Color(0xFF0F172A);
  static const Color textLight = Color(0xFFE6EEF8);
  static const Color borderLight = Color(0xFFD8E2EE);
  static const Color borderDark = Color(0xFF2F3F52);
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
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          fontSize: 22,
          fontWeight: FontWeight.w800,
          color: AppColors.textDark,
          letterSpacing: -0.3,
        ),
      ),

      /// ---------------- CARDS ----------------
      cardTheme: CardTheme(
        color: AppColors.lightCard,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(18),
          side: const BorderSide(color: AppColors.borderLight),
        ),
      ),

      /// ---------------- INPUTS ----------------
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.borderLight),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
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
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
          textStyle: const TextStyle(
            fontWeight: FontWeight.w700,
            letterSpacing: 0.2,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
        ),
      ),

      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.white,
          foregroundColor: AppColors.primary,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
        ),
      ),

      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.primary,
          side: const BorderSide(color: AppColors.primary),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
        ),
      ),

      /// ---------------- NAVIGATION BAR ----------------
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: Colors.white.withOpacity(0.92),
        indicatorColor: AppColors.accent.withOpacity(0.20),
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
      hoverColor: AppColors.accent.withOpacity(0.08),
      splashFactory: InkSparkle.splashFactory,
    );
  }

  static ThemeData dark() {
    final ColorScheme scheme = ColorScheme.fromSeed(
      seedColor: AppColors.accent,
      brightness: Brightness.dark,
      primary: AppColors.accent,
      secondary: AppColors.primary,
      background: AppColors.darkBackground,
      surface: AppColors.darkSurface,
    );

    final textTheme = Typography.material2021().white.apply(
      bodyColor: AppColors.textLight,
      displayColor: AppColors.textLight,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      textTheme: textTheme,
      scaffoldBackgroundColor: AppColors.darkBackground,

      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        titleTextStyle: TextStyle(
          fontSize: 22,
          fontWeight: FontWeight.w800,
          color: AppColors.textLight,
          letterSpacing: -0.3,
        ),
      ),

      cardTheme: CardTheme(
        color: AppColors.darkCard,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(18),
          side: const BorderSide(color: AppColors.borderDark),
        ),
      ),

      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.darkSurface,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.borderDark),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.accent, width: 1.6),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 14,
          vertical: 14,
        ),
      ),

      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: AppColors.accent,
          foregroundColor: Colors.black,
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
        ),
      ),

      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: AppColors.darkSurface,
        indicatorColor: AppColors.accent.withOpacity(0.25),
      ),

      hoverColor: AppColors.accent.withOpacity(0.10),
      splashFactory: InkSparkle.splashFactory,
    );
  }
}
