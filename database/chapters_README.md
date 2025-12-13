# Migration SQL - Table Chapters

## 📋 Fichiers créés

1. **`chapters_migration.sql`** - Script SQL complet pour créer la table chapters
2. **`lib/chaptersApi.ts`** - API TypeScript pour les opérations CRUD
3. **Interface mise à jour** - Fonctionnalités GET, PUT, DELETE ajoutées

## 🚀 Installation

### 1. Exécuter la migration SQL

Dans Supabase Dashboard :

1. Allez dans **SQL Editor**
2. Copiez-collez le contenu de `chapters_migration.sql`
3. Cliquez sur **Run**

Ou via la ligne de commande :

```bash
psql -h [votre-host] -U [votre-user] -d [votre-database] -f chapters_migration.sql
```

## 📊 Structure de la table

```sql
chapters
├── id (UUID, PRIMARY KEY)
├── project_id (UUID, FOREIGN KEY → projects)
├── title (TEXT, NOT NULL)
├── order (INTEGER, NOT NULL)
├── description (TEXT, NULLABLE)
├── cover_image_url (TEXT, NULLABLE)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

## 🔧 Fonctionnalités CRUD

### ✅ GET - Récupérer les chapitres

```typescript
import { getChapters, getChapterById } from '@/lib/chaptersApi'

// Tous les chapitres d'un projet
const chapters = await getChapters(projectId)

// Un chapitre spécifique
const chapter = await getChapterById(chapterId)
```

### ✅ POST - Créer un chapitre

```typescript
import { createChapter } from '@/lib/chaptersApi'

const newChapter = await createChapter(
  projectId,
  'Titre du chapitre',
  'Description optionnelle',
  'https://url-image-couverture.jpg'
)
```

### ✅ PUT - Mettre à jour un chapitre

```typescript
import { updateChapter } from '@/lib/chaptersApi'

await updateChapter(chapterId, {
  title: 'Nouveau titre',
  description: 'Nouvelle description',
  cover_image_url: 'https://nouvelle-image.jpg',
  order: 2
})
```

### ✅ DELETE - Supprimer un chapitre

```typescript
import { deleteChapter } from '@/lib/chaptersApi'

await deleteChapter(chapterId)
```

## 🎯 Fonctionnalités supplémentaires

### Réorganiser l'ordre des chapitres

```typescript
import { reorderChapters } from '@/lib/chaptersApi'

await reorderChapters(projectId, [
  { chapterId: 'uuid-1', order: 1 },
  { chapterId: 'uuid-2', order: 2 },
  { chapterId: 'uuid-3', order: 3 }
])
```

### Compter les chapitres

```typescript
import { getChaptersCount } from '@/lib/chaptersApi'

const count = await getChaptersCount(projectId)
```

## 🔒 Sécurité (RLS)

Le script SQL configure automatiquement :
- ✅ Row Level Security (RLS) activé
- ✅ Les utilisateurs ne voient que leurs propres chapitres
- ✅ Les utilisateurs ne peuvent modifier que leurs chapitres
- ✅ Suppression en cascade si le projet est supprimé

## 🔄 Fonctionnalités automatiques

1. **updated_at** - Mis à jour automatiquement à chaque modification
2. **Réorganisation de l'ordre** - Après suppression, les ordres sont réorganisés automatiquement
3. **Index** - Index sur `project_id` et `order` pour de meilleures performances

## 📝 Utilisation dans l'interface

L'interface `/project/[id]/chapters` permet maintenant :

1. ✅ **Créer** un chapitre (bouton principal)
2. ✅ **Voir** tous les chapitres (liste)
3. ✅ **Modifier** un chapitre (bouton ✏️)
4. ✅ **Supprimer** un chapitre (bouton 🗑️)
5. ✅ **Ouvrir l'éditeur** (bouton "Ouvrir l'éditeur")

## ⚠️ Notes importantes

- La suppression d'un chapitre supprime également toutes les scènes associées (CASCADE)
- L'ordre des chapitres est automatiquement réorganisé après suppression
- Les chapitres sont triés par `order` par défaut
