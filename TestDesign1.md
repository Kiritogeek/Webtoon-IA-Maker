# TestDesign1 - Documentation du Design Moderne

Ce document répertorie tous les styles et modifications de design appliqués au projet. Si ce design est validé, ce fichier servira de référence pour réappliquer tous les styles.

## 1. Typographie

### Police principale
- **Font Family**: `Inter`
- **Source**: Google Fonts (importée via `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');`)
- **Poids disponibles**: 300, 400, 500, 600, 700, 800, 900
- **Configuration Tailwind**: `fontFamily: { 'sans': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'] }`
- **Letter spacing**: `-0.01em` (défini dans `body`)

### Remplacement
- **Ancienne police**: `'Lugrasimo', cursive`
- **Nouvelle police**: `'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`

## 2. Palette de Couleurs

### Couleurs principales (tailwind.config.js)

#### Primary (Indigo)
- `primary`: `#6366F1` - Indigo moderne
- `primary-light`: `#818CF8` - Indigo clair
- `primary-dark`: `#4F46E5` - Indigo foncé

#### Accent (Rose)
- `accent`: `#EC4899` - Rose moderne
- `accent-light`: `#F472B6` - Rose clair
- `accent-dark`: `#DB2777` - Rose foncé

#### Secondary (Violet)
- `secondary`: `#8B5CF6` - Violet moderne
- `secondary-light`: `#A78BFA` - Violet clair
- `secondary-dark`: `#7C3AED` - Violet foncé

