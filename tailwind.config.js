/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#6366F1', // Indigo moderne
        'primary-light': '#818CF8',
        'primary-dark': '#4F46E5',
        'accent': '#EC4899', // Rose moderne
        'accent-light': '#F472B6',
        'accent-dark': '#DB2777',
        'secondary': '#8B5CF6', // Violet moderne
        'secondary-light': '#A78BFA',
        'secondary-dark': '#7C3AED',
        'yellow': '#FCD34D', // Jaune doux
        'orange': '#FB923C', // Orange doux
        'red': '#EF4444',
        'white': '#FFFFFF',
        'white-light': '#F8FAFC',
        'darkest': '#050510', // Très sombre
        'darker': '#0A0A0F', // Sombre
        'dark-gray': '#1A1A1F', // Gris foncé
        'gray': '#64748B', // Slate moyen
        'light': '#F1F5F9', // Slate clair
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
