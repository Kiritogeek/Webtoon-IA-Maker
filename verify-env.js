// Script de vérification des variables d'environnement
// Usage: node verify-env.js

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification de la configuration .env.local\n');

const envPath = path.join(__dirname, '.env.local');

// Vérifier si le fichier existe
if (!fs.existsSync(envPath)) {
  console.error('❌ Le fichier .env.local n\'existe pas!');
  console.error('   Créez-le à la racine du projet avec:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co');
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_ici');
  process.exit(1);
}

// Lire le fichier
const content = fs.readFileSync(envPath, 'utf8');
const lines = content.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));

console.log('📄 Contenu du fichier .env.local:');
lines.forEach((line, index) => {
  console.log(`   ${index + 1}. ${line}`);
});
console.log('');

// Parser les variables
const envVars = {};
lines.forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    envVars[key] = value;
  }
});

// Vérifier les variables requises
const requiredVars = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];
let hasErrors = false;

requiredVars.forEach(varName => {
  if (!envVars[varName]) {
    console.error(`❌ Variable manquante: ${varName}`);
    hasErrors = true;
  } else {
    const value = envVars[varName];
    
    // Vérifier les valeurs placeholder
    if (value.includes('votre-projet') || value.includes('placeholder') || value.includes('your-project')) {
      console.error(`❌ ${varName} contient encore des valeurs PLACEHOLDER!`);
      console.error(`   Valeur actuelle: ${value}`);
      console.error(`   Vous devez remplacer par votre vraie valeur Supabase`);
      hasErrors = true;
    } else if (varName === 'NEXT_PUBLIC_SUPABASE_URL') {
      // Vérifier le format de l'URL
      try {
        const url = new URL(value);
        if (!url.hostname.includes('.supabase.co')) {
          console.warn(`⚠️  ${varName} ne semble pas être une URL Supabase valide`);
          console.warn(`   Valeur: ${value}`);
        } else {
          console.log(`✅ ${varName} semble correct`);
          console.log(`   Valeur: ${value.substring(0, 40)}...`);
        }
      } catch (e) {
        console.error(`❌ ${varName} n'est pas une URL valide: ${value}`);
        hasErrors = true;
      }
    } else if (varName === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') {
      // Vérifier le format de la clé (doit commencer par eyJ)
      if (value.startsWith('eyJ')) {
        console.log(`✅ ${varName} semble correct`);
        console.log(`   Longueur: ${value.length} caractères`);
        console.log(`   Début: ${value.substring(0, 20)}...`);
      } else {
        console.warn(`⚠️  ${varName} ne semble pas être une clé JWT valide`);
        console.warn(`   Les clés Supabase commencent généralement par "eyJ"`);
        console.warn(`   Valeur actuelle commence par: ${value.substring(0, 10)}...`);
      }
    }
  }
});

console.log('');

if (hasErrors) {
  console.error('❌ Des erreurs ont été détectées. Veuillez corriger le fichier .env.local');
  console.error('');
  console.error('📝 Instructions:');
  console.error('   1. Ouvrez .env.local');
  console.error('   2. Remplacez les valeurs placeholder par vos vraies clés Supabase');
  console.error('   3. Trouvez vos clés dans Supabase: Settings → API');
  console.error('   4. Redémarrez le serveur (npm run dev)');
  process.exit(1);
} else {
  console.log('✅ Le fichier .env.local semble correct!');
  console.log('');
  console.log('⚠️  IMPORTANT: Si vous venez de modifier .env.local,');
  console.log('   vous DEVEZ redémarrer le serveur Next.js:');
  console.log('   1. Arrêtez le serveur (Ctrl+C)');
  console.log('   2. Relancez: npm run dev');
}