#### Couleurs utilitaires
- `yellow`: `#FCD34D` - Jaune doux (remplace l'ancien `#FEE600`)
- `orange`: `#FB923C` - Orange doux (remplace l'ancien `#FF9300`)
- `red`: `#EF4444` - Rouge moderne

#### Fonds (Slate)
- `darkest`: `#0F172A` - Slate très foncé (remplace `#0D0D0D`)
- `darker`: `#1E293B` - Slate foncé (remplace `#1A1A1A`)
- `dark-gray`: `#334155` - Slate gris (remplace `#2A2A2A`)
- `gray`: `#64748B` - Slate moyen (remplace `#4A4A4A`)
- `light`: `#F1F5F9` - Slate clair (remplace `#FFFFFF` pour certains usages)

### Variables CSS (globals.css)
```css
:root {
  --color-primary: #6366F1;
  --color-primary-light: #818CF8;
  --color-primary-dark: #4F46E5;
  --color-accent: #EC4899;
  --color-accent-light: #F472B6;
  --color-accent-dark: #DB2777;
  --color-secondary: #8B5CF6;
  --color-secondary-light: #A78BFA;
  --color-secondary-dark: #7C3AED;
  --color-yellow: #FCD34D;
  --color-orange: #FB923C;
  --color-red: #EF4444;
  --color-darkest: #0F172A;
  --color-darker: #1E293B;
  --color-dark-gray: #334155;
  --color-gray: #64748B;
  --color-light: #F1F5F9;
}
```

## 3. Mappings de Remplacement des Couleurs

### Remplacements dans les classes Tailwind

#### Anciennes → Nouvelles couleurs
- `orange-dark` → `primary-dark`
- `from-yellow to-orange` → `from-primary to-accent`
- `border-orange-dark` → `border-primary-dark`
- `border-orange-dark/50` → `border-primary-dark/50`
- `hover:border-yellow` → `hover:border-accent`
- `hover:border-yellow/50` → `hover:border-accent/50`
- `text-yellow` → `text-accent`
- `bg-yellow` → `bg-accent`
- `bg-yellow/20` → `bg-accent/20`
- `bg-yellow/30` → `bg-accent/30`
- `border-yellow` → `border-accent`
- `hover:text-yellow` → `hover:text-accent`
- `group-hover:text-yellow` → `group-hover:text-accent`
- `focus:border-yellow` → `focus:border-accent`
- `hover:bg-orange-dark/20` → `hover:bg-primary-dark/20`
- `hover:bg-orange-dark/10` → `hover:bg-primary-dark/10`
- `bg-orange-dark` → `bg-primary-dark`
- `bg-orange-dark/30` → `bg-primary-dark/30`
- `from-orange-dark/20` → `from-primary-dark/20`
- `text-darkest` → `text-white` (pour les boutons avec gradient)
- `bg-orange/30` → `bg-accent/30`
- `bg-orange-light/20` → `bg-secondary/20`
- `hover:border-orange/50` → `hover:border-accent/50`

## 4. Styles CSS Globaux

### Gradient Text
```css
.gradient-text {
  background: linear-gradient(135deg, #6366F1, #8B5CF6, #EC4899, #F472B6, #A78BFA);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  background-size: 200% 200%;
  animation: gradient-shift 5s ease infinite;
}
```

**Ancien gradient**: `linear-gradient(135deg, #FEE600, #FFBB00, #FF9300, #FF5F01, #FF2E33)`
**Nouveau gradient**: `linear-gradient(135deg, #6366F1, #8B5CF6, #EC4899, #F472B6, #A78BFA)`

### Creative Background
```css
.creative-bg {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #0F172A 0%, #1E1B4B 20%, #312E81 40%, #4C1D95 60%, #581C87 80%, #6B21A8 100%);
  background-size: 400% 400%;
  animation: gradient-shift 15s ease infinite;
}

.creative-bg::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
  animation: rotate 20s linear infinite;
}
```

**Ancien background**: `linear-gradient(135deg, #0D0D0D 0%, #FF2E33 15%, #FF5F01 30%, #FF9300 50%, #FFBB00 75%, #FEE600 100%)`
**Nouveau background**: `linear-gradient(135deg, #0F172A 0%, #1E1B4B 20%, #312E81 40%, #4C1D95 60%, #581C87 80%, #6B21A8 100%)`

**Ancien radial gradient**: `rgba(254, 230, 0, 0.2)`
**Nouveau radial gradient**: `rgba(99, 102, 241, 0.15)`

## 5. Couleurs des Configurations de Projet (projectConfig.ts)

### GENRES
```typescript
{ value: 'romance', label: 'Romance', color: '#EC4899' }
{ value: 'drame', label: 'Drame', color: '#EF4444' }
{ value: 'fantasy', label: 'Fantasy', color: '#8B5CF6' }
{ value: 'action', label: 'Action', color: '#F59E0B' }
{ value: 'thriller', label: 'Thriller', color: '#DC2626' }
{ value: 'science-fiction', label: 'Science-fiction', color: '#06B6D4' }
{ value: 'comedie', label: 'Comédie', color: '#FCD34D' }
{ value: 'surnaturel', label: 'Surnaturel', color: '#7C3AED' }
{ value: 'slice-of-life', label: 'Slice of Life', color: '#10B981' }
{ value: 'custom', label: 'Custom', color: '#FFFFFF' }
```

### AMBIANCES
```typescript
{ value: 'lumineuse', label: 'Lumineuse', color: '#FCD34D' }
{ value: 'sombre', label: 'Sombre', color: '#475569' }
{ value: 'mature', label: 'Mature', color: '#92400E' }
{ value: 'enfantine', label: 'Enfantine', color: '#F472B6' }
{ value: 'poetique', label: 'Poétique', color: '#C084FC' }
{ value: 'humoristique', label: 'Humoristique', color: '#FB923C' }
{ value: 'custom', label: 'Custom + IA', color: '#FFFFFF' }
```

### STYLES_GRAPHIQUES
```typescript
{ value: 'webtoon-standard', color: '#EF4444' }
{ value: 'manga-noir-blanc', color: '#1E293B' }
{ value: 'manhwa-semi-realiste', color: '#6366F1' }
{ value: 'cartoon', color: '#EC4899' }
{ value: 'peinture-digitale', color: '#8B5CF6' }
{ value: 'pixel-art', color: '#10B981' }
{ value: 'custom', color: '#FFFFFF' }
```

## 6. Fichiers Modifiés

### Configuration
- `tailwind.config.js` - Palette de couleurs et font family
- `styles/globals.css` - Styles globaux, gradients, animations
- `lib/projectConfig.ts` - Couleurs des genres, ambiances, styles graphiques

### Pages
- `pages/dashboard.tsx`
- `pages/index.tsx`
- `pages/auth/login.tsx`
- `pages/project/new.tsx`
- `pages/project/[id].tsx`
- `pages/project/[id]/character/new.tsx`
- `pages/project/[id]/character/[characterId].tsx`
- `pages/project/[id]/chapter/[chapterId].tsx`

## 7. Classes Tailwind Couramment Utilisées

### Boutons principaux
- `bg-gradient-to-r from-primary to-accent` - Gradient principal pour boutons
- `bg-gradient-to-br from-primary to-accent` - Gradient diagonal pour icônes/avatars

### Bordures
- `border-2 border-primary-dark/50` - Bordure principale des cards
- `hover:border-accent/50` - Bordure au survol
- `focus:border-accent` - Bordure au focus des inputs

### Textes
- `text-accent` - Texte accent (rose)
- `text-primary` - Texte primary (indigo)
- `hover:text-accent` - Texte accent au survol
- `gradient-text` - Texte avec gradient animé

### Fonds
- `bg-darker/90` - Fond des cards avec transparence
- `bg-darkest` - Fond des inputs
- `bg-accent/20` - Fond accent avec transparence
- `bg-primary-dark/10` - Fond primary-dark avec transparence

## 8. Instructions de Réapplication

Pour réappliquer ce design :

1. **Typographie** : Importer Inter depuis Google Fonts dans `globals.css`
2. **Couleurs Tailwind** : Mettre à jour `tailwind.config.js` avec la palette complète
3. **Variables CSS** : Mettre à jour `:root` dans `globals.css`
4. **Gradients** : Mettre à jour `.gradient-text` et `.creative-bg` dans `globals.css`
5. **ProjectConfig** : Mettre à jour les couleurs dans `lib/projectConfig.ts`
6. **Remplacements** : Remplacer toutes les classes selon le mapping section 3 dans tous les fichiers de pages

## 9. Notes Importantes

- Tous les `text-darkest` dans les boutons avec gradient ont été remplacés par `text-white`
- Les couleurs de fond utilisent maintenant la palette Slate au lieu de noirs purs
- Les gradients utilisent maintenant indigo/violet/rose au lieu de jaune/orange/rouge
- La police Inter remplace complètement Lugrasimo
- Les animations restent identiques, seules les couleurs changent

