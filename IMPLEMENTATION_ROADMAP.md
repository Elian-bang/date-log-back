# DateLog Backend Implementation Roadmap

## 📋 프로젝트 개요

**프로젝트명**: DateLog Backend Service
**목적**: 데이트 코스 기록 서비스의 REST API 백엔드 구현
**전략**: Systematic (단계별 체계적 구현)
**예상 기간**: 6-8주
**기술 스택**: Node.js + TypeScript + Express + PostgreSQL + Prisma

---

## ⚠️ 중요: 구현 규칙

### 필수 확인 사항
구현 중 다음 상황이 발생하면 **반드시 질문**해야 합니다:

1. **애매한 요구사항**
   - API 스펙이 불명확한 경우
   - 데이터 구조나 타입이 모호한 경우
   - 비즈니스 로직이 명확하지 않은 경우

2. **잠재적 문제 발견**
   - 성능 이슈 가능성 (N+1 쿼리, 대용량 데이터 처리 등)
   - 보안 취약점 가능성 (SQL Injection, XSS 등)
   - 확장성 제약 (하드코딩, 의존성 문제 등)

3. **설계 결정 필요**
   - 여러 구현 방법 중 선택이 필요한 경우
   - 아키텍처 변경이 필요한 경우
   - 외부 라이브러리 선택이 필요한 경우

4. **스펙과의 불일치**
   - API 명세와 구현이 다를 수 있는 경우
   - 데이터베이스 스키마와 요구사항이 맞지 않는 경우
   - 프론트엔드 요구사항과 충돌하는 경우

**원칙**: "추측하지 말고 확인하라" - 불확실한 것은 즉시 질문하고 명확히 한 후 구현

---

## 🎯 구현 전략

### MVP 범위
- ✅ 날짜별 데이트 코스 CRUD
- ✅ 장소(카페/음식점/관광지) 관리
- ✅ 지역별 필터링 및 검색
- ✅ 방문 여부 체크 기능
- ✅ 데이터 Export/Import

### 향후 확장 기능
- 🔒 사용자 인증 및 권한 관리
- 🌐 WebSocket 실시간 동기화
- 🖼️ 이미지 업로드 및 CDN 연동
- 🔍 전체 텍스트 검색
- 📊 통계 및 분석 기능

---

## 📅 Phase 1: 프로젝트 기반 설정 (Week 1)

**목표**: 개발 환경 구축 및 프로젝트 초기화
**예상 소요 시간**: 8-12시간
**담당 페르소나**: Backend Developer, DevOps

### 1.1 Node.js/TypeScript 프로젝트 초기화 (2시간)

**작업 내용**:
```bash
# 프로젝트 초기화
npm init -y

# TypeScript 및 기본 의존성 설치
npm install express cors dotenv
npm install -D typescript @types/node @types/express @types/cors
npm install -D ts-node nodemon

# TypeScript 설정
npx tsc --init
```

**파일 생성**:
- `package.json` - 프로젝트 메타데이터 및 스크립트
- `tsconfig.json` - TypeScript 컴파일러 설정
- `.env` - 환경 변수 (gitignore에 포함)
- `.env.example` - 환경 변수 템플릿

**tsconfig.json 권장 설정**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**검증 기준**:
- [x] TypeScript 컴파일 성공
- [x] 개발 서버 실행 가능
- [x] 환경 변수 로드 확인

---

### 1.2 프로젝트 구조 생성 (1시간)

