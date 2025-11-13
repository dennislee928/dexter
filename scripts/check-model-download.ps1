# PowerShell script to check model download progress

Write-Host "檢查模型下載狀態..." -ForegroundColor Cyan

$models = docker-compose exec -T localai ls -lh /models | Select-String "\.gguf"

if ($models) {
    Write-Host "`n已找到模型文件：" -ForegroundColor Green
    $models | ForEach-Object {
        Write-Host "  $_" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n尚未找到模型文件，下載可能仍在進行中..." -ForegroundColor Yellow
}

Write-Host "`n檢查模型列表 API..." -ForegroundColor Cyan
$apiResponse = docker-compose exec -T localai curl -s http://localhost:8080/v1/models
Write-Host $apiResponse -ForegroundColor Green

Write-Host "`n提示：" -ForegroundColor Cyan
Write-Host "  如果模型文件大小為 0 或很小，表示下載尚未完成" -ForegroundColor Yellow
Write-Host "  請等待下載完成後重啟 LocalAI: docker-compose restart localai" -ForegroundColor Yellow

