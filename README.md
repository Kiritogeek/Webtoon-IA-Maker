# 🎨 Webtoon AI Maker

Application web de création de Webtoon assistée par IA.

## 🚀 Démarrage rapide

### 1. Installation des dépendances

```bash
npm install
```

### 2. Configuration Supabase (OBLIGATOIRE)

⚠️ **L'application nécessite Supabase pour fonctionner.**

1. Créez un fichier `.env.local` à la racine du projet
2. Ajoutez vos clés Supabase :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_ici
```

📖 **Guide complet** : Voir [docs/SUPABASE_SETUP.md](./docs/SUPABASE_SETUP.md)

### 2.5. Configuration IA (OPTIONNEL mais recommandé)

Pour activer la génération d'images par IA, ajoutez dans `.env.local` :

```env
# Service IA à utiliser (openai, replicate, huggingface, grok)
AI_SERVICE=openai

# Option 1: OpenAI DALL-E 3 (Recommandé)
OPENAI_API_KEY=sk-votre_cle_openai_ici

# Option 2: Replicate
REPLICATE_API_TOKEN=r8_votre_token_replicate_ici

# Option 3: Hugging Face
HUGGINGFACE_API_KEY=hf_votre_cle_huggingface_ici

# Option 4: Grok (xAI) - Améliore les prompts avant génération
# Note: Nécessite aussi OPENAI_API_KEY ou REPLICATE_API_TOKEN
GROK_API_KEY=xai-votre_cle_grok_ici
```

📖 **Guide complet** : Voir [docs/AI_API_SETUP.md](./docs/AI_API_SETUP.md)

⚠️ **Important** : Redémarrez le serveur après avoir ajouté les clés API IA.

### 3. Configuration de la base de données

Exécutez les migrations SQL dans Supabase (SQL Editor) :
- `database/characters_type_migration.sql`
- `database/characters_migration.sql`
- `database/projects_background_migration.sql`
- `database/projects_identity_visual_migration.sql`
- `database/project_visual_references_migration.sql`
- `database/chapters_migration.sql`
- `database/places_migration.sql`
- `database/scenario_migration.sql`
- `database/objectives_migration.sql`

### 4. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## ⚠️ Erreur CORS ?

Si vous voyez une erreur CORS avec `https://placeholder.supabase.co`, cela signifie que Supabase n'est pas configuré.

**Solution** : Créez le fichier `.env.local` avec vos clés Supabase (voir étape 2).

## 📚 Documentation

- **[Guide complet des fonctionnalités](./docs/FONCTIONNALITES.md)** ⭐ - Toutes les fonctionnalités disponibles
- [Configuration Supabase](./docs/SUPABASE_SETUP.md) - Guide complet de configuration
- [Intégration IA](./docs/QUICK_START_AI.md) - Activer la génération d'images IA
- [Vue d'ensemble du système](./docs/SYSTEM_OVERVIEW.md) - Architecture et structure

## 🛠️ Technologies

- **Next.js 14** - Framework React
- **Supabase** - Backend et authentification
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styles
- **Konva** - Édition de canvas

## 📝 Scripts disponibles

- `npm run dev` - Serveur de développement
- `npm run build` - Build de production
- `npm run start` - Serveur de production
- `npm run lint` - Vérification du code

## 🔒 Sécurité

⚠️ Ne partagez jamais votre fichier `.env.local` ! Il contient des clés secrètes.

