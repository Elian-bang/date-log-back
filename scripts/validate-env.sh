#!/bin/bash
# scripts/validate-env.sh
# 환경 검증 자동화 스크립트
# Phase 0에서 사용

set -e

echo "🔍 DateLog Backend 환경 검증 시작..."
echo ""

ERRORS=0

# .env 파일 존재 확인
echo -n "Checking .env file... "
if [ -f .env ]; then
  echo "✅ .env file exists"
else
  echo "❌ .env file not found"
  echo "   Run: cp .env.example .env"
  ((ERRORS++))
fi

# DATABASE_URL 환경변수 확인
echo -n "Checking DATABASE_URL... "
if [ -z "$DATABASE_URL" ]; then
  # .env 파일에서 로드 시도
  if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
  fi
fi

if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL not set"
  echo "   Add to .env: DATABASE_URL=postgresql://..."
  ((ERRORS++))
else
  echo "✅ DATABASE_URL is set"

  # DATABASE_URL 형식 검증
  echo -n "Validating DATABASE_URL format... "
  if echo "$DATABASE_URL" | grep -Eq '^postgresql://[^:]+:[^@]+@[^:]+:[0-9]+/[^?]+'; then
    echo "✅ Format is valid"
  else
    echo "⚠️  Format may be incorrect"
    echo "   Expected: postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
  fi
fi

# PostgreSQL 연결 테스트
echo -n "Testing PostgreSQL connection... "
if command -v psql &> /dev/null; then
  if psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; then
    echo "✅ PostgreSQL is reachable"
  else
    echo "❌ PostgreSQL connection failed"
    echo "   Ensure PostgreSQL is running on the specified host/port"
    ((ERRORS++))
  fi
else
  echo "⚠️  psql command not found (skipping connection test)"
  echo "   Install PostgreSQL client to enable connection tests"
fi

# Node.js 버전 확인
echo -n "Checking Node.js version... "
if command -v node &> /dev/null; then
  NODE_VERSION=$(node --version)
  NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')

  if [ "$NODE_MAJOR" -ge 18 ]; then
    echo "✅ Node.js version: $NODE_VERSION"
  else
    echo "⚠️  Node.js version: $NODE_VERSION (v18+ recommended)"
  fi
else
  echo "❌ Node.js not found"
  ((ERRORS++))
fi

# npm 확인
echo -n "Checking npm... "
if command -v npm &> /dev/null; then
  NPM_VERSION=$(npm --version)
  echo "✅ npm version: $NPM_VERSION"
else
  echo "❌ npm not found"
  ((ERRORS++))
fi

# node_modules 확인
echo -n "Checking node_modules... "
if [ -d node_modules ]; then
  echo "✅ node_modules exists"
else
  echo "⚠️  node_modules not found"
  echo "   Running: npm install"
  npm install
  echo "✅ npm install completed"
fi

# Prisma schema 확인
echo -n "Checking Prisma schema... "
if [ -f prisma/schema.prisma ]; then
  echo "✅ prisma/schema.prisma exists"
else
  echo "❌ prisma/schema.prisma not found"
  ((ERRORS++))
fi

# PORT 환경변수 확인 (선택)
echo -n "Checking PORT... "
if [ -z "$PORT" ]; then
  if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
  fi
fi

if [ -z "$PORT" ]; then
  echo "⚠️  PORT not set (will use default)"
else
  echo "✅ PORT is set: $PORT"
fi

# NODE_ENV 확인 (선택)
echo -n "Checking NODE_ENV... "
if [ -z "$NODE_ENV" ]; then
  if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
  fi
fi

if [ -z "$NODE_ENV" ]; then
  echo "⚠️  NODE_ENV not set (will use default)"
else
  echo "✅ NODE_ENV: $NODE_ENV"
fi

# 결과 요약
echo ""
echo "========================================="
if [ $ERRORS -eq 0 ]; then
  echo "✅ All prerequisites met"
  echo "Ready to proceed to Phase 1"
  exit 0
else
  echo "❌ $ERRORS error(s) found"
  echo "Please fix the issues above before proceeding"
  exit 1
fi
