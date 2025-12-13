# Migration SQL - Extension Table Characters

## 📋 Fichiers créés

1. **`characters_migration.sql`** - Script SQL pour étendre la table characters
2. **Interface mise à jour** - `lib/supabase.ts` avec nouveaux champs
3. **Page d'édition refondue** - `/pages/project/[id]/character/[characterId].tsx`

## 🚀 Installation

### 1. Exécuter la migration SQL

Dans Supabase Dashboard :

1. Allez dans **SQL Editor**
2. Copiez-collez le contenu de `characters_migration.sql`
3. Cliquez sur **Run**

## 📊 Nouveaux champs ajoutés

```sql
characters
├── face_description (TEXT) - Description textuelle du visage
├── body_description (TEXT) - Description textuelle du corps
├── face_image_url (TEXT) - URL de l'image du visage
├── body_image_url (TEXT) - URL de l'image du corps
├── history (TEXT) - Histoire et background du personnage
├── personality_traits (JSONB) - Liste des traits de caractère
└── reference_images (JSONB) - Liste des URLs d'images de référence
```

## 🎨 Fonctionnalités

### Identité visuelle

- **Visage** : Description textuelle + upload ou génération IA
- **Corps** : Description textuelle + upload ou génération IA
- Les images peuvent être uploadées ou générées par IA en utilisant le style du projet

### Histoire et personnalité

- **Histoire** : Champ texte libre pour le background du personnage
- **Traits de caractère** : Liste dynamique (ex: "courageux", "loyal", "impulsif")

### Images de référence

- Upload multiple d'images de référence
- Stockage dans Supabase Storage
- Utilisables pour la génération IA future

## 🔧 Utilisation dans le code

### Interface TypeScript

```typescript
import type { Character } from '@/lib/supabase'

const character: Character = {
  id: '...',
  project_id: '...',
  name: 'Nom du personnage',
  description: 'Description générale',
  image_url: 'https://...',
  face_description: 'Yeux bleus, cheveux blonds...',
  body_description: 'Grand, mince, athlétique...',
  face_image_url: 'https://...',
  body_image_url: 'https://...',
  history: 'Histoire complète du personnage...',
  personality_traits: ['courageux', 'loyal', 'impulsif'],
  reference_images: ['https://...', 'https://...'],
  created_at: '...',
  updated_at: '...'
}
```

### Génération IA

La génération d'images utilise le contexte du projet :
- Style graphique du projet
- Ambiance du projet
- Image de référence du projet
- Description du visage/corps

### Drag & Drop dans les chapitres

Les personnages sont déjà utilisables par drag & drop dans l'éditeur Webtoon (`WebtoonPanelEditor`).

## 📝 Notes

- Les champs sont tous optionnels (NULLABLE)
- `personality_traits` et `reference_images` sont des tableaux JSONB
- Les images sont stockées dans Supabase Storage sous `characters/{project_id}/...`
- La génération IA nécessite que le projet ait un style configuré
