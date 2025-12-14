# Migration SQL - Colonnes de Background Normalisées

## 📋 Objectif

Ajouter les colonnes normalisées pour le système de background des projets :
- `background_type` : Type de background (`preset` ou `custom`)
- `background_preset` : Nom du preset sélectionné (si `background_type = 'preset'`)
- `background_image_url` : URL de l'image personnalisée (si `background_type = 'custom'`)

## 🚀 Installation

### 1. Exécuter la migration SQL

Dans Supabase Dashboard :

1. Allez dans **SQL Editor**
2. Copiez-collez le contenu de `projects_background_migration.sql`
3. Cliquez sur **Run**

## 📊 Nouvelles colonnes

```sql
projects
├── background_type (TEXT, NULLABLE)
│   └── 'preset' | 'custom' | NULL
├── background_preset (TEXT, NULLABLE)
│   └── 'indigo-violet' | 'rose-violet' | 'dark-creative' | 'colorful-gradient' | 'dark-indigo' | NULL
└── background_image_url (TEXT, NULLABLE)
    └── URL de l'image personnalisée (si background_type = 'custom')
```

## 🎯 Utilisation

### Structure normalisée

Le système utilise maintenant une structure normalisée au lieu de parser le CSS :

1. **Preset** : `background_type = 'preset'` + `background_preset = 'indigo-violet'`
2. **Custom** : `background_type = 'custom'` + `background_image_url = 'https://...'`

### Compatibilité

- `gradient_background` est **conservé** pour compatibilité avec les anciens projets
- Il ne doit **plus être utilisé** pour la logique, uniquement pour le fallback
- La fonction `getProjectBackground()` gère automatiquement le fallback

## 🔄 Migration depuis l'ancien système

Les projets existants qui utilisent `gradient_background` continueront de fonctionner grâce au fallback dans `getProjectBackground()`.

Pour migrer un projet existant vers le nouveau système :
1. Déterminer si le `gradient_background` correspond à un preset
2. Si oui, définir `background_type = 'preset'` et `background_preset = '...'`
3. Si non (image personnalisée), définir `background_type = 'custom'` et `background_image_url = '...'`

## 📝 Notes

- Toutes les colonnes sont **nullable** (peut être NULL)
- Les valeurs par défaut sont gérées côté application (TypeScript)
- Le preset par défaut est `'dark-creative'` si aucun n'est défini
