# Migration : Ajout du champ `type` aux personnages

## 📋 Vue d'ensemble

Cette migration ajoute un champ `type` à la table `characters` pour distinguer :
- **Personnages** (`character`) - Les héros et personnages principaux
- **Monstres** (`monster`) - Créatures et monstres
- **Ennemis** (`enemy`) - Antagonistes et adversaires

## 🚀 Installation

### 1. Exécuter la migration SQL

Dans Supabase Dashboard :

1. Allez dans **SQL Editor**
2. Copiez-collez le contenu de `characters_type_migration.sql`
3. Cliquez sur **Run**

## 📊 Changements

### Nouveau champ

```sql
type VARCHAR(20) DEFAULT 'character' NOT NULL
```

- **Valeurs possibles** : `'character'`, `'monster'`, `'enemy'`
- **Valeur par défaut** : `'character'` (pour la rétrocompatibilité)
- **Index** : Créé sur `(project_id, type)` pour améliorer les performances

## 🎨 Interface utilisateur

La page `/characters` a été refactorisée avec :

1. **Onglets** pour naviguer entre Personnages / Monstres / Ennemis
2. **Design différencié** :
   - **Personnages** : Bleu/Cyan (👤)
   - **Monstres** : Violet/Rose (👹)
   - **Ennemis** : Rouge/Orange (⚔️)
3. **Compteurs** sur chaque onglet
4. **Filtrage automatique** selon l'onglet actif

## 🔧 Utilisation

### Créer un personnage avec type

```typescript
const { data, error } = await supabase
  .from('characters')
  .insert([
    {
      project_id: '...',
      name: 'Dragon',
      type: 'monster', // ou 'character', 'enemy'
      // ...
    }
  ])
```

### Filtrer par type

```typescript
const { data } = await supabase
  .from('characters')
  .select('*')
  .eq('project_id', projectId)
  .eq('type', 'monster') // Filtrer les monstres
```

## 📝 Notes

- Les personnages existants auront automatiquement `type = 'character'`
- Le champ est **NOT NULL** avec une valeur par défaut pour garantir la cohérence
- L'index améliore les performances des requêtes filtrées par type
