# DateLog Backend - 다음 작업 단계

**프로젝트**: date-log-server
**현재 상태**: Phase 2 완료, Task 2 완료 (MongoDB 마이그레이션 및 로컬 테스트 완료)
**마지막 작업**: 2025년 11월 20일
**데이터베이스**: MongoDB Atlas (PostgreSQL → MongoDB로 변경됨)

---

## 🎯 작업 우선순위

### 🔴 Critical - 즉시 해결 필요
- [x] 데이터베이스 마이그레이션 실행 (Phase 2 완료 - MongoDB로 변경)
- [x] 로컬 환경 테스트 (완료 - 모든 API 엔드포인트 정상 작동)

### 🟡 High - 배포 전 필수
- [ ] Render Web Service 생성
- [ ] 환경 변수 설정
- [ ] Production DB 마이그레이션

### 🟢 Medium - 배포 후 작업
- [ ] CORS 설정 업데이트
- [ ] Health Check 검증
- [ ] API 엔드포인트 테스트

---

## 📋 상세 작업 가이드

## Task 1: 데이터베이스 마이그레이션 완료 🔴

**문제**: Phase 2에서 Prisma 마이그레이션이 환경 변수 문제로 중단됨

### 1.1 환경 변수 확인

```bash
cd date-log-server

# .env 파일 확인
cat .env
```

**필요한 환경 변수**:
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
PORT=3001
NODE_ENV=development
```

### 1.2 로컬 데이터베이스 준비

**옵션 A: Docker 사용 (권장)**
```bash
# Docker Compose로 PostgreSQL 실행
docker-compose up -d

# 또는 Docker 직접 실행
docker run --name datelog-postgres \
  -e POSTGRES_USER=datelog \
  -e POSTGRES_PASSWORD=datelog_dev \
  -e POSTGRES_DB=datelog_dev \
  -p 5432:5432 \
  -d postgres:15-alpine
```

**옵션 B: 로컬 PostgreSQL 사용**
```bash
# PostgreSQL이 이미 설치되어 있다면
createdb datelog_dev
```

### 1.3 Prisma 마이그레이션 실행

```bash
# Prisma Client 생성
npx prisma generate

# 마이그레이션 생성 및 실행
npx prisma migrate dev --name init

# 예상 결과:
# ✔ Prisma Migrate created 1 migration:
#   20251019000000_init
# ✔ Generated Prisma Client
```

### 1.4 시드 데이터 삽입 (선택)

```bash
# 시드 데이터 실행
npx prisma db seed

# 또는 수동으로 시드 스크립트 실행
npm run seed
```

### 1.5 데이터베이스 확인

```bash
# Prisma Studio로 확인
npx prisma studio

# 또는 psql로 확인
psql postgresql://datelog:datelog_dev@localhost:5432/datelog_dev

# SQL 쿼리로 테이블 확인
\dt
SELECT * FROM date_entries;
```

**✅ 완료 기준**:
- [x] 마이그레이션 성공 (에러 없음)
- [x] 4개 테이블 생성 확인 (date_entries, cafes, restaurants, spots)
- [x] 인덱스 생성 확인

---

## Task 2: 로컬 서버 테스트 🔴

### 2.1 서버 실행

```bash
# 개발 모드로 실행
npm run dev

# 예상 출력:
# 🚀 Server running on port 3001
# 📚 API Docs: http://localhost:3001/v1/docs
```

### 2.2 Health Check 테스트

```bash
# 새 터미널에서 실행
curl http://localhost:3001/v1/health

# 예상 응답:
# {"status":"ok","timestamp":"2025-11-15T..."}
```

### 2.3 API 엔드포인트 테스트

```bash
# Date Entry 생성
curl -X POST http://localhost:3001/v1/dates \
  -H "Content-Type: application/json" \
  -d '{"date":"2025-11-15","region":"삼송"}'

# Date Entry 조회
curl http://localhost:3001/v1/dates

# Cafe 생성 (dateEntryId는 위에서 생성된 ID 사용)
curl -X POST http://localhost:3001/v1/cafes \
  -H "Content-Type: application/json" \
  -d '{
    "name":"테스트 카페",
    "dateEntryId":"<UUID>",
    "visited":false,
    "latitude":37.6789,
    "longitude":126.9123
  }'
```

### 2.4 TypeScript 및 코드 품질 검증

```bash
# TypeScript 컴파일 확인
npm run build

