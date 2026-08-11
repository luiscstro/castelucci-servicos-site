# AGENTS.md — Castelucci Serviços (site institucional)

Instruções de processo para qualquer agente de IA (Claude, Codex, Copilot, etc.) que for
trabalhar neste repositório. Isso vale para qualquer sessão/modelo, não só para quem escreveu
este arquivo.

## Fluxo obrigatório: Issue → Branch → PR

Para qualquer tarefa de código que não seja um typo trivial — correção de bug, melhoria ou
nova função — siga sempre este fluxo, nesta ordem:

1. **Abra uma Issue no GitHub** antes de começar a mexer no código, descrevendo o que será
   feito e por quê. Use um destes rótulos (crie o label se ainda não existir):
   - `bug` — correção de algo que está quebrado/errado
   - `enhancement` — melhoria de algo que já existe
   - `feature` — funcionalidade nova
2. **Crie uma branch** a partir de `main`, com nome descritivo:
   `fix/<slug>`, `enhancement/<slug>` ou `feature/<slug>`.
3. Implemente a mudança na branch (commits normais, mensagens claras).
4. **Abra um Pull Request** de volta para `main` e **mencione a Issue na descrição do PR**,
   usando `Closes #<numero>` (fecha a issue automaticamente ao mergear) ou
   `Relates to #<numero>` quando o PR não resolve a issue por completo.
5. Não dar commit direto em `main` para mudanças de código não-triviais — mesmo trabalhando
   sozinho, use branch + PR, para manter histórico rastreável e permitir revisão antes do
   deploy.
6. **Não faça `push` para `origin` nem `merge` de PR sem confirmação explícita do responsável
   pelo projeto (Luis)**, a menos que ele tenha autorizado previamente o fluxo automático para
   aquela tarefa específica. PRs abertos ficam aguardando review — é assim que os deploys são
   gerenciados neste projeto.

### Por quê

Isso mantém rastreabilidade entre o "porquê" (a Issue) e o "o quê" (o diff do PR), permitindo
que qualquer pessoa — humana ou outro agente — entenda depois por que uma mudança foi feita, e
revise o conteúdo antes de ir para o site publicado.

### Comandos de referência (GitHub CLI)

```bash
# criar issue
gh issue create --title "Corrige X" --body "Descrição do problema e do comportamento esperado" --label bug

# criar branch e PR
git checkout -b fix/nome-da-issue
# ... commits ...
gh pr create --base main --title "Corrige X" --body "Closes #12

Descrição do que mudou e como foi testado."
```

## Padrão de interface: toda tela precisa ter motion completo

Este site foi construído com um sistema de motion deliberado (ver `assets/css/style.css`,
seções 2, 3, 5 e 6). **Qualquer nova página, seção ou componente precisa seguir o mesmo
padrão** — não é opcional, é o padrão de qualidade do projeto:

- **Skeleton loading** — toda imagem carregada via `<img loading="lazy">` deve ficar dentro de
  um wrapper `.media` com um `.skel` (shimmer) atrás dela. O JS (`assets/js/main.js`,
  `initMedia`) já cuida do crossfade quando a imagem carrega; só siga o padrão de markup:
  ```html
  <div class="media" style="aspect-ratio:4/3;">
    <div class="skel"></div>
    <img src="..." alt="..." loading="lazy">
  </div>
  ```
- **Lazy loading** — `loading="lazy"` em toda imagem abaixo da dobra. Nunca carregar tudo
  eager.
- **Entrada suave (scroll reveal)** — conteúdo novo de seção usa `data-reveal` (elemento
  único) ou `data-reveal-group` (grid/lista, com stagger automático por `nth-child`). Não
  adicionar animação custom por elemento sem necessidade — reuse o sistema existente.
- **Progresso/loading de ações assíncronas** — botões que disparam ação (formulário,
  submissão) usam a classe `.is-loading` + `.spinner` já estilizada; nunca deixar um botão
  "congelado" sem feedback durante uma espera.
