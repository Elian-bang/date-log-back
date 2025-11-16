# Windows Prisma Schema Engine Bug 해결 가이드

## 문제 설명

Windows 환경에서 Prisma Schema Engine 바이너리가 `.env` 파일의 DATABASE_URL을 제대로 파싱하지 못하는 버그가 있습니다.

**증상:**
```bash
Error: P1000
Can't reach database server at `127.0.0.1:5432`
Please make sure your database server is running at `127.0.0.1:5432`.
Credentials: "(not available)"
```

"(not available)"는 Prisma가 환경 변수를 읽지 못했음을 의미합니다.

## 해결 방법

### 방법 1: WSL2 사용 (권장) ⭐

가장 안정적인 해결책입니다.

1. **WSL2 설치**
   ```powershell
   wsl --install
   ```

2. **Ubuntu 배포판 설정**
   ```bash
   wsl --set-default-version 2
   wsl --install -d Ubuntu
   ```

3. **프로젝트를 WSL2에서 실행**
   ```bash
   # WSL 터미널에서
   cd /mnt/c/Users/bangs/WebstormProjects/date-log-server
   npm install
   npx prisma generate
   npx prisma db push
   ```

### 방법 2: Docker PostgreSQL + 수동 SQL

현재 사용 중인 방법입니다.

1. **Docker Compose로 PostgreSQL 실행**
   ```bash
   docker-compose up -d postgres
   ```

2. **수동으로 스키마 생성**
   ```bash
   docker exec -i datelog-postgres psql -U postgres -d datelog_dev << 'EOF'
   CREATE TABLE "DateEntry" (
     "id" TEXT NOT NULL,
     "date" TIMESTAMP(3) NOT NULL,
     "region" TEXT NOT NULL,
     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
     "updatedAt" TIMESTAMP(3) NOT NULL,
     CONSTRAINT "DateEntry_pkey" PRIMARY KEY ("id")
   );
   -- 나머지 테이블들...
   EOF
   ```

3. **애플리케이션 실행**
   ```bash
   npm run dev
   ```

### 방법 3: Prisma Proxy (실험적)

Prisma Data Proxy를 사용하여 원격에서 마이그레이션 실행.

```bash
# Prisma Cloud 계정 필요
prisma studio --browser none
```

## 환경 변수 설정 팁

### .env 파일 형식

```env
# 따옴표 없이 작성 (Windows에서 더 안정적)
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/datelog_dev

# IPv6 localhost 대신 127.0.0.1 사용
# localhost → 127.0.0.1 (IPv6 해석 방지)
```

### PowerShell에서 직접 설정

```powershell
$env:DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/datelog_dev"
npx prisma db push
```

### Git Bash에서 직접 설정

```bash
export DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/datelog_dev"
npx prisma db push
```

## 테스트 환경에서는?

Jest 테스트는 Prisma client를 mock하므로 이 문제의 영향을 받지 않습니다.

```typescript
jest.mock('../../src/config/database', () => ({
  __esModule: true,
  default: {
    dateEntry: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      // ...
    },
  },
}));
```

## CI/CD 환경 (GitHub Actions)

CI 환경에서는 이 문제가 발생하지 않습니다. Linux 기반이기 때문입니다.

```yaml
services:
  postgres:
    image: postgres:15
    env:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: datelog_test
```

## 관련 이슈

- Prisma GitHub Issue: [Schema Engine Windows Bug](https://github.com/prisma/prisma/issues)
- Node.js Windows 환경 변수 파싱 제한

## 권장 개발 워크플로우

1. **로컬 개발**: Docker + 수동 SQL 또는 WSL2
2. **테스트**: Jest mock 사용 (Prisma 연결 불필요)
3. **배포**: Render/Heroku 등 Linux 기반 플랫폼

이 방식으로 Windows 버그를 우회하면서 효과적으로 개발할 수 있습니다.
