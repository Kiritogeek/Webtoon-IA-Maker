# TestDesign3 - Design Webtoon AI Maker - Futuriste & Organique

Ce document présente un design complètement repensé, moderne et futuriste pour Webtoon AI Maker. Design inspiré de l'art numérique, des interfaces futuristes et des créations organiques.

## 1. Concept & Philosophie

### Inspiration
- **Art Numérique** : Formes organiques, dégradés fluides, morphing
- **Futurisme** : Interfaces néon, glassmorphism, effets de lumière
- **Créativité IA** : Particules animées, transformations, fluidité
- **Webtoon Moderne** : Dynamisme, couleurs saturées, mouvement

### Palette Conceptuelle
- **Base** : Dégradés sombres avec touches de lumière
- **Accents** : Néo-néon (cyan, magenta, violet, orange)
- **Textures** : Glassmorphism, néon glow, particules
- **Formes** : Organiques, courbes, morphing

## 2. Typographie

### Police Principale - Space Grotesk
- **Font Family**: `Space Grotesk` (géométrique, moderne, futuriste)
- **Source**: Google Fonts
- **Poids**: 300, 400, 500, 600, 700
- **Usage**: Titres, navigation, éléments principaux
- **Import**: `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');`

### Police Secondaire - Outfit
- **Font Family**: `Outfit` (moderne, arrondie, lisible)
- **Usage**: Corps de texte, descriptions
- **Import**: `@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');`

### Police Accent - Orbitron
- **Font Family**: `Orbitron` (futuriste, technologique)
- **Usage**: Badges, labels, éléments spéciaux
- **Import**: `@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;900&display=swap');`

### Configuration Tailwind
```javascript
fontFamily: {
  'space': ['Space Grotesk', 'sans-serif'],
  'outfit': ['Outfit', 'sans-serif'],
  'orbitron': ['Orbitron', 'sans-serif'],
  'sans': ['Outfit', 'system-ui', 'sans-serif'],
}
```

## 3. Palette de Couleurs

### Couleurs Principales

#### Dégradés Sombre (Base)
- `void-black`: `#000000` - Noir absolu
- `deep-space`: `#0A0E27` - Bleu très foncé (espace profond)
- `cosmic-purple`: `#1A0B2E` - Violet cosmique
- `midnight-blue`: `#16213E` - Bleu minuit
- `dark-slate`: `#1E293B` - Ardoise foncée

#### Néo-Néon (Accents Principaux)
- `neon-cyan`: `#00F5FF` - Cyan néon (lumière pure)
- `neon-magenta`: `#FF00F5` - Magenta néon (énergie)
- `neon-purple`: `#B026FF` - Violet néon (magie)
- `neon-pink`: `#FF1493` - Rose néon (passion)
- `neon-orange`: `#FF6B35` - Orange néon (créativité)
- `neon-yellow`: `#FFD700` - Jaune néon (joie)

#### Couleurs Organiques (Dégradés)
- `organic-teal`: `#00D4AA` - Sarcelle organique
- `organic-coral`: `#FF6B6B` - Corail organique
- `organic-lavender`: `#A78BFA` - Lavande organique
- `organic-mint`: `#10B981` - Menthe organique

#### Glassmorphism
- `glass-white`: `rgba(255, 255, 255, 0.1)` - Verre blanc
- `glass-cyan`: `rgba(0, 245, 255, 0.15)` - Verre cyan
- `glass-purple`: `rgba(176, 38, 255, 0.15)` - Verre violet
- `glass-dark`: `rgba(0, 0, 0, 0.3)` - Verre sombre

### Variables CSS (globals.css)
```css
:root {
  /* Dégradés Sombre */
  --color-void-black: #000000;
  --color-deep-space: #0A0E27;
  --color-cosmic-purple: #1A0B2E;
  --color-midnight-blue: #16213E;
  --color-dark-slate: #1E293B;
  
  /* Néo-Néon */
  --color-neon-cyan: #00F5FF;
  --color-neon-magenta: #FF00F5;
  --color-neon-purple: #B026FF;
  --color-neon-pink: #FF1493;
  --color-neon-orange: #FF6B35;
  --color-neon-yellow: #FFD700;
  
  /* Organiques */
  --color-organic-teal: #00D4AA;
  --color-organic-coral: #FF6B6B;
  --color-organic-lavender: #A78BFA;
  --color-organic-mint: #10B981;
  
  /* Glassmorphism */
  --glass-white: rgba(255, 255, 255, 0.1);
  --glass-cyan: rgba(0, 245, 255, 0.15);
  --glass-purple: rgba(176, 38, 255, 0.15);
  --glass-dark: rgba(0, 0, 0, 0.3);
}
```

