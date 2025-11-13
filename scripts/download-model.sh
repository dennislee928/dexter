#!/bin/bash
# Script to download a model to LocalAI

MODEL_ID=${1:-"phi-3-mini"}
MODEL_URL=${2:-"github:go-skynet/model-gallery/phi-3-mini.yaml"}

echo "Downloading model: $MODEL_ID"
echo "URL: $MODEL_URL"

docker-compose exec -T localai curl -X POST http://localhost:8080/models/apply \
  -H "Content-Type: application/json" \
  -d "{\"id\":\"$MODEL_ID\",\"url\":\"$MODEL_URL\"}"

echo ""
echo "Model download initiated. Check status with:"
echo "  docker-compose exec localai curl http://localhost:8080/models"
echo ""
echo "After download completes, restart LocalAI:"
echo "  docker-compose restart localai"

