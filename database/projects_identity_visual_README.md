# Migration SQL - Ajout de identity_visual_reference_url

## 📋 Objectif

Ajouter la colonne `identity_visual_reference_url` à la table `projects` pour stocker le template/identité visuelle sélectionné lors de la configuration du projet.

## 🚀 Installation

### 1. Exécuter la migration SQL

Dans Supabase Dashboard :

1. Allez dans **SQL Editor**
2. Copiez-collez le contenu de `projects_identity_visual_migration.sql`
3. Cliquez sur **Run**

## 📊 Nouvelle colonne

```sql
projects
└── identity_visual_reference_url (TEXT, NULLABLE)
    └── URL du template/identité visuelle sélectionné
```

## 🎯 Utilisation

Cette colonne est utilisée pour :

- **Stockage du template** : Lors de la création du projet, le template sélectionné est sauvegardé dans cette colonne
- **Cohérence graphique IA** : L'IA utilise cette référence pour garantir que tous les éléments générés (personnages, lieux, assets, planches) respectent le même style graphique
- **Affichage dans le dashboard** : Le template est affiché dans la section "Identité Visuelle & Moodboard"

## 🔄 Migration depuis style_reference_image_url

Pour les projets existants qui utilisent encore `style_reference_image_url`, le code fait automatiquement un fallback :

```typescript
const identityVisualReference = project.identity_visual_reference_url || project.style_reference_image_url
```

## 📝 Notes

- La colonne est **nullable** (peut être NULL)
- `style_reference_image_url` est conservé pour compatibilité avec les anciens projets
- La priorité est donnée à `identity_visual_reference_url` pour tous les nouveaux projets