### Configuration Tailwind
```javascript
colors: {
  // Dégradés Sombre
  'void-black': '#000000',
  'deep-space': '#0A0E27',
  'cosmic-purple': '#1A0B2E',
  'midnight-blue': '#16213E',
  'dark-slate': '#1E293B',
  
  // Néo-Néon
  'neon-cyan': '#00F5FF',
  'neon-magenta': '#FF00F5',
  'neon-purple': '#B026FF',
  'neon-pink': '#FF1493',
  'neon-orange': '#FF6B35',
  'neon-yellow': '#FFD700',
  
  // Organiques
  'organic-teal': '#00D4AA',
  'organic-coral': '#FF6B6B',
  'organic-lavender': '#A78BFA',
  'organic-mint': '#10B981',
}
```

## 4. Effets Visuels & Glassmorphism

### Glassmorphism Card
```css
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(0, 245, 255, 0.3);
  box-shadow: 
    0 12px 48px rgba(0, 245, 255, 0.2),
    0 0 0 1px rgba(0, 245, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transform: translateY(-4px);
}
```

### Néon Glow
```css
.neon-glow {
  box-shadow: 
    0 0 20px rgba(0, 245, 255, 0.5),
    0 0 40px rgba(0, 245, 255, 0.3),
    0 0 60px rgba(0, 245, 255, 0.1),
    inset 0 0 20px rgba(0, 245, 255, 0.1);
}

.neon-glow-magenta {
  box-shadow: 
    0 0 20px rgba(255, 0, 245, 0.5),
    0 0 40px rgba(255, 0, 245, 0.3),
    0 0 60px rgba(255, 0, 245, 0.1);
}

.neon-glow-purple {
  box-shadow: 
    0 0 20px rgba(176, 38, 255, 0.5),
    0 0 40px rgba(176, 38, 255, 0.3),
    0 0 60px rgba(176, 38, 255, 0.1);
}
```

### Dégradé Organique (Morphing)
```css
.organic-gradient {
  background: linear-gradient(135deg, #00F5FF, #B026FF, #FF00F5);
  background-size: 200% 200%;
  animation: morphGradient 8s ease infinite;
  position: relative;
}

.organic-gradient::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(0, 245, 255, 0.3), transparent 70%);
  animation: rotate 20s linear infinite;
}

@keyframes morphGradient {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

## 5. Animations Créatives

### Animation de Morphing (Forme Organique)
```css
@keyframes morphShape {
  0%, 100% {
    border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
  }
  50% {
    border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
  }
}

