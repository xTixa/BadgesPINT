class ConsultantUser {
  ConsultantUser({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    required this.pointsTotal,
    this.location,
  });

  final int id;
  final String name;
  final String email;
  final String role;
  final int pointsTotal;
  final String? location;

  factory ConsultantUser.fromJson(Map<String, dynamic> json) {
    return ConsultantUser(
      id: _readInt(json['id']) ?? 0,
      name: (json['name'] ?? '').toString(),
      email: (json['email'] ?? '').toString(),
      role: (json['role'] ?? 'consultant').toString(),
      pointsTotal: _readInt(json['points_total']) ?? 0,
      location: json['localizacao']?.toString(),
    );
  }
}

class BadgeItem {
  BadgeItem({
    required this.id,
    required this.name,
    required this.status,
    required this.points,
    this.area,
    this.expireInDays,
  });

  final int id;
  final String name;
  final String status;
  final int points;
  final String? area;
  final int? expireInDays;

  bool get isObtained => status.toLowerCase() == 'obtido';

  factory BadgeItem.fromJson(Map<String, dynamic> json) {
    return BadgeItem(
      id: _readInt(json['id']) ?? 0,
      name: (json['name'] ?? json['description'] ?? 'Badge').toString(),
      status: (json['status'] ?? 'pendente').toString(),
      points: _readInt(json['pontos']) ?? _readInt(json['points']) ?? 0,
      area: json['area']?.toString(),
      expireInDays: _readInt(json['expiraEmDias']) ?? _readInt(json['expire_in_days']),
    );
  }
}

class BadgeProgress {
  BadgeProgress({
    required this.badgeId,
    required this.total,
    required this.approved,
  });

  final int badgeId;
  final int total;
  final int approved;

  factory BadgeProgress.fromJson(Map<String, dynamic> json) {
    return BadgeProgress(
      badgeId: _readInt(json['badge_id']) ?? 0,
      total: _readInt(json['total']) ?? 0,
      approved: _readInt(json['approved']) ?? 0,
    );
  }
}

class RequirementItem {
  RequirementItem({
    required this.id,
    required this.title,
    required this.description,
    required this.code,
    this.imageUrl,
  });

  final int id;
  final String title;
  final String description;
  final String code;
  final String? imageUrl;

  factory RequirementItem.fromJson(Map<String, dynamic> json) {
    return RequirementItem(
      id: _readInt(json['id']) ?? 0,
      title: (json['title'] ?? 'Requisito').toString(),
      description: (json['description'] ?? '').toString(),
      code: (json['code'] ?? 'REQ').toString(),
      imageUrl: json['image_url']?.toString(),
    );
  }
}

class EvidenceItem {
  EvidenceItem({
    required this.id,
    required this.requirementId,
    required this.status,
    required this.evidenceUrl,
  });

  final int id;
  final int requirementId;
  final String status;
  final String evidenceUrl;

  factory EvidenceItem.fromJson(Map<String, dynamic> json) {
    return EvidenceItem(
      id: _readInt(json['id']) ?? 0,
      requirementId: _readInt(json['requirement_id']) ?? 0,
      status: (json['status'] ?? 'pendente').toString(),
      evidenceUrl: (json['evidence_url'] ?? '').toString(),
    );
  }
}

class RecommendationItem {
  RecommendationItem({
    required this.id,
    required this.name,
    required this.reason,
    required this.points,
  });

  final int id;
  final String name;
  final String reason;
  final int points;
}

class ExpiryAlert {
  ExpiryAlert({
    required this.id,
    required this.name,
    required this.expireInDays,
  });

  final int id;
  final String name;
  final int expireInDays;
}

class RankingItem {
  RankingItem({
    required this.position,
    required this.name,
    required this.points,
  });

  final int position;
  final String name;
  final int points;
}

int? _readInt(dynamic value) {
  if (value == null) return null;
  if (value is int) return value;
  return int.tryParse(value.toString());
}
