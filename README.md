# GymLog PWA — Controle de Treinos, Nutrição e Evolução

Aplicação web progressiva (PWA) **100% gratuita**, **offline-first** e **sem backend**, desenvolvida para montar e atualizar treinos (fichas A/B/C/D editáveis), controlar calorias/macronutrientes, personalizar aparência de leitura e acompanhar a evolução no celular Android ou no computador.

- **Aplicativo publicado (GitHub Pages):** https://lucasgmsilveira.github.io/fitness-app/
- **Repositório:** https://github.com/lucasgmsilveira/fitness-app

> **Privacidade:** Todos os dados ficam armazenados exclusivamente no navegador do seu dispositivo via IndexedDB (`Dexie.js`). Não há login, servidor, telemetria nem sincronização automática. Para mover dados entre celular e computador, use a exportação/importação manual em JSON na aba **Ajustes**.

## Stack (100% gratuita)

| Componente | Tecnologia | Finalidade |
| :--- | :--- | :--- |
| Interface | React 19 + TypeScript + Tailwind CSS v4 | Telas responsivas (mobile-first) e tema escuro |
| Build | Vite 6 | Desenvolvimento rápido e bundle estático |
| PWA / Offline | `vite-plugin-pwa` (Workbox) | Instalação no Android e cache offline |
| Banco local | IndexedDB + Dexie.js | Persistência local estruturada |
| Ícones / Gráficos | `lucide-react` + SVG nativo | Leve, sem bibliotecas pesadas |
| Testes | Vitest + `fake-indexeddb` | Validação de cálculos e backup JSON |
| Hospedagem | GitHub Pages + GitHub Actions | Publicação estática gratuita |

## Comandos Locais

Execute dentro da pasta `app/`:

```bash
npm install        # Instalar dependências
npm run dev        # Servidor de desenvolvimento local
npm test           # Rodar testes automatizados (Vitest)
npm run build      # Checagem TypeScript + build de produção em dist/
npm run preview    # Visualizar o build de produção localmente
```

Para simular o build com subcaminho do GitHub Pages (ex.: `/meu-repo/`):

```powershell
$env:VITE_BASE_PATH="/meu-repo/"; npm run build
```

## Estrutura de Documentação

- [`docs/ARQUITETURA.md`](./docs/ARQUITETURA.md) — Guia técnico completo para humanos e agentes de IA manterem e evoluírem o aplicativo (esquema do IndexedDB, migrations, backup JSON, convenções).
- [`docs/DEPLOY-GITHUB-PAGES.md`](./docs/DEPLOY-GITHUB-PAGES.md) — Passo a passo para publicar gratuitamente no GitHub Pages, instalar no Android e atualizar versões futuras.
