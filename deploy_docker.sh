#!/bin/bash

# --- CONFIGURATION ---
# Thay thế bằng username Docker Hub của bạn
DOCKER_USERNAME="phongva" 
BACKEND_IMAGE="cryptovault-backend"
ADMIN_IMAGE="cryptovault-admin"
TAG="latest"

echo "🚀 Bắt đầu quá trình đẩy Docker Images..."

# 1. Build & Push Backend
echo "📦 Đang build Backend (AMD64)..."
docker build --platform linux/amd64 -t $DOCKER_USERNAME/$BACKEND_IMAGE:$TAG ./crypto-vault-server
echo "⬆️ Đang đẩy Backend lên Docker Hub..."
docker push $DOCKER_USERNAME/$BACKEND_IMAGE:$TAG

# 2. Build & Push Admin Dashboard
echo "📦 Đang build Admin Dashboard (AMD64)..."
docker build --platform linux/amd64 -t $DOCKER_USERNAME/$ADMIN_IMAGE:$TAG ./admin-dashboard
echo "⬆️ Đang đẩy Admin Dashboard lên Docker Hub..."
docker push $DOCKER_USERNAME/$ADMIN_IMAGE:$TAG

echo "✅ Hoàn tất! Bạn có thể sử dụng các image này để deploy lên server."
echo "   Backend: $DOCKER_USERNAME/$BACKEND_IMAGE:$TAG"
echo "   Admin: $DOCKER_USERNAME/$ADMIN_IMAGE:$TAG"
