# Arquitetura e Manutenção — GymLog PWA

Este documento orienta desenvolvedores e agentes de IA que precisarem manter, corrigir ou adicionar funcionalidades ao aplicativo no futuro.

- **URL de produção (GitHub Pages):** https://lucasgmsilveira.github.io/fitness-app/
- **Repositório:** https://github.com/lucasgmsilveira/fitness-app

## 1. Estrutura de Pastas (`app/`)

```text
app/
├── .github/workflows/deploy-pages.yml  # Pipeline automático para GitHub Pages
├── docs/
│   ├── ARQUITETURA.md                  # Este documento
│   └── DEPLOY-GITHUB-PAGES.md          # Guia de publicação e instalação no Android
├── public/                             # Ícones PNG/SVG estáticos da PWA
├── scripts/
│   └── generate-icons.mjs              # Gerador Node puro dos ícones PNG (sem deps externas)
├── src/
│   ├── components/
│   │   ├── charts/                     # CalorieRing, TrendLineChart, MiniBarChart (SVG puro)
│   │   ├── exercises/                  # MuscleAnatomyDiagram, ExerciseExecutionScene, ExerciseVisualGuideModal
│   │   ├── layout/                     # AppShell, BottomNav, QuickActionSheet
│   │   └── ui/                         # Card, Modal, ConfirmDialog, Badge, EmptyState
│   ├── data/
│   │   ├── exerciseAnimations.ts       # Rigs e keyframes vetoriais SVG (100% offline) dos exercícios
│   │   ├── exerciseGuides.ts           # Passo a passo, respiração, postura e músculos por exercício
│   │   ├── foodCatalog.ts              # Catálogo nutricional BR/RS (TACO, TBCA, IBGE POF)
│   │   └── muscleAnatomy.ts            # Diagrama anatômico SVG (frente/costas) e regiões musculares
│   ├── db/
│   │   ├── types.ts                    # Interfaces TypeScript e constantes de domínio
│   │   ├── database.ts                 # Instância Dexie (GymLogDB) e índices
│   │   ├── seed.ts                     # Seed inicial (CURRENT_SEED_VERSION='3'), upgrade e resetDatabase()
│   │   └── backup.ts                   # Exportação, validação e restauração atômica JSON
│   ├── features/
│   │   ├── dashboard/DashboardPage.tsx # Painel inicial (calorias, macros, PRs, gráficos)
│   │   ├── nutrition/                  # Diário alimentar, metas, catálogo, receitas e Open Food Facts
│   │   ├── settings/                   # Aparência, backup JSON, medidas corporais, check-in
│   │   └── workouts/                   # Rotinas A/B/C/D, treino ativo, descanso, histórico
│   ├── utils/
│   │   ├── appearance.ts               # Preferências visuais (fonte, destaque, contraste, densidade)
│   │   ├── date.ts                     # Datas sempre no fuso local (YYYY-MM-DD)
│   │   ├── foodSearch.ts               # Busca sem acentos, sinônimos regionais e filtros
│   │   ├── nutritionMath.ts            # Escala de macros/fibras, base 100g e receitas próprias
│   │   ├── openFoodFacts.ts            # Consulta opcional por código de barras EAN (Open Food Facts)
│   │   └── workoutStats.ts             # Volume, PRs, frequência semanal e progressão
│   ├── App.tsx                         # Orquestração de abas, useLiveQuery e modais rápidos
│   ├── main.tsx                        # Ponto de entrada + registerSW({ immediate: true })
│   └── index.css                       # Tailwind CSS v4 + tokens de tema escuro
├── tests/
│   ├── appearance.test.ts              # Testes de preferências visuais
│   ├── calculations.test.ts            # Testes unitários de datas, treinos e nutrição
│   ├── exerciseGuides.test.ts          # Testes de cobertura anatômica, animações e ausência de links externos
│   ├── foodCatalog.test.ts             # Testes do catálogo BR/RS, busca, receitas e Open Food Facts
│   └── backup.test.ts                  # Testes de seed, upgrade v2->v3, exportação e restauração no Dexie
└── vite.config.ts                      # Configuração de base path + VitePWA/Workbox
```

