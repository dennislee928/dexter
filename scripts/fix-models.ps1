# Fix model configurations with backend
Write-Host "更新模型配置..." -ForegroundColor Cyan

# Update tinyllama.yaml
docker-compose exec -T localai sh -c @'
cat > /models/tinyllama.yaml << "EOF"
name: tinyllama
backend: llama-cpp
parameters:
  model: tinyllama.gguf
  context_size: 2048
  f16: true
  threads: 4
  stopwords:
    - "</s>"
    - "<|endoftext|>"
EOF
'@

# Update phi-3-mini.yaml
docker-compose exec -T localai sh -c @'
cat > /models/phi-3-mini.yaml << "EOF"
name: phi-3-mini
backend: llama-cpp
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
EOF
'@

Write-Host "`n重啟 LocalAI..." -ForegroundColor Cyan
docker-compose restart localai

Write-Host "`n等待服務啟動..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "`n檢查模型列表..." -ForegroundColor Cyan
docker-compose exec localai curl -s http://localhost:8080/v1/models

Write-Host "`n完成！請在前端測試聊天功能。" -ForegroundColor Green

