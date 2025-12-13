# 🎨 Intégration du Style Graphique

## 📋 Vue d'ensemble

Le style graphique sélectionné lors de la configuration du projet est **automatiquement appliqué** à tous les éléments générés par l'IA :
- Personnages
- Lieux / Décors
- Assets
- Panels
- Transitions

## 🔧 Comment ça fonctionne

### 1. Sélection du style lors de la création du projet

Dans `/pages/project/new.tsx`, étape 4 :
- L'utilisateur sélectionne un style graphique parmi les options
- Des exemples d'images sont affichés pour chaque style
- Le style est sauvegardé dans `project.style_graphique`

### 2. Utilisation automatique dans les prompts IA

Le système `aiContextBuilder.ts` inclut **automatiquement** le style dans tous les prompts :

```typescript
// Dans buildBaseContext()
if (project.style_graphique) {
  contextParts.push(`Style graphique: ${project.style_graphique}`)
}

// Dans buildImageGenerationPrompt()
// Le style est toujours inclus dans le prompt final
```

### 3. Application dans tous les composants

#### Personnages (`pages/project/[id]/character/[characterId].tsx`)

```typescript
const generateImageWithAI = async (type: 'face' | 'body', prompt: string) => {
  const { prompt: fullPrompt, styleReference } = buildImageGenerationPrompt(
    {
      project, // ← Le style est dans project.style_graphique
      character
    },
    prompt,
    'character'
  )
  // Le style est automatiquement inclus dans fullPrompt
}
```

#### Panels (`components/WebtoonPanelEditor.tsx`)

```typescript
const handleAIAction = async () => {
  const { prompt, styleReference } = buildImageGenerationPrompt(
    {
      project, // ← Le style est inclus
      chapter,
      scene,
      objectives
    },
    aiPrompt,
    'panel'
  )
}
```

## 📊 Styles disponibles

Les styles sont définis dans `lib/projectConfig.ts` :

- `webtoon-standard` : Style classique des webtoons coréens
- `manga-noir-blanc` : Style traditionnel manga
- `manhwa-semi-realiste` : Style manhwa avec proportions réalistes
- `cartoon` : Style cartoon avec formes arrondies
- `peinture-digitale` : Style artistique avec textures
- `pixel-art` : Style rétro avec pixels visibles
- `custom` : Style personnalisé (image de référence ou description)

## 🖼️ Exemples d'images

Les exemples sont stockés dans Supabase Storage :
- Bucket : `style-examples`
- Structure : `{style}/example-{1-3}.jpg`

Exemple : `style-examples/webtoon-standard/example-1.jpg`

### Configuration Supabase Storage

1. Créer un bucket `style-examples` (public)
2. Uploader les images dans les dossiers correspondants
3. Les URLs sont générées automatiquement via `supabase.storage.from('style-examples').getPublicUrl()`

## ✅ Vérification

Pour vérifier que le style est bien appliqué :

1. **Créer un projet** avec un style spécifique
2. **Créer un personnage** et générer une image avec IA
3. **Vérifier le prompt** dans la console (dev) ou les logs
4. Le prompt doit contenir : `Style graphique: {style_selectionné}`

## 🔄 Flux complet

```
1. Utilisateur sélectionne un style → project.style_graphique
2. Style sauvegardé dans la base de données
3. Lors d'une génération IA :
   - aiContextBuilder charge le projet
   - buildBaseContext() ajoute le style au prompt
   - Le prompt complet est envoyé à l'API IA
   - L'image générée respecte le style
```

## 🎯 Points importants

- ✅ Le style est **toujours** inclus dans les prompts IA
- ✅ Pas besoin de le spécifier manuellement
- ✅ Cohérence garantie entre tous les éléments
- ✅ L'image de référence (`style_reference_image_url`) est aussi utilisée si disponible