**폴더 구조**:
```
date-log-server/
├── src/
│   ├── config/          # 설정 파일
│   │   ├── database.ts
│   │   └── env.ts
│   ├── controllers/     # 컨트롤러 (비즈니스 로직)
│   │   ├── date.controller.ts
│   │   ├── place.controller.ts
│   │   └── region.controller.ts
│   ├── middlewares/     # 미들웨어
│   │   ├── error.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── logger.middleware.ts
│   ├── models/          # Prisma 모델 (자동 생성)
│   ├── routes/          # 라우트 정의
│   │   ├── index.ts
│   │   ├── date.routes.ts
│   │   ├── place.routes.ts
│   │   └── region.routes.ts
│   ├── services/        # 서비스 레이어
│   │   ├── date.service.ts
│   │   ├── place.service.ts
│   │   └── region.service.ts
│   ├── types/           # TypeScript 타입 정의
│   │   ├── api.types.ts
│   │   └── database.types.ts
│   ├── utils/           # 유틸리티 함수
│   │   ├── response.util.ts
│   │   └── validation.util.ts
│   ├── app.ts           # Express 앱 설정
│   └── server.ts        # 서버 진입점
├── prisma/
│   ├── schema.prisma    # Prisma 스키마
│   └── migrations/      # 마이그레이션 파일
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/                # API 문서 (기존)
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

**검증 기준**:
- [x] 모든 폴더 생성 완료
- [x] 기본 파일 템플릿 작성
- [x] Import 경로 정상 작동

---

### 1.3 ESLint & Prettier 설정 (1.5시간)

**의존성 설치**:
```bash
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D prettier eslint-config-prettier eslint-plugin-prettier
```

**.eslintrc.json**:
```json
{
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "plugins": ["@typescript-eslint", "prettier"],
  "rules": {
    "prettier/prettier": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn"
  },
  "env": {
    "node": true,
    "es2020": true
  }
}
```

**.prettierrc**:
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

**검증 기준**:
- [x] ESLint 실행 성공
- [x] Prettier 포맷팅 작동
- [x] VSCode 자동 포맷 설정

---

### 1.4 기본 Express 서버 구성 (3시간)

**src/app.ts**:
```typescript
import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { errorMiddleware } from './middlewares/error.middleware';
import { loggerMiddleware } from './middlewares/logger.middleware';

dotenv.config();

const app: Application = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);

// Routes
app.use('/v1', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorMiddleware);

export default app;
```

**src/server.ts**:
```typescript
import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/v1/docs`);
});
```

**검증 기준**:
- [x] 서버 정상 실행
- [x] Health check 엔드포인트 작동
- [x] CORS 설정 확인
- [x] 환경 변수 로드 확인

---

### 1.5 개발 스크립트 설정 (0.5시간)

**package.json scripts**:
```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write \"src/**/*.ts\"",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

**검증 기준**:
- [x] `npm run dev` - 개발 서버 실행
- [x] `npm run build` - TypeScript 컴파일
- [x] `npm run lint` - ESLint 검사
- [x] `npm run format` - 코드 포맷팅

---

## 📅 Phase 2: 데이터베이스 설계 및 설정 (Week 2)

**목표**: PostgreSQL + Prisma ORM 설정 및 스키마 정의
**예상 소요 시간**: 12-16시간
**담당 페르소나**: Backend Developer, Database Architect

### 2.1 PostgreSQL 설치 및 설정 (1시간)

**로컬 개발 환경**:
```bash
# Docker를 사용한 PostgreSQL 실행
docker run --name datelog-postgres \
  -e POSTGRES_USER=datelog \
  -e POSTGRES_PASSWORD=datelog_dev \
  -e POSTGRES_DB=datelog_dev \
  -p 5432:5432 \
  -d postgres:15-alpine

# 또는 Docker Compose
```

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: datelog-postgres
    environment:
      POSTGRES_USER: datelog
      POSTGRES_PASSWORD: datelog_dev
      POSTGRES_DB: datelog_dev
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**.env**:
```env
DATABASE_URL="postgresql://datelog:datelog_dev@localhost:5432/datelog_dev"
PORT=3000
NODE_ENV=development
```

**검증 기준**:
- [x] PostgreSQL 컨테이너 실행
- [x] 데이터베이스 연결 확인
- [x] psql 클라이언트 접속 가능

---

### 2.2 Prisma 설치 및 초기화 (1시간)

**의존성 설치**:
```bash
npm install @prisma/client
npm install -D prisma
```

**Prisma 초기화**:
```bash
npx prisma init
```

**검증 기준**:
- [x] `prisma/schema.prisma` 파일 생성
- [x] `.env`에 DATABASE_URL 설정
- [x] Prisma CLI 정상 작동

---

### 2.3 데이터베이스 스키마 설계 (4시간)

**prisma/schema.prisma**:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 날짜 엔트리 (Date Entry)
model DateEntry {
  id        String   @id @default(uuid())
  date      DateTime @unique @db.Date
  region    String   @db.VarChar(50)

  // Relations
  cafes       Cafe[]
  restaurants Restaurant[]
  spots       Spot[]

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@index([region])
  @@index([date])
  @@map("date_entries")
}

// 카페 (Cafe)
model Cafe {
  id          String  @id @default(uuid())
  name        String  @db.VarChar(100)
  memo        String? @db.VarChar(500)
  image       String?
  link        String?
  visited     Boolean @default(false)
  latitude    Float?
  longitude   Float?

  // Relations
  dateEntryId String    @map("date_entry_id")
  dateEntry   DateEntry @relation(fields: [dateEntryId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@index([dateEntryId])
  @@index([visited])
  @@map("cafes")
}

// 음식점 (Restaurant)
model Restaurant {
  id          String  @id @default(uuid())
  name        String  @db.VarChar(100)
  type        String  @db.VarChar(20) // 한식, 일식, 중식, 고기집, 전체
  memo        String? @db.VarChar(500)
  image       String?
  link        String?
  visited     Boolean @default(false)
  latitude    Float?
  longitude   Float?

  // Relations
  dateEntryId String    @map("date_entry_id")
  dateEntry   DateEntry @relation(fields: [dateEntryId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@index([dateEntryId])
  @@index([type])
  @@index([visited])
  @@map("restaurants")
}

// 관광지 (Spot)
model Spot {
  id          String  @id @default(uuid())
  name        String  @db.VarChar(100)
  memo        String? @db.VarChar(500)
  image       String?
  link        String?
  visited     Boolean @default(false)
  latitude    Float?
  longitude   Float?

  // Relations
  dateEntryId String    @map("date_entry_id")
  dateEntry   DateEntry @relation(fields: [dateEntryId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@index([dateEntryId])
  @@index([visited])
  @@map("spots")
}
```