.morph-shape {
  animation: morphShape 8s ease-in-out infinite;
  background: linear-gradient(135deg, #00F5FF, #B026FF);
}
```

### Animation de Particules Flottantes
```css
@keyframes floatParticles {
  0% {
    transform: translateY(0) translateX(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) translateX(50px) rotate(360deg);
    opacity: 0;
  }
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #00F5FF;
  border-radius: 50%;
  box-shadow: 0 0 10px #00F5FF;
  animation: floatParticles 10s linear infinite;
}
```

### Animation de Pulsation Néon
```css
@keyframes neonPulse {
  0%, 100% {
    box-shadow: 
      0 0 20px rgba(0, 245, 255, 0.5),
      0 0 40px rgba(0, 245, 255, 0.3),
      0 0 60px rgba(0, 245, 255, 0.1);
  }
  50% {
    box-shadow: 
      0 0 30px rgba(0, 245, 255, 0.8),
      0 0 60px rgba(0, 245, 255, 0.5),
      0 0 90px rgba(0, 245, 255, 0.2);
  }
}

.neon-pulse {
  animation: neonPulse 2s ease-in-out infinite;
}
```

### Animation de Glitch (Effet Cyber)
```css
@keyframes glitch {
  0% {
    transform: translate(0);
  }
  20% {
    transform: translate(-2px, 2px);
  }
  40% {
    transform: translate(-2px, -2px);
  }
  60% {
    transform: translate(2px, 2px);
  }
  80% {
    transform: translate(2px, -2px);
  }
  100% {
    transform: translate(0);
  }
}

.glitch-effect {
  position: relative;
}

.glitch-effect::before,
.glitch-effect::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.glitch-effect::before {
  left: 2px;
  text-shadow: -2px 0 #FF00F5;
  clip: rect(44px, 450px, 56px, 0);
  animation: glitch 0.5s infinite linear alternate-reverse;
}

.glitch-effect::after {
  left: -2px;
  text-shadow: -2px 0 #00F5FF, 2px 2px #FF00F5;
  clip: rect(44px, 450px, 56px, 0);
  animation: glitch 0.5s infinite linear alternate-reverse;
}
```

### Animation de Fluide (Liquid)
```css
@keyframes liquidFlow {
  0% {
    transform: translateX(-100%) translateY(0) rotate(0deg);
  }
  50% {
    transform: translateX(0) translateY(-20px) rotate(180deg);
  }
  100% {
    transform: translateX(100%) translateY(0) rotate(360deg);
  }
}

.liquid-effect {
  position: relative;
  overflow: hidden;
}

.liquid-effect::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(0, 245, 255, 0.3), transparent);
  animation: liquidFlow 4s ease-in-out infinite;
}
```

### Animation de Scan (Effet Scanner)
```css
@keyframes scanLine {
  0% {
    transform: translateY(-100%);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateY(100vh);
    opacity: 0;
  }
}

.scan-line {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00F5FF, transparent);
  box-shadow: 0 0 10px #00F5FF;
  animation: scanLine 3s linear infinite;
  pointer-events: none;
  z-index: 9999;
}
```

## 6. Composants Stylisés

### Boutons Futuristes
```css
.futuristic-button {
  background: linear-gradient(135deg, #00F5FF, #B026FF);
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
  color: #000000;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 
    0 4px 20px rgba(0, 245, 255, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.futuristic-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.futuristic-button:hover::before {
  left: 100%;
}

.futuristic-button:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 8px 30px rgba(0, 245, 255, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.futuristic-button:active {
  transform: translateY(0);
}
```

### Inputs Glassmorphism
```css
.glass-input {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  color: #FFFFFF;
  font-family: 'Outfit', sans-serif;
  transition: all 0.3s ease;
}

.glass-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(0, 245, 255, 0.5);
  box-shadow: 
    0 0 20px rgba(0, 245, 255, 0.3),
    inset 0 0 20px rgba(0, 245, 255, 0.1);
}

.glass-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}
```

### Cards avec Effet Holographique
```css
.holographic-card {
  background: linear-gradient(135deg, rgba(0, 245, 255, 0.1), rgba(176, 38, 255, 0.1));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  position: relative;
  overflow: hidden;
  transition: all 0.4s ease;
}

.holographic-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(0, 245, 255, 0.1) 50%,
    transparent 70%
  );
  transform: rotate(45deg);
  transition: transform 0.6s ease;
}

.holographic-card:hover::before {
  transform: rotate(45deg) translate(50%, 50%);
}

