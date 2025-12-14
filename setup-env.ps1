# Script PowerShell pour configurer .env.local
# Usage: .\setup-env.ps1

Write-Host "🔧 Configuration de .env.local pour Supabase" -ForegroundColor Cyan
Write-Host ""

$envPath = Join-Path $PSScriptRoot ".env.local"

# Demander les valeurs à l'utilisateur
Write-Host "Veuillez entrer vos clés Supabase:" -ForegroundColor Yellow
Write-Host "(Trouvez-les dans Supabase: Settings → API)" -ForegroundColor Gray
Write-Host ""

$supabaseUrl = Read-Host "NEXT_PUBLIC_SUPABASE_URL (ex: https://xxxxx.supabase.co)"
$supabaseKey = Read-Host "NEXT_PUBLIC_SUPABASE_ANON_KEY"

# Validation basique
if ($supabaseUrl -match "votre-projet|placeholder|your-project") {
    Write-Host "❌ Erreur: L'URL contient encore des valeurs placeholder!" -ForegroundColor Red
    exit 1
}

if ($supabaseKey -match "votre_cle|placeholder|your_key") {
    Write-Host "❌ Erreur: La clé contient encore des valeurs placeholder!" -ForegroundColor Red
    exit 1
}

# Créer le contenu du fichier
$content = @"
NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl
NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabaseKey
"@

# Écrire le fichier
try {
    $content | Out-File -FilePath $envPath -Encoding utf8 -NoNewline
    Write-Host ""
    Write-Host "✅ Fichier .env.local créé avec succès!" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Redémarrez le serveur Next.js maintenant!" -ForegroundColor Yellow
    Write-Host "   1. Arrêtez le serveur (Ctrl+C)" -ForegroundColor Gray
    Write-Host "   2. Relancez: npm run dev" -ForegroundColor Gray
} catch {
    Write-Host "❌ Erreur lors de la création du fichier: $_" -ForegroundColor Red
    exit 1
}