**스키마 설계 고려사항**:
- UUID 사용으로 분산 시스템 대비
- Cascade delete로 데이터 무결성 보장
- 인덱스 최적화 (region, date, type, visited)
- Snake case 네이밍 (DB 컨벤션)
- 좌표 정보 포함 (향후 지도 기능 대비)

**검증 기준**:
- [x] 스키마 문법 오류 없음
- [x] 관계 설정 정확함
- [x] 인덱스 최적화 완료
- [x] 제약 조건 설정 완료

---

### 2.4 마이그레이션 실행 (1시간)

**마이그레이션 생성 및 실행**:
```bash
# 마이그레이션 생성
npx prisma migrate dev --name init

# Prisma Client 생성
npx prisma generate
```

**검증 SQL 확인**:
```sql
-- DateEntry 테이블 확인
SELECT * FROM date_entries LIMIT 1;

-- 인덱스 확인
\di date_entries*
```

**검증 기준**:
- [x] 마이그레이션 성공
- [x] 모든 테이블 생성됨
- [x] 인덱스 생성 확인
- [x] Prisma Client 생성됨

---

### 2.5 Prisma Client 설정 (1시간)

**src/config/database.ts**:
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
```

**검증 기준**:
- [x] Prisma Client 연결 성공
- [x] 쿼리 로깅 작동
- [x] Graceful shutdown 구현

---

### 2.6 시드 데이터 생성 (2시간)

**prisma/seed.ts**:
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 날짜 엔트리 생성
  const dateEntry = await prisma.dateEntry.create({
    data: {
      date: new Date('2025-10-18'),
      region: '삼송',
      cafes: {
        create: [
          {
            name: '나무사이로',
            memo: '분위기 좋은 창가 자리 있음',
            visited: true,
            latitude: 37.6789,
            longitude: 126.9123,
          },
        ],
      },
      restaurants: {
        create: [
          {
            name: '이이요',
            type: '한식',
            memo: '고등어정식 맛있음',
            visited: true,
            latitude: 37.6790,
            longitude: 126.9125,
          },
        ],
      },
      spots: {
        create: [
          {
            name: '북한산 둘레길',
            memo: '산책로 좋음',
            visited: false,
            latitude: 37.6800,
            longitude: 126.9130,
          },
        ],
      },
    },
  });

  console.log('✅ Seed data created:', dateEntry);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**package.json 추가**:
```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

**실행**:
```bash
npm install -D ts-node
npx prisma db seed
```

**검증 기준**:
- [x] 시드 데이터 삽입 성공
- [x] 관계 데이터 정확함
- [x] 데이터 조회 가능

---

## 📅 Phase 3: API 구현 (Week 3-4)

**목표**: RESTful API 엔드포인트 구현
**예상 소요 시간**: 24-32시간
**담당 페르소나**: Backend Developer

### 3.1 공통 타입 및 유틸리티 (2시간)

**src/types/api.types.ts**:
```typescript
export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
  links?: Record<string, string>;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  requestId?: string;
}
```

