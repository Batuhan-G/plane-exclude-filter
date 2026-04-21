# Plane Exclude Filter

Plane'in free planında olmayan **exclude filter** özelliğini sağlayan minimal Next.js aracı.

Assignee ve Label bazında istediğin kişi veya etiketlere sahip taskları görünümden çıkarabilirsin.

## Kurulum

```bash
npm install
cp .env.local.example .env.local
```

`.env.local` dosyasını düzenle:

```
PLANE_API_KEY=plane_api_...        # Profile → Personal Access Tokens
PLANE_WORKSPACE_SLUG=my-workspace  # URL'deki slug: plane.so/MY-SLUG/...
```

```bash
npm run dev
# http://localhost:3000
```

## Vercel Deploy

1. GitHub'a push et
2. [vercel.com](https://vercel.com) → New Project → repo'yu seç
3. Environment Variables ekle:
   - `PLANE_API_KEY`
   - `PLANE_WORKSPACE_SLUG`
4. Deploy

Takım linki paylaş, kimse API key görmez.

## Güvenlik

API key sadece Vercel'deki environment variable'da durur. Tarayıcıya hiç çıkmaz. Tüm Plane istekleri Next.js API route üzerinden proxy'lenir.
