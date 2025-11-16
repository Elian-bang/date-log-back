# DateLog Backend 배포 워크플로우

**프로젝트**: date-log-server
**생성일**: 2025-11-16
**기반 문서**: NEXT_STEPS.md
**워크플로우 타입**: Production Deployment (Systematic)

---

## 📊 워크플로우 개요

### 전체 구조
```
Phase 0 (사전 준비) → Phase 1 (로컬 환경) → Phase 2 (Render 배포) → Phase 3 (Production DB) → Phase 4 (검증)
     15-30분              1-1.5시간             45분-1시간            1-1.5시간           30-45분
```

**총 예상 시간**: 3.5-5시간
**Critical Path**: 순차 실행 필수 (각 Phase는 이전 Phase 완료 후 진행)
**자동화 수준**: 70% (스크립트 제공)
**안전 수준**: Production-ready (백업, 롤백, 검증 게이트 포함)

### Phase별 요약

| Phase | 목표 | 소요 시간 | 자동화 | 위험도 |
|-------|------|-----------|---------|--------|
| Phase 0 | 환경 준비 및 검증 | 15-30분 | 90% | 🟢 Low |
| Phase 1 | 로컬 DB + API 테스트 | 1-1.5시간 | 80% | 🟢 Low |
| Phase 2 | Render 서비스 배포 | 45분-1시간 | 50% | 🟡 Medium |
| Phase 3 | Production DB 마이그레이션 | 1-1.5시간 | 60% | 🔴 High |
| Phase 4 | 배포 검증 및 모니터링 | 30-45분 | 85% | 🟡 Medium |

### 검증 게이트 (Quality Gates)

각 Phase 완료 시 다음 게이트를 통과해야 다음 Phase 진입 가능:

- **Gate 0**: 환경 설정 완전성 (DATABASE_URL, PostgreSQL 연결)
- **Gate 1**: 로컬 테스트 전체 통과 (API + 빌드 + Lint)
- **Gate 2**: Render 배포 성공 (빌드 + Health Check)
- **Gate 3**: Production DB 백업 완료 (롤백 준비)
- **Gate 4**: Production 검증 완료 (API + CORS + 모니터링)

---

## 📋 Phase 0: 사전 준비 및 환경 검증

### 🎯 목표
- 로컬 개발 환경 설정 완료
- 환경변수 및 데이터베이스 연결 검증
- 자동화 스크립트 준비

### ✅ 선행조건
- [ ] Git 레포지토리 클론 완료
- [ ] Node.js v18+ 설치
- [ ] npm 패키지 설치 완료 (`npm install`)
- [ ] PostgreSQL 설치 또는 Docker 사용 가능

### 🔧 실행 단계

#### Step 0.1: 환경변수 파일 생성

```bash
# .env 파일 생성 (템플릿 기반)
cp .env.example .env

# .env 파일 편집
# 필수 환경변수:
# DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
# PORT=3001
# NODE_ENV=development
```

**DATABASE_URL 형식 검증**:
```bash
# 올바른 형식 예시
postgresql://datelog:datelog_dev@localhost:5432/datelog_dev

# Prisma 연결 풀링 파라미터 (Production용)
postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20
```

#### Step 0.2: PostgreSQL 데이터베이스 준비

**옵션 A: Docker 사용 (권장)**
```bash
# Docker Compose 사용
docker-compose up -d

# 또는 Docker 직접 실행
docker run --name datelog-postgres \
  -e POSTGRES_USER=datelog \
  -e POSTGRES_PASSWORD=datelog_dev \
  -e POSTGRES_DB=datelog_dev \
  -p 5432:5432 \
  -d postgres:15-alpine

# 컨테이너 상태 확인
docker ps | grep datelog-postgres
```

**옵션 B: 로컬 PostgreSQL**
```bash
# 데이터베이스 생성
createdb datelog_dev

# 연결 테스트
psql -d datelog_dev -c "SELECT version();"
```

#### Step 0.3: 환경 검증 (자동화)

```bash
# 자동화 스크립트 실행
chmod +x scripts/validate-env.sh
./scripts/validate-env.sh

# 예상 출력:
# ✅ .env file exists
# ✅ DATABASE_URL is set
# ✅ PostgreSQL is reachable
# ✅ Node.js version: v18.x.x
# ✅ All prerequisites met
```

**스크립트 실패 시**: 출력된 오류 메시지 확인 후 해당 항목 수정

### 🚦 검증 게이트 (Gate 0)

**통과 조건**:
- [x] `.env` 파일 존재 및 필수 변수 설정
- [x] `DATABASE_URL` 형식 올바름
- [x] PostgreSQL 연결 성공 (포트 5432 응답)
- [x] Node.js 버전 18+ 확인
- [x] npm 패키지 설치 완료

**검증 명령어**:
```bash
# 자동 검증
./scripts/validate-env.sh

# 수동 검증
echo $DATABASE_URL
psql $DATABASE_URL -c "SELECT 1"
node --version
```

### 📦 산출물
- [x] `.env` 파일 (DATABASE_URL 포함)
- [x] PostgreSQL 데이터베이스 실행 중
- [x] 환경 검증 통과 로그

### 🔄 롤백 절차
**실패 시 조치**:
1. `.env` 파일 오류 → 형식 재확인, 예제 참조
2. PostgreSQL 연결 실패 → Docker 재시작 또는 포트 충돌 확인
3. Node.js 버전 오류 → nvm으로 버전 전환

**복구 명령어**:
```bash
# Docker 재시작
docker restart datelog-postgres

# .env 재생성
rm .env && cp .env.example .env
```

### ⏱️ 예상 시간
**최소**: 15분 (Docker 사용, 오류 없음)
**최대**: 30분 (수동 설정, 문제 해결 포함)

---

## 📋 Phase 1: 로컬 개발 환경 구축

