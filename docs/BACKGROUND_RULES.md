# 📋 Règles du Background du Projet

Ce document explique toutes les règles et fonctionnalités concernant le background (fond) d'un projet, depuis sa sélection lors de la création jusqu'à son application dans l'interface.

## 📌 Vue d'ensemble

Le background d'un projet est un élément visuel qui définit l'apparence générale de l'interface du projet. Il peut être :
- Un gradient CSS prédéfini (5 options disponibles)
- Une image personnalisée uploadée par l'utilisateur

Le background est stocké dans la base de données dans le champ `gradient_background` de la table `projects`, et peut être modifié à tout moment depuis la page des paramètres.

---

## 🎨 Types de Backgrounds Disponibles

### 1. **Indigo/Violet** (`indigo-violet`)
- **Gradient CSS** : `linear-gradient(135deg, #050510 0%, #1a1a2e 25%, #4F46E5 50%, #8B5CF6 75%, #050510 100%)`
- **Couleurs** : Indigo (#4F46E5) et Violet (#8B5CF6) - couleurs principales de la DA
- **Style** : Gradient sombre avec touches de couleurs vives

### 2. **Rose/Violet** (`rose-violet`)
- **Gradient CSS** : `linear-gradient(135deg, #050510 0%, #2d1b3d 25%, #EC4899 50%, #8B5CF6 75%, #050510 100%)`
- **Couleurs** : Rose (#EC4899) et Violet (#8B5CF6) - couleurs accent
- **Style** : Gradient sombre avec touches de rose et violet

### 3. **Sombre créatif** (`dark-creative`)
- **Gradient CSS** : `linear-gradient(135deg, #050510 0%, #0A0A1A 20%, #0F0F1F 40%, #141428 60%, #191932 80%, #1E1E3C 100%)`
- **Couleurs** : Nuances de sombre avec touches colorées
- **Style** : Style du site par défaut, gradient sombre créatif

### 4. **Gradient coloré** (`colorful-gradient`)
- **Gradient CSS** : `linear-gradient(135deg, #6366F1 0%, #8B5CF6 25%, #EC4899 50%, #F472B6 75%, #6366F1 100%)`
- **Couleurs** : Toutes les couleurs de la palette (Indigo, Violet, Rose)
- **Style** : Gradient coloré et dynamique

### 5. **Sombre indigo** (`dark-indigo`)
- **Gradient CSS** : `linear-gradient(135deg, #050510 0%, #0a0a1a 30%, #1a1a3e 60%, #2d1b4e 90%, #050510 100%)`
- **Couleurs** : Nuances de sombre avec touches d'indigo
- **Style** : Gradient sombre moderne avec indigo

### 6. **Personnalisé** (`custom`)
- **Type** : Image uploadée par l'utilisateur
- **Format** : Toute image acceptée (`image/*`)
- **Taille max** : 5MB
- **Stockage** : Supabase Storage dans le bucket `images`, sous le chemin `${user.id}/backgrounds/${timestamp}.${extension}`
- **Format stocké** : `url(${publicUrl})` dans le champ `gradient_background`

---

## 🚀 Sélection du Background lors de la Création

### Étape 6 : Choix du background

Lors de la création d'un projet (étape 6 sur 7), l'utilisateur peut choisir son background parmi les options disponibles.

#### Interface
- **Grille** : 2 colonnes sur mobile, 3 colonnes sur écrans moyens et grands (`grid-cols-2 sm:grid-cols-3`)
- **Boutons** : Chaque option est représentée par un bouton avec :
  - Un aperçu visuel (div avec gradient ou placeholder)
  - Le nom de l'option
  - Un état sélectionné (bordure jaune et fond jaune/20)

#### Placeholder pour l'option Personnalisée
- **Quand aucune image n'est sélectionnée** : Affiche une icône d'image SVG avec le texte "Image"
- **Quand une image est uploadée** : Affiche l'image en preview

#### Upload d'image (option Personnalisée)
1. L'utilisateur clique sur "Personnalisé"
2. Un champ de fichier apparaît avec le label "Image de background personnalisée"
3. L'utilisateur sélectionne une image
4. **Validation** :
   - Taille max : 5MB
   - Format : Tous les formats d'image acceptés
5. **Upload** :
   - Fichier uploadé dans Supabase Storage
   - Chemin : `${user.id}/backgrounds/${Date.now()}.${fileExt}`
   - Bucket : `images`
6. **Mise à jour** :
   - `background_image_url` : URL publique de l'image
   - `gradient_background` : `url(${publicUrl})`
   - `background_type` : `'custom'`

#### Sauvegarde
Lors de la soumission du formulaire (étape 7), le background est sauvegardé dans la base de données :
```typescript
gradient_background: gradientBackground // Gradient CSS ou URL d'image
```

Le `gradientBackground` est déterminé ainsi :
```typescript
const gradientBackground = config.gradient_background ||
  (config.background_type === 'indigo-violet' ? 'linear-gradient(...)' :
   config.background_type === 'rose-violet' ? 'linear-gradient(...)' :
   // ... autres types ...
   config.background_type === 'custom' && config.background_image_url ? `url(${config.background_image_url})` :
   getGradientBackground()) // Fallback par défaut
```

---

## ⚙️ Modification du Background dans les Paramètres

### Page `/project/[id]/parametres`

La page des paramètres permet de modifier le background d'un projet existant.

#### Section "🎨 Background du projet"

1. **Affichage du background actuel** :
   - Affiche le background actuel du projet
   - Si c'est une image (`url(...)`), affiche l'image
   - Si c'est un gradient, affiche le gradient
   - Cliquable pour ouvrir le modal de modification

2. **Modal de modification** :
   - **Titre** : "Modifier le background"
   - **Grille** : Même disposition que lors de la création (2 colonnes mobile, 3 colonnes desktop)
   - **Options** : Toutes les mêmes options que lors de la création
   - **Placeholder personnalisé** : Même système que lors de la création

#### Détection automatique du type

Lors du chargement de la page, le type de background est automatiquement détecté :

```typescript
const bg = project.gradient_background || ''
if (bg.startsWith('url(')) {
  setBackgroundType('custom')
  setCustomBackgroundPreview(bg.replace('url(', '').replace(')', ''))
} else if (bg.includes('#4F46E5') && bg.includes('#8B5CF6')) {
  setBackgroundType('indigo-violet')
} else if (bg.includes('#EC4899') && bg.includes('#8B5CF6')) {
  setBackgroundType('rose-violet')
} else if (bg.includes('#141428') && bg.includes('#191932')) {
  setBackgroundType('dark-creative')
} else if (bg.includes('#6366F1') && bg.includes('#EC4899')) {
  setBackgroundType('colorful-gradient')
} else if (bg.includes('#1a1a3e') || bg.includes('#2d1b4e')) {
  setBackgroundType('dark-indigo')
} else {
  setBackgroundType('indigo-violet') // Par défaut
}
```

#### Processus de modification

1. **Sélection d'un type prédéfini** :
   - L'utilisateur clique sur un bouton (Indigo/Violet, Rose/Violet, etc.)
   - Le gradient correspondant est généré
   - Mise à jour immédiate dans la base de données
   - Mise à jour du store Zustand

2. **Sélection de Personnalisé** :
   - Si aucune image n'est sélectionnée : Ouvre le sélecteur de fichier
   - Si une image est déjà sélectionnée : Permet de changer l'image
   - Upload dans Supabase Storage (même processus que lors de la création)
   - Mise à jour avec `url(${publicUrl})`

3. **Sauvegarde** :
   ```typescript
   const { error } = await supabase
     .from('projects')
     .update({ gradient_background: gradient })
     .eq('id', projectId)
   
   if (!error) {
     updateProject({ gradient_background: gradient })
   }
   ```

---

## 🎯 Application du Background

### Dans les Pages du Projet

Le background est appliqué via un style inline sur le conteneur principal de chaque page :

```typescript
<div
  style={{
    background: project.gradient_background || 'linear-gradient(to right, #050510, #0A0A0F, #050510)',
    backgroundAttachment: 'fixed',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }}
>
  {/* Contenu de la page */}
</div>
```

### Pages concernées
- `/project/[id]` (Dashboard)
- `/project/[id]/chapters`
- `/project/[id]/characters`
- `/project/[id]/places`
- `/project/[id]/scenario`
- `/project/[id]/objectives`
- `/project/[id]/parametres`
- `/project/[id]/chapter/[chapterId]`

### Fallback par défaut
Si `project.gradient_background` est `null` ou vide, le fallback suivant est utilisé :
```css
linear-gradient(to right, #050510, #0A0A0F, #050510)
```

---

## 💾 Stockage et Structure de Données

### Base de données

**Table** : `projects`
**Champ** : `gradient_background`
**Type** : `TEXT` (nullable)

**Valeurs possibles** :
- Gradient CSS : `linear-gradient(...)`
- URL d'image : `url(https://...)`

### Interface TypeScript

```typescript
interface ProjectConfig {
  background_type?: 'indigo-violet' | 'rose-violet' | 'dark-creative' | 'colorful-gradient' | 'dark-indigo' | 'custom'
  gradient_background?: string // Gradient CSS ou URL d'image
  background_image_url?: string // URL de l'image pour le background personnalisé
}
```

### Store Zustand

Le background est géré dans le store `useProjectStore` :
- **État** : `project.gradient_background`
- **Mise à jour** : Via `updateProject({ gradient_background: ... })`

---

## 🔒 Règles de Validation

### Lors de la Création

1. **Option Personnalisée** :
   - ✅ Format : Tous les formats d'image (`image/*`)
   - ✅ Taille max : 5MB
   - ❌ Si > 5MB : Erreur affichée, upload annulé

2. **Options prédéfinies** :
   - ✅ Aucune validation nécessaire
   - ✅ Sélection immédiate

### Lors de la Modification (Paramètres)

1. **Même règles que lors de la création**
2. **États de chargement** :
   - `uploading` : Pendant l'upload de l'image
   - `saving` : Pendant la sauvegarde en base de données
   - Boutons désactivés pendant ces états

---

## 🎨 Règles de Design

### Cohérence avec la Direction Artistique

Tous les backgrounds prédéfinis utilisent les couleurs de la palette du site :
- **Indigo** : `#6366F1` (primary)
- **Violet** : `#8B5CF6` (secondary)
- **Rose** : `#EC4899` (accent)
- **Sombre** : `#050510` (darkest)

### Aperçus visuels

Chaque option de background a un aperçu visuel dans la grille :
- **Gradients prédéfinis** : Div avec le gradient appliqué
- **Personnalisé** : 
  - Placeholder avec icône si aucune image
  - Image en preview si image sélectionnée

### États interactifs

- **Hover** : Bordure plus visible (`hover:border-white/80`)
- **Sélectionné** : Bordure jaune + fond jaune/20 (`border-yellow bg-yellow/20`)
- **Désactivé** : Opacité 50% + curseur non autorisé (`opacity-50 cursor-not-allowed`)

---

## 📝 Récapitulatif dans la Validation Finale

Lors de l'étape 7 (Validation finale), le background choisi est affiché dans le récapitulatif :

```typescript
{config.background_type === 'indigo-violet' ? 'Indigo/Violet' :
 config.background_type === 'rose-violet' ? 'Rose/Violet' :
 config.background_type === 'dark-creative' ? 'Sombre créatif' :
 config.background_type === 'colorful-gradient' ? 'Gradient coloré' :
 config.background_type === 'dark-indigo' ? 'Sombre indigo' :
 config.background_type === 'custom' ? 'Personnalisé' : 'Par défaut'}
```

---

## 🔄 Flux Complet

### Création d'un Projet

1. **Étape 6** : Choix du background
   - Sélection d'une option prédéfinie OU upload d'une image
   - Si image : Upload → Stockage → URL générée
2. **Étape 7** : Validation finale
   - Affichage du background choisi dans le récapitulatif
3. **Soumission** : Sauvegarde en base de données
   - `gradient_background` : Gradient CSS ou `url(...)`

### Modification d'un Projet Existant

1. **Page Paramètres** : `/project/[id]/parametres`
2. **Section Background** : Clic sur le background actuel
3. **Modal** : Sélection d'une nouvelle option
4. **Sauvegarde** : Mise à jour immédiate en base de données
5. **Application** : Le nouveau background est appliqué immédiatement sur toutes les pages

---

## ⚠️ Notes Importantes

1. **Compatibilité** : Les anciens projets peuvent avoir des backgrounds différents (noir, gris, blanc) qui ne sont plus proposés mais restent fonctionnels
2. **Performance** : Les images personnalisées sont stockées dans Supabase Storage pour optimiser les performances
3. **Fallback** : Si aucun background n'est défini, un gradient par défaut est utilisé
4. **Responsive** : Les grilles de sélection s'adaptent aux différentes tailles d'écran

---

## 🛠️ Fichiers Concernés

- `lib/projectConfig.ts` : Interface TypeScript et types
- `pages/project/new.tsx` : Étape 6 (Sélection du background)
- `pages/project/[id]/parametres.tsx` : Modification du background
- `lib/stores/projectStore.ts` : Gestion du state (Zustand)
- Toutes les pages du projet : Application du background via style inline

---

## 📚 Exemples de Code

### Sélection d'un background prédéfini
```typescript
setConfig({ 
  ...config, 
  background_type: 'indigo-violet', 
  gradient_background: 'linear-gradient(135deg, #050510 0%, #1a1a2e 25%, #4F46E5 50%, #8B5CF6 75%, #050510 100%)' 
})
```

### Upload d'une image personnalisée
```typescript
const { data: uploadData, error: uploadError } = await supabase.storage
  .from('images')
  .upload(fileName, file)

const { data: { publicUrl } } = supabase.storage
  .from('images')
  .getPublicUrl(fileName)

setConfig({ 
  ...config, 
  background_image_url: publicUrl, 
  gradient_background: `url(${publicUrl})` 
})
```

### Application du background
```typescript
<div
  style={{
    background: project.gradient_background || 'linear-gradient(to right, #050510, #0A0A0F, #050510)',
    backgroundAttachment: 'fixed',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }}
>
```

---

**Dernière mise à jour** : 2025-01-XX
**Version** : 1.0