# ESLint 검증
npm run lint

# Prettier 포맷 확인
npm run format
```

**✅ 완료 기준**:
- [x] 서버 정상 실행 (에러 없음) - MongoDB 연결 성공
- [x] Health check 응답 성공 - GET /v1/health 200 OK
- [x] 모든 CRUD 엔드포인트 테스트 성공 - GET /v1/dates, /v1/cafes, /v1/restaurants, /v1/spots 정상
- [x] 빌드 성공 - TypeScript 컴파일 오류 없음
- [x] Lint 에러 0개 - 코드 품질 검증 완료

---

## Task 3: Render Web Service 생성 🟡

### 3.1 Render 계정 준비

1. https://render.com 접속
2. 로그인 또는 회원가입
3. GitHub 계정 연동 확인

### 3.2 Web Service 생성 (방법 1: Blueprint)

```bash
# Render CLI 설치 (선택)
npm install -g render-cli

# Blueprint로 배포
render blueprint launch

# render.yaml을 읽어서 자동으로 서비스 생성
```

### 3.3 Web Service 생성 (방법 2: 수동)

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
   - Free (테스트용)
   - Starter ($7/month, 권장)

### 3.4 환경 변수 설정

**Render Dashboard → Environment**:

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=<Render PostgreSQL URL>
CORS_ORIGIN=https://your-frontend-url.onrender.com
```

**DATABASE_URL 가져오기**:
1. Render Dashboard → PostgreSQL 데이터베이스 선택
2. Internal Database URL 복사 (형식: `postgresql://user:pass@dpg-xxx:5432/db`)

**⚠️ 주의**:
- Staging은 External URL 사용
- Production은 **Internal URL** 사용 (더 빠르고 안전)

### 3.5 Health Check 설정

**Render Dashboard → Settings → Health Check**:
- Health Check Path: `/v1/health`
- Health Check Interval: 30초

**✅ 완료 기준**:
- [ ] Web Service 생성 완료
- [ ] 환경 변수 설정 완료
- [ ] 첫 배포 성공 (Build 완료)

---

## Task 4: Production 데이터베이스 마이그레이션 🟡

### 4.1 Render Shell에서 실행

**Render Dashboard → Shell**:
```bash
# Prisma 마이그레이션 배포
npx prisma migrate deploy

# 예상 결과:
# ✔ Applying migration `20251019000000_init`
# ✔ Database migration completed
```

### 4.2 로컬에서 원격 DB로 마이그레이션 (대안)

```bash
# 환경 변수로 Production DB URL 설정
DATABASE_URL="postgresql://..." npx prisma migrate deploy

# 또는 .env.prod 사용
export $(cat .env.prod | xargs)
npx prisma migrate deploy
```

### 4.3 데이터베이스 확인

```bash
# Prisma Studio로 원격 DB 확인
DATABASE_URL="postgresql://..." npx prisma studio

# 또는 Render Dashboard → PostgreSQL → Connect
# psql 명령어로 접속하여 확인
```

**✅ 완료 기준**:
- [ ] 마이그레이션 성공 (에러 없음)
- [ ] 테이블 생성 확인
- [ ] 인덱스 생성 확인

---

## Task 5: 배포 검증 및 테스트 🟢

### 5.1 Health Check 확인

```bash
# Render에 배포된 서버 Health Check
curl https://datelog-backend-production.onrender.com/v1/health

# 예상 응답:
# {"status":"ok","timestamp":"..."}
```

### 5.2 API 엔드포인트 테스트

```bash
# Date Entry 생성 테스트
curl -X POST https://datelog-backend-production.onrender.com/v1/dates \
  -H "Content-Type: application/json" \
  -d '{"date":"2025-11-15","region":"테스트"}'

# 조회 테스트
curl https://datelog-backend-production.onrender.com/v1/dates
```

### 5.3 CORS 테스트 (Frontend 배포 후)

**Frontend 배포 완료 후**:
1. Frontend URL 확인: `https://datelog-frontend-production.onrender.com`
2. Backend `.env.prod` 업데이트:
   ```env
   CORS_ORIGIN=https://datelog-frontend-production.onrender.com
   ```
3. Git commit 후 push (Render 자동 재배포)
4. Frontend에서 API 호출 테스트

### 5.4 모니터링 설정

**Render Dashboard → Logs**:
- 실시간 로그 확인
- 에러 로그 모니터링

