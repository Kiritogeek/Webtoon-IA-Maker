# Migration SQL - Table Places

## 📋 Objectif

Créer la table `places` pour gérer les lieux et décors utilisés comme fonds de chapitre dans les webtoons.

## 🚀 Installation

### 1. Exécuter la migration SQL

Dans Supabase Dashboard :

1. Allez dans **SQL Editor**
2. Copiez-collez le contenu de `places_migration.sql`
3. Cliquez sur **Run**

## 📊 Structure de la table

```sql
places
├── id (UUID, PRIMARY KEY)
├── project_id (UUID, FOREIGN KEY → projects)
├── name (TEXT, NOT NULL)
├── description (TEXT, NULLABLE)
├── image_url (TEXT, NULLABLE)
├── ambiance (TEXT, NULLABLE) - Ambiance prédéfinie
├── ambiance_custom (TEXT, NULLABLE) - Ambiance personnalisée
├── variations (JSONB) - Liste des variations (ex: ["jour", "nuit", "pluie"])
├── reference_images (JSONB) - Liste des URLs d'images de référence
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

## 🎯 Fonctionnalités

### Ambiance
- Sélection d'une ambiance prédéfinie (lumineuse, sombre, mature, etc.)
- Ou création d'une ambiance personnalisée avec IA

### Variations
- Liste de variations du même lieu (ex: "jour", "nuit", "pluie", "neige")
- Stockées en JSONB pour flexibilité

### Références
- Images de référence uploadées ou générées par IA
- Utilisées pour maintenir la cohérence visuelle

### Utilisation comme fond de chapitre
- Les lieux peuvent être utilisés comme arrière-plan dans les chapitres
- Cohérence graphique garantie par l'identité visuelle du projet

## 🔧 Utilisation dans le code

### Interface TypeScript

```typescript
import type { Place } from '@/lib/supabase'

const place: Place = {
  id: '...',
  project_id: '...',
  name: 'Forêt enchantée',
  description: 'Une forêt magique avec des arbres lumineux',
  image_url: 'https://...',
  ambiance: 'poetique',
  ambiance_custom: null,
  variations: ['jour', 'nuit', 'pluie'],
  reference_images: ['https://...', 'https://...'],
  created_at: '...',
  updated_at: '...'
}
```

## 📝 Notes

- Les champs `variations` et `reference_images` sont des tableaux JSONB
- Les images sont stockées dans Supabase Storage sous `places/{project_id}/...`
- La génération IA utilise l'identité visuelle du projet pour la cohérence graphique
- Les lieux sont utilisables comme fonds de chapitre dans l'éditeur Webtoon
