# PRODUIT — WEBTOON AI MAKER

## 🎬 CONTEXTE GÉNÉRAL

Tu travailles sur une application web de création de Webtoon assistée par IA avancée, pensée comme un mélange entre **Canva / Notion / Figma**, mais spécifiquement adaptée aux règles implicites du format Webtoon.

L'objectif du produit est de permettre à n'importe qui (même sans savoir dessiner) de créer un Webtoon cohérent visuellement et narrativement, grâce à :

- une structuration forte du projet
- une IA contrainte intelligemment
- une édition visuelle fluide (drag & drop, canvas vertical)

## 🎬 CONTEXTE PRODUIT

Tu travailles sur un éditeur Webtoon avancé, destiné à des créateurs non-dessinateurs, assistés par IA.

L'éditeur doit se comporter comme un mélange de :

- **Canva** (drag & drop, simplicité)
- **Figma** (édition fine, sélection d'éléments)
- **éditeur Webtoon natif** (rythme, transitions, narration verticale)

L'objectif est que l'utilisateur compose visuellement une histoire, pas juste des images.

## 🧠 PRINCIPE FONDAMENTAL À RESPECTER

**Un Webtoon n'est PAS une image continue.**

C'est :

- une succession de **panels**
- séparés par des **transitions visuelles**
- organisés pour créer du **rythme de lecture**

👉 **L'éditeur doit donc être orienté PANELS + TRANSITIONS, pas juste "dessin libre".**

## 🧠 COMPRÉHENSION FONDAMENTALE DU WEBTOON (RÈGLES PRODUIT)

Tu dois impérativement intégrer ces règles comme fondation du produit :

### 1. Lecture verticale

- Format scroll vertical
- Découpage en panels successifs
- Espaces respirations (blancs) importants

### 2. Structure d'un chapitre Webtoon

Chaque chapitre commence **obligatoirement** par :

- une image de couverture
- le nom du Webtoon
- éventuellement un numéro / titre de chapitre

### 3. Cohérence visuelle (CRUCIALE)

Le premier écran définit l'identité du Webtoon

Tous les éléments générés doivent être cohérents entre eux

👉 **Le produit doit automatiser et garantir cette cohérence.**

## 🖼️ IMAGE DE COUVERTURE — RÈGLE PRODUIT ABSOLUE

### 📌 Définition

Il existe **UNE** image de couverture de projet, qui sert :

- de cover du Webtoon
- d'image d'introduction de chaque chapitre
- de référence stylistique IA globale

### Composition

La couverture contient :

- une image principale (fond / ambiance)
- le nom du projet intégré dans l'image

**Options :**

- sous-titre
- numéro de saison

### Édition

La couverture est :

- un mini-canvas IA
- texte éditable (nom du projet)
- police, position, couleurs, effets
- possibilité de générer plusieurs variantes IA

### Lien avec les chapitres

Lorsqu'un chapitre est créé, la première planche = la couverture

- Elle est verrouillée par défaut
- Peut être dupliquée ou stylisée par chapitre

## DASHBOARD — STRUCTURE DÉTAILLÉE

### 🖼️ 1. Bloc — Couverture du Webtoon (CRITIQUE)

**Ce qu'on y trouve :**

- Image de couverture (plein largeur)
- Nom du projet intégré visuellement
- Bouton :
  - "Modifier la couverture"
  - "Générer avec l'IA"

**Actions possibles :**

- Modifier le texte (nom)
- Changer style graphique
- Tester plusieurs variantes
- Sauvegarder comme référence visuelle globale

**🧠 IA**

- Génération de couvertures cohérentes
- Applique le style à tous les chapitres
- Sert de prompt racine

**🔗 Liens**

- Utilisée automatiquement comme première planche de chaque chapitre
- Sert de base aux prompts IA globaux

### 📊 2. Bloc — État du Webtoon

(Identique mais enrichi)

- Personnages (utilisés / non utilisés)
- Lieux (liés à des chapitres)
- Chapitres créés
- Chapitres publiables
- Progression globale

### 📖 3. Bloc — Chapitres (Vue Webtoon)

**Spécifique Webtoon**

Chaque chapitre affiche :

- Miniature = cover + 1er panel
- Numéro
- Titre
- Statut (brouillon / prêt / publié)

**Actions :**

- Ouvrir
- Dupliquer
- Générer avec IA
- Prévisualiser lecture Webtoon

### 🎨 4. Bloc — Identité Visuelle & Moodboard

**Lien direct avec la couverture**

**Contenu :**

- Palette dominante
- Références graphiques
- Images IA ou uploadées
- Tags d'ambiance

👉 **Utilisé automatiquement dans :**

- personnages
- décors
- assets
- chapitres

### 🧠 5. Bloc — Intelligence Narrative (IA)

**Basé sur :**

- scénario
- chapitres existants
- moodboard
- couverture

**Suggestions :**

- découpage de chapitres
- rythme narratif
- cliffhangers
- variations visuelles

### 📝 6. Bloc — Notes & Direction créative

**Notes stratégiques :**

- intention artistique
- message
- public cible
- évolution de l'histoire

👉 **Ces notes alimentent les prompts IA**

## 4️⃣ LIEN ENTRE TOUS LES MENUS (VUE SYSTÈME)

### 🔗 Schéma mental (important pour ton mémoire)

```
Couverture du projet
        ↓
Identité visuelle globale
        ↓
Personnages ←→ Lieux ←→ Assets
        ↓
Scénario
        ↓
Chapitre (assemblage final)
```

### 🔁 DÉTAIL DES LIENS PAR MENU

#### 👤 Personnages

**Dépendent de :**

- Couverture
- Moodboard

**Utilisés dans :**

- Chapitre (drag & drop)

#### 🌍 Lieux & Décors

**Influencés par :**

- Couverture
- Ambiance globale

**Appliqués comme :**

- fond de chapitre

#### 🧰 Assets

- Créés indépendamment
- Stylisés selon l'identité
- Injectés dans chapitres

#### ✍️ Scénario

**Alimente :**

- Chapitres
- Dialogues
- Guide l'IA

#### 📖 Chapitre

**Consomme TOUT :**

- Personnages
- Lieux
- Assets
- Scénario
- Couverture

## IMPACT SUR LES PROMPTS IA (IMPORTANT)

À partir de maintenant, **tout prompt IA doit inclure implicitement** :

- **Le style de la couverture**
- **L'identité visuelle du projet**
- **Le contexte narratif**
- **Le format Webtoon vertical**
- **La continuité inter-chapitres**

👉 **C'est ça qui rend ton outil différent d'un simple générateur d'images.**

## RENOMMAGE & CHANGEMENT DE LOGIQUE

### ❌ Ancien

**État du Webtoon**
→ passif, informatif

### ✅ Nouveau

**Objectifs**
→ actif, structurant, stratégique

👉 **Ce menu définit le cadre dans lequel l'utilisateur ET l'IA doivent évoluer.**

### 🧠 PHILOSOPHIE DU MENU "OBJECTIFS"

**« Je définis ce que je veux produire, le système m'aide à y arriver sans dépasser le cadre. »**

C'est :

- une boussole créative
- un contrat narratif
- une contrainte intelligente (très bien vu pour le jury)

### 🧩 STRUCTURE GLOBALE

**📍 Navigation**

```
Dashboard
Objectifs
Chapitres
Personnages
Lieux / Décors
Scénario
Identité Visuelle
Assets
Paramètres
```

### MENU : OBJECTIFS (/objectifs)

#### 🟢 Rôle

Définir le cadre stratégique dans lequel :

- **l'utilisateur**
- **ET l'IA**

doivent évoluer.

👉 **Toutes les IA, générateurs, suggestions doivent respecter ces objectifs.**

### 🧱 STRUCTURE INTERNE

#### 1️⃣ Objectifs globaux

**Champs configurables :**

- **Nombre total de chapitres**
  - ex : 5 chapitres
- **Durée totale de lecture cible**
  - ex : 25–30 minutes
- **Niveau de complexité**
  - Simple / Moyen / Dense
- **Public visé**
  - Grand public / Ados / Mature

#### 2️⃣ Objectifs par chapitre

⚠️ **Un chapitre n'a PAS une taille fixe**
👉 **Il a un potentiel de temps de lecture**

**Champs :**

- **Titre** (optionnel)
- **Temps de lecture cible**
  - ex : 3–5 min
- **Type narratif**
  - Action / Dialogue / Climax / Introduction / etc.
- **Densité**
  - Visuelle / Textuelle / Mixte

👉 **L'IA s'en sert pour :**

- proposer le nombre de panels
- suggérer le découpage
- éviter les chapitres trop courts ou trop longs

#### 3️⃣ Objectifs de ressources

**Champs configurables :**

- **Nombre max de personnages**
  - ex : 3 principaux, 2 secondaires
- **Nombre de lieux / décors**
  - ex : 4 lieux récurrents
- **Nombre d'assets**
  - ex : 10 (armes, pouvoirs…)

**Affichage :**

- Barres de progression
  - Personnages utilisés / définis
  - Lieux créés / nécessaires
  - Assets générés / prévus

#### 4️⃣ Contraintes créatives

**Règles écrites par l'utilisateur**

**Exemples :**

- "Toujours garder une ambiance sombre"
- "Limiter les changements de lieu par chapitre"
- "Ne jamais introduire un personnage sans scène dédiée"

👉 **Ces règles :**

- sont lisibles par l'IA
- sont respectées par l'IA
- s'appliquent à toutes les générations

#### 5️⃣ Rythme & publication

**Champs :**

- **Rythme de publication**
  - Hebdomadaire / Mensuel
- **Cliffhanger requis ou non**
  - Oui / Non

👉 **Utilisé pour :**

- suggérer fins de chapitres
- structurer le scénario

### 🔗 LIENS AVEC LES AUTRES MENUS

#### 📖 Chapitres

Vérifie si le chapitre :

- respecte le temps cible
- respecte la densité

**Alerte si :**

- trop court
- trop dense

#### 👤 Personnages / 🌍 Lieux / 🧰 Assets

- Limite la création excessive
- Suggère la réutilisation intelligente

#### 🧠 IA

L'IA ne propose **QUE** ce qui rentre dans les objectifs

Peut dire :

- "Ce chapitre dépasse le temps de lecture cible"

### 🧠 UTILISATION IA — EXEMPLE CONCRET

**Contexte IA**

- Webtoon : 5 chapitres
- Chapitre 2 : 4–6 minutes
- Densité : Action
- Lieux autorisés : 2

👉 **L'IA :**

- propose 12–15 panels
- limite les dialogues
- privilégie des poses fortes
- évite d'introduire un nouveau personnage

Et applique la cohérence visuelle définie.

## 🧱 STRUCTURE GLOBALE DE L'ÉDITEUR (À METTRE EN PLACE)

### 1️⃣ Canvas central — Webtoon vertical

- Canvas vertical infini
- Largeur fixe (format Webtoon)
- Scroll vertical naturel
- Chaque élément posé sur le canvas est :
  - soit un **Panel**
  - soit une **Transition**
  - soit un **Texte / Dialogue**
  - soit un **Asset**
- Le canvas doit afficher :
  - des zones de drop intelligentes
  - des séparateurs visuels subtils entre panels

### 2️⃣ Sidebar gauche — OUTILS (logique Webtoon)

Remplacer la logique actuelle par cette structure :

#### 🧰 Outils

- **Sélection**
- **Déplacement**
- **Texte**
- **Dialogue** (bulles)
- **Effets visuels**

👉 **Un seul outil actif à la fois**

#### 👤 Personnages

- Liste des personnages créés
- Miniatures
- Drag & drop sur le canvas
- **Drop = création automatique d'un panel avec le personnage**

#### 🌍 Lieux

- Lieux / décors existants
- Drag & drop
- **Drop = fond de panel**

#### 🧰 Assets

- Objets
- Sorts
- Éléments visuels secondaires
- Drag & drop dans un panel existant

#### 🔀 Transitions (NOUVEAU — CLÉ DU PRODUIT)

Quand l'utilisateur clique sur "Transitions", afficher :

- Espacement vide (silence)
- Dégradé noir
- Flou progressif
- Splash lumineux
- Cut sec
- Transition action (lignes, impact)

👉 **Chaque transition est :**

- un bloc draggable
- avec une hauteur variable
- qui se place **ENTRE deux panels**

### 🧲 DRAG & DROP — RÈGLES DE COMPORTEMENT

Quand je drag un élément :

- Le canvas affiche :
  - des zones "Drop ici"
  - une prévisualisation du rendu
- L'élément snap automatiquement :
  - entre deux panels
  - ou crée un nouveau panel si nécessaire

### 🧠 IA CONTEXTUELLE (PAS UN BOUTON GÉNÉRAL)

**Interaction IA sur un élément**

Quand l'utilisateur clique sur :

- un personnage
- un panel
- une transition

👉 **Une bulle IA contextuelle apparaît :**

Exemples :

- "Faire lever les bras au personnage"
- "Accentuer l'émotion"
- "Rendre la scène plus dramatique"
- "Ajouter un cliffhanger"

**L'IA agit UNIQUEMENT sur l'élément sélectionné.**

### 🎭 PANELS — LOGIQUE INTERNE

Chaque panel possède :

- un fond (lieu)
- 0..n personnages
- 0..n assets
- du texte ou dialogue
- un cadrage implicite

**Clic sur un panel →**

Panneau latéral droit :

- Description du panel
- Rôle narratif (action, dialogue, pause)
- Densité visuelle
- Bouton : "Optimiser avec l'IA"

### 🔁 TRANSITIONS — COMPORTEMENT AVANCÉ

Les transitions :

- n'ont PAS de personnages
- influencent le rythme de lecture
- peuvent être :
  - allongées (pause)
  - réduites (cut rapide)

**L'IA doit comprendre que :**

- plus la transition est haute → plus le temps de lecture augmente

### 🧠 LIEN AVEC LES OBJECTIFS (IMPORTANT)

Avant toute action IA :

- vérifier les objectifs du chapitre
- vérifier le temps de lecture cible

Si l'utilisateur dépasse :

- afficher un warning discret
- proposer une optimisation

### 🧪 UX — MICRO-INTERACTIONS À AJOUTER

- Survol d'un panel → halo léger
- Drag d'un élément → preview live
- Sélection → contour coloré
- Transition sélectionnée → poignée de hauteur

### 🎓 POSITIONNEMENT PRODUIT (À RESPECTER)

**Ce n'est PAS :**
❌ un générateur d'images
❌ un simple canvas

**C'est :**
✅ un éditeur narratif vertical
✅ un chef d'orchestre IA
✅ un outil de mise en scène Webtoon
