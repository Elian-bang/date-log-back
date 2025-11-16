#!/bin/bash
# scripts/health-check-loop.sh
# Health Check 지속 모니터링 스크립트
# Phase 4에서 사용 (배포 후 자동 모니터링)

API_URL="${1:-http://localhost:3001}"
INTERVAL="${2:-30}"  # 기본 30초
MAX_FAILURES="${3:-5}"  # 연속 실패 5회 시 경고

echo "🔍 DateLog Backend Health Check 모니터링"
echo "Target: $API_URL/v1/health"
echo "Interval: ${INTERVAL}s"
echo "Max consecutive failures: $MAX_FAILURES"
echo ""
echo "Press Ctrl+C to stop monitoring"
echo "========================================="
echo ""

CONSECUTIVE_FAILURES=0

while true; do
  TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

  # 응답 시간 측정
  START=$(date +%s%N)
  RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/v1/health" 2>/dev/null)
  END=$(date +%s%N)

  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | head -n-1)

  # 밀리초 단위 응답 시간 계산
  DURATION=$(( (END - START) / 1000000 ))

  # Health Check 결과 확인
  if [ "$HTTP_CODE" = "200" ] && echo "$BODY" | grep -q "ok"; then
    # 성공
    echo "$TIMESTAMP - ✅ Health Check: OK (Response time: ${DURATION}ms)"
    CONSECUTIVE_FAILURES=0

    # 응답 시간 경고 (500ms 이상)
    if [ $DURATION -gt 500 ]; then
      echo "              ⚠️  Slow response detected (>${DURATION}ms)"
    fi
  else
    # 실패
    ((CONSECUTIVE_FAILURES++))
    echo "$TIMESTAMP - ❌ Health Check: FAIL (HTTP $HTTP_CODE, Failures: $CONSECUTIVE_FAILURES/$MAX_FAILURES)"

    # 응답 본문 출력 (디버깅용)
    if [ -n "$BODY" ]; then
      echo "              Response: $BODY"
    else
      echo "              No response (connection timeout or refused)"
    fi

    # 연속 실패 임계값 초과 시 경고
    if [ $CONSECUTIVE_FAILURES -ge $MAX_FAILURES ]; then
      echo ""
      echo "🚨 CRITICAL: $MAX_FAILURES consecutive failures detected!"
      echo "   Possible causes:"
      echo "   - Server crashed or stopped"
      echo "   - Database connection lost"
      echo "   - Network issue"
      echo ""
      echo "   Recommended actions:"
      echo "   1. Check Render logs (Dashboard → Logs)"
      echo "   2. Verify database connection"
      echo "   3. Check server status (Render Dashboard → Service)"
      echo ""
    fi
  fi

  sleep "$INTERVAL"
done
