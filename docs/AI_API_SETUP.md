# Configuration des Clés API IA

Ce guide explique comment configurer les clés API pour la génération d'images par IA.

## Variables d'environnement requises

Ajoutez ces variables dans votre fichier `.env.local` à la racine du projet :

```env
# Service IA à utiliser (openai, replicate, huggingface, grok)
AI_SERVICE=openai

# Option 1: OpenAI DALL-E 3 (Recommandé)
OPENAI_API_KEY=sk-votre_cle_openai_ici

# Option 2: Replicate (Stable Diffusion)
REPLICATE_API_TOKEN=r8_votre_token_replicate_ici

# Option 3: Hugging Face
HUGGINGFACE_API_KEY=hf_votre_cle_huggingface_ici

# Option 4: Grok (xAI) - Améliore les prompts avant génération
# Note: Grok nécessite aussi un service de génération (OpenAI ou Replicate)
GROK_API_KEY=xai-votre_cle_grok_ici
```

## Services supportés

### 1. Grok (xAI) - Amélioration de prompts (Nouveau)

**Avantages :**
- Améliore automatiquement les prompts avant génération
- Compréhension contextuelle avancée
- Peut être combiné avec OpenAI ou Replicate

**Configuration :**
```env
AI_SERVICE=grok
GROK_API_KEY=xai-...
# Nécessite aussi un service de génération :
OPENAI_API_KEY=sk-...  # OU
REPLICATE_API_TOKEN=r8_...
```

**Installation :**
Aucune installation supplémentaire nécessaire (utilise fetch natif)

**Où obtenir la clé :**
1. Allez sur https://console.x.ai/api-keys
2. Créez un compte ou connectez-vous
3. Créez une nouvelle clé API
4. Copiez-la dans `.env.local`

**Fonctionnement :**
- Grok améliore le prompt utilisateur
- L'image est générée avec OpenAI ou Replicate
- Résultat : prompts plus détaillés et cohérents

### 2. OpenAI DALL-E 3 (Recommandé)

**Avantages :**
- Qualité supérieure
- Format vertical Webtoon natif (1024x1792)
- Cohérence visuelle excellente

**Configuration :**
```env
AI_SERVICE=openai
OPENAI_API_KEY=sk-...
```

**Installation :**
```bash
npm install openai
```

**Où obtenir la clé :**
1. Allez sur https://platform.openai.com/api-keys
2. Créez un compte ou connectez-vous
3. Créez une nouvelle clé API
4. Copiez-la dans `.env.local`

### 3. Replicate (Stable Diffusion)

**Avantages :**
- Gratuit jusqu'à un certain quota
- Modèles personnalisables
- Support img2img

**Configuration :**
```env
AI_SERVICE=replicate
REPLICATE_API_TOKEN=r8_...
```

**Installation :**
```bash
npm install replicate
```

**Où obtenir le token :**
1. Allez sur https://replicate.com/account/api-tokens
2. Créez un compte ou connectez-vous
3. Créez un nouveau token
4. Copiez-le dans `.env.local`

### 4. Hugging Face

**Avantages :**
- Gratuit
- Open source
- Modèles variés

**Configuration :**
```env
AI_SERVICE=huggingface
HUGGINGFACE_API_KEY=hf_...
```

**Où obtenir la clé :**
1. Allez sur https://huggingface.co/settings/tokens
2. Créez un compte ou connectez-vous
3. Créez un nouveau token (type: Read)
4. Copiez-le dans `.env.local`

## Vérification de la configuration

Après avoir ajouté les variables dans `.env.local` :

1. **Redémarrez le serveur de développement** :
   ```bash
   # Arrêtez le serveur (Ctrl+C)
   npm run dev
   ```

2. **Vérifiez les logs** :
   - Si la configuration est correcte, vous verrez : `✅ Service IA configuré: openai`
   - Si la configuration est incorrecte, vous verrez : `⚠️ Aucun service IA configuré`

3. **Testez la génération** :
   - Créez un personnage ou un chapitre
   - Utilisez la génération IA
   - Si tout fonctionne, l'image sera générée
   - Si erreur, vérifiez les logs du serveur

## Dépannage

### Erreur : "Service IA non configuré"

**Causes possibles :**
- Les variables ne sont pas dans `.env.local`
- Le fichier `.env.local` n'est pas à la racine du projet
- Le serveur n'a pas été redémarré après modification

**Solution :**
1. Vérifiez que `.env.local` existe à la racine
2. Vérifiez le format des variables (pas d'espaces, pas de guillemets)
3. Redémarrez le serveur

### Erreur : "Invalid API key"

**Causes possibles :**
- La clé API est incorrecte
- La clé API a expiré
- La clé API n'a pas les bonnes permissions

**Solution :**
1. Vérifiez la clé sur le site du service
2. Régénérez une nouvelle clé si nécessaire
3. Vérifiez les permissions de la clé

### Erreur : "Module not installed"

**Solution :**
Installez le module correspondant :
```bash
# Pour OpenAI
npm install openai

# Pour Replicate
npm install replicate
```

## Sécurité

⚠️ **IMPORTANT :**
- Ne commitez JAMAIS `.env.local` dans Git
- Le fichier `.env.local` est déjà dans `.gitignore`
- Ne partagez jamais vos clés API publiquement
- Régénérez vos clés si elles sont compromises

## Coûts

### OpenAI DALL-E 3
- ~$0.04 par image (1024x1024)
- ~$0.08 par image (1024x1792 - format Webtoon)
- Compte avec crédit gratuit au départ

### Replicate
- Gratuit jusqu'à un certain quota
- Puis payant selon l'utilisation

### Hugging Face
- Gratuit pour la plupart des modèles
- Limites de rate selon le modèle

## Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs du serveur (`npm run dev`)
2. Vérifiez les logs du navigateur (Console F12)
3. Consultez la documentation du service utilisé
4. Vérifiez que votre clé API est valide et active

