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

---

## ➕ SPÉCIFICATIONS COMPLÉMENTAIRES

### 1️⃣ MODES UTILISATEUR (IMPORTANT POUR L'UX)

#### 🎚️ Modes d'édition

Le produit doit proposer 2 modes UX, sans changer la structure :

#### 🟢 Mode Standard (par défaut)

Destiné à 90 % des utilisateurs.

**Caractéristiques :**
- Aucune notion technique visible
- IA proactive
- Champs simplifiés
- Pas de paramètres avancés

#### 🔵 Mode Avancé (optionnel)

Pour utilisateurs experts / jury / power users.

**Débloque :**
- Édition fine des prompts (texte libre)
- Réglages avancés de panel
- Override ponctuel des objectifs (avec warning)

👉 **Le mode Avancé ne doit JAMAIS être nécessaire pour créer un Webtoon complet.**

**Implémentation :**
- Toggle dans les paramètres du projet
- Mode persistant par projet
- Interface adaptative selon le mode

---

### 2️⃣ SYSTÈME DE VARIANTES (CLÉ POUR L'IA)

#### 🔁 Principe

**Règle absolue :** Aucune génération IA n'écrase jamais un contenu existant.

Chaque génération crée une variante.

#### Variantes applicables à :
- Couverture
- Panel
- Transition
- Asset
- Personnage (pose / émotion)

#### UX des variantes

**Affichage :**
- Variantes visibles sous forme de thumbnails
- Sélection = activation
- Historique conservé
- Comparaison côte à côte possible

**Actions :**
- Créer une nouvelle variante
- Basculer entre variantes
- Supprimer une variante (avec confirmation)
- Dupliquer une variante

👉 **Zéro frustration, zéro perte.**

---

### 3️⃣ SYSTÈME DE VALIDATION SILENCIEUSE

#### 🧠 Validation automatique (non bloquante)

À chaque action IA, le système vérifie automatiquement :

**Vérifications :**
- Objectifs du projet
- Cohérence visuelle
- Règles Webtoon
- Temps de lecture
- Densité narrative

**Si problème détecté :**

❌ **Pas de blocage**

✅ **Warning discret** (badge, icône, message subtil)

✅ **Suggestion IA** proposée automatiquement

#### Exemples de warnings :

- "Ce chapitre dépasse le temps cible"
- "Trop de personnages introduits"
- "Rythme trop dense pour une scène d'émotion"
- "Cohérence visuelle : écart détecté avec l'identité"
- "Objectif non respecté : densité trop faible"

**Affichage :**
- Badge discret sur l'élément concerné
- Message contextuel dans la sidebar
- Option "Corriger automatiquement" proposée

---

### 4️⃣ DÉFINITION TECHNIQUE DU TEMPS DE LECTURE (OBLIGATOIRE)

#### ⏱️ Temps de lecture estimé

Le système doit calculer automatiquement le temps de lecture à partir de :

**Facteurs :**
- Nombre de panels
- Hauteur des transitions
- Quantité de texte
- Densité visuelle
- Complexité narrative

#### Formule conceptuelle (abstraite, non visible user)

```
Temps lecture =
  Σ (panel_time)
  + Σ (transition_height × facteur_rythme)
  + Σ (texte × facteur_lecture)
  + Σ (densité_visuelle × facteur_complexité)
```

**Calcul par panel :**
- Panel simple : ~2-3 secondes
- Panel avec dialogue : ~5-8 secondes
- Panel action dense : ~3-5 secondes

**Calcul par transition :**
- Transition courte : ~1 seconde
- Transition longue (pause) : ~3-5 secondes

#### Utilisation de l'estimation

Cette estimation alimente :
- **Objectifs** : vérification du respect des temps cibles
- **IA** : suggestions de découpage et rythme
- **Warnings UX** : alertes si dépassement
- **Prévisualisation** : affichage du temps estimé

👉 **L'utilisateur ne voit jamais la formule, seulement le résultat.**

---

### 5️⃣ PANELS — TYPOLOGIE NARRATIVE

#### Classification automatique

Chaque panel possède un type narratif implicite :

**Types :**
- **Introduction** : Présentation, mise en contexte
- **Action** : Mouvement, dynamisme
- **Dialogue** : Échange verbal
- **Pause** : Respiration narrative
- **Climax** : Point culminant
- **Transition narrative** : Passage entre scènes

#### Utilisation

**Aide l'IA à :**
- Proposer le bon cadrage
- Équilibrer le chapitre
- Respecter le rythme narratif

