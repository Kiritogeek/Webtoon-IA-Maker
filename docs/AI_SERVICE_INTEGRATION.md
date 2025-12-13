# 🤖 Intégration d'un Service IA pour la Génération d'Images

## 📋 Situation Actuelle

L'API `/api/generate-image` retourne actuellement un placeholder. Il faut intégrer un **vrai service IA** pour générer les images.

## 🎯 Options de Services IA

### 1. OpenAI DALL-E 3 (Recommandé)

**Avantages :**
- Qualité excellente
- Support des images de référence (style reference)
- API stable et documentée

**Prix :** ~$0.04 par image (1024x1024)

**Intégration :**

```typescript
// Dans pages/api/generate-image.ts
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Générer l'image
const response = await openai.images.generate({
  model: "dall-e-3",
  prompt: finalPrompt,
  size: "1024x1792", // Format vertical Webtoon
  quality: "standard",
  n: 1,
})

const imageUrl = response.data[0].url
```

### 2. Stable Diffusion via Replicate

**Avantages :**
- Open source
- Modèles spécialisés Webtoon disponibles
- Prix compétitifs

**Prix :** ~$0.002-0.01 par image

**Intégration :**

```typescript
import Replicate from "replicate"

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

const output = await replicate.run(
  "stability-ai/stable-diffusion:...",
  {
    input: {
      prompt: finalPrompt,
      image: styleReference, // Image de référence
      width: 800,
      height: 1200,
    }
  }
)

const imageUrl = output[0]
```

### 3. Midjourney API (si disponible)

**Avantages :**
- Qualité artistique exceptionnelle
- Style très adapté aux Webtoons

**Prix :** Variable selon le plan

### 4. Stable Diffusion via Hugging Face

**Avantages :**
- Gratuit (avec limitations)
- Modèles spécialisés disponibles

**Intégration :**

```typescript
const response = await fetch(
  "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
  {
    headers: {
      Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
    },
    method: "POST",
    body: JSON.stringify({
      inputs: finalPrompt,
    }),
  }
)
```

## 🔧 Configuration Requise

### Variables d'environnement

Ajoutez dans `.env.local` :

```env
# Option 1: OpenAI
OPENAI_API_KEY=sk-...

# Option 2: Replicate
REPLICATE_API_TOKEN=r8_...

# Option 3: Hugging Face
HUGGINGFACE_API_KEY=hf_...

# Service sélectionné
AI_SERVICE=openai  # ou 'replicate', 'huggingface', 'midjourney'
```

### Installation des packages

```bash
# Pour OpenAI
npm install openai

# Pour Replicate
npm install replicate

# Pour Hugging Face (utilise fetch natif)
# Pas besoin d'installer
```

## 📝 Exemple d'Intégration Complète

Voir `pages/api/generate-image.ts` pour l'implémentation complète avec support de plusieurs services.

## 🧪 Test

1. Configurer la clé API dans `.env.local`
2. Créer un projet avec un template sélectionné
3. Créer un personnage
4. Cliquer sur "🎨 IA" pour générer le visage
5. Vérifier que l'image est générée avec le bon style

## ⚠️ Important

- **Coûts** : Les services IA sont payants, surveillez votre usage
- **Rate Limits** : Respectez les limites de l'API
- **Cache** : Considérez mettre en cache les images générées
- **Fallback** : Gardez un fallback si l'API échoue
