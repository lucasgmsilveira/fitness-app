# Guia de Publicação Gratuita (GitHub Pages) e Instalação no Android

Este guia explica como publicar o aplicativo gratuitamente usando **GitHub Pages + GitHub Actions**, instalá-lo no Android como aplicativo (PWA) e transferir seus dados entre celular e computador.

> **Atenção de Privacidade:** Publique **apenas o conteúdo da pasta `app/`** em um repositório separado do GitHub. **Nunca** suba a pasta raiz `gym/` (onde ficam `perfil.md`, `saude/` e anotações pessoais). Mesmo em repositórios privados, o GitHub Pages gratuito costuma exigir repositório público na conta Free. O código dentro de `app/` não contém nenhum dado pessoal seu.

---

## 1. Testar localmente no computador antes de publicar

Dentro de `app/`:

```bash
npm install
npm test
npm run build
npm run preview
```

Abra o endereço exibido no terminal (ex.: `http://localhost:4173`) para verificar todas as telas.

---

## 2. Criar o repositório no GitHub (somente da pasta `app/`)

1. Crie uma conta gratuita no [GitHub](https://github.com) (se ainda não tiver) e crie um novo repositório vazio (por exemplo, `gymlog-app`), **sem** marcar "Add a README".
2. No computador, abra o terminal **dentro da pasta `app/`** (`d:\me\2b_v1\Projetos\gym\app`):

```bash
git init -b main
git add .
git commit -m "Versão inicial do GymLog PWA"
git remote add origin https://github.com/SEU_USUARIO/gymlog-app.git
git push -u origin main
```

---

## 3. Ativar o GitHub Pages com GitHub Actions

1. No repositório do GitHub, acesse **Settings → Pages**.
2. Em **Build and deployment → Source**, selecione **GitHub Actions**.
3. Vá na aba **Actions** do repositório: o workflow **"Publicar PWA no GitHub Pages"** (`.github/workflows/deploy-pages.yml`) será executado automaticamente a cada `push` na branch `main`.
4. Ao concluir (ícone verde), o link público aparecerá no próprio card de deploy e em **Settings → Pages**, no formato:
   `https://SEU_USUARIO.github.io/gymlog-app/`

> O workflow detecta automaticamente o nome do repositório e injeta `VITE_BASE_PATH=/gymlog-app/` (ou `/` se for um repositório `SEU_USUARIO.github.io`), configurando corretamente o `manifest.webmanifest` e o Service Worker.

---

## 4. Instalar no celular Android e usar offline

1. No celular Android, abra o **Google Chrome** e acesse a URL publicada do GitHub Pages.
2. Aguarde a página carregar completamente uma vez (para o Service Worker gravar os arquivos em cache).
3. Toque no menu do Chrome (**⋮** no canto superior direito) → **Adicionar à tela inicial** → **Instalar**.
4. O ícone do **GymLog** aparecerá na tela inicial e abrirá em tela cheia, sem barra de endereço do navegador.
5. **Teste offline:** ative o modo avião, abra o ícone do app na tela inicial e confirme que suas rotinas, catálogo e registros continuam funcionando normalmente.

---

## 5. Transferir dados entre Celular e Computador (Backup JSON)

Como não há servidor nem sincronização automática:

1. No aparelho de origem (ex.: celular), abra a aba **Ajustes → Backup e Transferência (JSON)** e toque em **Exportar Dados (.json)**.
2. Envie o arquivo `gymlog-backup-AAAA-MM-DD.json` para o computador (via cabo USB, Google Drive, e-mail para você mesmo, etc.).
3. No navegador do computador (acessando o mesmo link do app), abra **Ajustes → Importar / Restaurar (.json)**, selecione o arquivo e confirme a substituição após revisar o resumo exibido.

Faça backups periódicos antes de limpar dados do navegador ou trocar de aparelho.

---

## 6. Como atualizar o aplicativo no futuro

1. Edite o código localmente dentro de `app/`.
2. Valide com `npm test` e `npm run build`.
3. Faça `git add .`, `git commit -m "Descrição da melhoria"` e `git push`.
4. O GitHub Actions publicará a nova versão em poucos minutos. Como a PWA usa `registerType: 'autoUpdate'`, ao reabrir o app com internet no Android ele atualizará automaticamente sem precisar desinstalar (seus dados no IndexedDB são preservados).