.holographic-card:hover {
  border-color: rgba(0, 245, 255, 0.3);
  box-shadow: 
    0 8px 32px rgba(0, 245, 255, 0.2),
    inset 0 0 40px rgba(176, 38, 255, 0.1);
  transform: translateY(-4px) scale(1.02);
}
```

### Badges Néon
```css
.neon-badge {
  background: rgba(0, 245, 255, 0.2);
  border: 1px solid rgba(0, 245, 255, 0.5);
  border-radius: 20px;
  padding: 0.25rem 0.75rem;
  font-family: 'Orbitron', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  color: #00F5FF;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  box-shadow: 
    0 0 10px rgba(0, 245, 255, 0.5),
    inset 0 0 10px rgba(0, 245, 255, 0.1);
  animation: neonPulse 2s ease-in-out infinite;
}
```

## 7. Backgrounds & Décors

### Background Principal (Dégradé Cosmique)
```css
.cosmic-background {
  background: 
    radial-gradient(ellipse at top, #1A0B2E 0%, #0A0E27 50%, #000000 100%),
    linear-gradient(135deg, #000000 0%, #0A0E27 100%);
  position: relative;
  overflow: hidden;
}

.cosmic-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(0, 245, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(176, 38, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(255, 0, 245, 0.05) 0%, transparent 50%);
  animation: backgroundMorph 20s ease-in-out infinite;
}

@keyframes backgroundMorph {
  0%, 100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: scale(1.1) rotate(5deg);
    opacity: 0.8;
  }
}
```

### Background avec Particules
```css
.particle-background {
  position: relative;
  overflow: hidden;
}

.particle-background::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(2px 2px at 20% 30%, #00F5FF, transparent),
    radial-gradient(2px 2px at 60% 70%, #B026FF, transparent),
    radial-gradient(1px 1px at 50% 50%, #FF00F5, transparent);
  background-size: 200px 200px, 300px 300px, 150px 150px;
  background-position: 0 0, 100px 100px, 50px 50px;
  animation: particleMove 20s linear infinite;
  opacity: 0.6;
}

@keyframes particleMove {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(100px, 100px);
  }
}
```

### Background Glassmorphism
```css
.glass-background {
  background: 
    linear-gradient(135deg, rgba(0, 245, 255, 0.1) 0%, rgba(176, 38, 255, 0.1) 100%),
    rgba(10, 14, 39, 0.8);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

## 8. Gradients Spéciaux

### Gradient Néon (Principal)
```css
.neon-gradient {
  background: linear-gradient(135deg, #00F5FF, #B026FF, #FF00F5);
  background-size: 200% 200%;
  animation: gradientFlow 5s ease infinite;
}

@keyframes gradientFlow {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}
```

### Gradient Organique (Morphing)
```css
.organic-gradient-flow {
  background: linear-gradient(135deg, #00D4AA, #B026FF, #FF6B6B, #00F5FF);
  background-size: 400% 400%;
  animation: organicFlow 10s ease infinite;
}

@keyframes organicFlow {
  0% {
    background-position: 0% 50%;
  }
  25% {
    background-position: 100% 50%;
  }
  50% {
    background-position: 100% 100%;
  }
  75% {
    background-position: 0% 100%;
  }
  100% {
    background-position: 0% 50%;
  }
}
```

### Gradient Texte Néon
```css
.neon-text-gradient {
  background: linear-gradient(135deg, #00F5FF, #B026FF, #FF00F5, #00F5FF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  background-size: 200% 200%;
  animation: gradientFlow 5s ease infinite;
  filter: drop-shadow(0 0 10px rgba(0, 245, 255, 0.5));
}
```

## 9. Effets Hover & Interactions

### Hover avec Expansion Néon
```css
.neon-expand-hover {
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.neon-expand-hover::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 245, 255, 0.3), transparent);
  transform: translate(-50%, -50%);
  transition: width 0.6s ease, height 0.6s ease;
}

.neon-expand-hover:hover::before {
  width: 300px;
  height: 300px;
}

.neon-expand-hover:hover {
  transform: scale(1.05);
  box-shadow: 0 0 30px rgba(0, 245, 255, 0.6);
}
```

### Hover avec Trait Néon
```css
.neon-line-hover {
  position: relative;
  transition: all 0.3s ease;
}

.neon-line-hover::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #00F5FF, #B026FF);
  box-shadow: 0 0 10px #00F5FF;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.neon-line-hover:hover::after {
  width: 100%;
}
```

### Hover avec Rotation 3D
```css
.rotate-3d-hover {
  perspective: 1000px;
  transition: transform 0.6s ease;
}

.rotate-3d-hover:hover {
  transform: rotateY(10deg) rotateX(-5deg) scale(1.05);
}
```

### Hover avec Glow Pulse
```css
.glow-pulse-hover {
  transition: all 0.3s ease;
}

.glow-pulse-hover:hover {
  animation: neonPulse 1s ease-in-out infinite;
  filter: brightness(1.2);
}
```

## 10. Éléments Décoratifs

### Lignes Néon Décoratives
```css
.neon-line {
  position: relative;
  height: 1px;
  background: linear-gradient(90deg, transparent, #00F5FF, #B026FF, transparent);
  margin: 2rem 0;
  box-shadow: 0 0 10px rgba(0, 245, 255, 0.5);
}

.neon-line::before,
.neon-line::after {
  content: '';
  position: absolute;
  top: -2px;
  width: 4px;
  height: 4px;
  background: #00F5FF;
  border-radius: 50%;
  box-shadow: 0 0 10px #00F5FF;
}

.neon-line::before {
  left: 0;
}

.neon-line::after {
  right: 0;
}
```

### Formes Organiques Flottantes
```css
.organic-blob {
  position: absolute;
  border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
  background: linear-gradient(135deg, rgba(0, 245, 255, 0.2), rgba(176, 38, 255, 0.2));
  filter: blur(40px);
  animation: morphShape 10s ease-in-out infinite;
  pointer-events: none;
}
```

### Effet Hologramme
```css
.hologram-effect {
  position: relative;
  overflow: hidden;
}

.hologram-effect::before {
  content: '';
  position: absolute;
  top: -100%;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    180deg,
    transparent,
    rgba(0, 245, 255, 0.1),
    transparent
  );
  animation: hologramScan 3s linear infinite;
}

@keyframes hologramScan {
  0% {
    top: -100%;
  }
  100% {
    top: 100%;
  }
}
```

### Effet Matrix (Pluie de Code)
```css
.matrix-rain {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  opacity: 0.1;
}

.matrix-rain::before {
  content: '';
  position: absolute;
  width: 2px;
  height: 100%;
  background: linear-gradient(180deg, transparent, #00F5FF, transparent);
  animation: matrixFall 3s linear infinite;
}

@keyframes matrixFall {
  0% {
    transform: translateY(-100%);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateY(100vh);
    opacity: 0;
  }
}
```

## 11. Mappings de Remplacement

### Remplacements de Classes Tailwind

#### Couleurs de Base
- `darkest` → `void-black` ou `deep-space`
- `darker` → `cosmic-purple` ou `midnight-blue`
- `dark-gray` → `dark-slate`
- `white` → `glass-white` (avec backdrop-filter)

#### Couleurs Accent
- `primary` → `neon-cyan`
- `accent` → `neon-magenta` ou `neon-pink`
- `secondary` → `neon-purple`

#### Classes Spéciales
- `border-orange-dark` → `border` avec `rgba(255, 255, 255, 0.1)` (glassmorphism)
- `bg-gradient-to-r from-primary to-accent` → `neon-gradient` ou `organic-gradient-flow`
- `gradient-text` → `neon-text-gradient`
- Cards → `.glass-card` ou `.holographic-card`
- Boutons → `.futuristic-button`
- Inputs → `.glass-input`

## 12. Couleurs des Configurations (projectConfig.ts)

### GENRES (Couleurs Néo-Néon)
```typescript
{ value: 'romance', label: 'Romance', color: '#FF1493' }
{ value: 'drame', label: 'Drame', color: '#FF6B35' }
{ value: 'fantasy', label: 'Fantasy', color: '#B026FF' }
{ value: 'action', label: 'Action', color: '#FF00F5' }
{ value: 'thriller', label: 'Thriller', color: '#0A0E27' }
{ value: 'science-fiction', label: 'Science-fiction', color: '#00F5FF' }
{ value: 'comedie', label: 'Comédie', color: '#FFD700' }
{ value: 'surnaturel', label: 'Surnaturel', color: '#B026FF' }
{ value: 'slice-of-life', label: 'Slice of Life', color: '#00D4AA' }
{ value: 'custom', label: 'Custom', color: '#A78BFA' }
```

### AMBIANCES
```typescript
{ value: 'lumineuse', label: 'Lumineuse', color: '#FFD700' }
{ value: 'sombre', label: 'Sombre', color: '#1A0B2E' }
{ value: 'mature', label: 'Mature', color: '#16213E' }
{ value: 'enfantine', label: 'Enfantine', color: '#FF1493' }
{ value: 'poetique', label: 'Poétique', color: '#B026FF' }
{ value: 'humoristique', label: 'Humoristique', color: '#FF6B35' }
{ value: 'custom', label: 'Custom + IA', color: '#00F5FF' }
```

### STYLES_GRAPHIQUES
```typescript
{ value: 'webtoon-standard', color: '#FF1493' }
{ value: 'manga-noir-blanc', color: '#000000' }
{ value: 'manhwa-semi-realiste', color: '#00F5FF' }
{ value: 'cartoon', color: '#FF6B35' }
{ value: 'peinture-digitale', color: '#B026FF' }
{ value: 'pixel-art', color: '#00D4AA' }
{ value: 'custom', color: '#A78BFA' }
```

## 13. Instructions de Réapplication

### Étape 1 : Typographie
1. Importer les polices dans `globals.css` :
   - Space Grotesk
   - Outfit
   - Orbitron

### Étape 2 : Configuration Tailwind
1. Mettre à jour `tailwind.config.js` avec toutes les couleurs néon et organiques
2. Ajouter les font families (space, outfit, orbitron)

### Étape 3 : Styles CSS
1. Ajouter toutes les animations dans `globals.css`
2. Ajouter les classes glassmorphism (`.glass-card`, `.glass-input`, etc.)
3. Ajouter les effets néon (`.neon-glow`, `.neon-pulse`, etc.)
4. Ajouter les backgrounds (`.cosmic-background`, `.particle-background`, etc.)
5. Ajouter les gradients (`.neon-gradient`, `.organic-gradient-flow`, etc.)

### Étape 4 : ProjectConfig
1. Mettre à jour les couleurs dans `lib/projectConfig.ts` avec les couleurs néon

### Étape 5 : Remplacements dans les Pages
1. Remplacer les classes selon le mapping section 11
2. Ajouter les classes spéciales (`.glass-card`, `.futuristic-button`, etc.)
3. Ajouter les effets hover et animations
4. Appliquer glassmorphism partout où c'est approprié

## 14. Détails Créatifs Spéciaux

### Effet de Distorsion (Warp)
```css
.warp-effect {
  position: relative;
  transition: all 0.3s ease;
}

.warp-effect:hover {
  transform: perspective(1000px) rotateX(5deg) rotateY(5deg);
  filter: brightness(1.1) contrast(1.1);
}
```

### Effet de Réflexion (Mirror)
```css
.mirror-effect {
  position: relative;
}

.mirror-effect::after {
  content: '';
  position: absolute;
  bottom: -100%;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, transparent, rgba(0, 245, 255, 0.2));
  transform: scaleY(-1);
  opacity: 0.5;
}
```

### Effet de Vague (Wave)
```css
.wave-effect {
  position: relative;
  overflow: hidden;
}

.wave-effect::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 245, 255, 0.2), transparent);
  animation: waveFlow 3s ease-in-out infinite;
}

@keyframes waveFlow {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}
```

### Effet de Rayon (Beam)
```css
.beam-effect {
  position: relative;
}

.beam-effect::before {
  content: '';
  position: absolute;
  top: 50%;
  left: -100%;
  width: 200%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00F5FF, transparent);
  box-shadow: 0 0 20px #00F5FF;
  transform: translateY(-50%) rotate(45deg);
  animation: beamSweep 2s ease-in-out infinite;
}

@keyframes beamSweep {
  0% {
    left: -100%;
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    left: 100%;
    opacity: 0;
  }
}
```

## 15. Notes Finales

- **Philosophie** : Futuriste, organique, glassmorphism, néon
- **Animations** : Fluides, morphing, particules, effets de lumière
- **Détails** : Glassmorphism partout, néon glow, formes organiques
- **Professionnel** : Moderne, high-tech, interface de qualité
- **Passion** : Chaque élément respire la créativité et l'innovation

Ce design crée une expérience immersive futuriste où l'utilisateur se sent dans un environnement high-tech de création, avec des effets visuels spectaculaires et une esthétique moderne inspirée de l'art numérique et des interfaces futuristes.

