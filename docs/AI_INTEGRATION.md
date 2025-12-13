# 🧠 Guide d'Intégration IA - Cohérence Graphique

## 📋 Vue d'ensemble

Selon le **Produit.md**, l'IA doit garantir une **cohérence graphique absolue** en prenant en compte tous les éléments du projet.

## 🎯 Principes Fondamentaux

### 1. Image de Couverture = Référence Absolue

L'image de couverture du projet (`project.style_reference_image_url`) est **LA** référence stylistique pour toutes les générations IA.

**Règle :** Toute génération IA doit inclure cette référence dans le prompt.

### 2. Contexte Implicite Obligatoire

Tout prompt IA doit inclure automatiquement :

- ✅ Le style de la couverture
- ✅ L'identité visuelle du projet (style_graphique, ambiance)
- ✅ Le contexte narratif (chapitre, scène)
- ✅ Le format Webtoon vertical (800px × 1200px)
- ✅ La continuité inter-chapitres

### 3. Hiérarchie des Contexte

```
Couverture du projet (référence absolue)
    ↓
Identité visuelle globale (style, ambiance, genre)
    ↓
Contexte narratif (chapitre, scène, objectifs)
    ↓
Contexte élément (personnage, lieu, asset)
    ↓
Prompt utilisateur (action spécifique)
```

## 🔧 Utilisation de `aiContextBuilder.ts`

### Exemple 1 : Générer une image de personnage

```typescript
import { buildImageGenerationPrompt } from '@/lib/aiContextBuilder'
import { supabase } from '@/lib/supabase'

// Charger le projet et le personnage
const { data: project } = await supabase.from('projects').select('*').eq('id', projectId).single()
const { data: character } = await supabase.from('characters').select('*').eq('id', characterId).single()

// Construire le prompt avec contexte complet
const { prompt, styleReference, format } = buildImageGenerationPrompt(
  {
    project,
    character,
  },
  "Faire lever les bras au personnage avec une expression déterminée",
  'character'
)

// Appeler l'API
const response = await fetch('/api/generate-image', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt,
    styleReference,
    format,
    projectId,
    characterId,
    imageType: 'character'
  })
})
```

### Exemple 2 : Optimiser un panel

```typescript
const { prompt, styleReference } = buildImageGenerationPrompt(
  {
    project,
    chapter,
    scene,
    objectives: {
      readingTime: '3-5 min',
      narrativeType: 'action',
      visualDensity: 'high'
    }
  },
  "Rendre la scène plus dramatique avec un cadrage serré",
  'panel'
)
```

### Exemple 3 : Générer une transition

```typescript
const { prompt } = buildImageGenerationPrompt(
  {
    project,
    chapter
  },
  "Créer un effet de flou progressif entre deux panels",
  'transition'
)
```

## 📊 Structure des Contextes

### Contexte de Base (toujours présent)

- Style graphique du projet
- Ambiance
- Image de référence (couverture)
- Format Webtoon vertical
- Genre et univers

### Contexte Personnage

- Nom et description
- Identité visuelle (visage, corps)
- Traits de caractère
- Histoire
- Images de référence

### Contexte Panel

- Chapitre et scène
- Rôle narratif
- Densité visuelle
- Personnages présents
- Fond (lieu)
- Objectifs du chapitre

### Contexte Transition

- Type de transition
- Chapitre
- Rôle dans le rythme

## ✅ Validation des Objectifs

Avant toute génération, vérifier les objectifs :

```typescript
import { validateAgainstObjectives } from '@/lib/aiContextBuilder'

const validation = validateAgainstObjectives(
  {
    readingTime: '3-5 min',
    constraints: ['Ambiance sombre', 'Maximum 2 lieux']
  },
  currentReadingTime,
  currentPanels
)

if (!validation.valid) {
  // Afficher les warnings à l'utilisateur
  console.warn(validation.warnings)
}
```

## 🔗 Intégration dans les Composants

### Dans `WebtoonPanelEditor.tsx`

```typescript
import { buildImageGenerationPrompt } from '@/lib/aiContextBuilder'

const handleAIAction = async () => {
  const { prompt, styleReference, format } = buildImageGenerationPrompt(
    {
      project,
      chapter: { id: chapterId, ...chapterData },
      scene: selectedScene,
      character: selectedCharacter,
      objectives: chapterObjectives
    },
    aiPrompt,
    'panel'
  )

  const response = await fetch('/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      styleReference,
      format,
      projectId,
      chapterId,
      sceneId: selectedScene?.id,
      characterId: selectedCharacter?.id,
      imageType: 'panel',
      objectives: chapterObjectives
    })
  })
}
```

### Dans `[characterId].tsx` (édition personnage)

```typescript
const generateImageWithAI = async (type: 'face' | 'body', prompt: string) => {
  const { prompt: fullPrompt, styleReference } = buildImageGenerationPrompt(
    {
      project,
      character
    },
    prompt,
    'character'
  )

  const response = await fetch('/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: fullPrompt,
      styleReference,
      projectId: project.id,
      characterId: character.id,
      imageType: 'character'
    })
  })
}
```

## 🎨 Points Clés pour la Cohérence

1. **Toujours inclure la couverture** dans le styleReference
2. **Respecter le format Webtoon** (800px × 1200px, vertical)
3. **Maintenir la continuité** entre chapitres
4. **Respecter les objectifs** du projet
5. **Utiliser le contexte narratif** (chapitre, scène, rôle)

## 🚀 Prochaines Étapes

1. **Intégrer un service IA réel** dans `/api/generate-image.ts`
   - OpenAI DALL-E 3
   - Stable Diffusion
   - Midjourney API
   - Autre service

2. **Ajouter la validation des objectifs** dans l'UI
   - Afficher les warnings avant génération
   - Proposer des optimisations

3. **Cache des générations** pour éviter les doublons
   - Stocker les prompts + résultats
   - Réutiliser si contexte identique

4. **Batch generation** pour les séquences
   - Générer plusieurs panels d'un coup
   - Maintenir la cohérence sur la séquence