## 2. Banco de Dados Local (IndexedDB + Dexie.js)

Definido em [`src/db/database.ts`](../src/db/database.ts) (`GymLogDB`, versão `1`):

| Tabela | Chave / Índices | Conteúdo |
| :--- | :--- | :--- |
| `exercises` | `id, name, muscleGroup` | Catálogo de exercícios (padrão + personalizados) |
| `routines` | `id, order, name` | Fichas de treino A/B/C/D editáveis |
| `workoutSessions` | `id, status, date, startedAt, routineId` | Sessões ativas (`status: 'active'`) e concluídas (`completed`) |
| `foods` | `id, name` | Catálogo de alimentos e receitas próprias (com metadados opcionais: `category`, `preparation`, `source`, `fiber`, `isRegionalRS`, `aliases`, `recipeIngredients`) |
| `mealEntries` | `id, date, mealType, [date+mealType]` | Itens consumidos no diário alimentar por data (inclui `fiber` opcional) |
| `nutritionGoals` | `id` (`'default'`) | Metas diárias de kcal, macros e água |
| `dailyCheckins` | `date` (`YYYY-MM-DD`) | Peso, medidas corporais, água e nota lombar (0–10) |
| `appMeta` | `key` | Metadados internos (`seeded`, `seedVersion`, `lastBackupAt`, `lastRestoreAt`) |

### Como evoluir o schema do banco no futuro (Migrations)

**Nunca altere `this.version(1)` diretamente se o app já estiver em uso.** Sempre adicione uma nova versão em `GymLogDB`:

```ts
this.version(1).stores({ ... });
this.version(2).stores({
  // Apenas as tabelas que mudaram de índice ou novas tabelas
  dailyCheckins: 'date, updatedAt',
}).upgrade((tx) => {
  // Migração de dados existentes, se necessário
});
```

## 3. Formato do Backup JSON (`schemaVersion: 1`)

Implementado em [`src/db/backup.ts`](../src/db/backup.ts):

```json
{
  "app": "gymlog-pwa",
  "schemaVersion": 1,
  "exportedAt": "2026-11-22T23:00:00.000Z",
  "data": {
    "exercises": [],
    "routines": [],
    "workoutSessions": [],
    "foods": [],
    "mealEntries": [],
    "nutritionGoals": [],
    "dailyCheckins": []
  }
}
```

Regras importantes ao evoluir o backup:
- A importação usa `parseAndValidateBackup` para validar `app === 'gymlog-pwa'`, `schemaVersion` e todas as coleções antes de abrir a caixa de confirmação.
- A restauração usa transação `db.transaction('rw', ...)` para limpar e reescrever todas as tabelas atomicamente.
- Se no futuro `schemaVersion` passar para `2`, mantenha compatibilidade lendo backups `schemaVersion: 1` e preenchendo valores padrão nos campos novos.

## 4. Regras e Convenções Críticas

1. **Privacidade estrita (`../AGENTS.md`)**: nunca coloque dados pessoais reais (idade, altura, peso, histórico clínico ou detalhes de lesões) no código-fonte de `app/`, pois este diretório pode ser publicado no GitHub Pages.
2. **Datas sempre no fuso local**: use `getLocalDateString()` de `src/utils/date.ts`. **Nunca** use `new Date().toISOString().slice(0, 10)` para agrupar refeições ou treinos do dia, pois em fusos negativos (ex.: UTC-3) o dia vira às 21h.
3. **Subcaminho no GitHub Pages (`VITE_BASE_PATH`)**:
   - Referências estáticas em `index.html` devem usar `%BASE_URL%`.
   - `vite.config.ts` lê `process.env.VITE_BASE_PATH || '/'` e aplica o mesmo `base` em `manifest.start_url`, `manifest.scope` e no asset prefix do Vite.
   - `workbox.navigateFallback` usa `'index.html'` (relativo ao `base`).
4. **Regenerar ícones PWA**: caso altere o visual dos ícones, edite `scripts/generate-icons.mjs` e execute `npm run generate-icons`.
5. **Validação após mudanças**: sempre rode `npm test` e `npm run build` antes de fazer push.
