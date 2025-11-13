# PowerShell script to download a model to LocalAI

param(
    [string]$ModelId = "phi-3-mini",
    [string]$ModelUrl = "github:go-skynet/model-gallery/phi-3-mini.yaml"
)

Write-Host "Downloading model: $ModelId" -ForegroundColor Green
Write-Host "URL: $ModelUrl" -ForegroundColor Cyan

$body = "{`"id`":`"$ModelId`",`"url`":`"$ModelUrl`"}"

docker-compose exec -T localai sh -c "curl -X POST http://localhost:8080/models/apply -H 'Content-Type: application/json' -d '$body'"

Write-Host ""
Write-Host "Model download initiated. Check status with:" -ForegroundColor Yellow
Write-Host "  docker-compose exec localai curl http://localhost:8080/models"
Write-Host ""
Write-Host "After download completes, restart LocalAI:" -ForegroundColor Yellow
Write-Host "  docker-compose restart localai"

