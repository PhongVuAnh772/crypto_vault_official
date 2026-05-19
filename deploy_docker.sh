#!/bin/bash

set -euo pipefail

# --- CONFIGURATION ---
DOCKER_USERNAME="${DOCKER_USERNAME:-phongva}"
BACKEND_IMAGE="${BACKEND_IMAGE:-cryptovault-backend}"
TAG="${TAG:-latest}"
PLATFORM="${PLATFORM:-linux/amd64}"

echo "🚀 Bắt đầu quá trình đẩy Docker Images..."

# 1. Build & Push Backend
echo "📦 Đang build Backend (${PLATFORM})..."
docker build --platform "${PLATFORM}" -t "${DOCKER_USERNAME}/${BACKEND_IMAGE}:${TAG}" ./crypto-vault-server
echo "⬆️ Đang đẩy Backend lên Docker Hub..."
docker push "${DOCKER_USERNAME}/${BACKEND_IMAGE}:${TAG}"

echo "✅ Hoàn tất! Bạn có thể sử dụng các image này để deploy lên server."
echo "   Backend: ${DOCKER_USERNAME}/${BACKEND_IMAGE}:${TAG}"
