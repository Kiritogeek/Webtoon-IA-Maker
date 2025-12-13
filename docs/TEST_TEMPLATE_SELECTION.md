# 🧪 Guide de Test - Sélection de Template et Cohérence Graphique

## 📋 Objectif

Tester que la sélection d'un template lors de la création du projet garantit la cohérence graphique de tous les éléments générés par l'IA.

## ✅ Étapes de Test

### 1. Créer un projet avec sélection de template

1. Aller sur `/project/new`
2. Remplir les étapes 1-3 (nom, genre, ambiance)
3. **Étape 4 - Style graphique** :
   - Sélectionner un style (ex: "Webtoon standard")
   - **IMPORTANT** : Cliquer sur un des 3 templates affichés
   - Vérifier que le template sélectionné a :
     - Une bordure colorée (primary)
     - Un checkmark ✓
     - Un message "Template sélectionné"
4. Continuer et créer le projet

### 2. Vérifier que le template est sauvegardé

1. Aller sur la page du projet créé
2. Vérifier dans la console du navigateur (F12) :
   ```javascript
   // Le projet doit avoir style_reference_image_url avec l'URL du template
   ```

### 3. Créer un personnage avec génération IA

1. Aller dans **Personnages** → Créer un nouveau personnage
2. Remplir :
   - Nom : "Test Personnage"
   - Description : "Un personnage de test"
3. Dans la section **🎨 Identité visuelle** :
   - **Visage** : Cliquer sur le bouton "🎨 IA"
   - Entrer un prompt : "Visage souriant, cheveux noirs"
4. Vérifier que l'image générée :
   - Respecte le style du template sélectionné
   - A la même esthétique, couleurs, traits

### 4. Vérifier le prompt envoyé à l'IA

Dans la console du navigateur (F12 → Network), vérifier la requête vers `/api/generate-image` :

```json
{
  "prompt": "...",
  "styleReference": "https://...style-examples/webtoon-standard/exemple-1.jpg",
  "projectId": "...",
  "characterId": "...",
  "imageType": "character"
}
```

Le prompt doit contenir :
- `Référence visuelle ABSOLUE: [URL du template]`
- `Cohérence visuelle OBLIGATOIRE: Tous les éléments générés doivent être PARFAITEMENT cohérents avec cette image de référence`
- `Style graphique: [style sélectionné]`

## 🔍 Points de Vérification

### ✅ Sélection de template
- [ ] Les 3 templates s'affichent correctement
- [ ] Le clic sur un template le sélectionne (bordure + checkmark)
- [ ] Le message "Template sélectionné" apparaît
- [ ] Impossible de passer à l'étape suivante sans sélectionner un template

### ✅ Sauvegarde
- [ ] `project.style_reference_image_url` contient l'URL du template sélectionné
- [ ] L'URL est correcte (accessible)

### ✅ Génération IA
- [ ] Le prompt contient la référence visuelle
- [ ] L'image générée respecte le style du template
- [ ] Tous les éléments (personnages, lieux, assets) utilisent le même style

## 🐛 Dépannage

### Les templates ne s'affichent pas
- Vérifier que le bucket `style-references` existe dans Supabase Storage
- Vérifier la structure : `style-references/style-examples/{style}/exemple-{1-3}.{jpg|webp}`
- Vérifier que le bucket est public

### Le template n'est pas sauvegardé
- Vérifier dans la console si `style_reference_image_url` est bien défini
- Vérifier que le clic sur le template met à jour `config.style_reference_image_url`

### L'IA ne respecte pas le style
- Vérifier dans les logs que `styleReference` est bien envoyé à l'API
- Vérifier que le prompt contient bien la référence visuelle
- Vérifier que votre service IA supporte les images de référence

## 📝 Exemple de Test Complet

1. **Créer projet** :
   - Nom : "Test Webtoon"
   - Genre : Fantasy
   - Ambiance : Sombre
   - Style : Webtoon standard
   - **Template** : Sélectionner "exemple-1.jpg"

2. **Créer personnage** :
   - Nom : "Héros"
   - Description : "Le héros principal"
   - Visage : Générer avec IA "Visage déterminé, yeux bleus"
   - **Résultat attendu** : Image avec le style du template "exemple-1.jpg"

3. **Vérifier la cohérence** :
   - Créer un autre personnage
   - Générer avec IA
   - **Résultat attendu** : Même style que le premier personnage

## 🎯 Résultat Attendu

Tous les éléments générés par l'IA doivent avoir :
- ✅ Le même style graphique que le template sélectionné
- ✅ Les mêmes couleurs
- ✅ Les mêmes traits/proportions
- ✅ La même ambiance visuelle