**Jamais demandé explicitement à l'utilisateur** (auto-déduit par l'IA)

**Détection automatique :**
- Analyse du contenu (personnages, texte, action)
- Contexte narratif (position dans le chapitre)
- Suggestions de type si ambiguïté

---

### 6️⃣ RÈGLES D'INTELLIGENCE VISUELLE AUTOMATIQUE

#### Harmonisation automatique

Le système doit automatiquement :

**Harmonisation :**
- Luminosité entre panels proches
- Contrastes pour la lecture mobile
- Éviter les ruptures visuelles non justifiées
- Cohérence des couleurs dominantes

**Ajustements :**
- Correction automatique des écarts de luminosité
- Optimisation des contrastes texte/fond
- Lissage des transitions visuelles

👉 **L'utilisateur ne règle jamais ces points manuellement.**

**Transparence :**
- Option "Afficher les ajustements automatiques" (mode avancé)
- Log des corrections appliquées (optionnel)

---

### 7️⃣ GESTION DES TEXTES & DIALOGUES (MANQUANT)

#### ✍️ Textes possibles

**Types de texte :**
- **Texte narratif** : Description, voix off
- **Dialogue** : Bulles de dialogue
- **Onomatopées** : Effets sonores visuels

#### Règles UX

**Appartenance :**
- Le texte appartient **TOUJOURS** à un panel
- Impossible de créer un texte orphelin

**Édition :**
- Drag & drop depuis la sidebar
- Redimensionnement direct sur canvas
- Positionnement libre dans le panel
- Styles prédéfinis (bulles, narration, onomatopées)

#### IA des textes

**Capacités :**
- Reformulation
- Raccourcissement
- Adaptation au rythme du chapitre
- Suggestions de dialogues cohérents
- Vérification de la lisibilité

**Actions contextuelles :**
- "Raccourcir pour accélérer le rythme"
- "Reformuler plus naturellement"
- "Adapter au style du personnage"

---

### 8️⃣ EXPORT & PRÉVISUALISATION (INDISPENSABLE)

#### 👀 Prévisualisation Webtoon

**Mode lecture plein écran :**
- Scroll naturel
- Sans grilles ni UI
- Expérience lecteur authentique
- Navigation fluide
- Affichage du temps de lecture

**Fonctionnalités :**
- Mode sombre/clair
- Vitesse de scroll ajustable
- Pause automatique sur panels complexes
- Indicateur de progression

#### 📤 Exports

**Formats disponibles :**

1. **Export chapitre** (images découpées)
   - Panels individuels
   - Format PNG haute résolution
   - Nommage automatique

2. **Export série** (zip)
   - Tous les chapitres
   - Structure organisée
   - Métadonnées incluses

3. **Export format plateforme** (futur)
   - LINE Webtoon
   - Webtoon Canvas
   - Formats spécifiques plateformes

**Options d'export :**
- Résolution (HD, Full HD, 4K)
- Qualité de compression
- Inclusion des métadonnées
- Watermark optionnel

---

### 9️⃣ SYSTÈME DE BLOCS INTELLIGENTS

#### Concept

Tout élément posé sur le canvas est un **bloc intelligent**.

**Types de blocs :**
- Panel
- Transition
- Texte
- Asset

#### Propriétés communes

Chaque bloc possède :

**Actions :**
- Sélectionnable
- Duplicable
- Supprimable
- Améliorable via IA

**Propriétés :**
- Position
- Taille
- Opacité
- Ordre de superposition
- Métadonnées (type, contexte)

**Interactions :**
- Clic → Sélection + panneau latéral
- Double-clic → Édition directe
- Drag → Déplacement
- Resize → Redimensionnement

#### IA contextuelle par bloc

Chaque bloc peut recevoir des suggestions IA spécifiques :
- Panel : "Améliorer la composition"
- Transition : "Allonger pour accentuer la tension"
- Texte : "Raccourcir pour accélérer"
- Asset : "Ajuster la taille pour l'équilibre"

---

### 🔟 RÈGLES ABSOLUES D'INTERACTION IA (À AJOUTER)

#### Contraintes IA

L'IA :

❌ **Ne génère jamais sans contexte**
- Toujours utiliser le contexte du projet
- Toujours respecter l'identité visuelle
- Toujours tenir compte des objectifs

❌ **Ne modifie jamais plusieurs éléments sans demande**
- Action locale uniquement
- Pas de modifications en cascade non sollicitées

