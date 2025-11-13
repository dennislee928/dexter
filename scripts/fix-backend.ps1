# Fix backend configuration - change from llama-cpp to llama
Write-Host "修復後端配置..." -ForegroundColor Cyan

Write-Host "`n更新 tinyllama.yaml..." -ForegroundColor Yellow
docker-compose exec -T localai sh -c 'cat > /models/tinyllama.yaml << EOF
name: tinyllama
backend: llama
parameters:
  model: tinyllama.gguf
  context_size: 2048
  f16: true
  threads: 4
  stopwords:
    - "</s>"
    - "<|endoftext|>"
EOF'

Write-Host "更新 phi-3-mini.yaml..." -ForegroundColor Yellow
docker-compose exec -T localai sh -c 'cat > /models/phi-3-mini.yaml << EOF
name: phi-3-mini
backend: llama
parameters:
  model: phi-3-mini.gguf
  context_size: 4096
  f16: true
  threads: 4
  stopwords:
    - "<|end|>"
    - "<|endoftext|>"
    - "<|user|>"
    - "<|assistant|>"
EOF'

Write-Host "`n重啟 LocalAI..." -ForegroundColor Cyan
docker-compose restart localai

Write-Host "`n等待服務啟動（10秒）..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "`n檢查模型列表..." -ForegroundColor Cyan
docker-compose exec localai curl -s http://localhost:8080/v1/models

Write-Host "`n`n完成！後端已從 'llama-cpp' 改為 'llama'。" -ForegroundColor Green
Write-Host "請在前端測試聊天功能。" -ForegroundColor Green

