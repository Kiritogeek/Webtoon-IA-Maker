# 📚 Guide Complet des Fonctionnalités — Webtoon AI Maker

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Authentification](#authentification)
3. [Dashboard](#dashboard)
4. [Gestion de Projet](#gestion-de-projet)
5. [Identité Visuelle](#identité-visuelle)
6. [Personnages](#personnages)
7. [Lieux & Décors](#lieux--décors)
8. [Assets](#assets)
9. [Scénario](#scénario)
10. [Objectifs](#objectifs)
11. [Chapitres](#chapitres)
12. [Éditeur de Chapitre](#éditeur-de-chapitre)
13. [Paramètres](#paramètres)
14. [Intégration IA](#intégration-ia)

---

## 🎯 Vue d'ensemble

**Webtoon AI Maker** est une application web complète pour créer des webtoons assistés par IA. Elle combine la simplicité de **Canva**, la précision de **Figma** et les spécificités du format **Webtoon vertical**.

### Caractéristiques principales

- ✅ **Création assistée par IA** : Génération d'images cohérentes avec l'identité visuelle
- ✅ **Gestion complète de projet** : Personnages, lieux, scénario, chapitres
- ✅ **Éditeur visuel** : Canvas vertical avec drag & drop
- ✅ **Cohérence visuelle** : Système d'identité visuelle automatique
- ✅ **Multi-projets** : Gestion de plusieurs webtoons simultanément

---

## 🔐 Authentification

### Page : `/auth/login`

**Fonctionnalités :**

- **Connexion** : Email + mot de passe
- **Inscription** : Création de compte avec email et mot de passe
- **Gestion de session** : Connexion automatique persistante
- **Redirection automatique** : Vers le dashboard après connexion

**Interface :**
- Formulaire simple et intuitif
- Messages d'erreur clairs
- Validation en temps réel

---

## 🏠 Dashboard

### Page : `/dashboard`

**Fonctionnalités :**

- **Vue d'ensemble des projets** : Liste de tous vos webtoons
- **Création de projet** : Bouton pour créer un nouveau webtoon
- **Navigation rapide** : Accès direct à chaque projet
- **Profil utilisateur** : Menu utilisateur avec déconnexion
- **Recherche** : Filtrage des projets (si implémenté)

**Affichage :**
- Cartes visuelles pour chaque projet
- Informations clés : nom, description, dernière modification
- Actions rapides : Ouvrir, Modifier, Supprimer

---

## 📁 Gestion de Projet

### Page principale : `/project/[id]`

**Fonctionnalités :**

- **Vue d'ensemble du projet** : Statistiques et informations générales
- **Navigation latérale** : Accès à toutes les sections du projet
- **Sidebar rétractable** : Optimisation de l'espace d'écran
- **Topbar** : Informations du projet et actions rapides

**Sections disponibles :**
1. Dashboard du projet
2. Objectifs
3. Chapitres
4. Personnages
5. Lieux / Décors
6. Scénario
7. Identité Visuelle
8. Assets
9. Paramètres

---

## 🎨 Identité Visuelle

### Page : `/project/[id]/identite-visuelle`

**Objectif :** Définir et maintenir la cohérence graphique de tout le webtoon.

#### Fonctionnalités principales

##### 1. Références visuelles du projet
- **Upload d'images** : Ajout de références visuelles (moodboard)
- **Réorganisation** : Drag & drop pour réordonner les images
- **Minimum requis** : Au moins 1 image de référence
- **Grille visuelle** : Affichage type Canva/Notion

##### 2. Style compris par l'IA
- **Génération automatique** : Résumé textuel du style déduit par l'IA
- **Recalcul** : Bouton pour régénérer le résumé
- **Ajustement manuel** : Modification du prompt de style si nécessaire
- **Affichage** : Résumé clair et lisible

##### 3. Règles visuelles déduites
- **Tags automatiques** : Détection de caractéristiques (semi-réaliste, sombre, dramatique, etc.)
- **Lecture seule** : Affichage des règles déduites
- **Cohérence** : Utilisées pour toutes les générations IA

##### 4. Aperçu de cohérence
- **Génération d'exemples** : Preview IA montrant la compréhension du style
- **3 types d'aperçus** :
  - Visage
  - Décor
  - Panel
- **Validation visuelle** : Vérifier que l'IA a bien compris le style

##### 5. Utilisation dans le projet
- **Application automatique** : L'identité visuelle est utilisée dans :
  - Personnages
  - Lieux & Décors
  - Chapitres
  - Assets
  - Couverture

**Règle absolue :** Tous les éléments générés DOIVENT être cohérents avec l'identité visuelle.

---

## 👤 Personnages

### Page : `/project/[id]/characters`

**Objectif :** Créer et gérer tous les personnages du webtoon.

#### Types de personnages

1. **👤 Personnages** : Héros, protagonistes, personnages principaux
2. **👹 Monstres** : Créatures, ennemis non-humains
3. **⚔️ Ennemis** : Antagonistes humains

#### Fonctionnalités

##### Création de personnage
- **Nom** : Obligatoire
- **Description** : Optionnelle, histoire et personnalité
- **Type** : Personnage / Monstre / Ennemi
- **Image** : Upload d'image ou génération IA
- **Identité visuelle détaillée** :
  - Description du visage
  - Description du corps
  - Images de référence (visage, corps)
  - Traits de personnalité
  - Histoire du personnage

##### Gestion
- **Liste filtrée** : Par type de personnage
- **Cartes visuelles** : Preview avec image
- **Modification** : Édition complète
- **Suppression** : Avec confirmation

##### Utilisation
- **Drag & drop** : Dans l'éditeur de chapitre
- **Réutilisation** : Dans plusieurs chapitres
- **Cohérence** : Style respecté automatiquement

---

## 🌍 Lieux & Décors

### Page : `/project/[id]/places`

**Objectif :** Créer et gérer les décors utilisés comme fonds de chapitre.

#### Fonctionnalités

##### Création de lieu
- **Nom** : Obligatoire
- **Description** : Optionnelle
- **Ambiance** : Prédéfinie ou personnalisée
  - Prédéfinies : Serein, Dramatique, Mystérieux, Épique, etc.
  - Personnalisée : Texte libre
- **Image** : Upload ou génération IA
- **Variations** : Jour, nuit, pluie, etc. (JSON)

##### Gestion
- **Liste complète** : Tous les lieux du projet
- **Cartes visuelles** : Preview avec ambiance
- **Modification** : Édition complète
- **Suppression** : Avec confirmation

##### Utilisation
- **Fond de chapitre** : Utilisé comme arrière-plan
- **Réutilisation** : Dans plusieurs chapitres
- **Cohérence** : Style respecté automatiquement

---

## 🎨 Assets

### Page : `/project/[id]/assets`

**Objectif :** Créer et gérer des ressources visuelles secondaires réutilisables.

#### Types d'assets

1. **🗡️ Objets** : Armes, outils, accessoires
2. **✨ Effets visuels** : Feu, magie, explosions, aura
3. **🎭 Symboles / UI** : Icônes, signes, glyphes
4. **🧩 Éléments d'environnement** : Porte, table, rocher, arbre
5. **💬 Éléments narratifs** : Bulles, onomatopées stylisées
6. **🔁 Custom** : Défini librement par l'utilisateur

#### Fonctionnalités

##### Création d'asset (4 étapes)

**Étape 1 — Type d'asset**
- Choix parmi 6 types prédéfinis
- Description de chaque type
- Option "Custom" pour personnalisation

**Étape 2 — Description sémantique**
- **Nom** : Obligatoire
- **Description** : Textuelle libre (ce que c'est, à quoi ça sert)
- ⚠️ **Aucun réglage technique** demandé (pas de palette, style, paramètres IA)

**Étape 3 — Contexte optionnel**
- **Usage narratif** : Combat, magie, décor, émotion, narration
- **Émotion / Intensité** : Léger, violent, dramatique, épique

**Étape 4 — Génération IA**
- Génération automatique avec :
  - Références visuelles du projet
  - Résumé de style compris par l'IA
  - Type d'asset
  - Description utilisateur
- **Format** : PNG avec transparence
- **Cohérence** : Style strictement respecté

##### Gestion
- **Grille type Canva/Notion** : Cartes visuelles cliquables
- **Filtrage** :
  - Par type d'asset
  - Par usage (combat, magie, décor, etc.)
- **Carte Asset** :
  - Image preview
  - Nom de l'asset
  - Type (icône + label)
  - Statut IA (généré / modifié)
- **Actions** :
  - 👁️ Aperçu
  - 🗑️ Supprimer
  - ➕ Utiliser dans un chapitre

##### Utilisation
- **Palette latérale** : Dans l'éditeur de chapitre
- **Drag & drop** : Dans un panel existant
- **Manipulation** :
  - Redimensionner
  - Faire pivoter
  - Ajuster l'opacité
  - Dupliquer
- **Non-intrusif** : Ne modifie jamais le layout du chapitre

---

## 📖 Scénario

### Page : `/project/[id]/scenario`

**Objectif :** Structurer la trame narrative globale du webtoon.

#### Fonctionnalités

##### Trame globale
- **Texte libre** : Description complète de l'histoire
- **Édition riche** : Zone de texte avec formatage
- **Sauvegarde automatique** : Changements enregistrés

##### Arcs narratifs
- **Création d'arcs** : Structure narrative modulaire
- **Champs par arc** :
  - Titre
  - Description
  - Chapitres associés (IDs)
- **Visualisation** : Liste des arcs avec chapitres

##### Utilisation
- **Référence pour l'IA** : Contexte narratif pour générations
- **Planification** : Structure globale du webtoon
- **Cohérence** : Maintien de la continuité narrative

---

## 🎯 Objectifs

### Page : `/project/[id]/objectives`

**Objectif :** Définir le cadre stratégique pour l'utilisateur ET l'IA.

#### Fonctionnalités

##### Objectifs globaux
- **Nombre total de chapitres** : Ex. 5 chapitres
- **Durée totale de lecture cible** : Ex. 25-30 minutes
- **Niveau de complexité** : Simple / Moyen / Dense
- **Public visé** : Grand public / Ados / Mature

##### Objectifs par chapitre
- **Titre** : Optionnel
- **Temps de lecture cible** : Ex. 3-5 min
- **Type narratif** : Action / Dialogue / Climax / Introduction / etc.
- **Densité** : Visuelle / Textuelle / Mixte

##### Utilisation par l'IA
- **Proposition de panels** : Nombre suggéré selon objectifs
- **Découpage** : Suggestions de structure
- **Validation** : Évite les chapitres trop courts/longs
- **Respect des contraintes** : Toutes les générations respectent les objectifs

**Philosophie :** "Je définis ce que je veux produire, le système m'aide à y arriver sans dépasser le cadre."

---

## 📚 Chapitres

### Page : `/project/[id]/chapters`

**Objectif :** Gérer tous les chapitres du webtoon.

#### Fonctionnalités

##### Création de chapitre
- **Titre** : Obligatoire
- **Description** : Optionnelle
- **Ordre** : Numérotation automatique
- **Couverture** : Génération IA ou upload

##### Liste des chapitres
- **Affichage en grille** : Cartes visuelles
- **Informations** :
  - Numéro d'ordre
  - Titre
  - Description
  - Date de création
- **Actions** :
  - ✏️ Modifier
  - 🗑️ Supprimer
  - 📖 Ouvrir l'éditeur

##### Navigation
- **Ordre chronologique** : Affichage par ordre
- **Accès rapide** : Clic pour ouvrir l'éditeur
- **Statut** : Indicateur de progression

---

## ✏️ Éditeur de Chapitre

### Page : `/project/[id]/chapter/[chapterId]`

**Objectif :** Éditer visuellement un chapitre avec canvas vertical.

#### Structure d'un chapitre Webtoon

Chaque chapitre commence **obligatoirement** par :
- **Image de couverture** : Première planche
- **Nom du Webtoon** : Affiché automatiquement
- **Numéro / Titre de chapitre** : Optionnel

#### Fonctionnalités principales

##### Canvas vertical
- **Format Webtoon** : 800px de largeur, scroll vertical
- **Panels successifs** : Structure en panels
- **Transitions** : Entre les panels
- **Zoom** : Ajustable pour précision
- **Scroll fluide** : Navigation naturelle

##### Outils disponibles

**Sidebar gauche — Outils**
- **Sélection** : Sélectionner et déplacer des éléments
- **Déplacement** : Repositionner les éléments
- **Texte** : Ajouter du texte narratif
- **Dialogue** : Créer des bulles de dialogue
- **Effets visuels** : Ajouter des effets

**Personnages**
- **Liste** : Tous les personnages du projet
- **Drag & drop** : Sur le canvas
- **Création automatique** : Drop = création d'un panel avec le personnage
- **Miniatures** : Preview visuelle

**Lieux**
- **Liste** : Tous les lieux/décors
- **Drag & drop** : Sur le canvas
- **Fond de panel** : Drop = fond de panel
- **Miniatures** : Preview visuelle

**Assets**
- **Palette latérale** : Tous les assets disponibles
- **Drag & drop** : Dans un panel existant
- **Manipulation** :
  - Redimensionner
  - Faire pivoter
  - Ajuster l'opacité
  - Dupliquer
- **Non-intrusif** : Ne modifie pas le layout

**Transitions**
Types disponibles :
- **Espacement vide** : Silence visuel
- **Dégradé noir** : Transition sombre
- **Flou progressif** : Transition douce
- **Splash lumineux** : Transition lumineuse
- **Cut sec** : Transition brutale
- **Transition action** : Lignes, impact

Chaque transition :
- Bloc draggable
- Hauteur variable
- Se place **ENTRE deux panels**

##### Édition de panel

**Création de panel**
- **Bouton "Créer une planche"** : Ajoute un nouveau panel
- **Première planche** : Automatiquement couverture
- **Titre par défaut** : "Couverture" ou "Planche N"

**Contenu d'un panel**
- **Personnages** : Drag & drop depuis la sidebar
- **Fond** : Lieu/décor ou couleur
- **Assets** : Objets, effets, symboles
- **Textes** : Narratif ou dialogues
- **Rôle narratif** : Action / Dialogue / Pause / Climax / Introduction
- **Densité visuelle** : Faible / Moyenne / Élevée

**Manipulation**
- **Déplacement** : Drag & drop vertical
- **Redimensionnement** : Ajuster la hauteur
- **Suppression** : Avec confirmation
- **Duplication** : Copier un panel

##### Génération IA contextuelle

**Sur un élément**
Quand vous cliquez sur :
- Un personnage
- Un panel
- Une transition

👉 **Une bulle IA contextuelle apparaît** avec suggestions :
- "Générer une variante"
- "Améliorer le style"
- "Ajouter un effet"
- "Créer une transition"

**Sur un panel vide**
- **Génération complète** : Personnage + Fond + Assets
- **Respect des objectifs** : Temps de lecture, type narratif
- **Cohérence visuelle** : Style automatique

##### Sauvegarde
- **Automatique** : Changements enregistrés en temps réel
- **Canvas data** : Structure complète sauvegardée
- **Versioning** : Historique des modifications (si implémenté)

---

## ⚙️ Paramètres

### Page : `/project/[id]/parametres`

**Objectif :** Configurer les paramètres du projet.

#### Fonctionnalités

##### Configuration de base
- **Nom du projet** : Modifiable
- **Description** : Texte libre
- **Genre** : Prédéfini ou personnalisé
- **Ambiance** : Prédéfinie ou personnalisée
- **Style graphique** : Choix ou personnalisation
- **Format** : Vertical / Horizontal

##### Background
- **Type** : Preset ou personnalisé
- **Presets disponibles** :
  - Indigo-Violet
  - Rose-Violet
  - Dark Creative
  - Colorful Gradient
  - Dark Indigo
- **Image personnalisée** : Upload d'image

##### Paramètres avancés
- **Univers principal** : Contexte narratif
- **Nombre de personnages** : Estimation
- **Style prompt** : Personnalisation avancée

##### Actions
- **Sauvegarder** : Enregistrer les modifications
- **Supprimer le projet** : Avec confirmation
- **Exporter** : (Si implémenté)

---

## 🤖 Intégration IA

### Génération d'images

#### Services supportés

1. **OpenAI DALL-E 3**
   - Format : 1024x1792 (vertical Webtoon)
   - Qualité : Standard
   - Limite : 1000 caractères de prompt

2. **Replicate (Stable Diffusion)**
   - Modèles disponibles : SDXL, etc.
   - Personnalisation avancée
   - Format adaptatif

3. **Hugging Face** (si configuré)
   - Modèles open-source
   - Personnalisation complète

#### Contexte automatique

**Tous les prompts IA incluent automatiquement :**
- ✅ Style de la couverture
- ✅ Identité visuelle du projet
- ✅ Contexte narratif
- ✅ Format Webtoon vertical
- ✅ Continuité inter-chapitres
- ✅ Références visuelles
- ✅ Résumé de style IA
- ✅ Objectifs du projet

#### APIs disponibles

##### `/api/generate-image`
Génération d'image avec contexte complet.

**Paramètres :**
- `prompt` : Description textuelle
- `projectId` : Contexte du projet
- `imageType` : character / panel / transition / cover / asset
- `format` : webtoon_vertical / png / etc.

**Retour :**
- `imageUrl` : URL de l'image générée
- `warnings` : Avertissements éventuels

##### `/api/generate-asset`
Génération d'asset cohérent.

**Paramètres :**
- `projectId` : ID du projet
- `name` : Nom de l'asset
- `description` : Description
- `type` : object / effect / symbol / environment / narrative / custom
- `usageContext` : combat / magie / décor / émotion (optionnel)
- `emotionIntensity` : léger / violent / dramatique / épique (optionnel)

**Retour :**
- `asset` : Objet asset créé avec image_url

##### `/api/generate-style-summary`
Génération du résumé de style à partir des références.

**Paramètres :**
- `projectId` : ID du projet
- `imageUrls` : URLs des références visuelles

**Retour :**
- `summary` : Résumé textuel du style

##### `/api/generate-coherence-preview`
Génération d'aperçus de cohérence.

**Paramètres :**
- `projectId` : ID du projet
- `imageUrls` : URLs des références visuelles

**Retour :**
- `preview` : Objet avec face, place, panel

---

## 🎨 Interface Utilisateur

### Design System

#### Couleurs
- **Primary** : Dégradé indigo-violet
- **Secondary** : Rose-violet
- **Accent** : Couleurs vives pour actions
- **Dark** : Fond sombre créatif
- **White/Transparent** : Textes et bordures

#### Typographie
- **Titres** : Gradient text avec effet
- **Corps** : Texte blanc avec opacité variable
- **Labels** : Texte blanc/70
- **Descriptions** : Texte blanc/60

#### Composants réutilisables

**ProjectSidebar**
- Navigation latérale
- Rétractable (desktop)
- Overlay mobile
- Icônes personnalisées

**ProjectTopbar**
- Informations du projet
- Actions rapides
- Toggle sidebar

**Modals**
- Fond sombre avec blur
- Bordures arrondies
- Animations fluides

**Cartes**
- Fond sombre avec transparence
- Bordures subtiles
- Hover effects
- Preview images

---

## 🔄 Flux de travail recommandé

### 1. Création de projet
1. Créer un nouveau projet
2. Configurer les paramètres de base
3. Définir l'identité visuelle (références)

### 2. Structure narrative
1. Définir les objectifs globaux
2. Créer le scénario (trame + arcs)
3. Planifier les chapitres

### 3. Éléments réutilisables
1. Créer les personnages principaux
2. Créer les lieux importants
3. Créer les assets récurrents

### 4. Création de chapitres
1. Créer un chapitre
2. Éditer avec l'éditeur visuel
3. Ajouter panels, transitions, dialogues
4. Générer des éléments avec l'IA si nécessaire

### 5. Finalisation
1. Vérifier la cohérence visuelle
2. Valider les objectifs
3. Exporter ou publier

---

## 📊 Structure des données

### Tables principales

- **projects** : Projets webtoon
- **characters** : Personnages
- **places** : Lieux et décors
- **assets** : Ressources visuelles secondaires
- **chapters** : Chapitres
- **scenes** : Scènes (panels) dans les chapitres
- **scenario** : Scénario global
- **objectives** : Objectifs du projet
- **project_visual_references** : Références visuelles
- **asset_usage** : Suivi d'utilisation des assets

---

## 🚀 Fonctionnalités avancées

### Cohérence visuelle automatique
- Toutes les générations IA respectent l'identité visuelle
- Style déduit automatiquement des références
- Ajustement manuel possible

### Drag & Drop intelligent
- Zones de drop visuelles
- Snap automatique entre panels
- Prévisualisation en temps réel

### Génération contextuelle
- IA adaptée à chaque élément
- Suggestions intelligentes
- Respect des objectifs

### Multi-projets
- Gestion de plusieurs webtoons
- Isolation des données
- Navigation fluide

---

## 📝 Notes importantes

### Règles de cohérence
- ⚠️ **Tous les éléments générés DOIVENT être cohérents avec l'identité visuelle**
- ⚠️ **Les objectifs sont OBLIGATOIRES pour l'IA**
- ⚠️ **Un chapitre commence TOUJOURS par une couverture**

### Bonnes pratiques
- ✅ Ajouter au moins 3-5 références visuelles
- ✅ Définir les objectifs avant de créer des chapitres
- ✅ Créer les personnages principaux en premier
- ✅ Utiliser les assets pour enrichir les panels

### Limitations
- Format Webtoon vertical uniquement (800px largeur)
- Génération IA nécessite une clé API configurée
- Certaines fonctionnalités nécessitent Supabase configuré

---

## 🔗 Ressources

- **Documentation Supabase** : [docs/SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- **Vue d'ensemble système** : [docs/SYSTEM_OVERVIEW.md](./SYSTEM_OVERVIEW.md)
- **Intégration IA** : [docs/QUICK_START_AI.md](./QUICK_START_AI.md)
- **Configuration** : [CONFIGURATION_ENV.md](../CONFIGURATION_ENV.md)

---

## 📞 Support

Pour toute question ou problème :
1. Vérifier la documentation
2. Consulter les logs de la console
3. Vérifier la configuration Supabase
4. Vérifier les clés API IA

---

**Dernière mise à jour** : Version actuelle avec support complet des Assets