- **Transição de página** — a navegação entre páginas já usa View Transitions API nativa
  (`@view-transition` em `style.css`) com fallback de barra de progresso no topo
  (`#load-progress`, já presente no `<body>` de cada página). Toda página nova precisa incluir
  esse mesmo bloco de markup (progress bar + script `assets/js/main.js`).
- **`prefers-reduced-motion` é obrigatório** — qualquer animação nova precisa ter caminho de
  fallback estático. A seção 13 do CSS já desliga tudo globalmente; se você adicionar uma
  animação `@keyframes` nova fora desse sistema, inclua-a nessa media query também.
- **Motion tem peso**: siga a pirâmide de designers do skill `design-motion-principles`
  (instalado em `~/.claude/skills/design-motion-principles`) — para este projeto (site
  institucional B2B para setor público), a ponderação é **Primário: Jakub Krehel** (polimento
  de produção, sutil), **Secundário: Jhey Tompkins** (só no momento de assinatura — o cubo
  isométrico da marca no hero), **Seletivo: Emil Kowalski** (nav, formulários, botões — rápido,
  sem bounce). Não adicione animação decorativa sem propósito funcional (feedback, orientação
  ou continuidade). Nunca use `scale(0)` como estado inicial, nunca use `ease`/`ease-in-out`
  puro (sempre curva customizada ou spring), sempre anime só `transform`/`opacity`/`filter`.

Antes de abrir o PR, rode uma verificação visual local (`python -m http.server` na raiz do
repo) e confirme que a página nova segue este padrão — skeleton visível brevemente ao carregar
imagens, reveal suave ao rolar, sem "pulo" de layout.

## Notas específicas deste projeto

- Site estático (HTML/CSS/JS puro, sem build). Testar localmente com
  `python -m http.server` a partir da raiz do repo. Deploy é feito por upload/FTP para
  Hostinger após o merge do PR na `main` (sem CI/CD automático configurado até o momento).
- Paleta, tipografia e componentes seguem os tokens definidos em `assets/css/style.css`
  (seção 1 — Design tokens), derivados da identidade visual da Castelucci
  (`material_Castelucci/`, pasta local, não versionada — ver `.gitignore`). Não reintroduzir
  essa pasta nem `portfolio/` no controle de versão: são arquivos brutos de trabalho/venda,
  mantidos só localmente.
- Fotos reais de colaboradores (extraídas do portfólio comercial) ficam em
  `assets/img/equipe/`. Logos de clientes/órgãos atendidos ficam em `assets/img/clientes/` —
  só usar logo de cliente real confirmado no portfólio, nunca inventar cliente.
- Dados de contato (`[TELEFONE]`, `[WHATSAPP]`, número do WhatsApp `55XXXXXXXXXXX` nos links
  `wa.me/`) são placeholders — ver Issue "Adicionar dados de contato reais". Substituir em
  todos os arquivos HTML (busca por `[TELEFONE]`, `[WHATSAPP]`, `55XXXXXXXXXXX`) antes do
  primeiro deploy em produção.
- Linguagem do site é português do Brasil; manter tom institucional/corporativo, focado em
  credibilidade para contratos públicos (licitação). Evitar linguagem que soe gerada por IA
  (travessões em excesso, frases genéricas de "diferenciais/valores" repetidas, adjetivos
  vazios). Basear qualquer novo texto de serviço/institucional no conteúdo real do portfólio
  comercial da empresa quando possível.
- Antes de escrever ou revisar qualquer motion (animação, transição, hover), consulte o skill
  `design-motion-principles` — ele está instalado globalmente em
  `~/.claude/skills/design-motion-principles/` (não aparece na lista de skills até a sessão
  ser reiniciada; se não aparecer, leia `SKILL.md` e `references/motion-cookbook.md`
  diretamente).
