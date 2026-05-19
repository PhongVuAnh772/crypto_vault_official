#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="${ROOT_DIR}/crypto-vault-server"

IMAGE_REPO="${IMAGE_REPO:-phongva/cryptovault-backend}"
TAG="${TAG:-latest}"
PLATFORM="${PLATFORM:-linux/amd64}"

echo "==> Building backend image"
echo "    repo: ${IMAGE_REPO}"
echo "    tag:  ${TAG}"
echo "    platform: ${PLATFORM}"

docker build \
  --platform "${PLATFORM}" \
  -t "${IMAGE_REPO}:${TAG}" \
  "${BACKEND_DIR}"

echo "==> Pushing image ${IMAGE_REPO}:${TAG}"
docker push "${IMAGE_REPO}:${TAG}"

echo "==> Done"
