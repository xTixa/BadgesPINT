import 'package:flutter/foundation.dart';

import '../../data/consultor_repository.dart';
import '../../data/models/consultor_models.dart';

class ConsultorController extends ChangeNotifier {
  ConsultorController({required ConsultorRepository repository}) : _repository = repository;

  final ConsultorRepository _repository;

  bool isLoading = true;
  int selectedTab = 0;
  ConsultantUser? profile;
  List<BadgeItem> badges = <BadgeItem>[];
  List<BadgeProgress> badgesProgress = <BadgeProgress>[];
  List<RecommendationItem> recommendations = <RecommendationItem>[];
  List<ExpiryAlert> expiryAlerts = <ExpiryAlert>[];
  List<RankingItem> ranking = <RankingItem>[];

  int? selectedBadgeId;
  List<RequirementItem> requirements = <RequirementItem>[];
  List<EvidenceItem> evidences = <EvidenceItem>[];
  bool uploadLoading = false;

  Future<void> initialize() async {
    isLoading = true;
    notifyListeners();

    final results = await Future.wait<dynamic>(<Future<dynamic>>[
      _repository.getMyProfile(),
      _repository.getMyBadges(),
      _repository.getBadgesProgress(),
    ]);

    profile = results[0] as ConsultantUser?;
    badges = results[1] as List<BadgeItem>;
    badgesProgress = results[2] as List<BadgeProgress>;

    recommendations = _repository.getRecommendationsMock();
    expiryAlerts = _repository.getExpiryAlertsMock();
    ranking = _repository.getRankingMock();

    if (badges.isNotEmpty) {
      await selectBadge(badges.first.id);
    }

    isLoading = false;
    notifyListeners();
  }

  void changeTab(int index) {
    selectedTab = index;
    notifyListeners();
  }

  int get badgesObtidos => badges.where((BadgeItem b) => b.isObtained).length;

  int get totalPoints {
    final profilePoints = profile?.pointsTotal ?? 0;
    if (profilePoints > 0) return profilePoints;

    return badges.fold<int>(0, (int acc, BadgeItem badge) => acc + badge.points);
  }

  int get globalProgress {
    if (badges.isEmpty) return 0;
    return ((badgesObtidos / badges.length) * 100).round();
  }

  BadgeProgress? progressForBadge(int badgeId) {
    try {
      return badgesProgress.firstWhere((BadgeProgress p) => p.badgeId == badgeId);
    } catch (_) {
      return null;
    }
  }

  Future<void> selectBadge(int badgeId) async {
    selectedBadgeId = badgeId;
    uploadLoading = true;
    notifyListeners();

    final results = await Future.wait<dynamic>(<Future<dynamic>>[
      _repository.getRequirementsByBadge(badgeId),
      _repository.getEvidencesByBadge(badgeId),
    ]);

    requirements = results[0] as List<RequirementItem>;
    evidences = results[1] as List<EvidenceItem>;
    uploadLoading = false;
    notifyListeners();
  }

  EvidenceItem? latestEvidenceForRequirement(int requirementId) {
    final items = evidences.where((EvidenceItem e) => e.requirementId == requirementId);
    if (items.isEmpty) return null;
    return items.first;
  }

  Future<bool> submitEvidence({
    required int requirementId,
    required String evidenceUrl,
    String? notes,
  }) async {
    final success = await _repository.submitEvidence(
      requirementId: requirementId,
      evidenceUrl: evidenceUrl,
      notes: notes,
    );

    final badgeId = selectedBadgeId;
    if (success && badgeId != null) {
      evidences = await _repository.getEvidencesByBadge(badgeId);
      notifyListeners();
    }

    return success;
  }

  Future<bool> submitPedido() async {
    final badgeId = selectedBadgeId;
    if (badgeId == null) return false;
    return _repository.submitPedido(badgeId);
  }
}
