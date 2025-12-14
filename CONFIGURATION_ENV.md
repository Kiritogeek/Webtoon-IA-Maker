# 🔧 Configuration de .env.local - Guide pas à pas

## ⚠️ Problème courant

Si vous voyez toujours l'erreur "votre-projet.supabase.co" ou "placeholder", c'est que le fichier `.env.local` contient encore les valeurs placeholder.

## ✅ Solution : Modifier le fichier correctement

### Méthode 1 : Utiliser le script PowerShell (Recommandé)

1. Ouvrez PowerShell dans le dossier `Webtoon-IA-Maker`
2. Exécutez :
```powershell
.\setup-env.ps1
```
3. Entrez vos clés Supabase quand on vous le demande
4. Redémarrez le serveur

### Méthode 2 : Modifier manuellement

1. **Ouvrez le fichier** `.env.local` dans `Webtoon-IA-Maker` (à la racine, pas dans un sous-dossier)

2. **Remplacez TOUT le contenu** par :
```env
NEXT_PUBLIC_SUPABASE_URL=https://VOTRE-VRAIE-URL.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=VOTRE-VRAIE-CLE-ICI
```

   ⚠️ **IMPORTANT** :
   - Remplacez `VOTRE-VRAIE-URL` par votre URL Supabase (ex: `abcdefghijklmnop`)
   - Remplacez `VOTRE-VRAIE-CLE-ICI` par votre clé anon (commence par `eyJ...`)
   - **PAS d'espaces** autour du `=`
   - **PAS de guillemets** autour des valeurs
   - **PAS de ligne vide** au début ou à la fin

3. **Sauvegardez le fichier** (Ctrl+S)

4. **Redémarrez le serveur** :
   - Arrêtez le serveur (Ctrl+C dans le terminal)
   - Relancez : `npm run dev`

### Méthode 3 : Vérifier avec PowerShell

Pour vérifier que votre fichier est correct :

```powershell
cd "C:\Users\PC\Desktop\Webtoon IA Maker\Webtoon-IA-Maker"
Get-Content .env.local
```

Le fichier ne doit **PAS** contenir :
- ❌ `votre-projet`
- ❌ `votre_cle`
- ❌ `placeholder`
- ❌ `your-project`
- ❌ `your_key`

Il doit contenir :
- ✅ Une URL réelle comme `https://xxxxx.supabase.co`
- ✅ Une clé réelle commençant par `eyJ...`

## 🔍 Où trouver vos clés Supabase ?

1. Allez sur [https://supabase.com](https://supabase.com)
2. Connectez-vous et ouvrez votre projet
3. Allez dans **Settings** (⚙️) → **API**
4. Copiez :
   - **Project URL** → pour `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → pour `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## ⚠️ Erreurs courantes

### Le fichier n'est pas au bon endroit
Le fichier `.env.local` doit être **à la racine** de `Webtoon-IA-Maker`, pas dans un sous-dossier.

### Le serveur n'a pas été redémarré
Next.js charge les variables d'environnement **uniquement au démarrage**. Si vous modifiez `.env.local`, vous **DEVEZ** redémarrer le serveur.

### Espaces ou guillemets
```env
# ❌ MAUVAIS
NEXT_PUBLIC_SUPABASE_URL = "https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJ...'

# ✅ BON
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Lignes vides ou commentaires
Évitez les lignes vides au début ou à la fin du fichier.

## 🆘 Dépannage

Si après avoir modifié le fichier et redémarré le serveur, vous voyez toujours l'erreur :

1. Vérifiez que le fichier est bien sauvegardé
2. Vérifiez le contenu avec PowerShell (voir Méthode 3)
3. Vérifiez que vous avez bien redémarré le serveur
4. Vérifiez qu'il n'y a pas d'espaces ou de caractères invisibles

