# 🚀 Guide Rapide : Activer la Génération IA

## ✅ État Actuel

Le site fonctionne **sans clé API** pour le moment. Les boutons "🎨 IA" affichent un message clair indiquant que le service n'est pas configuré.

## 🔧 Quand vous serez prêt à activer l'IA

### Étape 1 : Choisir un service

**Recommandation : OpenAI DALL-E 3**
- ✅ Qualité excellente
- ✅ Support des images de référence (style)
- ✅ API stable

**Alternative : Replicate (Stable Diffusion)**
- ✅ Moins cher
- ✅ Modèles spécialisés disponibles

### Étape 2 : Obtenir une clé API

#### Pour OpenAI :
1. Aller sur https://platform.openai.com
2. Créer un compte ou se connecter
3. Aller dans **API Keys** : https://platform.openai.com/api-keys
4. Cliquer sur **"Create new secret key"**
5. Copier la clé (commence par `sk-...`)

#### Pour Replicate :
1. Aller sur https://replicate.com
2. Créer un compte ou se connecter
3. Aller dans **Account** → **API Tokens** : https://replicate.com/account/api-tokens
4. Cliquer sur **"Create token"**
5. Copier le token (commence par `r8_...`)

### Étape 3 : Configurer dans `.env.local`

Ouvrir le fichier `.env.local` à la racine du projet et ajouter :

```env
# Pour OpenAI DALL-E 3
OPENAI_API_KEY=sk-votre-cle-ici
AI_SERVICE=openai

# OU pour Replicate
# REPLICATE_API_TOKEN=r8-votre-token-ici
# AI_SERVICE=replicate
```

### Étape 4 : Installer le package (si nécessaire)

```bash
# Pour OpenAI
npm install openai

# Pour Replicate
npm install replicate
```

### Étape 5 : Redémarrer le serveur

```bash
npm run dev
```

## ✅ Test

1. Créer un projet avec un template sélectionné
2. Créer un personnage
3. Cliquer sur "🎨 IA" pour le visage
4. L'image devrait être générée avec le style du template !

## 💰 Coûts

- **OpenAI DALL-E 3** : ~$0.04 par image (1024x1792)
- **Replicate** : ~$0.002-0.01 par image

## 📝 Notes

- Les images générées respectent automatiquement le style du template sélectionné
- Le contexte complet du projet est inclus dans chaque génération
- Les images sont générées au format Webtoon vertical (800x1200px ou 1024x1792px)

## 🆘 Problèmes ?

Voir `docs/AI_SERVICE_INTEGRATION.md` pour plus de détails.
