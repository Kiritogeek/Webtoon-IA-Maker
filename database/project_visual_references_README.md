# Migration SQL - Système d'Identité Visuelle Multi-Références

## 📋 Objectif

Transformer le système d'identité visuelle d'une **image unique** vers un **système de moodboard** avec plusieurs images de référence.

### Changement de philosophie

**❌ Avant** : 1 image = vérité absolue
- Trop rigide, trop technique, peu intuitif
- Palette extraite automatiquement
- Ambiance "calculée"

**✅ Maintenant** : Plusieurs images = intention visuelle
- L'IA déduit le style commun
- L'utilisateur raisonne en inspiration, pas en paramètres
- Exactement comme un vrai artiste ou DA

## 🚀 Installation

### 1. Exécuter la migration SQL

Dans Supabase Dashboard :

1. Allez dans **SQL Editor**
2. Copiez-collez le contenu de `project_visual_references_migration.sql`
3. Cliquez sur **Run**

## 📊 Structure des tables

### Table `project_visual_references`

```sql
project_visual_references
├── id (UUID, PRIMARY KEY)
├── project_id (UUID, FOREIGN KEY → projects, ON DELETE CASCADE)
├── image_url (TEXT, NOT NULL) - URL de l'image de référence
├── display_order (INTEGER, DEFAULT 0) - Ordre d'affichage dans le moodboard
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

### Colonnes ajoutées à `projects`

```sql
projects
├── visual_style_summary (TEXT, NULLABLE)
│   └── Résumé textuel généré automatiquement par l'IA
│   └── Ex: "Style semi-réaliste, couleurs contrastées, ambiance sombre..."
└── visual_style_prompt (TEXT, NULLABLE)
    └── Prompt de style ajustable manuellement (optionnel)
```

## 🎯 Fonctionnalités

### 1. Collection d'images de référence

- **Minimum** : 1 image
- **Maximum** : Aucune limite
- **Toutes les images sont également importantes**
- **Réorganisation** : Via `display_order`

### 2. Compréhension IA automatique

L'IA analyse toutes les images et génère :
- Un résumé textuel du style (`visual_style_summary`)
- Des règles visuelles implicites (lecture seule)

### 3. Utilisation dans les générations IA

Toutes les images de référence sont utilisées pour :
- Génération de personnages
- Génération de lieux
- Génération de panels
- Génération d'assets
- Génération de couverture

## 🔄 Migration depuis l'ancien système

### Ancien système

- `identity_visual_reference_url` (1 image unique)
- `style_reference_image_url` (compatibilité)

### Nouveau système

- `project_visual_references` (plusieurs images)
- `visual_style_summary` (résumé IA)
- `visual_style_prompt` (ajustement manuel)

### Migration automatique

Pour migrer les projets existants :

```sql
-- Migrer identity_visual_reference_url vers project_visual_references
INSERT INTO project_visual_references (project_id, image_url, display_order)
SELECT id, identity_visual_reference_url, 0
FROM projects
WHERE identity_visual_reference_url IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM project_visual_references 
    WHERE project_id = projects.id
  );
```

## 📝 Notes

- Les anciennes colonnes (`identity_visual_reference_url`, `style_reference_image_url`) sont **conservées** pour compatibilité
- Le code fait un **fallback** automatique vers l'ancien système si aucune référence n'existe
- La priorité est donnée au **nouveau système** (plusieurs images) pour tous les nouveaux projets

## 🎨 Interface utilisateur

### Menu "Identité Visuelle"

1. **Références visuelles du projet**
   - Grille type moodboard (style Pinterest / Canva)
   - Drag & drop pour ajouter
   - Supprimer, remplacer, réordonner

2. **Style compris par l'IA**
   - Résumé textuel généré automatiquement
   - Bouton "Recalculer la compréhension"
   - Option "Ajuster manuellement"

3. **Règles visuelles déduites**
   - Affichage en tags / bullet points
   - Lecture seule
   - Type de traits, niveau de détail, ambiance, réalisme, dynamique

4. **Aperçu de cohérence**
   - Mini preview IA (visage, décor, panel)
   - Généré pour montrer ce que l'IA a compris

## 🔧 Utilisation dans le code

### Interface TypeScript

```typescript
interface ProjectVisualReference {
  id: string
  project_id: string
  image_url: string
  display_order: number
  created_at: string
  updated_at: string
}

interface Project {
  // ... autres champs
  visual_style_summary?: string | null
  visual_style_prompt?: string | null
}
```

### Récupération des références

```typescript
const { data: references } = await supabase
  .from('project_visual_references')
  .select('*')
  .eq('project_id', projectId)
  .order('display_order', { ascending: true })
```

---

*Document créé le : 2024*
*Dernière mise à jour : 2024*
