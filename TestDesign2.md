# TestDesign2 - Design Webtoon AI Maker - Art & Création

Ce document présente un design complet, créatif et professionnel pour Webtoon AI Maker, inspiré de l'art du dessin, des mangas et des webtoons. Le design combine élégance, créativité et passion pour la création artistique.

## 1. Concept & Philosophie

### Inspiration
- **Art du dessin** : Traits de crayon, textures de papier, ombres portées
- **Webtoon/Manga** : Grilles, cases, dynamisme, noir & blanc avec touches colorées
- **Création IA** : Effets lumineux, particules, transitions fluides
- **Professionnel & Passionné** : Équilibre entre sérieux et créativité

### Palette Conceptuelle
- **Base** : Noir & Blanc (comme une planche de BD)
- **Accents** : Couleurs vives pour les webtoons (rouge, bleu, violet, rose)
- **Textures** : Papier, crayon, encre
- **Lumière** : Ombres portées, éclairages dramatiques

## 2. Typographie

### Police Principale - Comic Neue
- **Font Family**: `Comic Neue` (moderne, lisible, rappelle les comics)
- **Source**: Google Fonts
- **Poids**: 300 (Light), 400 (Regular), 700 (Bold)
- **Usage**: Titres, boutons, éléments créatifs
- **Import**: `@import url('https://fonts.googleapis.com/css2?family=Comic+Neue:wght@300;400;700&display=swap');`

### Police Secondaire - Inter
- **Font Family**: `Inter`
- **Usage**: Corps de texte, descriptions, formulaires
- **Raison**: Lisibilité optimale pour le contenu

### Police Accent - Permanent Marker
- **Font Family**: `Permanent Marker` (effet crayon/marker)
- **Usage**: Accents, badges, éléments décoratifs
- **Import**: `@import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap');`

### Configuration Tailwind
```javascript
fontFamily: {
  'comic': ['Comic Neue', 'cursive'],
  'sans': ['Inter', 'system-ui', 'sans-serif'],
  'marker': ['Permanent Marker', 'cursive'],
}
```

## 3. Palette de Couleurs

### Couleurs Principales

#### Noir & Blanc (Base)
- `ink-black`: `#0A0A0A` - Noir encre (plus profond que noir pur)
- `paper-white`: `#FAF9F6` - Blanc cassé (comme du papier)
- `charcoal`: `#2C2C2C` - Charbon (gris foncé)
- `graphite`: `#4A4A4A` - Graphite (gris moyen)
- `pencil-gray`: `#8B8B8B` - Gris crayon (gris clair)

#### Accents Webtoon (Couleurs Vives)
- `webtoon-red`: `#FF3B5C` - Rouge webtoon (passion, action)
- `webtoon-blue`: `#4A90E2` - Bleu webtoon (rêve, fantastique)
- `webtoon-purple`: `#9B59B6` - Violet webtoon (magie, mystère)
- `webtoon-pink`: `#FF6B9D` - Rose webtoon (romance, douceur)
- `webtoon-yellow`: `#FFD93D` - Jaune webtoon (joie, énergie)
- `webtoon-green`: `#6BCB77` - Vert webtoon (nature, croissance)

