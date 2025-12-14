# Vue d'ensemble du système — Webtoon AI Maker

## 📋 Table des matières

1. [Architecture générale](#architecture-générale)
2. [Rôle de l'identité visuelle](#rôle-de-lidentité-visuelle)
3. [Structure des données](#structure-des-données)
4. [Flux de création](#flux-de-création)
5. [Intégration IA](#intégration-ia)

---

## 🏗️ Architecture générale

### Vue système

Le Webtoon AI Maker est structuré autour d'un **projet central** qui contient tous les éléments nécessaires à la création d'un webtoon :

```
Projet
├── Configuration (genre, ambiance, style, format)
├── Identité Visuelle (template de référence)
├── Personnages
├── Lieux & Décors
├── Scénario (trame globale, arcs narratifs)
├── Chapitres
│   ├── Scènes
│   │   └── Panels
│   └── Notes scénaristiques
└── Objectifs (contraintes créatives)
```

### Composants principaux

#### 1. **Projet** (`projects` table)
- **Nom et description** : Identité du webtoon
- **Configuration** : Genre, ambiance, style graphique, format (vertical/horizontal)
- **Identité visuelle** : Template de référence pour la cohérence graphique
- **Univers principal** : Contexte narratif global
- **Background** : Ambiance visuelle (preset ou image personnalisée)

#### 2. **Personnages** (`characters` table)
- Informations de base (nom, description)
- Identité visuelle détaillée (visage, corps, vêtements)
- Images de référence pour chaque partie
- Type de personnage (principal, secondaire, figurant)
- Utilisés dans les chapitres via drag & drop

#### 3. **Lieux & Décors** (`places` table)
- Nom et description
- Ambiance du lieu
- Variations (jour, nuit, pluie, etc.)
- Images de référence
- Utilisés comme fonds de chapitre

#### 4. **Scénario** (`scenario` table)
- **Trame globale** : Histoire principale du webtoon
- **Arcs narratifs** : Structure narrative avec chapitres associés
- Alimente les prompts IA et guide la création

#### 5. **Chapitres** (`chapters` table)
- Structure narrative d'un chapitre
- Contient des **scènes** (`scenes` table)
- Chaque scène contient des **panels** (éléments visuels)
- Notes scénaristiques associées (`chapter_notes` table)

#### 6. **Objectifs** (`objectives` table)
- Objectifs globaux (nombre de chapitres, temps de lecture)
- Objectifs par chapitre (type narratif, densité)
- Contraintes créatives (règles écrites)
- Utilisés pour valider et guider les générations IA

---

## 🎨 Rôle de l'identité visuelle

### Définition

L'**identité visuelle** (`identity_visual_reference_url`) est une **image de référence unique** qui définit le style graphique de **TOUS** les éléments générés par l'IA dans un projet.

### Pourquoi c'est crucial ?

Dans un webtoon, la **cohérence visuelle** est essentielle :
- Les personnages doivent avoir le même style de dessin
- Les couleurs doivent être cohérentes
- Les proportions, traits, textures doivent correspondre
- L'ambiance visuelle doit être uniforme

👉 **Sans identité visuelle, chaque génération IA serait différente, créant un webtoon incohérent.**

### Comment elle est définie ?

#### 1. **Lors de la création du projet** (Étape 4)

L'utilisateur sélectionne un **style graphique** :
- Webtoon standard
- Manga noir & blanc
- Manhwa semi-réaliste
- Cartoon
- Peinture digitale
- Pixel art
- Custom (image personnalisée)

#### 2. **Sélection du template**

Pour chaque style (sauf "custom"), **3 templates d'exemple** sont proposés :
- Ces templates sont stockés dans Supabase Storage : `style-references/style-examples/{style}/exemple-{1-3}.{jpg|webp}`
- L'utilisateur sélectionne **un seul template** qui devient l'identité visuelle

#### 3. **Stockage**

L'URL du template sélectionné est sauvegardée dans :
- **Colonne** : `identity_visual_reference_url` (table `projects`)
- **Fallback** : `style_reference_image_url` (pour compatibilité avec anciens projets)

### Utilisation dans le système

#### ✅ **1. Génération IA de personnages**

Quand l'IA génère un personnage, elle reçoit :
```
Référence visuelle ABSOLUE (Identité Visuelle): {identity_visual_reference_url}
Cohérence visuelle OBLIGATOIRE: Tous les éléments générés doivent être PARFAITEMENT cohérents avec cette image de référence
Style, couleurs, traits, proportions, textures, ambiance - TOUT doit correspondre exactement à cette référence
```

#### ✅ **2. Génération IA de lieux**

Les lieux générés respectent le même style graphique que l'identité visuelle.

#### ✅ **3. Génération IA de panels**

Chaque panel généré dans un chapitre utilise l'identité visuelle comme référence pour :
- Le style de dessin
- Les couleurs
- Les proportions
- L'ambiance visuelle

#### ✅ **4. Génération IA d'assets**

Tous les assets (objets, effets, etc.) respectent l'identité visuelle.

### Code d'intégration

L'identité visuelle est intégrée dans **tous les prompts IA** via `lib/aiContextBuilder.ts` :

```typescript
// Priorité à identity_visual_reference_url, fallback sur style_reference_image_url
const identityVisualReference = project.identity_visual_reference_url || project.style_reference_image_url

if (identityVisualReference) {
  contextParts.push(`Référence visuelle ABSOLUE (Identité Visuelle): ${identityVisualReference}`)
  contextParts.push('Cohérence visuelle OBLIGATOIRE: Tous les éléments générés doivent être PARFAITEMENT cohérents avec cette image de référence')
  contextParts.push('Style, couleurs, traits, proportions, textures, ambiance - TOUT doit correspondre exactement à cette référence')
}
```

### Affichage dans l'interface

L'identité visuelle est affichée dans :
- **Dashboard du projet** : Section "Identité Visuelle & Moodboard"
- **Éditeur de chapitres** : Visible comme référence lors de la génération IA
- **Création de personnages** : Utilisée automatiquement pour la génération

---

## 💾 Structure des données

### Table `projects`

```typescript
interface Project {
  id: string
  name: string
  description: string | null
  user_id: string
  
  // Configuration
  genre?: string | null
  genre_custom?: string | null
  ambiance?: string | null
  ambiance_custom?: string | null
  style_graphique?: string | null
  format?: string | null
  univers_principal?: string | null
  
  // Identité visuelle (CRUCIALE)
  identity_visual_reference_url?: string | null  // Template sélectionné
  style_reference_image_url?: string | null      // Ancien champ (compatibilité)
  style_prompt?: string | null                  // Description personnalisée
  
  // Background
  background_type?: 'preset' | 'custom' | null
  background_preset?: string | null
  background_image_url?: string | null
  
  created_at: string
  updated_at: string
}
```

### Flux de données

```
Création projet
    ↓
Sélection style graphique
    ↓
Sélection template (identity_visual_reference_url)
    ↓
Stockage dans projects.identity_visual_reference_url
    ↓
Utilisation dans TOUS les prompts IA
    ↓
Cohérence graphique garantie
```

---

## 🔄 Flux de création

### 1. Création du projet

1. **Étape 1** : Nom et description
2. **Étape 2** : Genre
3. **Étape 3** : Ambiance
4. **Étape 4** : **Style graphique + Template (identité visuelle)** ⭐
5. **Étape 5** : Univers principal
6. **Étape 6** : Background (ambiance visuelle)
7. **Étape 7** : Validation finale

### 2. Création de personnages

- L'utilisateur définit les caractéristiques (nom, description, visage, corps)
- L'IA génère les images en utilisant **l'identité visuelle** comme référence
- Tous les personnages ont le même style graphique

### 3. Création de lieux

- L'utilisateur définit le lieu (nom, description, ambiance)
- L'IA génère l'image en respectant **l'identité visuelle**

### 4. Création de chapitres

- L'utilisateur crée des scènes avec panels
- Chaque panel peut être généré par IA
- Tous les panels respectent **l'identité visuelle**
- Les personnages et lieux créés précédemment sont utilisés

---

## 🤖 Intégration IA

### Principe fondamental

**Toute génération IA inclut automatiquement l'identité visuelle du projet.**

### Fichiers clés

#### `lib/aiContextBuilder.ts`

Construit le contexte de base pour tous les prompts IA :

```typescript
export function buildBaseContext(project: Project): string {
  // ...
  const identityVisualReference = project.identity_visual_reference_url || project.style_reference_image_url
  if (identityVisualReference) {
    contextParts.push(`Référence visuelle ABSOLUE (Identité Visuelle): ${identityVisualReference}`)
    contextParts.push('Cohérence visuelle OBLIGATOIRE: ...')
  }
  // ...
}
```

#### `pages/api/generate-image.ts`

Endpoint API qui génère les images avec contexte complet :

```typescript
// L'identité visuelle est automatiquement incluse dans le prompt
const prompt = buildImageGenerationPrompt({
  project,
  character,
  // ...
})
```

### Utilisation dans les composants

#### `components/WebtoonPanelEditor.tsx`
```typescript
const identityVisualReference = project.identity_visual_reference_url || project.style_reference_image_url
// Utilisé lors de la génération de panels
```

#### `components/WebtoonCanvasEditor.tsx`
```typescript
const identityVisualReference = project.identity_visual_reference_url || project.style_reference_image_url
// Utilisé lors de la génération IA dans le canvas
```

#### `pages/project/[id]/character/[characterId].tsx`
```typescript
const identityVisualReference = project.identity_visual_reference_url || project.style_reference_image_url
// Utilisé lors de la génération/modification de personnages
```

---

## 🎯 Résumé : Rôle de l'identité visuelle

### En une phrase

**L'identité visuelle est l'image de référence unique qui garantit la cohérence graphique de TOUS les éléments générés par l'IA dans un projet.**

### Points clés

1. ✅ **Définie une seule fois** lors de la création du projet
2. ✅ **Utilisée automatiquement** dans tous les prompts IA
3. ✅ **Garantit la cohérence** entre personnages, lieux, panels, assets
4. ✅ **Stockée dans** `projects.identity_visual_reference_url`
5. ✅ **Priorité absolue** : Tous les éléments doivent correspondre exactement à cette référence

### Impact

Sans identité visuelle :
- ❌ Chaque génération IA serait différente
- ❌ Le webtoon serait incohérent visuellement
- ❌ Les personnages auraient des styles différents
- ❌ L'expérience de lecture serait dégradée

Avec identité visuelle :
- ✅ Tous les éléments sont cohérents
- ✅ Le webtoon a une identité visuelle forte
- ✅ L'expérience de lecture est professionnelle
- ✅ L'utilisateur peut créer un webtoon sans savoir dessiner

---

## 📚 Ressources complémentaires

- **Migration SQL** : `database/projects_identity_visual_migration.sql`
- **Documentation migration** : `database/projects_identity_visual_README.md`
- **Builder de contexte IA** : `lib/aiContextBuilder.ts`
- **API génération images** : `pages/api/generate-image.ts`
- **Règles de background** : `docs/BACKGROUND_RULES.md`

---

*Document créé le : 2024*
*Dernière mise à jour : 2024*
