# Script pour nettoyer le cache Next.js
Write-Host "🧹 Nettoyage du cache Next.js..." -ForegroundColor Cyan

$nextDir = Join-Path $PSScriptRoot ".next"
if (Test-Path $nextDir) {
    Remove-Item -Path $nextDir -Recurse -Force
    Write-Host "✅ Dossier .next supprimé" -ForegroundColor Green
} else {
    Write-Host "⚠️  Dossier .next introuvable" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Cache nettoyé! Redémarrez le serveur avec: npm run dev" -ForegroundColor Green

