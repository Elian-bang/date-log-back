# DateLog Backend Service

백엔드 서비스를 위한 폴더입니다. 현재는 API 설계 문서만 포함하고 있으며, 향후 실제 백엔드 구현이 진행될 예정입니다.

## 📁 폴더 구조

```
backend/
├── README.md                 # 백엔드 서비스 개요 (현재 파일)
├── docs/                     # API 설계 문서
│   ├── api-specification.md  # REST API 상세 명세서
│   └── openapi.yaml          # OpenAPI 3.0 스펙 (Swagger)
└── src/                      # 백엔드 소스 코드 (향후 추가 예정)
```

## 📚 문서

### API Specification (`docs/api-specification.md`)
- 완전한 REST API 문서
- 모든 엔드포인트 상세 설명
- 요청/응답 예시
- 에러 처리 가이드
- 검증 규칙 및 제약사항
- 사용 예시 및 베스트 프랙티스

### OpenAPI Specification (`docs/openapi.yaml`)
- OpenAPI 3.0 표준 스펙
- Swagger UI, Postman 등에서 사용 가능
- 자동 코드 생성 지원
- 인터랙티브 API 문서 생성 가능

## 🚀 API 문서 사용 방법

### 1. Swagger UI로 보기

온라인 Swagger Editor에서 보기:
1. https://editor.swagger.io/ 접속
2. `File > Import File` 선택
3. `docs/openapi.yaml` 파일 업로드

### 2. Postman으로 가져오기

1. Postman 실행
2. `Import` 버튼 클릭
3. `docs/openapi.yaml` 파일 선택
4. 자동으로 모든 API 엔드포인트가 컬렉션으로 생성됨

### 3. 로컬에서 Swagger UI 실행

```bash
# npx를 사용한 간단한 방법
npx swagger-ui-watcher docs/openapi.yaml

# 또는 Docker 사용
docker run -p 8080:8080 -e SWAGGER_JSON=/docs/openapi.yaml -v $(pwd)/docs:/docs swaggerapi/swagger-ui
```

브라우저에서 `http://localhost:8080` 접속

## 🛠️ 향후 구현 계획

### Phase 1: 프로젝트 설정
- [ ] Node.js/Express 프로젝트 초기화
- [ ] TypeScript 설정
- [ ] ESLint, Prettier 설정
- [ ] 기본 프로젝트 구조 생성

### Phase 2: 데이터베이스 설계
- [ ] 데이터베이스 선택 (PostgreSQL, MongoDB 등)
- [ ] 스키마 설계
- [ ] ORM/ODM 설정 (Prisma, TypeORM, Mongoose 등)
- [ ] 마이그레이션 시스템 구축

### Phase 3: API 구현
- [ ] 기본 CRUD 엔드포인트 구현
- [ ] 검증 미들웨어
- [ ] 에러 핸들링
- [ ] 로깅 시스템
- [ ] API 테스트

### Phase 4: 인증 & 보안
- [ ] JWT 인증 구현
- [ ] 권한 관리
- [ ] Rate limiting
- [ ] CORS 설정
- [ ] 보안 헤더

### Phase 5: 배포
- [ ] Docker 컨테이너화
- [ ] CI/CD 파이프라인
- [ ] 프로덕션 환경 설정
- [ ] 모니터링 및 로깅

## 📋 기술 스택 (예정)

### 백엔드 프레임워크
- **Node.js** + **Express** 또는 **Fastify**
- **TypeScript** for type safety

### 데이터베이스
- **PostgreSQL** (관계형) 또는 **MongoDB** (NoSQL)
- **Redis** (캐싱 및 세션)

### ORM/ODM
- **Prisma** (PostgreSQL) 또는 **Mongoose** (MongoDB)

### 인증
- **JWT** (JSON Web Tokens)
- **bcrypt** (비밀번호 해싱)

### 검증
- **Zod** 또는 **Joi** (스키마 검증)

### 테스팅
- **Jest** (유닛 테스트)
- **Supertest** (API 테스트)

### 배포
- **Docker** (컨테이너화)
- **Vercel** / **Railway** / **Render** (호스팅)

## 🔗 관련 문서

- [프론트엔드 README](../README.md)
- [프로젝트 기획서](../DateLog_Planning_Document.md)
- [디자인 명세서](../DESIGN_SPECIFICATION.md)

## 📞 Contact

백엔드 구현에 대한 질문이나 제안사항이 있으시면 이슈를 생성해주세요.
