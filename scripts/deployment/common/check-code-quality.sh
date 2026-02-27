#!/bin/bash

# Check code quality for React Native project
# Usage: check-code-quality.sh [PROJECT_DIR]

set -e

PROJECT_DIR=${1:-$(pwd)}

cd "$PROJECT_DIR"

echo "=================================="
echo "Step 1 - Code Quality Check"
echo "Project directory: $PROJECT_DIR"
echo "=================================="

# -----------------------------
# Detect package manager
# -----------------------------
if [ -f "yarn.lock" ]; then
  PKG_MANAGER="yarn"
elif [ -f "pnpm-lock.yaml" ]; then
  PKG_MANAGER="pnpm"
else
  PKG_MANAGER="npm"
fi

echo "Using package manager: $PKG_MANAGER"

# -----------------------------
# Install dependencies
# -----------------------------
echo "Installing dependencies..."

if [ "$PKG_MANAGER" = "yarn" ]; then
  yarn install --frozen-lockfile
elif [ "$PKG_MANAGER" = "pnpm" ]; then
  pnpm install --frozen-lockfile
else
  npm ci
fi

echo "✓ Dependencies installed"

# -----------------------------
# TypeScript check (if exists)
# -----------------------------
if [ -f "tsconfig.json" ]; then
  echo "Running TypeScript check..."

  npx tsc --noEmit || {
    echo "ERROR: TypeScript type check failed"
    exit 1
  }

  echo "✓ TypeScript check passed"
fi

# -----------------------------
# ESLint
# -----------------------------
if [ -f ".eslintrc.js" ] || [ -f ".eslintrc.json" ]; then
  echo "Running ESLint..."

  npx eslint . --ext .js,.jsx,.ts,.tsx || {
    echo "ERROR: ESLint failed"
    exit 1
  }

  echo "✓ ESLint passed"
else
  echo "No ESLint config found, skipping..."
fi

# -----------------------------
# Prettier format check
# -----------------------------
if [ -f ".prettierrc" ] || [ -f "prettier.config.js" ]; then
  echo "Checking code formatting..."

  npx prettier . --check || {
    echo "ERROR: Formatting issues found."
    echo "Run: npx prettier . --write"
    exit 1
  }

  echo "✓ Formatting check passed"
fi

# -----------------------------
# Metro / RN lint sanity check
# -----------------------------
echo "Running React Native doctor..."

if npx react-native --version >/dev/null 2>&1; then
  npx react-native doctor || true
fi

echo "=================================="
echo "✓ Code quality check passed"
echo "=================================="