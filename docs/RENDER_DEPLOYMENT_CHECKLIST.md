# Render 배포 체크리스트

## 배포 전 준비사항

### 1. 환경 변수 확인

**Staging 환경** (`datelog-backend-staging`):
```env
NODE_ENV=staging
PORT=3001
CORS_ORIGIN=https://datelog-frontend-staging.onrender.com
DATABASE_URL=postgresql://user:pass@dpg-xxx-a.oregon-postgres.render.com:5432/datelog_staging
```

**Production 환경** (`datelog-backend-production`):
```env
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://datelog-frontend-production.onrender.com
DATABASE_URL=postgresql://user:pass@dpg-xxx-a:5432/datelog_prod
```

> **중요**: Production에서는 내부 네트워크 주소 (`dpg-xxx-a:5432`) 사용

### 2. 로컬 빌드 검증

```bash
# TypeScript 컴파일 확인
npm run build

# 모든 테스트 통과 확인
npm test
# Expected: 104 passed, 104 total

# 린트 검사
npm run lint

# 타입 체크
npm run type-check
```

### 3. GitHub에 Push

```bash
# 변경사항 확인
git status
git diff

# 스테이징
git add .

# 커밋
git commit -m "feat: Add nested resource routes and fix all tests

- Add POST /v1/dates/:dateEntryId/cafes|restaurants|spots routes
- Fix Prisma mock to include findFirst method
- All 104 tests now passing
- Add CI/CD workflows for GitHub Actions
- Add Playwright E2E testing setup

🤖 Generated with Claude Code"

# Push
git push origin main
```

## Render 대시보드 설정

### 1. Web Service 생성

1. Render Dashboard → New → Web Service
2. GitHub 저장소 연결
3. 설정:
   - **Name**: `datelog-backend-staging` 또는 `datelog-backend-production`
   - **Environment**: Node
   - **Build Command**: `npm ci && npx prisma generate && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (staging) / Starter (production)

### 2. 환경 변수 설정

Render Dashboard → Environment → Add Environment Variable

| Key | Value (Example) |
|-----|-----------------|
| `NODE_ENV` | `staging` 또는 `production` |
| `PORT` | `3001` |
| `CORS_ORIGIN` | `https://your-frontend.onrender.com` |
| `DATABASE_URL` | `postgresql://...` |

### 3. PostgreSQL 데이터베이스 생성

1. Render Dashboard → New → PostgreSQL
2. 설정:
   - **Name**: `datelog-db-staging` 또는 `datelog-db-production`
   - **PostgreSQL Version**: 15
   - **Instance Type**: Free (staging) / Starter (production)
3. 생성 후 Internal Database URL 복사
4. Web Service 환경 변수에 `DATABASE_URL`로 설정

### 4. 데이터베이스 마이그레이션

첫 배포 후 Render Shell에서:

```bash
npx prisma db push
# 또는
npm run db:migrate:deploy
```

## 배포 후 검증

### 1. 헬스 체크

```bash
curl https://your-backend.onrender.com/v1/health
```

예상 응답:
```json
{
  "status": "ok",
  "timestamp": "2025-11-16T07:00:00.000Z",
  "service": "DateLog API",
  "version": "1.0.0"
}
```

### 2. API 엔드포인트 테스트

```bash
# 날짜 목록 조회
curl https://your-backend.onrender.com/v1/dates

# 식당 목록 조회
curl https://your-backend.onrender.com/v1/restaurants
```

### 3. CORS 검증

프론트엔드에서 API 호출이 정상적으로 동작하는지 확인.

### 4. 로그 모니터링

Render Dashboard → Logs에서 다음 확인:
- 서버 시작 로그
- 요청 처리 로그
- 에러 로그

## GitHub Actions CI/CD

Push 시 자동으로 실행되는 워크플로우:

1. **ci.yml**: 테스트, 린트, 빌드 검증
2. **pr-check.yml**: PR 품질 게이트

### CI 실패 시 조치

1. GitHub Actions 탭에서 실패한 job 확인
2. 로그 분석
3. 로컬에서 수정 후 다시 push

## 문제 해결

### 빌드 실패

```bash
# Prisma client 생성 문제
npm ci && npx prisma generate && npm run build
```

### 데이터베이스 연결 실패

- DATABASE_URL 형식 확인
- 내부/외부 네트워크 주소 확인
- PostgreSQL 서비스 상태 확인

### CORS 오류

- `CORS_ORIGIN` 환경 변수 확인
- 프로토콜(https) 포함 확인
- 트레일링 슬래시 제거

### 메모리 부족

- Free tier는 512MB RAM 제한
- 필요시 인스턴스 업그레이드

## 모니터링 권장사항

1. **Uptime Monitoring**: UptimeRobot 등으로 헬스 체크
2. **Error Tracking**: Sentry 통합 고려
3. **Performance**: Render Metrics 활용
4. **Logs**: 정기적인 로그 검토

## 롤백 절차

문제 발생 시:

1. Render Dashboard → Deploys
2. 이전 성공 배포 선택
3. "Redeploy" 클릭
4. 또는 Git revert 후 push
