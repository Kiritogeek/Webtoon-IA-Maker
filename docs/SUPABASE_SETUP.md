# 🔧 Configuration Supabase

## Problème : Erreur CORS

Si vous voyez l'erreur :
```
Blocage d'une requête multiorigine (Cross-Origin Request) : la politique « Same Origin » ne permet pas de consulter la ressource distante située sur https://placeholder.supabase.co
```

Cela signifie que Supabase n'est pas configuré dans votre projet.

## Solution : Configurer Supabase

### Étape 1 : Créer un projet Supabase

1. Allez sur [https://supabase.com](https://supabase.com)
2. Créez un compte ou connectez-vous
3. Cliquez sur **"New Project"**
4. Remplissez les informations :
   - **Name** : Nom de votre projet
   - **Database Password** : Choisissez un mot de passe fort
   - **Region** : Choisissez la région la plus proche
5. Cliquez sur **"Create new project"**
6. Attendez que le projet soit créé (2-3 minutes)

### Étape 2 : Récupérer vos clés API

1. Dans votre projet Supabase, allez dans **Settings** (⚙️) → **API**
2. Vous verrez deux informations importantes :
   - **Project URL** : `https://xxxxx.supabase.co`
   - **anon public** key : Une longue chaîne de caractères

### Étape 3 : Créer le fichier `.env.local`

1. À la racine du projet `Webtoon-IA-Maker`, créez un fichier nommé `.env.local`
2. Ajoutez le contenu suivant en remplaçant les valeurs :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_ici
```

**Exemple :**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODU2Nzg5MCwiZXhwIjoxOTU0MTQzODkwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Étape 4 : Configurer la base de données

1. Dans Supabase, allez dans **SQL Editor**
2. Exécutez les scripts de migration dans l'ordre :
   - `database/characters_type_migration.sql`
   - `database/characters_migration.sql`
   - `database/projects_background_migration.sql`
   - `database/projects_identity_visual_migration.sql`
   - `database/project_visual_references_migration.sql`
   - `database/chapters_migration.sql`
   - `database/places_migration.sql`
   - `database/scenario_migration.sql`
   - `database/objectives_migration.sql`

### Étape 5 : Redémarrer le serveur

1. Arrêtez le serveur de développement (Ctrl+C)
2. Redémarrez-le :
```bash
npm run dev
```

### Étape 6 : Vérifier la configuration

1. Ouvrez la console du navigateur (F12)
2. Vous ne devriez plus voir l'avertissement "⚠️ Supabase non configuré"
3. Essayez de vous connecter ou de vous inscrire

## 🔒 Sécurité

⚠️ **IMPORTANT** : Ne partagez jamais votre fichier `.env.local` ! Il contient des clés secrètes.

- Le fichier `.env.local` est déjà dans `.gitignore` (il ne sera pas commité)
- Ne partagez jamais vos clés API publiquement
- Si vous avez accidentellement commité vos clés, régénérez-les dans Supabase

## 🆘 Dépannage

### L'erreur CORS persiste

1. Vérifiez que le fichier `.env.local` est bien à la racine de `Webtoon-IA-Maker`
2. Vérifiez que les variables commencent par `NEXT_PUBLIC_`
3. Vérifiez qu'il n'y a pas d'espaces autour du `=`
4. Redémarrez le serveur après avoir modifié `.env.local`

### Erreur "Invalid API key"

1. Vérifiez que vous avez copié la clé **anon public** (pas la clé **service_role**)
2. Vérifiez qu'il n'y a pas d'espaces ou de retours à la ligne dans la clé

### Erreur "Failed to fetch"

1. Vérifiez que votre URL Supabase est correcte
2. Vérifiez que votre projet Supabase est actif (pas en pause)
3. Vérifiez votre connexion internet

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Guide Next.js + Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