#### Couleurs IA & Technologie
- `ai-cyan`: `#00D9FF` - Cyan IA (technologie, futur)
- `ai-purple`: `#8B5CF6` - Violet IA (magie de l'IA)
- `ai-glow`: `#B794F6` - Lueur IA (effets lumineux)

#### Ombres & Lumières
- `shadow-soft`: `rgba(0, 0, 0, 0.1)` - Ombre douce
- `shadow-medium`: `rgba(0, 0, 0, 0.2)` - Ombre moyenne
- `shadow-strong`: `rgba(0, 0, 0, 0.4)` - Ombre forte
- `highlight-white`: `rgba(255, 255, 255, 0.1)` - Surbrillance

### Variables CSS (globals.css)
```css
:root {
  /* Noir & Blanc */
  --color-ink-black: #0A0A0A;
  --color-paper-white: #FAF9F6;
  --color-charcoal: #2C2C2C;
  --color-graphite: #4A4A4A;
  --color-pencil-gray: #8B8B8B;
  
  /* Accents Webtoon */
  --color-webtoon-red: #FF3B5C;
  --color-webtoon-blue: #4A90E2;
  --color-webtoon-purple: #9B59B6;
  --color-webtoon-pink: #FF6B9D;
  --color-webtoon-yellow: #FFD93D;
  --color-webtoon-green: #6BCB77;
  
  /* IA */
  --color-ai-cyan: #00D9FF;
  --color-ai-purple: #8B5CF6;
  --color-ai-glow: #B794F6;
}
```

### Configuration Tailwind
```javascript
colors: {
  // Noir & Blanc
  'ink-black': '#0A0A0A',
  'paper-white': '#FAF9F6',
  'charcoal': '#2C2C2C',
  'graphite': '#4A4A4A',
  'pencil-gray': '#8B8B8B',
  
  // Accents Webtoon
  'webtoon-red': '#FF3B5C',
  'webtoon-blue': '#4A90E2',
  'webtoon-purple': '#9B59B6',
  'webtoon-pink': '#FF6B9D',
  'webtoon-yellow': '#FFD93D',
  'webtoon-green': '#6BCB77',
  
  // IA
  'ai-cyan': '#00D9FF',
  'ai-purple': '#8B5CF6',
  'ai-glow': '#B794F6',
}
```

## 4. Effets Visuels & Textures

### Texture de Papier
```css
.paper-texture {
  background-image: 
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0, 0, 0, 0.03) 2px,
      rgba(0, 0, 0, 0.03) 4px
    );
  background-color: #FAF9F6;
}
```

### Effet Crayon (Border)
```css
.pencil-border {
  border: 2px solid #2C2C2C;
  box-shadow: 
    0 0 0 1px rgba(0, 0, 0, 0.1),
    inset 0 0 0 1px rgba(255, 255, 255, 0.1);
  position: relative;
}

.pencil-border::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, transparent 30%, rgba(0, 0, 0, 0.1) 50%, transparent 70%);
  pointer-events: none;
}
```

### Ombre Portée (Comme un dessin)
```css
.drawing-shadow {
  box-shadow: 
    4px 4px 0px rgba(0, 0, 0, 0.2),
    8px 8px 0px rgba(0, 0, 0, 0.1);
}
```

### Grille de Planche (Comme une BD)
```css
.comic-grid {
  background-image: 
    linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
}
```

## 5. Animations Créatives

### Animation de Dessin (Trait qui apparaît)
```css
@keyframes drawLine {
  0% {
    stroke-dashoffset: 1000;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

.draw-animation {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: drawLine 2s ease-out forwards;
}
```

### Animation de Crayon qui Écrit
```css
@keyframes pencilWrite {
  0% {
    transform: translateX(-10px) rotate(-5deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateX(100px) rotate(5deg);
    opacity: 0;
  }
}

.pencil-writing::after {
  content: '✏️';
  position: absolute;
  animation: pencilWrite 3s ease-in-out infinite;
}
```

### Animation de Particules de Couleur
```css
@keyframes colorParticles {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0;
  }
}

.color-particle {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  animation: colorParticles 3s ease-out infinite;
}
```

### Animation de Flip (Comme tourner une page)
```css
@keyframes pageFlip {
  0% {
    transform: perspective(1000px) rotateY(0deg);
  }
  50% {
    transform: perspective(1000px) rotateY(-90deg);
  }
  100% {
    transform: perspective(1000px) rotateY(0deg);
  }
}

.page-flip {
  animation: pageFlip 0.6s ease-in-out;
  transform-style: preserve-3d;
}
```

### Animation de Zoom avec Trait (Comme un zoom de BD)
```css
@keyframes comicZoom {
  0% {
    transform: scale(1);
    filter: brightness(1);
  }
  50% {
    transform: scale(1.1);
    filter: brightness(1.2);
  }
  100% {
    transform: scale(1);
    filter: brightness(1);
  }
}

.comic-zoom {
  animation: comicZoom 0.5s ease-out;
}
```

### Animation de Lueur IA
```css
@keyframes aiGlow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
  }
  50% {
    box-shadow: 0 0 40px rgba(139, 92, 246, 0.8), 0 0 60px rgba(0, 217, 255, 0.4);
  }
}

.ai-glow {
  animation: aiGlow 2s ease-in-out infinite;
}
```

### Animation de Traits qui Apparaissent
```css
@keyframes strokeAppear {
  0% {
    stroke-dashoffset: 100%;
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    stroke-dashoffset: 0;
    opacity: 1;
  }
}

.stroke-animate {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: strokeAppear 2s ease-out forwards;
}
```

## 6. Composants Stylisés

### Cards avec Effet de Planche
```css
.comic-card {
  background: #FAF9F6;
  border: 3px solid #0A0A0A;
  box-shadow: 
    6px 6px 0px rgba(0, 0, 0, 0.3),
    12px 12px 0px rgba(0, 0, 0, 0.1);
  position: relative;
  transition: all 0.3s ease;
}

.comic-card:hover {
  transform: translate(-2px, -2px);
  box-shadow: 
    8px 8px 0px rgba(0, 0, 0, 0.3),
    16px 16px 0px rgba(0, 0, 0, 0.1);
}

.comic-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      rgba(0, 0, 0, 0.02) 10px,
      rgba(0, 0, 0, 0.02) 20px
    );
  pointer-events: none;
  opacity: 0.5;
}
```

### Boutons avec Effet de Marker
```css
.marker-button {
  background: linear-gradient(135deg, #FF3B5C, #FF6B9D);
  border: 3px solid #0A0A0A;
  box-shadow: 
    4px 4px 0px rgba(0, 0, 0, 0.3),
    inset 0 2px 0px rgba(255, 255, 255, 0.2);
  font-family: 'Permanent Marker', cursive;
  font-size: 1.1rem;
  letter-spacing: 0.05em;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.marker-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.marker-button:hover::before {
  left: 100%;
}

.marker-button:hover {
  transform: translate(-2px, -2px);
  box-shadow: 
    6px 6px 0px rgba(0, 0, 0, 0.3),
    inset 0 2px 0px rgba(255, 255, 255, 0.3);
}

.marker-button:active {
  transform: translate(2px, 2px);
  box-shadow: 
    2px 2px 0px rgba(0, 0, 0, 0.3),
    inset 0 2px 0px rgba(255, 255, 255, 0.2);
}
```

### Inputs avec Style Crayon
```css
.pencil-input {
  background: #FAF9F6;
  border: 2px solid #2C2C2C;
  border-radius: 4px;
  font-family: 'Comic Neue', cursive;
  box-shadow: 
    inset 2px 2px 0px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.pencil-input:focus {
  outline: none;
  border-color: #4A90E2;
  box-shadow: 
    inset 2px 2px 0px rgba(74, 144, 226, 0.2),
    0 0 0 3px rgba(74, 144, 226, 0.1),
    0 0 20px rgba(74, 144, 226, 0.3);
}
```

### Badges avec Style Webtoon
```css
.webtoon-badge {
  background: linear-gradient(135deg, #FF3B5C, #FF6B9D);
  color: #FAF9F6;
  border: 2px solid #0A0A0A;
  font-family: 'Permanent Marker', cursive;
  font-size: 0.9rem;
  padding: 0.25rem 0.75rem;
  box-shadow: 
    3px 3px 0px rgba(0, 0, 0, 0.2),
    inset 0 1px 0px rgba(255, 255, 255, 0.3);
  transform: rotate(-2deg);
  display: inline-block;
}

.webtoon-badge:hover {
  transform: rotate(2deg) scale(1.05);
}
```

## 7. Backgrounds & Décors

### Background Principal (Noir avec Grille)
```css
.main-background {
  background: 
    linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%),
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 40px,
      rgba(255, 255, 255, 0.02) 40px,
      rgba(255, 255, 255, 0.02) 41px
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 40px,
      rgba(255, 255, 255, 0.02) 40px,
      rgba(255, 255, 255, 0.02) 41px
    );
  background-size: 100% 100%, 40px 40px, 40px 40px;
}
```

### Background Créatif (Avec Particules)
```css
.creative-background {
  background: linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 50%, #0A0A0A 100%);
  position: relative;
  overflow: hidden;
}

.creative-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(255, 59, 92, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(74, 144, 226, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(155, 89, 182, 0.1) 0%, transparent 50%);
  animation: backgroundShift 20s ease-in-out infinite;
}

@keyframes backgroundShift {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(-20px, -20px) scale(1.1);
  }
}
```

### Background de Page (Effet Papier)
```css
.page-background {
  background: 
    #FAF9F6,
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0, 0, 0, 0.03) 2px,
      rgba(0, 0, 0, 0.03) 4px
    );
  box-shadow: 
    inset 0 0 100px rgba(0, 0, 0, 0.05),
    0 0 50px rgba(0, 0, 0, 0.1);
}
```

## 8. Gradients Spéciaux

### Gradient Webtoon (Couleurs Vives)
```css
.webtoon-gradient {
  background: linear-gradient(135deg, #FF3B5C, #FF6B9D, #9B59B6, #4A90E2);
  background-size: 400% 400%;
  animation: gradientShift 8s ease infinite;
}

@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}
```

### Gradient IA (Cyan/Purple)
```css
.ai-gradient {
  background: linear-gradient(135deg, #00D9FF, #8B5CF6, #B794F6);
  background-size: 200% 200%;
  animation: gradientShift 5s ease infinite;
}
```

### Gradient Texte Webtoon
```css
.webtoon-text-gradient {
  background: linear-gradient(135deg, #FF3B5C, #FF6B9D, #9B59B6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  background-size: 200% 200%;
  animation: gradientShift 5s ease infinite;
}
```

## 9. Effets Hover & Interactions

### Hover avec Trait de Crayon
```css
.pencil-hover {
  position: relative;
  transition: all 0.3s ease;
}

.pencil-hover::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 3px;
  background: #2C2C2C;
  transition: width 0.3s ease;
}

.pencil-hover:hover::after {
  width: 100%;
}
```

### Hover avec Éclat de Couleur
```css
.color-burst-hover {
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.color-burst-hover::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 59, 92, 0.3), transparent);
  transform: translate(-50%, -50%);
  transition: width 0.5s ease, height 0.5s ease;
}

.color-burst-hover:hover::before {
  width: 300px;
  height: 300px;
}
```

### Hover avec Flip 3D
```css
.flip-hover {
  perspective: 1000px;
  transition: transform 0.6s ease;
}

.flip-hover:hover {
  transform: rotateY(5deg) rotateX(-2deg);
}
```

## 10. Éléments Décoratifs

### Traits de Crayon Décoratifs
```css
.pencil-line {
  position: relative;
  height: 2px;
  background: linear-gradient(90deg, transparent, #2C2C2C, transparent);
  margin: 1rem 0;
}

.pencil-line::before {
  content: '';
  position: absolute;
  left: 0;
  top: -1px;
  width: 4px;
  height: 4px;
  background: #2C2C2C;
  border-radius: 50%;
  box-shadow: 0 0 0 2px rgba(44, 44, 44, 0.3);
}
```

### Bulles de Dialogue (Style BD)
```css
.comic-bubble {
  background: #FAF9F6;
  border: 3px solid #0A0A0A;
  border-radius: 20px;
  padding: 1rem 1.5rem;
  position: relative;
  box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.2);
  font-family: 'Comic Neue', cursive;
}

.comic-bubble::after {
  content: '';
  position: absolute;
  bottom: -15px;
  left: 30px;
  width: 0;
  height: 0;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  border-top: 15px solid #0A0A0A;
}

.comic-bubble::before {
  content: '';
  position: absolute;
  bottom: -12px;
  left: 32px;
  width: 0;
  height: 0;
  border-left: 13px solid transparent;
  border-right: 13px solid transparent;
  border-top: 13px solid #FAF9F6;
}
```

### Étoiles Décoratives (Effet Sparkle)
```css
.sparkle {
  position: relative;
  display: inline-block;
}

.sparkle::before,
.sparkle::after {
  content: '✨';
  position: absolute;
  font-size: 0.8em;
  animation: sparkleFloat 2s ease-in-out infinite;
}

.sparkle::before {
  top: -10px;
  left: -10px;
  animation-delay: 0s;
}

.sparkle::after {
  bottom: -10px;
  right: -10px;
  animation-delay: 1s;
}

@keyframes sparkleFloat {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-10px) scale(1.2);
    opacity: 1;
  }
}
```

## 11. Mappings de Remplacement

### Remplacements de Classes Tailwind

#### Couleurs de Base
- `darkest` → `ink-black`
- `darker` → `charcoal`
- `dark-gray` → `graphite`
- `gray` → `pencil-gray`
- `white` → `paper-white`

#### Couleurs Accent
- `primary` → `webtoon-blue` ou `ai-purple`
- `accent` → `webtoon-pink` ou `webtoon-red`
- `secondary` → `webtoon-purple`

#### Classes Spéciales
- `border-orange-dark` → `border-ink-black` (avec `pencil-border`)
- `bg-gradient-to-r from-primary to-accent` → `webtoon-gradient`
- `gradient-text` → `webtoon-text-gradient`

## 12. Couleurs des Configurations (projectConfig.ts)

### GENRES (Couleurs Webtoon)
```typescript
{ value: 'romance', label: 'Romance', color: '#FF6B9D' }
{ value: 'drame', label: 'Drame', color: '#FF3B5C' }
{ value: 'fantasy', label: 'Fantasy', color: '#9B59B6' }
{ value: 'action', label: 'Action', color: '#FF3B5C' }
{ value: 'thriller', label: 'Thriller', color: '#2C2C2C' }
{ value: 'science-fiction', label: 'Science-fiction', color: '#4A90E2' }
{ value: 'comedie', label: 'Comédie', color: '#FFD93D' }
{ value: 'surnaturel', label: 'Surnaturel', color: '#8B5CF6' }
{ value: 'slice-of-life', label: 'Slice of Life', color: '#6BCB77' }
{ value: 'custom', label: 'Custom', color: '#8B8B8B' }
```

### AMBIANCES
```typescript
{ value: 'lumineuse', label: 'Lumineuse', color: '#FFD93D' }
{ value: 'sombre', label: 'Sombre', color: '#2C2C2C' }
{ value: 'mature', label: 'Mature', color: '#4A4A4A' }
{ value: 'enfantine', label: 'Enfantine', color: '#FF6B9D' }
{ value: 'poetique', label: 'Poétique', color: '#9B59B6' }
{ value: 'humoristique', label: 'Humoristique', color: '#FFD93D' }
{ value: 'custom', label: 'Custom + IA', color: '#8B5CF6' }
```

### STYLES_GRAPHIQUES
```typescript
{ value: 'webtoon-standard', color: '#FF3B5C' }
{ value: 'manga-noir-blanc', color: '#0A0A0A' }
{ value: 'manhwa-semi-realiste', color: '#4A90E2' }
{ value: 'cartoon', color: '#FF6B9D' }
{ value: 'peinture-digitale', color: '#9B59B6' }
{ value: 'pixel-art', color: '#6BCB77' }
{ value: 'custom', color: '#8B8B8B' }
```

## 13. Instructions de Réapplication

### Étape 1 : Typographie
1. Importer les polices dans `globals.css` :
   - Comic Neue
   - Inter
   - Permanent Marker

### Étape 2 : Configuration Tailwind
1. Mettre à jour `tailwind.config.js` avec toutes les couleurs
2. Ajouter les font families

### Étape 3 : Styles CSS
1. Ajouter toutes les animations dans `globals.css`
2. Ajouter les classes utilitaires (`.paper-texture`, `.pencil-border`, etc.)
3. Ajouter les backgrounds (`.main-background`, `.creative-background`, etc.)
4. Ajouter les gradients (`.webtoon-gradient`, `.ai-gradient`, etc.)

### Étape 4 : ProjectConfig
1. Mettre à jour les couleurs dans `lib/projectConfig.ts`

### Étape 5 : Remplacements dans les Pages
1. Remplacer les classes selon le mapping section 11
2. Ajouter les classes spéciales (`.comic-card`, `.marker-button`, etc.)
3. Ajouter les effets hover et animations

## 14. Détails Créatifs Spéciaux

### Effet de Goutte d'Encre
```css
.ink-drop {
  position: relative;
}

.ink-drop::before {
  content: '';
  position: absolute;
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 10px;
  height: 10px;
  background: radial-gradient(circle, #0A0A0A, transparent);
  border-radius: 50%;
  animation: inkDrop 2s ease-in-out infinite;
}

@keyframes inkDrop {
  0% {
    transform: translateX(-50%) translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateX(-50%) translateY(20px) scale(2);
    opacity: 0;
  }
}
```

### Effet de Crayon qui Dessine
```css
.drawing-effect {
  position: relative;
  overflow: hidden;
}

.drawing-effect::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 59, 92, 0.3), transparent);
  animation: drawAcross 3s ease-in-out infinite;
}

@keyframes drawAcross {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}
```

### Effet de Lumière qui Scanne
```css
.scan-light {
  position: relative;
  overflow: hidden;
}

.scan-light::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  animation: scan 3s ease-in-out infinite;
}

@keyframes scan {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}
```

## 15. Notes Finales

- **Philosophie** : Noir & blanc comme base, couleurs vives pour les accents
- **Animations** : Fluides, créatives, inspirées du dessin
- **Détails** : Traits de crayon, ombres portées, textures de papier
- **Professionnel** : Équilibre entre créativité et sérieux
- **Passion** : Chaque élément rappelle l'art du webtoon et du dessin

Ce design crée une expérience immersive où l'utilisateur se sent dans un atelier de création, avec tous les outils et l'inspiration nécessaires pour créer son webtoon avec l'IA.