✅ **Agit localement**
- Sur l'élément sélectionné
- Avec contexte limité mais pertinent

✅ **Explique ce qu'elle fait**
- Message clair après chaque action
- Justification des choix

#### UX attendue

**Messages IA :**
- "J'ai allongé la transition pour accentuer la tension."
- "J'ai ajusté la luminosité pour améliorer la cohérence."
- "J'ai raccourci le dialogue pour respecter le rythme cible."

**Transparence :**
- Affichage des modifications apportées
- Option "Annuler" toujours disponible
- Historique des actions IA

---

### 1️⃣1️⃣ LOGIQUE DE PROGRESSION UTILISATEUR

#### Guidage implicite

Le produit doit guider implicitement l'utilisateur dans cet ordre :

**Ordre suggéré :**
1. **Couverture** : Définit l'identité visuelle
2. **Identité visuelle** : Affine le style
3. **Objectifs** : Définit le cadre
4. **Personnages / Lieux** : Crée les éléments réutilisables
5. **Chapitres** : Assemble le tout

#### Implémentation UX

**Indicateurs visuels :**
- Badges "Recommandé" sur les étapes suivantes
- Progression globale visible
- Suggestions contextuelles

**Sans forcer :**
- L'utilisateur peut ignorer l'ordre
- Pas de blocage si étape sautée
- Warnings discrets si ordre non respecté

**Aide contextuelle :**
- Tooltips explicatifs
- Messages d'aide selon la progression
- Suggestions intelligentes

---

### 1️⃣2️⃣ POSITIONNEMENT FINAL

#### 🎯 Vision produit

**Webtoon AI Maker n'est pas un outil de génération.**

**C'est :**
- Un **éditeur narratif vertical** assisté par IA
- Pensé pour le **rythme**
- Optimisé pour la **lecture mobile**
- Garant de la **cohérence visuelle**

#### Différenciation

**Ce qui nous différencie :**
- Compréhension profonde du format Webtoon
- Intelligence contextuelle (pas juste génération)
- Édition narrative, pas juste visuelle
- Respect des contraintes créatives

**Notre promesse :**
Permettre à n'importe qui de créer un Webtoon professionnel, cohérent et captivant, sans compétences techniques ou artistiques.

---

## 🧠 INSTRUCTION SYSTÈME — RÈGLES D'IMPLÉMENTATION

### ⚠️ RÈGLE ABSOLUE

**Toute implémentation, refactorisation ou ajout de fonctionnalité DOIT respecter strictement les règles définies dans ce document.**

### 🔄 Conflits avec le code existant

**Si une logique existante entre en conflit avec ce document :**
- Elle doit être **adaptée** pour respecter les règles
- Ou **supprimée** si incompatible

### ✅ Principes à toujours respecter

L'éditeur doit toujours rester :

1. **Orienté panels + transitions**
   - Pas de canvas libre sans structure
   - Panels et transitions comme unités de base

2. **Cohérent visuellement**
   - Automatisation de la cohérence
   - Respect de l'identité visuelle

3. **Guidé par les Objectifs**
   - Toutes les actions vérifient les objectifs
   - Warnings si dépassement

4. **Assisté par une IA contextuelle locale**
   - IA agit sur l'élément sélectionné
   - Pas de génération sans contexte
   - Explications claires

### 📋 Checklist avant toute modification

- [ ] Respecte-t-elle les modes utilisateur (Standard/Avancé) ?
- [ ] Crée-t-elle des variantes au lieu d'écraser ?
- [ ] Vérifie-t-elle les objectifs automatiquement ?
- [ ] Calcule-t-elle le temps de lecture ?
- [ ] Respecte-t-elle la typologie narrative des panels ?
- [ ] Applique-t-elle l'intelligence visuelle automatique ?
- [ ] Gère-t-elle les textes correctement ?
- [ ] Permet-elle l'export et la prévisualisation ?
- [ ] Traite-t-elle les éléments comme des blocs intelligents ?
- [ ] L'IA agit-elle localement et explique-t-elle ses actions ?
- [ ] Guide-t-elle la progression utilisateur ?
- [ ] Respecte-t-elle le positionnement produit ?

### 🎯 Objectif final

**Créer un outil qui :**
- Rend la création de Webtoon accessible à tous
- Garantit la qualité et la cohérence
- Respecte les contraintes créatives
- Guide sans imposer
- Assiste sans remplacer

---

**Fin du document Produit.md**