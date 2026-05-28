# CarReels Publisher

Publica vídeos de carros no Instagram, TikTok e YouTube em simultâneo, a partir de um único formulário web.

---

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Vercel Blob (armazenamento temporário de vídeo)
- Deploy: Vercel

---

## Variáveis de Ambiente

Copia `.env.local.example` para `.env.local` e preenche os valores:

```env
INSTAGRAM_USER_ID=
INSTAGRAM_ACCESS_TOKEN=
TIKTOK_ACCESS_TOKEN=
YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=
YOUTUBE_REFRESH_TOKEN=
BLOB_READ_WRITE_TOKEN=
```

---

## Como Obter Cada Token

### Instagram (Meta Graph API)

**Pré-requisito:** Conta Business (não Creator) ligada a uma Página do Facebook.

1. Acede a [developers.facebook.com](https://developers.facebook.com) e cria uma App (tipo: Business).
2. Adiciona o produto **Instagram Graph API**.
3. Em **Instagram > Basic Display**, obtém um token de curta duração para o teu utilizador.
4. Troca por um **long-lived token** (válido 60 dias):
   ```
   GET https://graph.facebook.com/v19.0/oauth/access_token
     ?grant_type=fb_exchange_token
     &client_id={APP_ID}
     &client_secret={APP_SECRET}
     &fb_exchange_token={SHORT_LIVED_TOKEN}
   ```
5. Obtém o teu Instagram User ID:
   ```
   GET https://graph.facebook.com/v19.0/me/accounts?access_token={TOKEN}
   ```
   Depois: `GET /{page-id}?fields=instagram_business_account&access_token={TOKEN}`

   O `id` retornado é o teu `INSTAGRAM_USER_ID`.

6. Renova o token antes dos 60 dias com `GET /refresh_access_token`.

---

### TikTok (Content Posting API)

1. Acede a [developers.tiktok.com](https://developers.tiktok.com) e cria uma app.
2. Ativa o produto **Content Posting API**.
3. Obtém autorização OAuth2 com os scopes:
   - `video.upload`
   - `video.publish`
4. Após o utilizador autorizar, troca o `code` por um `access_token`:
   ```
   POST https://open.tiktokapis.com/v2/oauth/token/
   {
     "client_key": "...",
     "client_secret": "...",
     "code": "...",
     "grant_type": "authorization_code",
     "redirect_uri": "..."
   }
   ```
5. Guarda o `access_token` e o `refresh_token`.
6. Renova o token com `POST /v2/oauth/token/` usando `grant_type: refresh_token`.

**Nota:** A legenda tem de ser adicionada manualmente na app TikTok após o vídeo aparecer na inbox.

---

### YouTube (YouTube Data API v3)

1. Acede a [console.cloud.google.com](https://console.cloud.google.com).
2. Cria um projeto e ativa a **YouTube Data API v3**.
3. Em **Credenciais**, cria um **OAuth 2.0 Client ID** (tipo: Web Application).
4. Adiciona `https://developers.google.com/oauthplayground` como Redirect URI autorizado.
5. Vai a [OAuth 2.0 Playground](https://developers.google.com/oauthplayground):
   - Clica no ícone de engrenagem → ativa "Use your own OAuth credentials".
   - Introduz o teu Client ID e Client Secret.
   - Em Step 1, seleciona `https://www.googleapis.com/auth/youtube.upload`.
   - Clica "Authorize APIs" e autoriza com a conta Google.
   - Em Step 2, clica "Exchange authorization code for tokens".
   - Copia o `refresh_token` exibido.

---

## Deploy no Vercel

1. Faz push para GitHub:
   ```bash
   git init
   git add .
   git commit -m "initial commit"
   gh repo create carreels-publisher --public --source=. --push
   ```

2. Vai a [vercel.com/new](https://vercel.com/new) e importa o repositório.

3. Adiciona as variáveis de ambiente no dashboard do Vercel:
   - `INSTAGRAM_USER_ID`
   - `INSTAGRAM_ACCESS_TOKEN`
   - `TIKTOK_ACCESS_TOKEN`
   - `YOUTUBE_CLIENT_ID`
   - `YOUTUBE_CLIENT_SECRET`
   - `YOUTUBE_REFRESH_TOKEN`
   - `BLOB_READ_WRITE_TOKEN` — obtém em [vercel.com/dashboard/stores](https://vercel.com/dashboard/stores) criando um Blob store e copiando o token de leitura/escrita.

4. Clica **Deploy**.

---

## Desenvolvimento Local

```bash
npm install
cp .env.local.example .env.local
# preenche .env.local com os teus tokens
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

---

## Notas sobre Rascunhos

| Plataforma | Modo | Legenda via API? |
|---|---|---|
| YouTube | Privado (draft real) | Sim |
| TikTok | Inbox (draft) | Não — adicionar manualmente na app |
| Instagram | Não existe draft — publica direto | Sim |
