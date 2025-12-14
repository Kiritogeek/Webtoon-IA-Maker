// Script de vérification de la compilation
const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification des fichiers critiques...\n');

const filesToCheck = [
  'pages/_app.tsx',
  'pages/index.tsx',
  'pages/_document.tsx',
  'lib/supabase.ts',
  'lib/stores/projectStore.ts',
];

let hasErrors = false;

filesToCheck.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      // Vérifications basiques
      const openBraces = (content.match(/\{/g) || []).length;
      const closeBraces = (content.match(/\}/g) || []).length;
      const openParens = (content.match(/\(/g) || []).length;
      const closeParens = (content.match(/\)/g) || []).length;
      
      if (openBraces !== closeBraces) {
        console.error(`❌ ${file}: Accolades déséquilibrées (${openBraces} ouvertes, ${closeBraces} fermées)`);
        hasErrors = true;
      } else if (openParens !== closeParens) {
        console.error(`❌ ${file}: Parenthèses déséquilibrées (${openParens} ouvertes, ${closeParens} fermées)`);
        hasErrors = true;
      } else {
        console.log(`✅ ${file}: Syntaxe de base OK`);
      }
    } catch (error) {
      console.error(`❌ ${file}: Erreur de lecture - ${error.message}`);
      hasErrors = true;
    }
  } else {
    console.error(`❌ ${file}: Fichier introuvable`);
    hasErrors = true;
  }
});

if (hasErrors) {
  console.log('\n❌ Des erreurs ont été détectées');
  process.exit(1);
} else {
  console.log('\n✅ Tous les fichiers critiques semblent corrects');
  console.log('⚠️  Si le problème persiste, vérifiez les logs du serveur Next.js');
}