### 🎯 목표
- Prisma 마이그레이션 실행
- 로컬 API 서버 테스트
- 코드 품질 검증

### ✅ 선행조건
- [x] Gate 0 통과 (환경 설정 완료)
- [x] PostgreSQL 실행 중
- [x] DATABASE_URL 설정 완료

### 🔧 실행 단계

#### Step 1.1: Prisma 마이그레이션 실행

```bash
# Prisma Client 생성
npx prisma generate

# 예상 출력:
# ✔ Generated Prisma Client (x.x.x) to ./node_modules/@prisma/client

# 마이그레이션 생성 및 적용
npx prisma migrate dev --name init

# 예상 출력:
# Applying migration `20251116000000_init`
# ✔ Generated Prisma Client
#
# Database synchronized with schema

# 마이그레이션 상태 확인
npx prisma migrate status
```

**⚠️ 마이그레이션 실패 시**:
```bash
# 오류 확인
cat .env | grep DATABASE_URL

# Prisma Client 강제 재생성
npx prisma generate --force

# 데이터베이스 리셋 (개발 환경 전용)
npx prisma migrate reset --force
```

#### Step 1.2: 데이터베이스 스키마 검증

```bash
# Prisma Studio로 시각적 확인
npx prisma studio
# 브라우저에서 http://localhost:5555 열림

# 또는 psql로 확인
psql $DATABASE_URL

# SQL 쿼리
\dt                        # 테이블 목록
SELECT * FROM date_entries; # 데이터 확인 (빈 테이블)
```

**기대 결과**:
- `date_entries` 테이블 생성
- `cafes` 테이블 생성
- `restaurants` 테이블 생성
- `spots` 테이블 생성
- 각 테이블에 필수 컬럼 및 인덱스 존재

#### Step 1.3: 로컬 서버 실행 및 테스트

```bash
# 개발 서버 시작 (새 터미널)
npm run dev

# 예상 출력:
# 🚀 Server running on port 3001
# 📚 API Docs: http://localhost:3001/v1/docs
```

**병렬 테스트 (별도 터미널)**:

```bash
# Health Check 테스트
curl http://localhost:3001/v1/health

# 예상 응답:
# {"status":"ok","timestamp":"2025-11-16T..."}

# API 엔드포인트 자동 테스트
chmod +x scripts/test-api-endpoints.sh
./scripts/test-api-endpoints.sh http://localhost:3001

# 예상 출력:
# ✅ Health Check: PASS
# ✅ GET /v1/dates: PASS
# ✅ POST /v1/dates: PASS
# ✅ GET /v1/cafes: PASS
# ✅ All tests passed: 12/12
```

#### Step 1.4: 코드 품질 검증 (병렬 실행 가능)

```bash
# TypeScript 컴파일 확인
npm run build

# ESLint 검증
npm run lint

# Prettier 포맷 확인
npm run format

# 모든 검증 한 번에 (병렬)
npm run build & npm run lint & npm run format
wait
```

**기대 결과**:
- `dist/` 디렉토리 생성 (빌드 산출물)
- Lint 오류 0개
- 포맷 오류 0개

### 🚦 검증 게이트 (Gate 1)

**통과 조건**:
- [x] Prisma 마이그레이션 성공
- [x] 4개 테이블 생성 확인 (date_entries, cafes, restaurants, spots)
- [x] 서버 시작 성공 (에러 로그 없음)
- [x] Health Check 200 OK 응답
- [x] 모든 CRUD 엔드포인트 테스트 통과
- [x] TypeScript 빌드 성공 (`dist/` 생성)
- [x] ESLint 오류 0개
- [x] Prettier 검증 통과

**검증 명령어**:
```bash
# 자동 검증 (스크립트)
./scripts/test-api-endpoints.sh http://localhost:3001

# 수동 검증
npm run build && npm run lint
curl http://localhost:3001/v1/health
psql $DATABASE_URL -c "\dt"
```

### 📦 산출물
- [x] Prisma 마이그레이션 파일 (`prisma/migrations/`)
- [x] 로컬 데이터베이스 스키마
- [x] 빌드 산출물 (`dist/`)
- [x] API 테스트 결과 로그

### 🔄 롤백 절차
**실패 시 조치**:

1. **마이그레이션 실패**:
```bash
# 마이그레이션 리셋
npx prisma migrate reset --force

# 다시 시도
npx prisma migrate dev --name init
```

2. **서버 시작 실패**:
```bash
# 로그 확인
npm run dev 2>&1 | tee server-error.log

# 포트 충돌 확인
netstat -ano | findstr :3001

# 포트 변경 (.env)
PORT=3002
```

3. **테스트 실패**:
```bash
# 특정 엔드포인트 디버깅
curl -v http://localhost:3001/v1/dates

# 데이터베이스 연결 확인
psql $DATABASE_URL -c "SELECT 1"
```

4. **빌드 실패 (TypeScript)**:
```bash
# 타입 검사 상세 로그
npm run type-check 2>&1 | tee build-errors.log

# Prisma Client 재생성
npx prisma generate

# node_modules 재설치
rm -rf node_modules dist
npm install
```

### ⏱️ 예상 시간
**최소**: 1시간 (모든 테스트 통과)
**최대**: 1.5시간 (문제 해결 포함)

---

## 📋 Phase 2: Render Web Service 배포

### 🎯 목표
- Render에 Web Service 생성
- 환경변수 설정
- 첫 배포 성공 및 검증