**Render Dashboard → Metrics**:
- CPU/메모리 사용량
- 응답 시간
- 요청 수

**✅ 완료 기준**:
- [ ] Health check 성공
- [ ] 모든 API 엔드포인트 정상 작동
- [ ] CORS 설정 확인 (Frontend 연동 성공)
- [ ] 로그에 에러 없음

---

## 🚨 트러블슈팅

### 문제 1: 마이그레이션 실패 - "Environment variable not found"

**원인**: `.env` 파일 누락 또는 `DATABASE_URL` 미설정

**해결**:
```bash
# .env 파일 생성
cp .env.example .env

# DATABASE_URL 설정 확인
echo $DATABASE_URL

# 또는 직접 설정
export DATABASE_URL="postgresql://..."
```

### 문제 2: Prisma Client 생성 실패

**원인**: Prisma schema 변경 후 Client 재생성 필요

**해결**:
```bash
# Prisma Client 강제 재생성
npx prisma generate --force

# node_modules 정리 후 재설치
rm -rf node_modules
npm install
npx prisma generate
```

### 문제 3: Render 빌드 실패 - "Prisma not found"

**원인**: Build command에 `prisma generate` 누락

**해결**:
```bash
# render.yaml 확인
buildCommand: npm ci && npx prisma generate && npm run build
```

### 문제 4: 데이터베이스 연결 실패

**원인**: DATABASE_URL 형식 오류 또는 네트워크 문제

**해결**:
```bash
# URL 형식 확인 (Prisma 형식)
postgresql://USER:PASSWORD@HOST:PORT/DATABASE

# 연결 테스트
npx prisma db execute --stdin <<< "SELECT 1"
```

### 문제 5: CORS 에러

**원인**: Frontend URL과 Backend CORS_ORIGIN 불일치

**해결**:
```bash
# .env.prod 업데이트
CORS_ORIGIN=https://actual-frontend-url.onrender.com

# 또는 개발 중에는 임시로 모든 origin 허용 (비권장)
CORS_ORIGIN=*
```

---

## 📊 체크리스트 요약

### Phase 2 완료 (데이터베이스)
- [x] 로컬 PostgreSQL 실행
- [x] `.env` 파일 설정
- [x] `npx prisma migrate dev` 성공
- [x] 테이블 생성 확인
- [ ] 시드 데이터 삽입 (선택)

### Phase 3 검증 (API)
- [x] `npm run dev` 서버 실행 (MongoDB 연결 성공)
- [x] Health check 성공
- [x] Date Entry CRUD 테스트 (조회 성공, 초기 데이터 확인)
- [x] Cafe, Restaurant, Spot CRUD 테스트 (모든 엔드포인트 정상)
- [x] TypeScript 빌드 성공

### Phase 4 배포 (Render)
- [ ] Render Web Service 생성
- [ ] 환경 변수 설정
- [ ] 첫 배포 성공
- [ ] Production DB 마이그레이션
- [ ] Health check 검증
- [ ] API 엔드포인트 테스트

### Phase 5 통합 (Frontend 연동)
- [ ] CORS 설정 업데이트
- [ ] Frontend API 통신 확인
- [ ] 로그 모니터링 설정
- [ ] 성능 확인

---

## 📚 참고 문서

- **Implementation Roadmap**: `IMPLEMENTATION_ROADMAP.md`
- **Phase 2 부분 완료**: `PHASE2_PARTIAL_COMPLETION.md`
- **Phase 3 Part 1 완료**: `PHASE3_PART1_COMPLETION.md`
- **Phase 3 Part 2 완료**: `PHASE3_PART2_COMPLETION.md`
- **Prisma 문서**: https://www.prisma.io/docs
- **Render 문서**: https://render.com/docs

---

## 💡 다음 단계 추천

**최우선 작업**:
```bash
1. 로컬 마이그레이션 실행 및 테스트 (Task 1-2)
2. 문제 없으면 Render 배포 진행 (Task 3-4)
3. Frontend와 통합 테스트 (Task 5)
```

**예상 소요 시간**:
- Task 1-2: 1-2시간 (마이그레이션 + 로컬 테스트)
- Task 3-4: 30분-1시간 (Render 배포 + DB 마이그레이션)
- Task 5: 30분 (검증 및 테스트)

**총 예상 시간**: 2-4시간

---

**마지막 업데이트**: 2025년 11월 15일
