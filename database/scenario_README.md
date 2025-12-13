# Migration SQL - Tables Scenario et Chapter Notes

## 📋 Objectif

Créer les tables `scenario` et `chapter_notes` pour gérer le scénario du projet :
- **Trame globale** : Histoire principale du webtoon
- **Arcs narratifs** : Structure narrative avec chapitres associés
- **Notes par chapitre** : Notes scénaristiques pour chaque chapitre (boussole narrative)

## 🚀 Installation

### 1. Exécuter la migration SQL

Dans Supabase Dashboard :

1. Allez dans **SQL Editor**
2. Copiez-collez le contenu de `scenario_migration.sql`
3. Cliquez sur **Run**

## 📊 Structure des tables

### Table `scenario`

```sql
scenario
├── id (UUID, PRIMARY KEY)
├── project_id (UUID, FOREIGN KEY → projects, UNIQUE)
├── global_plot (TEXT, NULLABLE) - Trame globale
├── narrative_arcs (JSONB) - Liste des arcs narratifs
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

### Table `chapter_notes`

```sql
chapter_notes
├── id (UUID, PRIMARY KEY)
├── chapter_id (UUID, FOREIGN KEY → chapters, UNIQUE)
├── project_id (UUID, FOREIGN KEY → projects)
├── notes (TEXT, NULLABLE) - Notes scénaristiques
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

## 🎯 Fonctionnalités

### Trame globale
- Description complète de l'histoire principale
- Enjeux, conflits, dénouement prévu
- Sert de boussole narrative lors de l'édition

### Arcs narratifs
- Structure narrative avec titre et description
- Association avec des chapitres spécifiques
- Permet de structurer l'histoire en plusieurs arcs

### Notes par chapitre
- Notes scénaristiques pour chaque chapitre
- Événements clés, dialogues importants, révélations
- Sauvegarde automatique lors de la perte de focus
- Boussole narrative lors de l'édition

## 🔧 Utilisation dans le code

### Interface TypeScript

```typescript
import type { Scenario, ChapterNotes } from '@/lib/supabase'

const scenario: Scenario = {
  id: '...',
  project_id: '...',
  global_plot: 'Trame globale du webtoon...',
  narrative_arcs: [
    {
      id: 'arc1',
      title: 'Arc de l\'introduction',
      description: '...',
      chapters: [1, 2, 3]
    }
  ],
  created_at: '...',
  updated_at: '...'
}

const chapterNote: ChapterNotes = {
  id: '...',
  chapter_id: '...',
  project_id: '...',
  notes: 'Notes scénaristiques pour ce chapitre...',
  created_at: '...',
  updated_at: '...'
}
```

## 📝 Notes

- Un seul scénario par projet (contrainte UNIQUE sur project_id)
- Une seule note par chapitre (contrainte UNIQUE sur chapter_id)
- Les arcs narratifs sont stockés en JSONB pour flexibilité
- Les notes sont sauvegardées automatiquement lors de la perte de focus
- Le scénario sert de boussole narrative lors de l'édition des chapitres
