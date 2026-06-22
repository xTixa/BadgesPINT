import 'dart:convert';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../consultor_controller.dart';
import '../consultor_models.dart';
import '../widgets/section_card.dart';
import '../widgets/badge_medal.dart';
import 'badge_detail_page.dart';
import 'timeline_page.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({required this.controller, super.key});

  final ConsultorController controller;

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage>
    with TickerProviderStateMixin {
  late AnimationController _anim;
  late Animation<double> _fade;
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _anim = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );
    _fade = CurvedAnimation(parent: _anim, curve: Curves.easeIn);
    _anim.forward();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _anim.dispose();
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final controller = widget.controller;
    final profile = controller.profile;
    final fullName = profile?.name ?? 'Consultor';

    final obtained = controller.badges.where((b) => b.isObtained).toList();

    final totalBadges = controller.badges.length;
    final progress = totalBadges == 0 ? 0.0 : obtained.length / totalBadges;

    return FadeTransition(
      opacity: _fade,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
        children: [
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: Colors.black12),
            ),
            clipBehavior: Clip.antiAlias,
            child: Column(
              children: [
                Container(
                  height: 94,
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Color(0xFF0F62FE), Color(0xFF8A3FFC)],
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(18, 0, 18, 18),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Transform.translate(
                            offset: const Offset(0, -34),
                            child: CircleAvatar(
                              radius: 40,
                              backgroundColor: Colors.white,
                              child: CircleAvatar(
                                radius: 36,
                                backgroundColor: const Color(0xFF0F62FE),
                                backgroundImage:
                                    _avatarProvider(profile?.avatarUrl),
                                child: (profile?.avatarUrl ?? '').isEmpty
                                    ? Text(
                                        fullName[0].toUpperCase(),
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 28,
                                          fontWeight: FontWeight.w900,
                                        ),
                                      )
                                    : null,
                              ),
                            ),
                          ),
                          const Spacer(),
                          Padding(
                            padding: const EdgeInsets.only(top: 10),
                            child: IconButton.filledTonal(
                              tooltip: 'Editar perfil',
                              onPressed: _openEditProfileSheet,
                              icon: const Icon(Icons.edit_outlined),
                            ),
                          ),
                        ],
                      ),
                      Transform.translate(
                        offset: const Offset(0, -22),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    fullName,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                      fontSize: 24,
                                      fontWeight: FontWeight.w900,
                                    ),
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 8,
                                  ),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFEFF4FF),
                                    borderRadius: BorderRadius.circular(999),
                                  ),
                                  child: Text(
                                    '#${controller.rankingPosition}',
                                    style: const TextStyle(
                                      color: Color(0xFF0F62FE),
                                      fontWeight: FontWeight.w900,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            if ((profile?.email ?? '').isNotEmpty)
                              Text(
                                profile!.email,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(color: Colors.grey.shade700),
                              ),
                            const SizedBox(height: 14),
                            Wrap(
                              spacing: 8,
                              runSpacing: 8,
                              children: [
                                _profileChip(
                                  Icons.stars_rounded,
                                  '${controller.totalPoints} pts',
                                ),
                                _profileChip(
                                  Icons.workspace_premium_rounded,
                                  '${obtained.length} badges',
                                ),
                                _profileChip(
                                  Icons.hub_outlined,
                                  _areaName(profile?.areaId),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: _openChangePasswordSheet,
              icon: const Icon(Icons.lock_reset_outlined),
              label: const Text('Alterar password'),
            ),
          ),
          const SizedBox(height: 8),
          SizedBox(
            width: double.infinity,
            child: FilledButton.tonalIcon(
              onPressed: () => context.push('/ranking'),
              icon: const Icon(Icons.leaderboard_rounded),
              label: const Text('Ver ranking e perfis'),
            ),
          ),
          const SizedBox(height: 8),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => TimelinePage(controller: widget.controller),
                ),
              ),
              icon: const Icon(Icons.timeline_rounded),
              label: const Text('Timeline profissional'),
            ),
          ),

          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(
                child: _statCard(
                  "Pontos",
                  controller.totalPoints.toString(),
                  Icons.stars,
                ),
              ),

              const SizedBox(width: 12),

              Expanded(
                child: _statCard(
                  "Badges",
                  obtained.length.toString(),
                  Icons.workspace_premium,
                ),
              ),

              const SizedBox(width: 12),

              Expanded(
                child: _statCard(
                  "Ranking",
                  controller.rankingPosition.toString(),
                  Icons.leaderboard,
                ),
              ),
            ],
          ),

          const SizedBox(height: 20),
          // 🔹 PROGRESSO GLOBAL
          const Text(
            "Progresso geral",
            style: TextStyle(fontWeight: FontWeight.bold),
          ),

          const SizedBox(height: 8),

          LinearProgressIndicator(
            value: progress,
            minHeight: 8,
            color: scheme.primary,
            backgroundColor: Colors.grey.shade300,
          ),

          const SizedBox(height: 20),
          SectionCard(
            title: "Informações",
            child: Column(
              children: [
                _infoRow(Icons.email, "Email", profile?.email ?? "-"),

                _infoRow(
                  Icons.hub_outlined,
                  "Area",
                  _areaName(profile?.areaId),
                ),

                _infoRow(
                  Icons.location_on,
                  "Localização",
                  profile?.location ?? "Não definida",
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),
          _profileTabs(obtained),
          const SizedBox(height: 20),

          // 🔹 PARTILHA
          if (obtained.isNotEmpty)
            SectionCard(
              title: 'Partilha',
              child: Column(
                children: [
                  ElevatedButton.icon(
                    onPressed: () async {
                      final messenger = ScaffoldMessenger.of(context);
                      final link = _shareLinkForFirstBadge(obtained);
                      if (link == null) {
                        messenger.showSnackBar(
                          const SnackBar(
                            content: Text(
                              'Ativa RGPD e galeria publica nas definicoes para partilhar.',
                            ),
                          ),
                        );
                        return;
                      }

                      await Clipboard.setData(ClipboardData(text: link));

                      if (!mounted) return;

                      messenger.showSnackBar(
                        const SnackBar(content: Text("Link copiado")),
                      );
                    },
                    icon: const Icon(Icons.link),
                    label: const Text("Copiar link"),
                  ),

                  const SizedBox(height: 8),

                  ElevatedButton.icon(
                    onPressed: () async {
                      final link = _shareLinkForFirstBadge(obtained);
                      if (link == null) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text(
                              'Ativa RGPD e galeria publica nas definicoes para partilhar.',
                            ),
                          ),
                        );
                        return;
                      }
                      await _openLinkedInShare(
                        link,
                        badgeName: obtained.first.name,
                      );
                    },
                    icon: const Icon(Icons.share),
                    label: const Text("LinkedIn"),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  String? _shareLinkForFirstBadge(List<BadgeItem> obtained) {
    final profile = widget.controller.profile;
    if (profile?.rgpdPublicationAccepted != true ||
        profile?.publicProfileEnabled != true ||
        profile?.linkedinSharingEnabled != true ||
        obtained.isEmpty) {
      return null;
    }
    return _certificateForBadge(obtained.first.id)?.verificationUrl;
  }

  Widget _profileTabs(List<BadgeItem> obtained) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.black12),
      ),
      child: Column(
        children: [
          TabBar(
            controller: _tabController,
            tabs: const [
              Tab(text: 'Badges'),
              Tab(text: 'Meus Certificados'),
            ],
          ),
          SizedBox(
            height: obtained.isEmpty ? 150 : 360,
            child: TabBarView(
              controller: _tabController,
              children: [
                _badgesTab(obtained),
                _certificatesTab(obtained),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _badgesTab(List<BadgeItem> obtained) {
    if (obtained.isEmpty) {
      return const Center(child: Text('Ainda nao tens badges obtidos.'));
    }

    return LayoutBuilder(
      builder: (context, constraints) {
        final columns = constraints.maxWidth < 420 ? 2 : 3;

        return GridView.builder(
          padding: const EdgeInsets.all(12),
          itemCount: obtained.length,
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: columns,
            mainAxisSpacing: 10,
            crossAxisSpacing: 10,
            mainAxisExtent: 138,
          ),
          itemBuilder: (context, index) {
            final badge = obtained[index];
            return InkWell(
              borderRadius: BorderRadius.circular(14),
              onTap: () => _openBadgeDetail(badge),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
                decoration: BoxDecoration(
                  color: Colors.grey.shade50,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: Colors.black12),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _BadgeThumb(imageUrl: badge.imageUrl),
                    const SizedBox(height: 6),
                    Flexible(
                      child: Text(
                        badge.name,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      '${badge.points} pts',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(fontSize: 11, color: Colors.grey.shade700),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  Widget _certificatesTab(List<BadgeItem> obtained) {
    if (obtained.isEmpty) {
      return const Center(child: Text('Ainda nao tens certificados.'));
    }

    return ListView.separated(
      padding: const EdgeInsets.all(12),
      itemCount: obtained.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (context, index) {
        final badge = obtained[index];
        final certificate = _certificateForBadge(badge.id);
        final canShare = widget.controller.profile?.rgpdPublicationAccepted == true &&
            widget.controller.profile?.publicProfileEnabled == true &&
            (certificate?.verificationUrl ?? '').isNotEmpty;
        final canLinkedIn = canShare &&
            (widget.controller.profile?.linkedinSharingEnabled ?? false);
        return InkWell(
          borderRadius: BorderRadius.circular(14),
          onTap: () => _openBadgeDetail(badge),
          child: Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.grey.shade50,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Colors.black12),
            ),
            child: Row(
              children: [
                _BadgeThumb(imageUrl: badge.imageUrl),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        badge.name,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontWeight: FontWeight.w900),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${badge.points} pts',
                        style: TextStyle(color: Colors.grey.shade700),
                      ),
                    ],
                  ),
                ),
                Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton.filledTonal(
                      tooltip: 'Descarregar certificado',
                      onPressed: () => _downloadCertificate(badge.id),
                      icon: const Icon(Icons.download_rounded),
                    ),
                    IconButton(
                      tooltip: canShare
                          ? 'Abrir pagina publica'
                          : 'Ativa RGPD e galeria publica nas definicoes',
                      onPressed: canShare
                          ? () => _openCertificateInBrowser(certificate!.verificationUrl)
                          : null,
                      icon: const Icon(Icons.open_in_browser_rounded),
                    ),
                    IconButton(
                      tooltip: canShare
                          ? 'Copiar link publico'
                          : 'Ativa RGPD e galeria publica nas definicoes',
                      onPressed: canShare
                          ? () => _copyCertificateLink(certificate!.verificationUrl)
                          : null,
                      icon: const Icon(Icons.link_rounded),
                    ),
                    IconButton(
                      tooltip: canLinkedIn
                          ? 'Partilhar no LinkedIn'
                          : 'Ativa RGPD, galeria publica e partilha LinkedIn nas definicoes',
                      onPressed: canLinkedIn
                          ? () => _openLinkedInShare(
                                certificate!.verificationUrl,
                                badgeName: badge.name,
                              )
                          : null,
                      icon: const Icon(Icons.share_rounded),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  CertificateItem? _certificateForBadge(int badgeId) {
    for (final certificate in widget.controller.certificates) {
      if (certificate.badgeId == badgeId) return certificate;
    }
    return null;
  }

  void _openBadgeDetail(BadgeItem badge) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => BadgeDetailPage(
          badge: _catalogBadgeFor(badge),
          controller: widget.controller,
        ),
      ),
    );
  }

  CatalogBadgeItem _catalogBadgeFor(BadgeItem badge) {
    final matches = <CatalogBadgeItem>[
      ...widget.controller.catalogBadges,
      ...widget.controller.preferredAreaBadges,
    ].where((item) => item.id == badge.id);

    if (matches.isNotEmpty) return matches.first;

    return CatalogBadgeItem(
      id: badge.id,
      name: badge.name,
      description: badge.name,
      points: badge.points,
      level: 1,
      levelLabel: 'Badge',
      areaName: badge.area,
      imageUrl: badge.imageUrl,
    );
  }

  Future<void> _openCertificateInBrowser(String url) async {
    final uri = Uri.tryParse(url);
    if (uri == null) return;
    final opened = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!mounted) return;
    if (!opened) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Nao foi possivel abrir o link.')),
      );
    }
  }

  Future<void> _copyCertificateLink(String url) async {
    await Clipboard.setData(ClipboardData(text: url));
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Link publico copiado.')),
    );
  }

  Future<void> _openLinkedInShare(
    String url, {
    required String badgeName,
  }) async {
    final text =
        'Conclui o badge "$badgeName" na plataforma BadgesPINT. Verificacao: $url';
    await Clipboard.setData(ClipboardData(text: text));

    final shareUri = Uri.https(
      'www.linkedin.com',
      '/sharing/share-offsite/',
      <String, String>{'url': url},
    );

    final opened = await launchUrl(
      shareUri,
      mode: LaunchMode.externalApplication,
    );

    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          opened
              ? 'LinkedIn aberto. O texto da publicacao foi copiado.'
              : 'Nao foi possivel abrir o LinkedIn. O texto foi copiado.',
        ),
      ),
    );
  }

  Future<void> _downloadCertificate(int badgeId) async {
    final messenger = ScaffoldMessenger.of(context);
    final result = await widget.controller.downloadCertificate(badgeId);
    if (!mounted) return;

    messenger.showSnackBar(
      SnackBar(
        content: Text(
          result.message ??
              (result.success
                  ? 'Certificado descarregado.'
                  : 'Erro ao descarregar certificado.'),
        ),
        backgroundColor: result.success ? Colors.green : Colors.red,
      ),
    );
  }

  String _areaName(int? areaId) {
    if (areaId == null) return 'Nao definida';
    for (final area in widget.controller.areas) {
      if (area.id == areaId) return area.name;
    }
    return 'Nao definida';
  }

  Future<void> _openEditProfileSheet() async {
    final profile = widget.controller.profile;
    if (profile == null) return;

    final nameController = TextEditingController(text: profile.name);
    final emailController = TextEditingController(text: profile.email);
    final areaIds = widget.controller.areas.map((area) => area.id).toSet();
    int? selectedAreaId =
        areaIds.contains(profile.areaId) ? profile.areaId : null;
    String? selectedAvatarUrl = profile.avatarUrl;

    final result = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      builder: (ctx) {
        bool saving = false;
        return StatefulBuilder(
          builder: (ctx, setSheetState) {
            return Padding(
              padding: EdgeInsets.fromLTRB(
                16,
                16,
                16,
                MediaQuery.of(ctx).viewInsets.bottom + 16,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Center(
                    child: Stack(
                      clipBehavior: Clip.none,
                      children: [
                        CircleAvatar(
                          radius: 42,
                          backgroundColor: const Color(0xFF0F62FE),
                          backgroundImage: _avatarProvider(selectedAvatarUrl),
                          child: (selectedAvatarUrl ?? '').isEmpty
                              ? Text(
                                  profile.name.isEmpty
                                      ? '?'
                                      : profile.name[0].toUpperCase(),
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 28,
                                    fontWeight: FontWeight.w900,
                                  ),
                                )
                              : null,
                        ),
                        Positioned(
                          right: -6,
                          bottom: -6,
                          child: IconButton.filled(
                            tooltip: 'Escolher foto',
                            onPressed: () async {
                              final picked = await FilePicker.platform.pickFiles(
                                type: FileType.image,
                                withData: true,
                              );
                              final file = picked?.files.single;
                              final bytes = file?.bytes;
                              if (bytes == null) return;

                              if (bytes.length > 4 * 1024 * 1024) {
                                if (!ctx.mounted) return;
                                ScaffoldMessenger.of(ctx).showSnackBar(
                                  const SnackBar(
                                    content: Text(
                                      'Escolhe uma imagem com menos de 4 MB.',
                                    ),
                                  ),
                                );
                                return;
                              }

                              final ext = (file!.extension ?? 'png').toLowerCase();
                              final mime = ext == 'jpg' || ext == 'jpeg'
                                  ? 'image/jpeg'
                                  : ext == 'webp'
                                      ? 'image/webp'
                                      : 'image/png';
                              setSheetState(() {
                                selectedAvatarUrl =
                                    'data:$mime;base64,${base64Encode(bytes)}';
                              });
                            },
                            icon: const Icon(Icons.photo_camera_outlined),
                          ),
                        ),
                      ],
                    ),
                  ),
                  TextButton.icon(
                    onPressed: (selectedAvatarUrl ?? '').isEmpty
                        ? null
                        : () => setSheetState(() => selectedAvatarUrl = null),
                    icon: const Icon(Icons.delete_outline),
                    label: const Text('Remover foto'),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Expanded(
                        child: Text(
                          'Editar perfil',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                      IconButton(
                        onPressed: () => Navigator.pop(ctx, false),
                        icon: const Icon(Icons.close),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: nameController,
                    textInputAction: TextInputAction.next,
                    decoration: const InputDecoration(
                      labelText: 'Nome',
                      prefixIcon: Icon(Icons.person_outline),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: emailController,
                    keyboardType: TextInputType.emailAddress,
                    textInputAction: TextInputAction.next,
                    decoration: const InputDecoration(
                      labelText: 'Email',
                      prefixIcon: Icon(Icons.email_outlined),
                    ),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<int>(
                    value: selectedAreaId,
                    decoration: const InputDecoration(
                      labelText: 'Area principal',
                      prefixIcon: Icon(Icons.hub_outlined),
                    ),
                    items:
                        widget.controller.areas
                            .map(
                              (area) => DropdownMenuItem<int>(
                                value: area.id,
                                child: Text(area.name),
                              ),
                            )
                            .toList(),
                    onChanged: (value) {
                      setSheetState(() => selectedAreaId = value);
                    },
                  ),
                  const SizedBox(height: 16),
                  FilledButton.icon(
                    onPressed: saving
                        ? null
                        : () async {
                            final name = nameController.text.trim();
                            final email = emailController.text.trim();

                            if (name.isEmpty ||
                                email.isEmpty ||
                                !email.contains('@')) {
                              ScaffoldMessenger.of(ctx).showSnackBar(
                                const SnackBar(
                                  content: Text('Preenche nome e email valido.'),
                                ),
                              );
                              return;
                            }

                            final navigator = Navigator.of(ctx);
                            setSheetState(() => saving = true);
                            final ok = await widget.controller.updateProfile(
                              name: name,
                              email: email,
                              areaId: selectedAreaId,
                              avatarUrl: selectedAvatarUrl,
                            );
                            if (!ctx.mounted) return;
                            navigator.pop(ok);
                          },
                    icon: const Icon(Icons.save_outlined),
                    label: Text(saving ? 'A guardar...' : 'Guardar'),
                  ),
                ],
              ),
            );
          },
        );
      },
    );

    if (!mounted || result == null) return;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          result
              ? 'Perfil atualizado com sucesso.'
              : 'Erro ao atualizar perfil.',
        ),
      ),
    );
  }

  Future<void> _openChangePasswordSheet() async {
    final currentController = TextEditingController();
    final newController = TextEditingController();
    final confirmController = TextEditingController();

    final result = await showModalBottomSheet<String?>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      builder: (ctx) {
        bool saving = false;
        return StatefulBuilder(
          builder: (ctx, setSheet) => Padding(
            padding: EdgeInsets.fromLTRB(
              16,
              16,
              16,
              MediaQuery.of(ctx).viewInsets.bottom + 16,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  children: [
                    const Expanded(
                      child: Text(
                        'Alterar password',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.pop(ctx),
                      icon: const Icon(Icons.close),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: currentController,
                  obscureText: true,
                  textInputAction: TextInputAction.next,
                  decoration: const InputDecoration(
                    labelText: 'Password atual',
                    prefixIcon: Icon(Icons.lock_outline),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: newController,
                  obscureText: true,
                  textInputAction: TextInputAction.next,
                  decoration: const InputDecoration(
                    labelText: 'Nova password',
                    prefixIcon: Icon(Icons.lock_reset_outlined),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: confirmController,
                  obscureText: true,
                  decoration: const InputDecoration(
                    labelText: 'Confirmar nova password',
                    prefixIcon: Icon(Icons.verified_user_outlined),
                  ),
                ),
                const SizedBox(height: 16),
                FilledButton.icon(
                  onPressed: saving
                      ? null
                      : () async {
                          final current = currentController.text;
                          final next = newController.text;
                          final confirm = confirmController.text;
                          final messenger = ScaffoldMessenger.of(ctx);
                          final navigator = Navigator.of(ctx);

                          if (current.isEmpty || next.length < 6) {
                            messenger.showSnackBar(const SnackBar(
                              content: Text(
                                'Indica a password atual e uma nova com pelo menos 6 caracteres.',
                              ),
                            ));
                            return;
                          }

                          if (next != confirm) {
                            messenger.showSnackBar(const SnackBar(
                              content: Text('As passwords nao coincidem.'),
                            ));
                            return;
                          }

                          setSheet(() => saving = true);
                          final error = await widget.controller.changePassword(
                            currentPassword: current,
                            newPassword: next,
                          );
                          if (!ctx.mounted) return;
                          navigator.pop(error ?? '');
                        },
                  icon: const Icon(Icons.save_outlined),
                  label: Text(saving ? 'A guardar...' : 'Guardar'),
                ),
              ],
            ),
          ),
        );
      },
    );

    if (!mounted || result == null) return;
    if (result.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Password alterada com sucesso.')),
      );
    } else {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(result)));
    }
  }

  Widget _profileChip(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
      decoration: BoxDecoration(
        color: const Color(0xFFEFF4FF),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: const Color(0xFF0F62FE)),
          const SizedBox(width: 6),
          Text(
            label,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800),
          ),
        ],
      ),
    );
  }

  ImageProvider<Object>? _avatarProvider(String? avatarUrl) {
    if (avatarUrl == null || avatarUrl.isEmpty) return null;
    if (avatarUrl.startsWith('data:image/')) {
      final commaIndex = avatarUrl.indexOf(',');
      if (commaIndex == -1) return null;
      try {
        return MemoryImage(base64Decode(avatarUrl.substring(commaIndex + 1)));
      } catch (_) {
        return null;
      }
    }
    return NetworkImage(avatarUrl);
  }

  Widget _statCard(String title, String value, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          Icon(icon, color: const Color(0xFF0F62FE)),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          Text(title, style: const TextStyle(fontSize: 12)),
        ],
      ),
    );
  }

  Widget _infoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Row(
        children: [
          Icon(icon, color: const Color(0xFF0F62FE)),

          const SizedBox(width: 12),

          Expanded(
            child: Text(
              label,
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
          ),

          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.end,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}

class _BadgeThumb extends StatelessWidget {
  const _BadgeThumb({required this.imageUrl});

  final String? imageUrl;

  @override
  Widget build(BuildContext context) {
    return BadgeMedal(imageUrl: imageUrl, size: 42);
  }
}