### ✅ 선행조건
- [x] Gate 1 통과 (로컬 테스트 성공)
- [x] GitHub 레포지토리 push 완료
- [x] Render 계정 준비 (https://render.com)

### 🔧 실행 단계

#### Step 2.1: Render 계정 준비

1. https://render.com 접속
2. 로그인 또는 회원가입
3. GitHub 계정 연동 확인

#### Step 2.2: Web Service 생성 (방법 1: Blueprint - 권장)

```bash
# Render CLI 설치 (선택)
npm install -g render-cli

# Blueprint로 자동 배포
render blueprint launch

# render.yaml을 읽어서 자동으로 서비스 생성
# 서비스 이름: datelog-backend-production
# 환경: production
```

**Blueprint 사용 시 자동 설정**:
- Build Command: `npm ci && npx prisma generate && npm run build`
- Start Command: `npm start`
- Node 버전: 18.x
- Health Check Path: `/v1/health`

#### Step 2.3: Web Service 생성 (방법 2: 수동)

**Render Dashboard에서**:

1. **New → Web Service** 클릭
2. **GitHub 레포지토리 선택**: `date-log-server`
3. **기본 설정**:
   - Name: `datelog-backend-production`
   - Region: `Oregon (US West)`
   - Branch: `main`
   - Runtime: `Node`
   - Build Command: `npm ci && npx prisma generate && npm run build`
   - Start Command: `npm start`

4. **Plan 선택**:
   - Free (테스트용) - **제한: Cold start, 15분 유휴 시 sleep**
   - Starter ($7/month, 권장) - **항상 실행, 512MB RAM**

#### Step 2.4: 환경변수 설정 (중요)

**Render Dashboard → Environment**:

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=<Render PostgreSQL Internal URL>
CORS_ORIGIN=https://your-frontend-url.onrender.com
```

**DATABASE_URL 가져오기**:
1. Render Dashboard → PostgreSQL 데이터베이스 선택
2. **Internal Database URL** 복사 (형식: `postgresql://user:pass@dpg-xxx:5432/db`)
3. Environment에 붙여넣기

**⚠️ 중요 보안 설정**:
```env
# ❌ 절대 금지 (프로덕션)
CORS_ORIGIN=*

# ✅ 올바른 설정
CORS_ORIGIN=https://datelog-frontend-production.onrender.com

# 다중 도메인 (쉼표 구분)
CORS_ORIGIN=https://app.datelog.com,https://admin.datelog.com
```

#### Step 2.5: 첫 배포 시작

**자동 배포**:
1. 환경변수 저장 후 자동 배포 시작
2. Render Dashboard → Logs에서 실시간 확인

**예상 빌드 로그**:
```
==> Installing dependencies...
==> Running 'npm ci'
==> Running 'npx prisma generate'
✔ Generated Prisma Client
==> Running 'npm run build'
==> Build successful
==> Starting server with 'npm start'
🚀 Server running on port 3001
```

**배포 시간**: 5-10분 (첫 배포)

#### Step 2.6: Health Check 설정

**Render Dashboard → Settings → Health Check**:
- Health Check Path: `/v1/health`
- Health Check Interval: 30초
- Grace Period: 60초

### 🚦 검증 게이트 (Gate 2)

**통과 조건**:
- [x] Render 빌드 성공 (로그에 "Build successful")
- [x] 서버 시작 성공 ("Server running")
- [x] Health Check 응답 성공 (30초 내)
- [x] 환경변수 전체 설정 확인
- [x] CORS_ORIGIN에 wildcard(*) 없음

**검증 명령어**:
```bash
# Render 서비스 URL 확인 (Dashboard에서 복사)
RENDER_URL="https://datelog-backend-production.onrender.com"

# Health Check 테스트
curl $RENDER_URL/v1/health

# 예상 응답:
# {"status":"ok","timestamp":"..."}

# CORS 설정 검증
curl -H "Origin: https://malicious.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS $RENDER_URL/v1/dates

# 예상: CORS error (403 또는 거부)
```

### 📦 산출물
- [x] Render Web Service URL
- [x] 배포 로그 (성공 확인)
- [x] Health Check 응답 성공

### 🔄 롤백 절차
**실패 시 조치**:

1. **빌드 실패 - "Prisma not found"**:
```bash
# render.yaml 또는 Dashboard 확인
buildCommand: npm ci && npx prisma generate && npm run build
```

2. **서버 시작 실패**:
```bash
# Render Logs 확인
# 일반적 원인:
# - DATABASE_URL 미설정
# - PORT 불일치 (3001 확인)
# - Prisma Client 생성 누락
```

3. **Health Check 실패**:
```bash
# Health Check Path 확인: /v1/health (정확히)
# Grace Period 늘리기: 60초 → 120초

# 수동 테스트
curl https://your-service.onrender.com/v1/health
```

4. **환경변수 오류**:
```bash
# Render Dashboard → Environment 재확인
# DATABASE_URL 형식: postgresql://...
# Internal URL 사용 (External 아님)
```

**롤백 방법**:
```bash
# Render Dashboard → Deploys → 이전 배포 선택 → Redeploy
# 또는 Git 기반 롤백
git revert HEAD
git push origin main  # 자동 재배포
```

### ⏱️ 예상 시간
**최소**: 45분 (Blueprint 사용, 오류 없음)
**최대**: 1시간 (수동 설정, 문제 해결)

---

## 📋 Phase 3: Production 데이터베이스 마이그레이션

### 🎯 목표
- Production DB 백업 (안전 장치)
- Prisma 마이그레이션 배포
- 스키마 검증

### ✅ 선행조건
- [x] Gate 2 통과 (Render 배포 성공)
- [x] Render PostgreSQL 데이터베이스 생성 완료
- [x] DATABASE_URL 환경변수 설정 완료

### 🚨 안전 경고
**🔴 CRITICAL: 이 단계는 프로덕션 데이터베이스를 변경합니다**
- 반드시 백업 완료 후 진행
- Staging 환경에서 사전 테스트 권장
- 롤백 절차 숙지 필수

### 🔧 실행 단계

#### Step 3.0: 프로덕션 마이그레이션 전 필수 안전 조치 (NEW)

**백업 생성 (필수)**:

```bash
# 방법 1: Render Dashboard 백업
# Render Dashboard → PostgreSQL → Backups → Create Manual Backup
# 백업 이름: "pre-migration-20251116"
# 예상 시간: 5-10분

# 방법 2: pg_dump로 로컬 백업
# Render에서 External Database URL 복사
PROD_DB_URL="postgresql://..."

pg_dump $PROD_DB_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 백업 파일 확인
ls -lh backup_*.sql
# 예상: backup_20251116_143022.sql (수 KB ~ 수 MB)
```

**백업 검증**:
```bash
# 백업 파일 내용 확인
head -n 20 backup_*.sql

# 예상 내용:
# -- PostgreSQL database dump
# -- Dumped from database version 15.x
# CREATE TABLE ...

# 백업 파일 다운로드 (안전 보관)
# Render Dashboard → Backups → Download
```

**✅ 안전 체크리스트**:
- [ ] 수동 백업 생성 완료
- [ ] 백업 파일 다운로드 확인 (로컬 저장)
- [ ] 마이그레이션 파일 검토 완료 (`prisma/migrations/`)
- [ ] Staging 환경 마이그레이션 사전 테스트 (있는 경우)

#### Step 3.1: Render Shell에서 마이그레이션 실행

**Render Dashboard → Shell**:

```bash
# Prisma 마이그레이션 배포
npx prisma migrate deploy

# 예상 출력:
# Applying migration `20251116000000_init`
# The following migration(s) have been applied:
#
# migrations/
#   └─ 20251116000000_init/
#       └─ migration.sql
#
# ✔ Database migration completed

# 마이그레이션 상태 확인
npx prisma migrate status

# 예상:
# Status: All migrations have been applied
```

#### Step 3.2: 로컬에서 원격 DB로 마이그레이션 (대안)

```bash
# 로컬 터미널에서 실행
# Render External Database URL 사용
DATABASE_URL="postgresql://..." npx prisma migrate deploy

# 또는 환경변수 파일 사용
echo "DATABASE_URL=postgresql://..." > .env.prod
export $(cat .env.prod | xargs)
npx prisma migrate deploy
```

**⚠️ 주의**: External URL은 인터넷을 통한 연결이므로 보안에 유의

#### Step 3.3: 데이터베이스 스키마 검증

```bash
# Prisma Studio로 원격 DB 확인 (로컬에서)
DATABASE_URL="postgresql://..." npx prisma studio

# 또는 Render Dashboard → PostgreSQL → Connect
# psql 명령어로 접속

# SQL 쿼리로 검증
\dt                        # 테이블 목록
\d date_entries            # 테이블 스키마 상세
SELECT COUNT(*) FROM date_entries;  # 레코드 수 확인
```

**기대 결과**:
- `date_entries` 테이블 생성
- `cafes` 테이블 생성
- `restaurants` 테이블 생성 (`type` 컬럼 포함)
- `spots` 테이블 생성
- 모든 인덱스 생성 확인 (`dateEntryId`, `visited`)

#### Step 3.4: 연결 풀링 최적화 (Production 설정)

**DATABASE_URL 파라미터 추가** (Render Environment):

```env
# 기본 URL
postgresql://user:pass@dpg-xxx:5432/db

# 연결 풀링 최적화 추가
postgresql://user:pass@dpg-xxx:5432/db?connection_limit=10&pool_timeout=20&connect_timeout=10
```

**Render Free Tier 제한**:
- 최대 동시 연결: 10개
- 권장 `connection_limit`: 5 (안전 마진)

**Starter Tier**:
- 최대 동시 연결: 40개
- 권장 `connection_limit`: 10

### 🚦 검증 게이트 (Gate 3)

**통과 조건**:
- [x] 데이터베이스 백업 완료 (수동 백업 + 다운로드)
- [x] 마이그레이션 실행 성공 (에러 없음)
- [x] 4개 테이블 생성 확인
- [x] 인덱스 생성 확인
- [x] Render 서버 재시작 성공 (마이그레이션 후)

**검증 명령어**:
```bash
# 마이그레이션 상태
DATABASE_URL="..." npx prisma migrate status

# 테이블 확인
psql $DATABASE_URL -c "\dt"

# API 연결 테스트 (마이그레이션 후 서버 재시작 확인)
curl https://your-service.onrender.com/v1/health
```

### 📦 산출물
- [x] 데이터베이스 백업 파일 (`backup_*.sql`)
- [x] Production DB 스키마 (4개 테이블)
- [x] 마이그레이션 로그 (성공 확인)

### 🔄 롤백 절차
**마이그레이션 실패 시**:

1. **즉시 백업 복원**:
```bash
# Render Dashboard → PostgreSQL → Backups → Restore
# 백업 선택: "pre-migration-20251116"

# 또는 pg_dump 파일로 복원
psql $DATABASE_URL < backup_20251116_143022.sql
```

2. **마이그레이션 상태 리셋**:
```bash
# 실패한 마이그레이션 롤백
npx prisma migrate resolve --rolled-back [migration_name]

# 예시
npx prisma migrate resolve --rolled-back 20251116000000_init
```

3. **부분 적용 마이그레이션 처리**:
```bash
# 마이그레이션 상태 확인
npx prisma migrate status

# "Failed" 상태 마이그레이션이 있다면
# 수동으로 SQL 수정 후 다시 시도
# 또는 데이터베이스 리셋 (데이터 손실 주의)
```

4. **롤백 후 재시도**:
```bash
# 백업 복원 후
# 마이그레이션 파일 검토 및 수정
# 다시 배포 시도
npx prisma migrate deploy
```

### ⏱️ 예상 시간
**최소**: 1시간 (백업 포함, 오류 없음)
**최대**: 1.5시간 (백업 검증, 문제 해결)

---

## 📋 Phase 4: 배포 검증 및 모니터링

### 🎯 목표
- Production API 전체 검증
- CORS 설정 확인
- 모니터링 및 알림 설정

### ✅ 선행조건
- [x] Gate 3 통과 (Production DB 마이그레이션 성공)
- [x] Render 서비스 실행 중
- [x] Health Check 정상 응답

### 🔧 실행 단계

#### Step 4.1: Health Check 검증

```bash
# Render 서비스 URL
RENDER_URL="https://datelog-backend-production.onrender.com"

# Health Check 테스트
curl $RENDER_URL/v1/health

# 예상 응답:
# {"status":"ok","timestamp":"2025-11-16T14:30:22.123Z"}

# Health Check 자동 모니터링 시작
chmod +x scripts/health-check-loop.sh
./scripts/health-check-loop.sh $RENDER_URL
```

**자동 Health Check 스크립트 출력**:
```
2025-11-16 14:30:22 - ✅ Health Check: OK (Response time: 123ms)
2025-11-16 14:30:52 - ✅ Health Check: OK (Response time: 115ms)
2025-11-16 14:31:22 - ✅ Health Check: OK (Response time: 109ms)
```

#### Step 4.2: API 엔드포인트 전체 테스트

```bash
# 자동화 테스트 스크립트 실행
./scripts/test-api-endpoints.sh $RENDER_URL

# 예상 출력:
# ✅ Health Check: PASS
# ✅ GET /v1/dates: PASS
# ✅ POST /v1/dates: PASS (Created dateEntry: {...})
# ✅ GET /v1/dates/:id: PASS
# ✅ PATCH /v1/dates/:id: PASS
# ✅ DELETE /v1/dates/:id: PASS
# ✅ GET /v1/cafes: PASS
# ✅ POST /v1/cafes: PASS
# ✅ GET /v1/restaurants: PASS
# ✅ POST /v1/restaurants: PASS
# ✅ GET /v1/spots: PASS
# ✅ POST /v1/spots: PASS
#
# All tests passed: 12/12
```

**수동 테스트 (필요 시)**:

```bash
# Date Entry 생성 테스트
curl -X POST $RENDER_URL/v1/dates \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-11-16",
    "region": "테스트 지역"
  }'

# 응답 예시:
# {
#   "id": "uuid-here",
#   "date": "2025-11-16T00:00:00.000Z",
#   "region": "테스트 지역",
#   "createdAt": "...",
#   "updatedAt": "..."
# }

# Date Entry 조회
curl $RENDER_URL/v1/dates

# Cafe 생성 (dateEntryId는 위에서 생성된 ID 사용)
curl -X POST $RENDER_URL/v1/cafes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "테스트 카페",
    "dateEntryId": "uuid-here",
    "visited": false,
    "latitude": 37.6789,
    "longitude": 126.9123
  }'
```

#### Step 4.3: CORS 설정 검증 (보안 필수)

```bash
# CORS 설정 확인 (환경변수)
# Render Dashboard → Environment → CORS_ORIGIN 값 확인

# ❌ 반드시 확인: wildcard 아님
# CORS_ORIGIN=*  (절대 금지)

# ✅ 올바른 설정:
# CORS_ORIGIN=https://datelog-frontend-production.onrender.com

# CORS 테스트 (악의적 Origin)
curl -H "Origin: https://malicious.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS $RENDER_URL/v1/dates

# 예상 결과: CORS error 또는 403 Forbidden

# CORS 테스트 (허용된 Origin)
curl -H "Origin: https://datelog-frontend-production.onrender.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS $RENDER_URL/v1/dates

# 예상 결과: 200 OK, Access-Control-Allow-Origin 헤더 존재
```

**Frontend 배포 후 통합 테스트**:
1. Frontend에서 API 호출 테스트
2. 브라우저 개발자 도구에서 CORS 에러 확인
3. Network 탭에서 `Access-Control-Allow-Origin` 헤더 확인

#### Step 4.4: 모니터링 설정

**Render 기본 모니터링**:

1. **Render Dashboard → Metrics**:
   - CPU 사용량 추적 (목표: <70%)
   - 메모리 사용량 (Free Tier: <512MB)
   - 응답 시간 모니터링 (목표: <200ms)
   - 에러율 추적 (목표: <0.1%)

2. **알림 설정** (Render Dashboard → Settings → Notifications):
```yaml
Health check failures: Email + Slack (선택)
High CPU usage (>80%): Email
Deployment failures: Email + Slack
```

**외부 Uptime 모니터링** (권장):

**UptimeRobot 설정** (무료):
1. https://uptimerobot.com 가입
2. New Monitor 생성:
   - Monitor Type: HTTP(s)
   - URL: `https://datelog-backend-production.onrender.com/v1/health`
   - Monitoring Interval: 5분
   - Alert Contacts: Email

**Better Uptime** (대안):
1. https://betteruptime.com 가입
2. 모니터 생성 (동일 설정)
3. Slack 통합 (선택)

#### Step 4.5: 로그 모니터링

**Render Logs 확인**:

```bash
# Render Dashboard → Logs → Live Logs

# 또는 Render CLI
render logs -s datelog-backend-production --tail

# 중요 로그 패턴:
# ✅ "Server running on port 3001" → 정상 시작
# ❌ "ECONNREFUSED" → DB 연결 실패
# ❌ "Prisma Client not generated" → 빌드 문제
# ⚠️  "Slow query: 1234ms" → 성능 이슈
```

**로그 레벨 설정** (선택):
```env
# .env 또는 Render Environment
LOG_LEVEL=info    # production 권장
LOG_LEVEL=debug   # 문제 해결 시
```

### 🚦 검증 게이트 (Gate 4)

**통과 조건**:
- [x] Health Check 응답 성공 (30초 내)
- [x] 모든 API 엔드포인트 테스트 통과 (12/12)
- [x] CORS 설정 정확 (wildcard 아님)
- [x] 모니터링 설정 완료 (Render Metrics + Uptime)
- [x] 로그에 Critical 오류 없음
- [x] Frontend 통합 테스트 성공 (있는 경우)

**검증 명령어**:
```bash
# 자동 검증
./scripts/test-api-endpoints.sh $RENDER_URL

# Health Check 모니터링
./scripts/health-check-loop.sh $RENDER_URL

# CORS 확인
curl -H "Origin: https://malicious.com" -X OPTIONS $RENDER_URL/v1/dates
```

### 📦 산출물
- [x] API 테스트 결과 (12/12 통과)
- [x] CORS 검증 보고서
- [x] 모니터링 대시보드 설정 완료
- [x] Uptime 모니터 활성화

### 🔄 롤백 절차
**배포 후 문제 발생 시**:

1. **즉시 이전 배포로 롤백**:
```bash
# Render Dashboard → Deploys → 이전 배포 선택 → Redeploy
# 예상 시간: 5-10분

# 또는 Git 기반 롤백
git revert HEAD
git push origin main  # 자동 재배포
```

2. **API 실패 원인 분석**:
```bash
# Render Logs 확인
# 일반적 원인:
# 1. DATABASE_URL 오류 → 환경변수 재확인
# 2. CORS 설정 오류 → CORS_ORIGIN 수정
# 3. Prisma Client 오류 → 재빌드
```

3. **데이터베이스 롤백** (필요 시):
```bash
# Phase 3 백업으로 복원
# Render Dashboard → PostgreSQL → Backups → Restore
```

4. **긴급 대응 절차**:
```yaml
즉시 조치:
  - Render 서비스 재시작
  - 이전 배포로 롤백
  - 로그 확인 및 원인 분석

복구 후:
  - 문제 원인 문서화
  - 수정 후 재배포
  - 모니터링 강화
```

### ⏱️ 예상 시간
**최소**: 30분 (자동 테스트, 오류 없음)
**최대**: 45분 (수동 검증, 모니터링 설정)

---

## 🔧 자동화 스크립트

### scripts/validate-env.sh

환경변수 및 사전 조건 검증 스크립트 (Phase 0)

```bash
#!/bin/bash
# scripts/validate-env.sh
# 환경 검증 자동화

set -e

echo "🔍 환경 검증 시작..."

# .env 파일 존재 확인
if [ -f .env ]; then
  echo "✅ .env file exists"
else
  echo "❌ .env file not found"
  exit 1
fi

# DATABASE_URL 설정 확인
if [ -z "$DATABASE_URL" ]; then
  source .env
fi

if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL not set"
  exit 1
else
  echo "✅ DATABASE_URL is set"
fi

# PostgreSQL 연결 테스트
if psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; then
  echo "✅ PostgreSQL is reachable"
else
  echo "❌ PostgreSQL connection failed"
  exit 1
fi

# Node.js 버전 확인
NODE_VERSION=$(node --version)
echo "✅ Node.js version: $NODE_VERSION"

# npm 패키지 설치 확인
if [ -d node_modules ]; then
  echo "✅ node_modules exists"
else
  echo "⚠️  node_modules not found, running npm install..."
  npm install
fi

echo ""
echo "✅ All prerequisites met"
echo "Ready to proceed to Phase 1"
```

### scripts/test-api-endpoints.sh

API 엔드포인트 자동 테스트 스크립트 (Phase 1, 4)

```bash
#!/bin/bash
# scripts/test-api-endpoints.sh
# API 엔드포인트 자동 테스트

API_URL="${1:-http://localhost:3001}"
PASSED=0
FAILED=0

echo "🧪 API 엔드포인트 테스트 시작: $API_URL"
echo ""

# Health Check
echo -n "Testing Health Check... "
if curl -s "$API_URL/v1/health" | grep -q "ok"; then
  echo "✅ PASS"
  ((PASSED++))
else
  echo "❌ FAIL"
  ((FAILED++))
fi

# GET /v1/dates
echo -n "Testing GET /v1/dates... "
if curl -s "$API_URL/v1/dates" > /dev/null; then
  echo "✅ PASS"
  ((PASSED++))
else
  echo "❌ FAIL"
  ((FAILED++))
fi

# POST /v1/dates
echo -n "Testing POST /v1/dates... "
DATE_RESPONSE=$(curl -s -X POST "$API_URL/v1/dates" \
  -H "Content-Type: application/json" \
  -d '{"date":"2025-11-16","region":"Test Region"}')

if echo "$DATE_RESPONSE" | grep -q "id"; then
  DATE_ID=$(echo "$DATE_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
  echo "✅ PASS (ID: ${DATE_ID:0:8}...)"
  ((PASSED++))
else
  echo "❌ FAIL"
  ((FAILED++))
  DATE_ID=""
fi

# GET /v1/dates/:id
if [ -n "$DATE_ID" ]; then
  echo -n "Testing GET /v1/dates/:id... "
  if curl -s "$API_URL/v1/dates/$DATE_ID" | grep -q "$DATE_ID"; then
    echo "✅ PASS"
    ((PASSED++))
  else
    echo "❌ FAIL"
    ((FAILED++))
  fi
fi

# PATCH /v1/dates/:id
if [ -n "$DATE_ID" ]; then
  echo -n "Testing PATCH /v1/dates/:id... "
  if curl -s -X PATCH "$API_URL/v1/dates/$DATE_ID" \
    -H "Content-Type: application/json" \
    -d '{"region":"Updated Region"}' | grep -q "Updated Region"; then
    echo "✅ PASS"
    ((PASSED++))
  else
    echo "❌ FAIL"
    ((FAILED++))
  fi
fi

# POST /v1/cafes
if [ -n "$DATE_ID" ]; then
  echo -n "Testing POST /v1/cafes... "
  if curl -s -X POST "$API_URL/v1/cafes" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Test Cafe\",\"dateEntryId\":\"$DATE_ID\",\"visited\":false,\"latitude\":37.5,\"longitude\":127.0}" \
    | grep -q "Test Cafe"; then
    echo "✅ PASS"
    ((PASSED++))
  else
    echo "❌ FAIL"
    ((FAILED++))
  fi
fi

# GET /v1/cafes
echo -n "Testing GET /v1/cafes... "
if curl -s "$API_URL/v1/cafes" > /dev/null; then
  echo "✅ PASS"
  ((PASSED++))
else
  echo "❌ FAIL"
  ((FAILED++))
fi

# POST /v1/restaurants
if [ -n "$DATE_ID" ]; then
  echo -n "Testing POST /v1/restaurants... "
  if curl -s -X POST "$API_URL/v1/restaurants" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Test Restaurant\",\"type\":\"한식\",\"dateEntryId\":\"$DATE_ID\",\"visited\":false}" \
    | grep -q "Test Restaurant"; then
    echo "✅ PASS"
    ((PASSED++))
  else
    echo "❌ FAIL"
    ((FAILED++))
  fi
fi

# GET /v1/restaurants
echo -n "Testing GET /v1/restaurants... "
if curl -s "$API_URL/v1/restaurants" > /dev/null; then
  echo "✅ PASS"
  ((PASSED++))
else
  echo "❌ FAIL"
  ((FAILED++))
fi

# POST /v1/spots
if [ -n "$DATE_ID" ]; then
  echo -n "Testing POST /v1/spots... "
  if curl -s -X POST "$API_URL/v1/spots" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Test Spot\",\"dateEntryId\":\"$DATE_ID\",\"visited\":false}" \
    | grep -q "Test Spot"; then
    echo "✅ PASS"
    ((PASSED++))
  else
    echo "❌ FAIL"
    ((FAILED++))
  fi
fi

# GET /v1/spots
echo -n "Testing GET /v1/spots... "
if curl -s "$API_URL/v1/spots" > /dev/null; then
  echo "✅ PASS"
  ((PASSED++))
else
  echo "❌ FAIL"
  ((FAILED++))
fi

# DELETE /v1/dates/:id (cleanup)
if [ -n "$DATE_ID" ]; then
  echo -n "Testing DELETE /v1/dates/:id (cleanup)... "
  if curl -s -X DELETE "$API_URL/v1/dates/$DATE_ID" > /dev/null; then
    echo "✅ PASS"
    ((PASSED++))
  else
    echo "❌ FAIL"
    ((FAILED++))
  fi
fi

# 결과 요약
echo ""
echo "========================================="
TOTAL=$((PASSED + FAILED))
echo "Test Results: $PASSED/$TOTAL passed"

if [ $FAILED -eq 0 ]; then
  echo "✅ All tests passed!"
  exit 0
else
  echo "❌ $FAILED test(s) failed"
  exit 1
fi
```

### scripts/health-check-loop.sh

배포 후 Health Check 모니터링 스크립트 (Phase 4)

```bash
#!/bin/bash
# scripts/health-check-loop.sh
# Health Check 지속 모니터링

API_URL="${1:-http://localhost:3001}"
INTERVAL="${2:-30}"  # 기본 30초

echo "🔍 Health Check 모니터링 시작: $API_URL"
echo "Interval: ${INTERVAL}s (Ctrl+C to stop)"
echo ""

while true; do
  TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

  START=$(date +%s%3N)
  RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/v1/health")
  END=$(date +%s%3N)

  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | head -n-1)
  DURATION=$((END - START))

  if [ "$HTTP_CODE" = "200" ]; then
    echo "$TIMESTAMP - ✅ Health Check: OK (Response time: ${DURATION}ms)"
  else
    echo "$TIMESTAMP - ❌ Health Check: FAIL (HTTP $HTTP_CODE)"
    echo "Response: $BODY"
  fi

  sleep "$INTERVAL"
done
```

### scripts/backup-db.sh

데이터베이스 백업 자동화 스크립트 (Phase 3)

```bash
#!/bin/bash
# scripts/backup-db.sh
# 데이터베이스 백업 자동화

set -e

DATABASE_URL="${1:-$DATABASE_URL}"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

echo "🗄️  데이터베이스 백업 시작..."

# 백업 디렉토리 생성
mkdir -p "$BACKUP_DIR"

# pg_dump 실행
echo "Backing up to: $BACKUP_FILE"
pg_dump "$DATABASE_URL" > "$BACKUP_FILE"

# 백업 파일 크기 확인
BACKUP_SIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
echo "✅ Backup completed: $BACKUP_FILE ($BACKUP_SIZE)"

# 백업 검증
if head -n 5 "$BACKUP_FILE" | grep -q "PostgreSQL database dump"; then
  echo "✅ Backup file validated"
else
  echo "❌ Backup file validation failed"
  exit 1
fi

# 오래된 백업 삭제 (7일 이상)
echo "Cleaning up old backups (>7 days)..."
find "$BACKUP_DIR" -name "backup_*.sql" -mtime +7 -delete

echo ""
echo "✅ Backup process completed successfully"
echo "Backup location: $BACKUP_FILE"
```

---

## 🚨 롤백 플레이북

### 전체 배포 롤백 절차

**시나리오**: Production 배포 후 Critical 오류 발생

```bash
# 1. 즉시 이전 버전으로 롤백
# Render Dashboard → Deploys → 이전 배포 → Redeploy

# 2. 또는 Git 롤백
git revert HEAD
git push origin main  # 자동 재배포 트리거

# 3. 데이터베이스 롤백 (필요 시)
# Render Dashboard → PostgreSQL → Backups → Restore
# 백업 선택: "pre-migration-YYYYMMDD"

# 4. 롤백 검증
curl https://your-service.onrender.com/v1/health

# 5. 로그 확인 및 원인 분석
# Render Dashboard → Logs
```

### Phase별 롤백 매트릭스

| Phase | 롤백 트리거 | 복구 시간 | 데이터 손실 위험 | 절차 |
|-------|-------------|-----------|------------------|------|
| Phase 0 | 환경 검증 실패 | <5분 | 없음 | .env 재설정, DB 재시작 |
| Phase 1 | 로컬 테스트 실패 | <10분 | 없음 | 코드 수정, 마이그레이션 리셋 |
| Phase 2 | Render 배포 실패 | 5-10분 | 없음 | 이전 배포로 롤백 |
| Phase 3 | DB 마이그레이션 실패 | 10-20분 | 🔴 있음 | 백업 복원 필수 |
| Phase 4 | API 검증 실패 | 5-10분 | 없음 | 이전 배포 + 설정 수정 |

### 긴급 대응 연락망 (템플릿)

```yaml
배포 담당자:
  - 이름: [Your Name]
  - 연락처: [Phone]
  - Slack: @username

Render 계정:
  - Email: [Render Account Email]
  - 2FA: [Recovery Codes 위치]

외부 서비스:
  - Uptime 모니터: [UptimeRobot 계정]
  - 데이터베이스 백업: [백업 저장 위치]

롤백 권한:
  - Git: [GitHub 권한자]
  - Render: [Render 계정 소유자]
  - Database: [DB 관리자]
```

---

## 📈 진행률 추적 체크리스트

### Phase 0: 사전 준비
- [ ] `.env` 파일 생성 및 설정
- [ ] PostgreSQL 실행 (Docker 또는 로컬)
- [ ] `./scripts/validate-env.sh` 실행 성공
- [ ] Gate 0 통과

### Phase 1: 로컬 환경
- [ ] `npx prisma generate` 성공
- [ ] `npx prisma migrate dev` 성공
- [ ] 4개 테이블 생성 확인
- [ ] `npm run dev` 서버 시작 성공
- [ ] Health Check 응답 (200 OK)
- [ ] `./scripts/test-api-endpoints.sh` 전체 통과
- [ ] `npm run build` 성공
- [ ] `npm run lint` 오류 0개
- [ ] Gate 1 통과

### Phase 2: Render 배포
- [ ] Render 계정 준비
- [ ] Web Service 생성 (Blueprint 또는 수동)
- [ ] 환경변수 설정 (DATABASE_URL, CORS_ORIGIN)
- [ ] 첫 배포 성공 (빌드 로그 확인)
- [ ] Health Check Path 설정 (`/v1/health`)
- [ ] Health Check 응답 성공
- [ ] CORS_ORIGIN wildcard 없음 확인
- [ ] Gate 2 통과

### Phase 3: Production DB
- [ ] **필수**: 데이터베이스 백업 생성
- [ ] **필수**: 백업 파일 다운로드 확인
- [ ] `npx prisma migrate deploy` 성공
- [ ] 4개 테이블 생성 확인
- [ ] 인덱스 생성 확인
- [ ] 연결 풀링 파라미터 추가
- [ ] Render 서버 재시작 성공
- [ ] Gate 3 통과

### Phase 4: 검증 및 모니터링
- [ ] Health Check 자동 모니터링 시작
- [ ] `./scripts/test-api-endpoints.sh` Production 테스트 통과
- [ ] CORS 설정 검증 완료
- [ ] Render Metrics 확인
- [ ] Uptime 모니터 설정 (UptimeRobot 등)
- [ ] 로그 모니터링 정상
- [ ] Frontend 통합 테스트 성공 (있는 경우)
- [ ] Gate 4 통과

### 배포 완료
- [ ] 모든 Phase 완료
- [ ] 모든 Gate 통과
- [ ] Production API 정상 작동
- [ ] 모니터링 활성화
- [ ] 배포 문서 업데이트 (날짜, 버전)

---

## 📚 참고 문서

- **기반 문서**: `NEXT_STEPS.md`
- **프로젝트 가이드**: `CLAUDE.md`
- **API 명세**: `IMPLEMENTATION_ROADMAP.md`
- **Prisma 문서**: https://www.prisma.io/docs
- **Render 문서**: https://render.com/docs
- **Express.js 가이드**: https://expressjs.com/
- **TypeScript 핸드북**: https://www.typescriptlang.org/docs/

---

## 💡 성공 요인 및 주의사항

### ✅ 성공 요인
1. **체계적 접근**: 각 Phase를 순차적으로 완료, 검증 게이트 준수
2. **자동화 활용**: 제공된 스크립트로 반복 작업 최소화
3. **안전 우선**: 백업, 롤백 절차 준수로 위험 완화
4. **모니터링**: 배포 후 지속적 감시로 조기 문제 발견

### ⚠️ 주의사항
1. **백업 필수**: Phase 3 전 데이터베이스 백업 절대 스킵 금지
2. **CORS 보안**: wildcard(*) 설정 절대 금지, Frontend URL 명시
3. **환경변수**: Production과 Development 환경 분리, DATABASE_URL 보안 관리
4. **롤백 준비**: 각 Phase별 롤백 절차 숙지, 긴급 시 즉시 실행

### 🎯 다음 단계 (배포 후)
1. Frontend와 통합 테스트
2. 부하 테스트 및 성능 최적화
3. 자동화된 백업 스케줄링
4. CI/CD 파이프라인 구축 (GitHub Actions)
5. 로그 집계 및 분석 도구 도입 (예: LogDNA, Papertrail)

---

**마지막 업데이트**: 2025-11-16
**워크플로우 버전**: 1.0
**적용 대상**: date-log-server (Production 배포)
