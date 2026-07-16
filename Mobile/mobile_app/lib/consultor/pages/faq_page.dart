import 'package:flutter/material.dart';

class _FaqItem {
  const _FaqItem({required this.question, required this.answer});

  final String question;
  final String answer;
}

class _FaqCategory {
  const _FaqCategory({
    required this.title,
    required this.icon,
    required this.color,
    required this.items,
  });

  final String title;
  final IconData icon;
  final Color color;
  final List<_FaqItem> items;
}

final List<_FaqCategory> _faqCategories = <_FaqCategory>[
  _FaqCategory(
    title: 'Badges & Candidaturas',
    icon: Icons.workspace_premium_rounded,
    color: const Color(0xFF0F62FE),
    items: const <_FaqItem>[
      _FaqItem(
        question: 'Como submeto uma candidatura a um badge?',
        answer:
            'Acede ao catalogo de badges, escolhe o badge desejado e clica em Candidatar. Podes fazer upload das tuas evidencias antes ou depois de submeter o pedido.',
      ),
      _FaqItem(
        question: 'Quem valida os meus pedidos de badge?',
        answer:
            'O processo tem duas etapas: primeiro o Talent Manager reve as evidencias; depois o Service Line Leader faz a aprovacao final.',
      ),
      _FaqItem(
        question: 'Quanto tempo demora a validacao?',
        answer:
            'Nao ha um prazo fixo. Podes acompanhar o estado do pedido em tempo real na seccao Meus Badges.',
      ),
      _FaqItem(
        question: 'O que acontece se o meu pedido for rejeitado?',
        answer:
            'Recebes uma notificacao com o motivo da rejeicao. Podes rever as evidencias, melhora-las e submeter novamente o pedido.',
      ),
    ],
  ),
  _FaqCategory(
    title: 'Certificados & Exportacoes',
    icon: Icons.description_rounded,
    color: const Color(0xFF059669),
    items: const <_FaqItem>[
      _FaqItem(
        question: 'Como faco o download do meu certificado?',
        answer:
            'Na seccao Meus Certificados, dentro do teu Perfil, escolhe o badge obtido e usa o botao Descarregar Certificado PDF.',
      ),
      _FaqItem(
        question: 'Posso exportar os meus badges em Excel ou PDF?',
        answer:
            'Sim. Nas areas de relatorios podes exportar listas em Excel ou PDF quando o teu perfil tem permissoes para isso.',
      ),
    ],
  ),
  _FaqCategory(
    title: 'Pontos & Gamificacao',
    icon: Icons.auto_awesome_rounded,
    color: const Color(0xFFD97706),
    items: const <_FaqItem>[
      _FaqItem(
        question: 'Como funciona o sistema de pontos?',
        answer:
            'Cada badge tem um valor em pontos definido pelo administrador. Ao obteres um badge, os pontos sao acumulados no teu perfil.',
      ),
      _FaqItem(
        question: 'O que sao badges Premium?',
        answer:
            'Sao badges de nivel avancado ou com maior pontuacao, com destaque especial no sistema de gamificacao.',
      ),
    ],
  ),
  _FaqCategory(
    title: 'Perfil & Notificacoes',
    icon: Icons.person_rounded,
    color: const Color(0xFF7C3AED),
    items: const <_FaqItem>[
      _FaqItem(
        question: 'Como altero a minha palavra-passe?',
        answer:
            'Acede as Definicoes no menu do teu perfil. Na seccao Conta podes alterar a tua palavra-passe.',
      ),
      _FaqItem(
        question: 'Porque nao estou a receber emails de notificacao?',
        answer:
            'Verifica se o email no teu perfil esta correto e confirma a pasta de spam. Se persistir, contacta o administrador.',
      ),
    ],
  ),
];

class FaqPage extends StatefulWidget {
  const FaqPage({super.key});

  @override
  State<FaqPage> createState() => _FaqPageState();
}

class _FaqPageState extends State<FaqPage> {
  final TextEditingController _searchController = TextEditingController();
  String _search = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final query = _search.trim().toLowerCase();
    final filtered = query.isEmpty
        ? _faqCategories
        : _faqCategories
            .map((category) {
              final items = category.items
                  .where((item) =>
                      item.question.toLowerCase().contains(query) ||
                      item.answer.toLowerCase().contains(query))
                  .toList();
              return _FaqCategory(
                title: category.title,
                icon: category.icon,
                color: category.color,
                items: items,
              );
            })
            .where((category) => category.items.isNotEmpty)
            .toList();

    return Scaffold(
      appBar: AppBar(title: const Text('Perguntas Frequentes')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
        children: <Widget>[
          TextField(
            controller: _searchController,
            decoration: const InputDecoration(
              hintText: 'Pesquisar pergunta...',
              prefixIcon: Icon(Icons.search),
            ),
            onChanged: (value) => setState(() => _search = value),
          ),
          const SizedBox(height: 16),
          if (filtered.isEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 60),
              child: Center(
                child: Column(
                  children: <Widget>[
                    Icon(Icons.inbox_outlined,
                        size: 56, color: Colors.grey.shade300),
                    const SizedBox(height: 12),
                    Text(
                      'Nenhuma pergunta encontrada para "$_search".',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.grey.shade600),
                    ),
                  ],
                ),
              ),
            )
          else
            for (final category in filtered) ...<Widget>[
              _buildCategoryCard(category),
              const SizedBox(height: 16),
            ],
          _buildContactCard(context),
        ],
      ),
    );
  }

  Widget _buildCategoryCard(_FaqCategory category) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(12, 14, 12, 6),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            Row(
              children: <Widget>[
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: category.color.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(category.icon, size: 18, color: category.color),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    category.title,
                    style: const TextStyle(
                      fontWeight: FontWeight.w800,
                      fontSize: 14,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            for (final item in category.items) _FaqTile(item: item),
          ],
        ),
      ),
    );
  }

  Widget _buildContactCard(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(top: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Colors.grey.shade300,
          style: BorderStyle.solid,
        ),
      ),
      child: Row(
        children: <Widget>[
          Icon(Icons.mail_outline_rounded, color: Colors.grey.shade600),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                const Text(
                  'Nao encontraste o que procuravas?',
                  style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13),
                ),
                const SizedBox(height: 2),
                Text(
                  'Fala com o teu Talent Manager ou com o administrador da plataforma.',
                  style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _FaqTile extends StatefulWidget {
  const _FaqTile({required this.item});

  final _FaqItem item;

  @override
  State<_FaqTile> createState() => _FaqTileState();
}

class _FaqTileState extends State<_FaqTile> {
  bool _open = false;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        InkWell(
          onTap: () => setState(() => _open = !_open),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 10),
            child: Row(
              children: <Widget>[
                Expanded(
                  child: Text(
                    widget.item.question,
                    style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 13,
                    ),
                  ),
                ),
                Icon(
                  _open
                      ? Icons.keyboard_arrow_up_rounded
                      : Icons.keyboard_arrow_down_rounded,
                  size: 20,
                  color: Colors.grey.shade600,
                ),
              ],
            ),
          ),
        ),
        if (_open)
          Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Text(
              widget.item.answer,
              style: TextStyle(
                fontSize: 12.5,
                height: 1.4,
                color: Colors.grey.shade700,
              ),
            ),
          ),
        const Divider(height: 1),
      ],
    );
  }
}
