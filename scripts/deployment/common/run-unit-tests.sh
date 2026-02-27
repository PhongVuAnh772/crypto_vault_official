#!/bin/bash

set -e

PROJECT_DIR=${1:-$(pwd)}
cd "$PROJECT_DIR"

echo "=================================="
echo "Step 2 - Unit Tests"
echo "=================================="

# Detect package manager
if [ -f "yarn.lock" ]; then
  PKG_MANAGER="yarn"
elif [ -f "pnpm-lock.yaml" ]; then
  PKG_MANAGER="pnpm"
else
  PKG_MANAGER="npm"
fi

echo "Using package manager: $PKG_MANAGER"

# Install deps (safe for CI)
if [ "$PKG_MANAGER" = "yarn" ]; then
  yarn install --frozen-lockfile
elif [ "$PKG_MANAGER" = "pnpm" ]; then
  pnpm install --frozen-lockfile
else
  npm ci
fi

echo "Running Jest tests..."

if [ "$PKG_MANAGER" = "yarn" ]; then
  yarn test --ci --coverage
else
  npm test -- --ci --coverage
fi

echo "✓ Unit tests passed"