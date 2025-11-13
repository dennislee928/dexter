# Test LocalAI chat API
$body = @{
    model = "tinyllama"
    messages = @(
        @{
            role = "user"
            content = "Hello, test message"
        }
    )
    max_tokens = 20
} | ConvertTo-Json -Compress

Write-Host "Testing LocalAI chat API..." -ForegroundColor Cyan
Write-Host "Request body: $body" -ForegroundColor Gray

$response = docker-compose exec -T localai sh -c "echo '$body' | curl -X POST http://localhost:8080/v1/chat/completions -H 'Content-Type: application/json' -d @-"

Write-Host "`nResponse:" -ForegroundColor Green
Write-Host $response