**src/utils/response.util.ts**:
```typescript
import { Response } from 'express';
import { ApiResponse, ApiError } from '../types/api.types';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  meta?: any,
  links?: any
): Response => {
  const response: ApiResponse<T> = { data };
  if (meta) response.meta = meta;
  if (links) response.links = links;
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  code: string,
  message: string,
  statusCode: number = 400,
  details?: any
): Response => {
  const error: ApiError = {
    code,
    message,
    timestamp: new Date().toISOString(),
  };
  if (details) error.details = details;
  return res.status(statusCode).json({ error });
};
```

---

### 3.2 Date Entry API 구현 (8시간)

#### 3.2.1 Service Layer

**src/services/date.service.ts**:
```typescript
import prisma from '../config/database';
import { DateEntry, Prisma } from '@prisma/client';

export class DateService {
  async findAll(filters: {
    region?: string;
    year?: number;
    month?: number;
    hasVisited?: boolean;
    page?: number;
    limit?: number;
    sort?: string;
  }) {
    const { page = 1, limit = 20, sort = 'date_desc', ...where } = filters;
    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: Prisma.DateEntryWhereInput = {};
    if (where.region) whereClause.region = where.region;
    if (where.year || where.month) {
      const dateFilter: any = {};
      if (where.year) {
        dateFilter.gte = new Date(where.year, 0, 1);
        dateFilter.lt = new Date(where.year + 1, 0, 1);
      }
      if (where.month && where.year) {
        dateFilter.gte = new Date(where.year, where.month - 1, 1);
        dateFilter.lt = new Date(where.year, where.month, 1);
      }
      whereClause.date = dateFilter;
    }

    // Build order by
    const orderBy: Prisma.DateEntryOrderByWithRelationInput = {};
    if (sort === 'date_asc') orderBy.date = 'asc';
    else if (sort === 'date_desc') orderBy.date = 'desc';

    const [data, total] = await Promise.all([
      prisma.dateEntry.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy,
        include: {
          _count: {
            select: {
              cafes: true,
              restaurants: true,
              spots: true,
            },
          },
        },
      }),
      prisma.dateEntry.count({ where: whereClause }),
    ]);

    return {
      data: data.map((entry) => ({
        date: entry.date.toISOString().split('T')[0],
        region: entry.region,
        placeCounts: {
          cafe: entry._count.cafes,
          restaurant: entry._count.restaurants,
          spot: entry._count.spots,
        },
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByDate(date: string) {
    return prisma.dateEntry.findUnique({
      where: { date: new Date(date) },
      include: {
        cafes: true,
        restaurants: true,
        spots: true,
      },
    });
  }

  async create(data: { date: string; region: string }) {
    return prisma.dateEntry.create({
      data: {
        date: new Date(data.date),
        region: data.region,
      },
    });
  }

  async update(date: string, data: { region?: string }) {
    return prisma.dateEntry.update({
      where: { date: new Date(date) },
      data,
    });
  }

  async delete(date: string) {
    return prisma.dateEntry.delete({
      where: { date: new Date(date) },
    });
  }
}
```

#### 3.2.2 Controller Layer

**src/controllers/date.controller.ts**:
```typescript
import { Request, Response, NextFunction } from 'express';
import { DateService } from '../services/date.service';
import { sendSuccess, sendError } from '../utils/response.util';

const dateService = new DateService();

export class DateController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { region, year, month, has_visited, page, limit, sort } = req.query;

      const result = await dateService.findAll({
        region: region as string,
        year: year ? parseInt(year as string) : undefined,
        month: month ? parseInt(month as string) : undefined,
        hasVisited: has_visited === 'true',
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
        sort: (sort as string) || 'date_desc',
      });

      return sendSuccess(res, result.data, 200, {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  }

  async getByDate(req: Request, res: Response, next: NextFunction) {
    try {
      const { date } = req.params;
      const entry = await dateService.findByDate(date);

      if (!entry) {
        return sendError(res, 'DATE_NOT_FOUND', 'Date entry not found', 404, { date });
      }

      return sendSuccess(res, entry);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { date, region } = req.body;
      const entry = await dateService.create({ date, region });
      return sendSuccess(res, entry, 201);
    } catch (error) {
      if ((error as any).code === 'P2002') {
        return sendError(res, 'DATE_ALREADY_EXISTS', 'Date entry already exists', 409);
      }
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { date } = req.params;
      const { region } = req.body;
      const entry = await dateService.update(date, { region });
      return sendSuccess(res, entry);
    } catch (error) {
      if ((error as any).code === 'P2025') {
        return sendError(res, 'DATE_NOT_FOUND', 'Date entry not found', 404);
      }
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { date } = req.params;
      await dateService.delete(date);
      return res.status(204).send();
    } catch (error) {
      if ((error as any).code === 'P2025') {
        return sendError(res, 'DATE_NOT_FOUND', 'Date entry not found', 404);
      }
      next(error);
    }
  }
}
```

