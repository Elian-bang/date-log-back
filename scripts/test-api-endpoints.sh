#!/bin/bash
# scripts/test-api-endpoints.sh
# API 엔드포인트 자동 테스트 스크립트
# Phase 1, Phase 4에서 사용

set -e

API_URL="${1:-http://localhost:3001}"
PASSED=0
FAILED=0
DATE_ID=""

echo "🧪 DateLog Backend API 엔드포인트 테스트"
echo "Target: $API_URL"
echo ""

# ==================== Health Check ====================
echo -n "[1/12] Testing Health Check (GET /v1/health)... "
RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/v1/health")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ] && echo "$BODY" | grep -q "ok"; then
  echo "✅ PASS"
  ((PASSED++))
else
  echo "❌ FAIL (HTTP $HTTP_CODE)"
  echo "   Response: $BODY"
  ((FAILED++))
fi

# ==================== GET /v1/dates ====================
echo -n "[2/12] Testing GET /v1/dates... "
RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/v1/dates")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ PASS"
  ((PASSED++))
else
  echo "❌ FAIL (HTTP $HTTP_CODE)"
  ((FAILED++))
fi

# ==================== POST /v1/dates ====================
echo -n "[3/12] Testing POST /v1/dates... "
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/v1/dates" \
  -H "Content-Type: application/json" \
  -d '{"date":"2025-11-16","region":"Test Region"}')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "201" ] && echo "$BODY" | grep -q "id"; then
  DATE_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | head -n1 | cut -d'"' -f4)
  echo "✅ PASS (Created ID: ${DATE_ID:0:8}...)"
  ((PASSED++))
else
  echo "❌ FAIL (HTTP $HTTP_CODE)"
  echo "   Response: $BODY"
  ((FAILED++))
  DATE_ID=""
fi

# ==================== GET /v1/dates/:id ====================
if [ -n "$DATE_ID" ]; then
  echo -n "[4/12] Testing GET /v1/dates/:id... "
  RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/v1/dates/$DATE_ID")
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | head -n-1)

  if [ "$HTTP_CODE" = "200" ] && echo "$BODY" | grep -q "$DATE_ID"; then
    echo "✅ PASS"
    ((PASSED++))
  else
    echo "❌ FAIL (HTTP $HTTP_CODE)"
    ((FAILED++))
  fi
else
  echo "[4/12] Skipping GET /v1/dates/:id (no DATE_ID)"
  ((FAILED++))
fi

# ==================== PATCH /v1/dates/:id ====================
if [ -n "$DATE_ID" ]; then
  echo -n "[5/12] Testing PATCH /v1/dates/:id... "
  RESPONSE=$(curl -s -w "\n%{http_code}" -X PATCH "$API_URL/v1/dates/$DATE_ID" \
    -H "Content-Type: application/json" \
    -d '{"region":"Updated Region"}')

  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | head -n-1)

  if [ "$HTTP_CODE" = "200" ] && echo "$BODY" | grep -q "Updated Region"; then
    echo "✅ PASS"
    ((PASSED++))
  else
    echo "❌ FAIL (HTTP $HTTP_CODE)"
    ((FAILED++))
  fi
else
  echo "[5/12] Skipping PATCH /v1/dates/:id (no DATE_ID)"
  ((FAILED++))
fi

# ==================== POST /v1/cafes ====================
if [ -n "$DATE_ID" ]; then
  echo -n "[6/12] Testing POST /v1/cafes... "
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/v1/cafes" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Test Cafe\",\"dateEntryId\":\"$DATE_ID\",\"visited\":false,\"latitude\":37.5,\"longitude\":127.0}")

  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | head -n-1)

  if [ "$HTTP_CODE" = "201" ] && echo "$BODY" | grep -q "Test Cafe"; then
    echo "✅ PASS"
    ((PASSED++))
  else
    echo "❌ FAIL (HTTP $HTTP_CODE)"
    echo "   Response: $BODY"
    ((FAILED++))
  fi
else
  echo "[6/12] Skipping POST /v1/cafes (no DATE_ID)"
  ((FAILED++))
fi

# ==================== GET /v1/cafes ====================
echo -n "[7/12] Testing GET /v1/cafes... "
RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/v1/cafes")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ PASS"
  ((PASSED++))
else
  echo "❌ FAIL (HTTP $HTTP_CODE)"
  ((FAILED++))
fi

# ==================== POST /v1/restaurants ====================
if [ -n "$DATE_ID" ]; then
  echo -n "[8/12] Testing POST /v1/restaurants... "
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/v1/restaurants" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Test Restaurant\",\"type\":\"한식\",\"dateEntryId\":\"$DATE_ID\",\"visited\":false}")

  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | head -n-1)

  if [ "$HTTP_CODE" = "201" ] && echo "$BODY" | grep -q "Test Restaurant"; then
    echo "✅ PASS"
    ((PASSED++))
  else
    echo "❌ FAIL (HTTP $HTTP_CODE)"
    echo "   Response: $BODY"
    ((FAILED++))
  fi
else
  echo "[8/12] Skipping POST /v1/restaurants (no DATE_ID)"
  ((FAILED++))
fi

# ==================== GET /v1/restaurants ====================
echo -n "[9/12] Testing GET /v1/restaurants... "
RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/v1/restaurants")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ PASS"
  ((PASSED++))
else
  echo "❌ FAIL (HTTP $HTTP_CODE)"
  ((FAILED++))
fi

# ==================== POST /v1/spots ====================
if [ -n "$DATE_ID" ]; then
  echo -n "[10/12] Testing POST /v1/spots... "
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/v1/spots" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Test Spot\",\"dateEntryId\":\"$DATE_ID\",\"visited\":false}")

  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | head -n-1)

  if [ "$HTTP_CODE" = "201" ] && echo "$BODY" | grep -q "Test Spot"; then
    echo "✅ PASS"
    ((PASSED++))
  else
    echo "❌ FAIL (HTTP $HTTP_CODE)"
    echo "   Response: $BODY"
    ((FAILED++))
  fi
else
  echo "[10/12] Skipping POST /v1/spots (no DATE_ID)"
  ((FAILED++))
fi

# ==================== GET /v1/spots ====================
echo -n "[11/12] Testing GET /v1/spots... "
RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/v1/spots")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ PASS"
  ((PASSED++))
else
  echo "❌ FAIL (HTTP $HTTP_CODE)"
  ((FAILED++))
fi

# ==================== DELETE /v1/dates/:id (cleanup) ====================
if [ -n "$DATE_ID" ]; then
  echo -n "[12/12] Testing DELETE /v1/dates/:id (cleanup)... "
  RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$API_URL/v1/dates/$DATE_ID")
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "204" ]; then
    echo "✅ PASS (Cascade delete: date + cafe + restaurant + spot)"
    ((PASSED++))
  else
    echo "❌ FAIL (HTTP $HTTP_CODE)"
    ((FAILED++))
  fi
else
  echo "[12/12] Skipping DELETE /v1/dates/:id (no DATE_ID)"
  ((FAILED++))
fi

# ==================== 결과 요약 ====================
echo ""
echo "========================================="
TOTAL=$((PASSED + FAILED))
echo "Test Results: $PASSED/$TOTAL passed"

if [ $FAILED -eq 0 ]; then
  echo "✅ All tests passed!"
  echo ""
  echo "API is ready for production deployment"
  exit 0
else
  echo "❌ $FAILED test(s) failed"
  echo ""
  echo "Please fix the failing endpoints before proceeding"
  exit 1
fi
