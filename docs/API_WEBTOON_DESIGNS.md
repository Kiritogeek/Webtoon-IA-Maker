# Configuration de l'API Webtoon Designs

Ce document explique comment configurer l'intégration d'une API externe pour récupérer des designs de webtoon dans la configuration du projet.

## Configuration

### Variables d'environnement

Ajoutez ces variables dans votre fichier `.env.local` :

```env
# URL de l'API externe pour les designs de webtoon
WEBTOON_DESIGNS_API_URL=https://votre-api.com/api/webtoon-designs

# Clé API (optionnelle, selon votre API)
WEBTOON_DESIGNS_API_KEY=votre_cle_api_ici
```

### Format de réponse attendu

L'API doit retourner un JSON avec l'un des formats suivants :

**Format 1 (recommandé) :**
```json
{
  "designs": [
    {
      "id": "design-1",
      "name": "Webtoon Style A",
      "description": "Description du design",
      "imageUrl": "https://example.com/image.jpg",
      "style": "webtoon-standard",
      "category": "action",
      "tags": ["action", "modern"]
    }
  ],
  "total": 1
}
```

**Format 2 :**
```json
{
  "data": [
    {
      "id": "design-1",
      "name": "Webtoon Style A",
      "imageUrl": "https://example.com/image.jpg",
      "style": "webtoon-standard"
    }
  ]
}
```

**Format 3 :**
```json
{
  "results": [
    {
      "id": "design-1",
      "name": "Webtoon Style A",
      "imageUrl": "https://example.com/image.jpg",
      "style": "webtoon-standard"
    }
  ]
}
```

**Format 4 (tableau direct) :**
```json
[
  {
    "id": "design-1",
    "name": "Webtoon Style A",
    "imageUrl": "https://example.com/image.jpg",
    "style": "webtoon-standard"
  }
]
```

## Structure des designs

Chaque design doit contenir au minimum :

- `id` (string) : Identifiant unique du design
- `name` (string) : Nom du design
- `imageUrl` (string) : URL de l'image du design
- `style` (string) : Style correspondant (ex: "webtoon-standard", "manga-noir-blanc", etc.)

Champs optionnels :

- `description` (string) : Description du design
- `category` (string) : Catégorie du design
- `tags` (string[]) : Tags associés au design

## Paramètres de requête

L'API reçoit un paramètre `style` dans la requête :

```
GET /api/webtoon-designs?style=webtoon-standard
```

Vous pouvez adapter la route API (`pages/api/webtoon-designs.ts`) pour ajouter d'autres paramètres selon les besoins de votre API externe.

## Authentification

Si votre API nécessite une authentification, configurez-la dans `pages/api/webtoon-designs.ts` :

```typescript
// Exemple avec Bearer token
headers['Authorization'] = `Bearer ${WEBTOON_DESIGNS_API_KEY}`

// Exemple avec clé API dans header
headers['X-API-Key'] = WEBTOON_DESIGNS_API_KEY

// Exemple avec clé API en paramètre
url.searchParams.append('api_key', WEBTOON_DESIGNS_API_KEY)
```

## Fallback

Si l'API externe n'est pas configurée ou retourne une erreur, le système utilise automatiquement :

1. **Supabase Storage** : Les templates stockés dans le bucket `style-references`
2. **Placeholders** : Des images placeholder si Supabase n'est pas disponible

## Personnalisation

Pour personnaliser l'intégration selon votre API spécifique :

1. Modifiez `pages/api/webtoon-designs.ts` pour adapter la requête à votre API
2. Ajustez le parsing de la réponse selon le format de votre API
3. Ajoutez des paramètres de filtrage supplémentaires si nécessaire

## Exemple d'utilisation avec une API REST

```typescript
// Dans pages/api/webtoon-designs.ts
const url = new URL(WEBTOON_DESIGNS_API_URL)
url.searchParams.append('style', style || '')
url.searchParams.append('limit', '20')
url.searchParams.append('format', 'webtoon')

const response = await fetch(url.toString(), {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${WEBTOON_DESIGNS_API_KEY}`,
    'Content-Type': 'application/json',
  },
})
```

## Test

Pour tester l'intégration :

1. Configurez les variables d'environnement
2. Redémarrez le serveur de développement (`npm run dev`)
3. Créez un nouveau projet et sélectionnez un style graphique
4. Les designs devraient apparaître depuis votre API externe

Si l'API n'est pas disponible, le système utilisera automatiquement le fallback Supabase Storage.