#### 3.2.3 Routes

**src/routes/date.routes.ts**:
```typescript
import { Router } from 'express';
import { DateController } from '../controllers/date.controller';

const router = Router();
const controller = new DateController();

router.get('/', controller.list);
router.get('/:date', controller.getByDate);
router.post('/', controller.create);
router.patch('/:date', controller.update);
router.delete('/:date', controller.delete);

export default router;
```

**검증 기준**:
- [x] GET /dates - 목록 조회
- [x] GET /dates/:date - 단일 조회
- [x] POST /dates - 생성
- [x] PATCH /dates/:date - 수정
- [x] DELETE /dates/:date - 삭제

---

### 3.3 Place (Cafe/Restaurant/Spot) API 구현 (10시간)

구현 내용 생략 (Date Entry와 유사한 패턴)

**주요 엔드포인트**:
- POST /dates/:date/cafes
- GET /dates/:date/cafes
- PATCH /dates/:date/cafes/:id
- DELETE /dates/:date/cafes/:id

*(Restaurant, Spot도 동일)*

---

### 3.4 검증 미들웨어 (4시간)

**Zod를 사용한 스키마 검증**:
```bash
npm install zod
```

**src/middlewares/validation.middleware.ts**:
```typescript
import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.util';

export const dateEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  region: z.string().min(1).max(50),
});

export const placeSchema = z.object({
  name: z.string().min(1).max(100),
  memo: z.string().max(500).optional(),
  image: z.string().url().optional(),
  link: z.string().url().optional(),
  visited: z.boolean().default(false),
  coordinates: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    })
    .optional(),
});

export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(res, 'VALIDATION_ERROR', 'Request validation failed', 422, {
          errors: error.errors,
        });
      }
      next(error);
    }
  };
};
```

---

### 3.5 에러 핸들링 미들웨어 (2시간)

**src/middlewares/error.middleware.ts**:
```typescript
import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        error: {
          code: 'CONFLICT',
          message: 'Resource already exists',
          timestamp: new Date().toISOString(),
        },
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Resource not found',
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  // Default error
  return res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    },
  });
};
```

---

## 📅 Phase 4: 테스팅 (Week 5)

**목표**: 단위 테스트 및 통합 테스트 구현
**예상 소요 시간**: 16-20시간
**담당 페르소나**: QA Engineer, Backend Developer

### 4.1 Jest 설정 (2시간)

```bash
npm install -D jest @types/jest ts-jest supertest @types/supertest
```

**jest.config.js**:
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

---

### 4.2 단위 테스트 (8시간)

**tests/unit/services/date.service.test.ts**:
```typescript
import { DateService } from '../../../src/services/date.service';
import prisma from '../../../src/config/database';

jest.mock('../../../src/config/database', () => ({
  dateEntry: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
}));

describe('DateService', () => {
  let service: DateService;

  beforeEach(() => {
    service = new DateService();
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated date entries', async () => {
      const mockData = [
        {
          id: '1',
          date: new Date('2025-10-18'),
          region: '삼송',
          _count: { cafes: 3, restaurants: 5, spots: 2 },
        },
      ];

      (prisma.dateEntry.findMany as jest.Mock).mockResolvedValue(mockData);
      (prisma.dateEntry.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });
  });

  // More tests...
});
```

---

### 4.3 통합 테스트 (6시간)

**tests/integration/date.routes.test.ts**:
```typescript
import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/database';

describe('Date Routes', () => {
  beforeAll(async () => {
    // Setup test database
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /v1/dates', () => {
    it('should return list of date entries', async () => {
      const response = await request(app).get('/v1/dates').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter by region', async () => {
      const response = await request(app).get('/v1/dates?region=삼송').expect(200);

      expect(response.body.data.every((entry: any) => entry.region === '삼송')).toBe(true);
    });
  });

  // More tests...
});
```

