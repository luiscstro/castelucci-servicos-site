# Castelucci Serviços — site institucional

Site estático (HTML/CSS/JS puro, sem build) para a Castelucci Serviços.

## Rodar localmente

**Importante:** não abra os arquivos direto no navegador (duplo-clique / `file:///...`).
O site usa URLs limpas (ex: `/sobre/` em vez de `/sobre/index.html`), e isso só funciona
servido por um servidor HTTP — abrir via `file://` faz o navegador listar o conteúdo da pasta
em vez de carregar a página, e os links de navegação "quebram".

Windows — clique duas vezes em **`preview.bat`** (abre o navegador e inicia o servidor).

Ou, em qualquer terminal, a partir da raiz do repo:

```bash
python -m http.server 8080
```

Depois acesse **http://localhost:8080/**.

## Estrutura

- `index.html`, `sobre/`, `servicos/`, `setor-publico/`, `contato/` — páginas do site.
- `assets/css/style.css` — design system + sistema de motion (tokens, skeleton loaders,
  scroll-reveal, transições de página).
- `assets/js/main.js` — navegação, formulário, widgets.
- `assets/img/` — imagens otimizadas (fotos da equipe, logos de clientes, marca).

## Processo de trabalho

Ver [AGENTS.md](AGENTS.md) — todo bug/melhoria/funcionalidade nova segue Issue → branch → PR.