---

## 📅 Phase 5: 배포 준비 (Week 6)

**목표**: Docker, CI/CD, 프로덕션 환경 설정
**예상 소요 시간**: 12-16시간
**담당 페르소나**: DevOps Engineer

### 5.1 Docker 설정 (3시간)

**Dockerfile**:
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npm run build
RUN npx prisma generate

# Production image
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

EXPOSE 3000

CMD ["npm", "start"]
```

**docker-compose.prod.yml**:
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      DATABASE_URL: postgresql://user:pass@postgres:5432/datelog
      NODE_ENV: production
    depends_on:
      - postgres

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: datelog
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

### 5.2 환경 변수 관리 (1시간)

**.env.production**:
```env
DATABASE_URL=postgresql://user:pass@host:5432/datelog
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://datelog.app
```

---

### 5.3 CI/CD 파이프라인 (4시간)

**.github/workflows/ci.yml**:
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npx prisma migrate deploy
      - run: npm test
```

---

### 5.4 배포 (Railway/Render) (2시간)

**Railway 배포**:
1. Railway 계정 생성
2. GitHub 연동
3. PostgreSQL 서비스 추가
4. 환경 변수 설정
5. 자동 배포 활성화

---

## 📊 구현 완료 체크리스트

### Phase 1: 프로젝트 설정
- [ ] Node.js/TypeScript 프로젝트 초기화
- [ ] 프로젝트 구조 생성
- [ ] ESLint, Prettier 설정
- [ ] 기본 Express 서버 구성
- [ ] 개발 스크립트 설정

### Phase 2: 데이터베이스
- [ ] PostgreSQL 설치 및 설정
- [ ] Prisma 설치 및 초기화
- [ ] 데이터베이스 스키마 설계
- [ ] 마이그레이션 실행
- [ ] Prisma Client 설정
- [ ] 시드 데이터 생성

### Phase 3: API 구현
- [ ] 공통 타입 및 유틸리티
- [ ] Date Entry API (CRUD)
- [ ] Cafe API (CRUD)
- [ ] Restaurant API (CRUD)
- [ ] Spot API (CRUD)
- [ ] Region API (조회)
- [ ] Export/Import API
- [ ] 검증 미들웨어
- [ ] 에러 핸들링

### Phase 4: 테스팅
- [ ] Jest 설정
- [ ] 단위 테스트 (80% 커버리지)
- [ ] 통합 테스트
- [ ] E2E 테스트

### Phase 5: 배포
- [ ] Docker 설정
- [ ] 환경 변수 관리
- [ ] CI/CD 파이프라인
- [ ] 프로덕션 배포
- [ ] 모니터링 설정

---

## 🎯 성공 지표

### 기술적 지표
- **API 응답 시간**: < 200ms (p95)
- **테스트 커버리지**: ≥ 80%
- **빌드 시간**: < 2분
- **배포 시간**: < 5분

### 품질 지표
- **코드 품질**: ESLint 0 errors
- **타입 안정성**: TypeScript strict mode
- **보안**: 알려진 취약점 0개
- **문서화**: API 문서 100% 완성

---

## 🚨 리스크 및 대응 방안

### 기술적 리스크
| 리스크 | 영향도 | 확률 | 대응 방안 |
|--------|--------|------|-----------|
| PostgreSQL 연결 실패 | High | Low | Connection pool, retry logic |
| Prisma 마이그레이션 충돌 | Medium | Medium | 버전 관리, 백업 전략 |
| TypeScript 타입 오류 | Low | Medium | Strict mode, 린터 활용 |

### 일정 리스크
| 리스크 | 영향도 | 확률 | 대응 방안 |
|--------|--------|------|-----------|
| API 구현 지연 | High | Medium | MVP 범위 축소, 우선순위 조정 |
| 테스트 작성 지연 | Medium | High | TDD 방식 적용, 자동화 |

---

## 📚 참고 자료

- [Express.js 공식 문서](https://expressjs.com/)
- [Prisma 공식 문서](https://www.prisma.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest 공식 문서](https://jestjs.io/)
- [PostgreSQL 공식 문서](https://www.postgresql.org/docs/)

---

## 🔄 다음 단계

Phase 1 완료 후:
1. `/sc:implement` 명령어로 실제 구현 시작
2. `/sc:test` 명령어로 테스트 작성
3. `/sc:document` 명령어로 API 문서 업데이트
