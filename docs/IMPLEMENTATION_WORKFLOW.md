# DateLog 프론트엔드-백엔드 통합 구현 워크플로우
**Implementation Workflow & Development Roadmap**

> **기반 문서**: FRONTEND_INTEGRATION.md
> **전략**: Systematic Strategy (체계적 단계별 구현)
> **예상 기간**: 5주 (Phase 1-5)
> **위험도**: 중간 (데이터 마이그레이션 리스크 존재)

---

## 📊 프로젝트 개요

### 목표
localStorage 기반 프론트엔드 앱을 PostgreSQL 백엔드와 통합하여 데이터 영속성 및 다중 디바이스 지원 구현

### 핵심 과제
1. **데이터 모델 불일치 해결**: 프론트엔드 (다중 지역/날짜) ↔ 백엔드 (단일 지역/날짜)
2. **기존 데이터 마이그레이션**: localStorage → PostgreSQL (무손실)
3. **오프라인 지원**: API 장애 시 localStorage 폴백
4. **점진적 전환**: 사용자 경험 중단 없이 백엔드 통합

### 주요 이해관계자
- **프론트엔드 팀**: React + TypeScript 개발
- **백엔드 팀**: Express + Prisma API 개발
- **DevOps**: 배포 및 인프라 관리
- **최종 사용자**: 데이터 손실 없는 원활한 전환 기대

---

## 🎯 Phase 1: API Client 설정 및 어댑터 구현 (1주차)

### 목표
프론트엔드에 API 통신 레이어 및 데이터 변환 로직 구축

### 담당 페르소나
- **Frontend Developer**: API Client 구현
- **Architect**: 데이터 어댑터 설계

### 구현 작업

#### 1.1 프로젝트 구조 설정 (2시간)
```bash
# 프론트엔드 프로젝트 디렉토리 생성
my-date-log/src/services/
├── api/
│   ├── client.ts          # HTTP 클라이언트
│   ├── adapter.ts         # 데이터 변환 어댑터
│   ├── types.ts           # API 타입 정의
│   └── __tests__/         # 단위 테스트
├── config/
│   └── api.config.ts      # API 환경 설정
```

**체크리스트**:
- [ ] `src/services/api/` 디렉토리 생성
- [ ] TypeScript 타입 정의 파일 구조화
- [ ] 테스트 디렉토리 준비

#### 1.2 환경 변수 설정 (1시간)
```env
# my-date-log/.env.development
VITE_API_BASE_URL=http://localhost:3001/v1
VITE_API_TIMEOUT=10000
VITE_ENABLE_API=false  # 개발 중에는 false, 준비되면 true

# my-date-log/.env.production
VITE_API_BASE_URL=https://date-log-back.onrender.com/v1
VITE_API_TIMEOUT=5000
VITE_ENABLE_API=true
```

**체크리스트**:
- [ ] `.env.development` 파일 생성
- [ ] `.env.production` 파일 생성
- [ ] Vite 환경 변수 타입 정의 (`vite-env.d.ts`)
- [ ] `.gitignore`에 `.env.local` 추가

#### 1.3 ApiClient 클래스 구현 (8시간)
```typescript
// src/services/api/client.ts

export class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL;
    this.timeout = import.meta.env.VITE_API_TIMEOUT || 10000;
  }

  // ===== Generic HTTP Methods =====
  async get<T>(url: string, params?: Record<string, string>): Promise<T> {}
  async post<T>(url: string, body: any): Promise<T> {}
  async put<T>(url: string, body: any): Promise<T> {}
  async delete(url: string): Promise<void> {}

  // ===== Date Entry Operations =====
  async getDateEntries(filters?: DateEntryFilters): Promise<DateEntryResponse[]> {}
  async getDateByDate(date: string): Promise<DateEntryResponse> {}
  async createDateEntry(date: string, region: string): Promise<DateEntryResponse> {}
  async updateDateEntry(id: string, data: UpdateDateEntryRequest): Promise<DateEntryResponse> {}
  async deleteDateEntry(id: string): Promise<void> {}

  // ===== Place Operations (Cafe/Restaurant/Spot) =====
  async createCafe(dateEntryId: string, data: CreateCafeRequest): Promise<CafeResponse> {}
  async updateCafe(id: string, data: UpdateCafeRequest): Promise<CafeResponse> {}
  async deleteCafe(id: string): Promise<void> {}
  // ... (Restaurant, Spot 동일 패턴)
}
```

**구현 세부사항**:
1. **에러 핸들링**:
   - Network errors → "서버에 연결할 수 없습니다"
   - 404 → "데이터를 찾을 수 없습니다"
   - 400 → "입력값이 올바르지 않습니다"
   - 500 → "서버 오류가 발생했습니다"

2. **타임아웃 처리**: AbortController 사용
3. **재시도 로직**: 네트워크 에러 시 3회 재시도 (exponential backoff)
4. **요청 인터셉터**: 인증 토큰 자동 추가 (향후 확장)

**체크리스트**:
- [ ] HTTP 메서드 구현 (GET, POST, PUT, DELETE)
- [ ] 에러 핸들링 및 한국어 메시지 매핑
- [ ] 타임아웃 및 재시도 로직 구현
- [ ] 단위 테스트 작성 (Jest + MSW)

#### 1.4 DateLogAdapter 구현 (12시간)
```typescript
// src/services/api/adapter.ts

export class DateLogAdapter {
  /**
   * Backend → Frontend 변환
   * 여러 DateEntry를 날짜별로 그룹화하여 다중 지역 구조로 변환
   */
  static toFrontendModel(entries: DateEntryResponse[]): DateLogData {
    const grouped: DateLogData = {};

    entries.forEach((entry) => {
      if (!grouped[entry.date]) {
        grouped[entry.date] = {
          date: entry.date,
          regions: [],
        };
      }

      grouped[entry.date].regions.push({
        id: entry.id, // 백엔드 ID를 지역 ID로 사용
        name: entry.region,
        categories: {
          cafe: entry.cafes.map(this.toCafe),
          restaurant: entry.restaurants.map(this.toRestaurant),
          spot: entry.spots.map(this.toSpot),
        },
      });
    });

    return grouped;
  }

  /**
   * Frontend → Backend 변환
   * 다중 지역 구조를 개별 DateEntry로 분할
   */
  static toBackendCreateRequests(dateLog: DateLog): CreateDateEntryRequest[] {
    return dateLog.regions.map((region) => ({
      date: dateLog.date,
      region: region.name,
    }));
  }

  // Place 변환 메서드
  private static toCafe(cafe: CafeResponse): Cafe {}
  private static toRestaurant(restaurant: RestaurantResponse): Restaurant {}
  private static toSpot(spot: SpotResponse): Spot {}
}
```

**변환 로직 상세**:
- **좌표 변환**: `{ latitude, longitude }` → `{ lat, lng }`
- **타입 매핑**: 백엔드 enum → 프론트엔드 union type
- **선택적 필드**: `null` → `undefined` 변환
- **ID 관리**: 백엔드 UUID 유지

**체크리스트**:
- [ ] Backend → Frontend 변환 로직 구현
- [ ] Frontend → Backend 변환 로직 구현
- [ ] Place 타입별 변환 메서드 구현
- [ ] 엣지 케이스 처리 (빈 배열, null 값 등)
- [ ] 단위 테스트 (90% 커버리지 목표)

#### 1.5 통합 테스트 (5시간)
```typescript
// src/services/api/__tests__/integration.test.ts

describe('API Client Integration', () => {
  it('should fetch and transform date entries', async () => {
    const mockBackendData = [/* ... */];
    const frontendData = DateLogAdapter.toFrontendModel(mockBackendData);
    expect(frontendData['2025-10-18'].regions).toHaveLength(1);
  });

  it('should handle network errors gracefully', async () => {
    // MSW로 네트워크 에러 시뮬레이션
  });
});
```

**체크리스트**:
- [ ] MSW (Mock Service Worker) 설정
- [ ] 성공 시나리오 테스트
- [ ] 에러 시나리오 테스트
- [ ] 데이터 변환 정확성 검증

### Phase 1 완료 기준
- [x] ApiClient 클래스 구현 완료 (모든 엔드포인트)
- [x] DateLogAdapter 양방향 변환 구현
- [x] 단위 테스트 80% 이상 커버리지
- [x] 통합 테스트 통과
- [x] 코드 리뷰 완료

### 예상 소요 시간
**총 28시간 (약 1주)**

### 의존성
- **외부**: 없음 (백엔드 API 아직 필요 없음 - MSW 사용)
- **내부**: TypeScript 설정, 테스트 환경 구축

### 위험 요소 및 대응
| 위험 | 영향도 | 대응 방안 |
|------|--------|----------|
| 타입 불일치 | 중 | TypeScript strict mode로 조기 발견 |
| 테스트 커버리지 부족 | 중 | 코드 리뷰에서 필수 확인 |
| 환경 변수 누락 | 저 | 환경 변수 검증 유틸리티 추가 |

---

## 🔌 Phase 2: 백엔드 통합 및 UI 업데이트 (2주차)

### 목표
`useDateLog` 훅을 API 기반으로 전환하고 UI에 로딩/에러 상태 추가

### 담당 페르소나
- **Frontend Developer**: UI 컴포넌트 업데이트
- **Backend Developer**: CORS 설정 및 API 검증

### 구현 작업

#### 2.1 백엔드 CORS 설정 확인 (1시간)
```typescript
// date-log-server/src/app.ts (이미 구현됨, 검증 필요)

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);
```

**체크리스트**:
- [ ] `.env` 파일에 `CORS_ORIGIN=http://localhost:3000` 설정
- [ ] Postman/Thunder Client로 CORS 헤더 검증
- [ ] Preflight 요청 (OPTIONS) 정상 응답 확인

#### 2.2 Sync Mode 구현 (8시간)
```typescript
// src/services/sync/SyncManager.ts

export enum SyncMode {
  API_ONLY = 'api_only',
  LOCALSTORAGE_ONLY = 'local',
  HYBRID = 'hybrid',  // 권장
}

export class SyncManager {
  constructor(
    private mode: SyncMode,
    private apiClient: ApiClient
  ) {}

  async getData(): Promise<DateLogData> {
    switch (this.mode) {
      case SyncMode.API_ONLY:
        return this.fetchFromAPI();

      case SyncMode.LOCALSTORAGE_ONLY:
        return this.loadFromLocalStorage();

      case SyncMode.HYBRID:
        try {
          const apiData = await this.fetchFromAPI();
          this.saveToLocalStorage(apiData); // 캐시
          return apiData;
        } catch (error) {
          console.warn('API 연결 실패, 캐시된 데이터 사용');
          return this.loadFromLocalStorage();
        }
    }
  }

  async saveData(data: DateLogData): Promise<void> {
    // API와 localStorage에 동시 저장 (HYBRID 모드)
  }
}
```

**체크리스트**:
- [ ] SyncManager 클래스 구현
- [ ] 3가지 모드 로직 구현
- [ ] 로컬 스토리지 폴백 메커니즘
- [ ] 동기화 충돌 해결 전략 (Last Write Wins)

#### 2.3 useDateLog 훅 업데이트 (12시간)
```typescript
// src/hooks/useDateLog.ts (API-enabled)

export const useDateLog = (): UseDateLogReturn => {
  const [data, setData] = useState<DateLogData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [syncManager] = useState(() => new SyncManager(
    SyncMode.HYBRID,
    apiClient
  ));

  // 초기 데이터 로드
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const entries = await apiClient.getDateEntries();
      const frontendData = DateLogAdapter.toFrontendModel(entries);
      setData(frontendData);
      setError(null);
    } catch (err) {
      setError(err as Error);
      // 폴백: localStorage에서 로드
      const cached = loadFromLocalStorage();
      if (cached) setData(cached);
    } finally {
      setLoading(false);
    }
  };

  // API 기반 addDate 구현
  const addDate = async (date: string, regionName: string) => {
    try {
      const entry = await apiClient.createDateEntry(date, regionName);

      // 낙관적 업데이트 (Optimistic UI)
      setData((prev) => {
        const newData = DateLogAdapter.toFrontendModel([entry]);
        return { ...prev, ...newData };
      });

      setError(null);
    } catch (err) {
      setError(err as Error);
      throw err; // UI에서 에러 처리
    }
  };

  // ... 다른 CRUD 메서드도 동일 패턴으로 구현

  return {
    data,
    loading,
    error,
    addDate,
    // ...
    refreshData: loadData,
  };
};
```

**구현 세부사항**:
- **낙관적 업데이트**: API 요청 전에 UI 먼저 업데이트, 실패 시 롤백
- **에러 처리**: 각 메서드에서 에러 던지기 (UI에서 토스트 메시지 표시)
- **자동 재시도**: 네트워크 에러 시 재시도 로직
- **캐시 무효화**: 데이터 변경 시 자동 새로고침

**체크리스트**:
- [ ] `loadData` 메서드 구현
- [ ] 모든 CRUD 메서드 API 연동
- [ ] 낙관적 업데이트 로직
- [ ] 에러 처리 및 롤백
- [ ] 기존 localStorage 로직 제거 (폴백은 유지)

#### 2.4 UI 컴포넌트 업데이트 (10시간)

##### 로딩 상태 UI
```tsx
// src/components/MainView.tsx

function MainView() {
  const { data, loading, error, refreshData } = useDateLog();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorDisplay error={error} onRetry={refreshData} />
    );
  }

  return (
    <div>{/* 기존 UI */}</div>
  );
}
```

##### 에러 표시 컴포넌트
```tsx
// src/components/common/ErrorDisplay.tsx

interface ErrorDisplayProps {
  error: Error;
  onRetry: () => void;
}

export function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center bg-white rounded-lg shadow-xl p-6 max-w-md">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">오류 발생</h1>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
```

##### 토스트 알림 시스템
```tsx
// src/components/common/Toast.tsx

export function useToast() {
  const showToast = (message: string, type: 'success' | 'error') => {
    // react-hot-toast 또는 커스텀 구현
  };

  return { showToast };
}

// 사용 예시
const { showToast } = useToast();

const handleAddDate = async (date: string, region: string) => {
  try {
    await addDate(date, region);
    showToast('날짜가 추가되었습니다', 'success');
  } catch (error) {
    showToast(error.message, 'error');
  }
};
```

**체크리스트**:
- [ ] 로딩 스피너 컴포넌트
- [ ] 에러 표시 컴포넌트
- [ ] 토스트 알림 시스템 구현
- [ ] 모든 폼에 에러 핸들링 추가
- [ ] 재시도 버튼 구현

#### 2.5 E2E 테스트 (8시간)
```typescript
// e2e/integration.spec.ts (Playwright 또는 Cypress)

test('사용자가 날짜를 추가하고 조회할 수 있다', async ({ page }) => {
  // 1. 앱 접속
  await page.goto('http://localhost:3000');

  // 2. 날짜 추가 버튼 클릭
  await page.click('[data-testid="add-date-button"]');

  // 3. 날짜 입력
  await page.fill('[data-testid="date-input"]', '2025-10-18');
  await page.fill('[data-testid="region-input"]', '삼송');

  // 4. 저장
  await page.click('[data-testid="save-button"]');

  // 5. 토스트 메시지 확인
  await expect(page.locator('.toast')).toContainText('날짜가 추가되었습니다');

  // 6. 캘린더에서 확인
  await expect(page.locator('[data-date="2025-10-18"]')).toBeVisible();
});
```

**체크리스트**:
- [ ] 날짜 CRUD 시나리오 테스트
- [ ] 장소 CRUD 시나리오 테스트
- [ ] 네트워크 에러 시나리오 테스트
- [ ] 오프라인 모드 테스트

### Phase 2 완료 기준
- [x] useDateLog 훅 API 연동 완료
- [x] 모든 UI 컴포넌트에 로딩/에러 상태 추가
- [x] E2E 테스트 통과
- [x] 백엔드 API와 정상 통신 확인

### 예상 소요 시간
**총 39시간 (약 1주)**

### 의존성
- **외부**: 백엔드 API 서버 실행 필요
- **내부**: Phase 1 완료 (ApiClient, Adapter)

### 위험 요소 및 대응
| 위험 | 영향도 | 대응 방안 |
|------|--------|----------|
| CORS 이슈 | 높음 | 개발 초기에 CORS 설정 검증 |
| API 응답 지연 | 중 | 로딩 스피너 및 타임아웃 처리 |
| 낙관적 업데이트 롤백 실패 | 중 | 상태 관리 라이브러리 도입 검토 (React Query) |

---

## 🔄 Phase 3: 데이터 마이그레이션 (3주차)

### 목표
기존 localStorage 데이터를 백엔드 DB로 안전하게 이전

### 담당 페르소나
- **Backend Developer**: 마이그레이션 API 엔드포인트 준비
- **Frontend Developer**: 마이그레이션 UI 및 로직 구현
- **QA Engineer**: 데이터 무결성 검증

### 구현 작업

#### 3.1 마이그레이션 유틸리티 구현 (10시간)
```typescript
// src/services/migration/migrator.ts

export class DataMigrator {
  constructor(private apiClient: ApiClient) {}

  /**
   * localStorage 데이터를 백엔드로 마이그레이션
   * @returns 마이그레이션 결과 (성공/실패 카운트)
   */
  async migrate(): Promise<MigrationResult> {
    const localData = this.loadFromLocalStorage();
    const result: MigrationResult = {
      total: 0,
      succeeded: 0,
      failed: 0,
      errors: [],
    };

    for (const [date, dateLog] of Object.entries(localData)) {
      for (const region of dateLog.regions) {
        result.total++;

        try {
          // 1. DateEntry 생성
          const entry = await this.apiClient.createDateEntry(date, region.name);

          // 2. Cafes 마이그레이션
          for (const cafe of region.categories.cafe) {
            await this.apiClient.createCafe(entry.id, {
              name: cafe.name,
              memo: cafe.memo,
              link: cafe.link,
              visited: cafe.visited,
              latitude: cafe.coordinates?.lat,
              longitude: cafe.coordinates?.lng,
            });
          }

          // 3. Restaurants 마이그레이션
          for (const restaurant of region.categories.restaurant) {
            await this.apiClient.createRestaurant(entry.id, {
              name: restaurant.name,
              type: this.mapRestaurantType(restaurant.type),
              memo: restaurant.memo,
              link: restaurant.link,
              visited: restaurant.visited,
              latitude: restaurant.coordinates?.lat,
              longitude: restaurant.coordinates?.lng,
            });
          }

          // 4. Spots 마이그레이션
          for (const spot of region.categories.spot) {
            await this.apiClient.createSpot(entry.id, {
              name: spot.name,
              memo: spot.memo,
              link: spot.link,
              visited: spot.visited,
              latitude: spot.coordinates?.lat,
              longitude: spot.coordinates?.lng,
            });
          }

          result.succeeded++;
        } catch (error) {
          result.failed++;
          result.errors.push({
            date,
            region: region.name,
            error: error.message,
          });
        }
      }
    }

    return result;
  }

  /**
   * 마이그레이션 롤백 (실패 시)
   */
  async rollback(): Promise<void> {
    // 백업된 localStorage 데이터 복원
    const backup = localStorage.getItem('DATE_LOG_BACKUP');
    if (backup) {
      localStorage.setItem('DATE_LOG_DATA', backup);
    }
  }

  /**
   * 마이그레이션 전 백업 생성
   */
  createBackup(): void {
    const current = localStorage.getItem('DATE_LOG_DATA');
    if (current) {
      localStorage.setItem('DATE_LOG_BACKUP', current);
      localStorage.setItem('BACKUP_TIMESTAMP', new Date().toISOString());
    }
  }
}
```

**체크리스트**:
- [ ] 마이그레이션 로직 구현
- [ ] 백업 생성 기능
- [ ] 롤백 기능 구현
- [ ] 진행률 추적 (progress callback)
- [ ] 에러 로깅 및 리포팅

#### 3.2 마이그레이션 UI 구현 (8시간)
```tsx
// src/components/settings/MigrationPanel.tsx

export function MigrationPanel() {
  const [status, setStatus] = useState<'idle' | 'migrating' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<MigrationResult | null>(null);

  const handleMigrate = async () => {
    const migrator = new DataMigrator(apiClient);

    try {
      setStatus('migrating');

      // 백업 생성
      migrator.createBackup();

      // 마이그레이션 실행
      const migrationResult = await migrator.migrate();

      setResult(migrationResult);
      setStatus(migrationResult.failed === 0 ? 'success' : 'error');

      if (migrationResult.failed === 0) {
        // localStorage 데이터 삭제 (백업은 유지)
        localStorage.removeItem('DATE_LOG_DATA');
      }
    } catch (error) {
      setStatus('error');
      // 롤백
      await migrator.rollback();
    }
  };

  return (
    <div className="migration-panel">
      <h2>데이터 마이그레이션</h2>
      <p>localStorage 데이터를 서버로 이전합니다.</p>

      {status === 'idle' && (
        <button onClick={handleMigrate} className="btn-primary">
          마이그레이션 시작
        </button>
      )}

      {status === 'migrating' && (
        <div>
          <div className="progress-bar" style={{ width: `${progress}%` }} />
          <p>마이그레이션 진행 중... {progress}%</p>
        </div>
      )}

      {status === 'success' && result && (
        <div className="success-message">
          <p>✅ 마이그레이션 완료!</p>
          <p>총 {result.total}개 중 {result.succeeded}개 성공</p>
        </div>
      )}

      {status === 'error' && result && (
        <div className="error-message">
          <p>⚠️ 마이그레이션 실패</p>
          <p>{result.failed}개 실패</p>
          <details>
            <summary>에러 상세</summary>
            <ul>
              {result.errors.map((err, idx) => (
                <li key={idx}>{err.date} - {err.region}: {err.error}</li>
              ))}
            </ul>
          </details>
        </div>
      )}
    </div>
  );
}
```

**체크리스트**:
- [ ] 마이그레이션 시작 버튼
- [ ] 진행률 표시
- [ ] 결과 표시 (성공/실패)
- [ ] 에러 상세 정보 표시
- [ ] 롤백 버튼 (실패 시)

#### 3.3 데이터 검증 도구 (6시간)
```typescript
// src/services/migration/validator.ts

export class MigrationValidator {
  /**
   * 마이그레이션 전후 데이터 비교
   */
  async validate(): Promise<ValidationResult> {
    const localData = this.loadFromLocalStorage();
    const apiData = await this.fetchFromAPI();

    const issues: ValidationIssue[] = [];

    // 1. 날짜 엔트리 수 비교
    const localDates = Object.keys(localData).length;
    const apiDates = Object.keys(apiData).length;

    if (localDates !== apiDates) {
      issues.push({
        type: 'count_mismatch',
        message: `날짜 수 불일치: Local ${localDates} vs API ${apiDates}`,
      });
    }

    // 2. 각 날짜별 장소 수 비교
    for (const date of Object.keys(localData)) {
      const local = localData[date];
      const api = apiData[date];

      if (!api) {
        issues.push({
          type: 'missing_date',
          message: `${date} 날짜가 API에 없음`,
        });
        continue;
      }

      // 카페 수 비교
      const localCafes = local.regions.reduce((sum, r) => sum + r.categories.cafe.length, 0);
      const apiCafes = api.regions.reduce((sum, r) => sum + r.categories.cafe.length, 0);

      if (localCafes !== apiCafes) {
        issues.push({
          type: 'place_count_mismatch',
          message: `${date} 카페 수 불일치: Local ${localCafes} vs API ${apiCafes}`,
        });
      }

      // ... Restaurant, Spot도 동일하게 검증
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }
}
```

**체크리스트**:
- [ ] 날짜 엔트리 수 검증
- [ ] 장소 수 검증 (카페, 식당, 스팟)
- [ ] 데이터 필드 일치 검증
- [ ] 검증 리포트 생성

#### 3.4 마이그레이션 테스트 (8시간)
```typescript
// src/services/migration/__tests__/migrator.test.ts

describe('DataMigrator', () => {
  it('should migrate all data successfully', async () => {
    const mockLocalData = createMockLocalData();
    const migrator = new DataMigrator(apiClient);

    const result = await migrator.migrate();

    expect(result.succeeded).toBe(result.total);
    expect(result.failed).toBe(0);
  });

  it('should handle partial failures', async () => {
    // API가 일부 요청 실패 시뮬레이션
    const result = await migrator.migrate();

    expect(result.failed).toBeGreaterThan(0);
    expect(result.errors).toHaveLength(result.failed);
  });

  it('should rollback on critical error', async () => {
    // 심각한 에러 발생 시 롤백 확인
  });
});
```

**체크리스트**:
- [ ] 성공 시나리오 테스트
- [ ] 부분 실패 시나리오 테스트
- [ ] 롤백 시나리오 테스트
- [ ] 백업/복원 기능 테스트

### Phase 3 완료 기준
- [x] 마이그레이션 유틸리티 구현 완료
- [x] 마이그레이션 UI 구현 완료
- [x] 데이터 검증 도구 구현 완료
- [x] 테스트 데이터로 마이그레이션 성공
- [x] 실제 사용자 데이터 마이그레이션 성공

### 예상 소요 시간
**총 32시간 (약 1주)**

### 의존성
- **외부**: 백엔드 API 안정성
- **내부**: Phase 1, 2 완료

### 위험 요소 및 대응
| 위험 | 영향도 | 대응 방안 |
|------|--------|----------|
| 데이터 손실 | 치명적 | 백업 필수, 롤백 메커니즘 |
| 부분 마이그레이션 실패 | 높음 | 실패 항목 재시도 기능 |
| 네트워크 중단 | 높음 | 체크포인트 및 재개 기능 |

---

## 🚀 Phase 4: 프로덕션 배포 (4주차)

### 목표
Render 플랫폼에 안전하게 배포 및 모니터링 설정

### 배포 환경
- **플랫폼**: Render (https://render.com)
- **백엔드 Service ID**: `srv-d3pmoj0gjchc73anclpg`
- **백엔드 URL**: `https://date-log-back.onrender.com`
- **프론트엔드**: Render Static Site (동일 플랫폼)

### 담당 페르소나
- **DevOps Engineer**: 배포 및 인프라 설정
- **Backend Developer**: 프로덕션 최적화
- **Security Engineer**: 보안 설정 검증

### 구현 작업

#### 4.1 백엔드 프로덕션 설정 (6시간)
```env
# .env.production (Render Environment Variables)

NODE_ENV=production
PORT=3001  # Render가 자동으로 설정하는 PORT 사용 가능
CORS_ORIGIN=https://your-frontend-app.onrender.com  # 프론트엔드 Render URL로 업데이트 필요

# Database (Render PostgreSQL 또는 외부 DB)
DATABASE_URL=postgresql://user:password@db-host.render.com:5432/datelog_prod

# Security
JWT_SECRET=your-256-bit-secret
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000
```

**Render 배포 설정**:
- Service Type: Web Service
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Auto-Deploy: Enabled (main 브랜치 푸시 시 자동 배포)

**보안 헤더 추가**:
```typescript
// src/middlewares/security.middleware.ts

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

app.use(helmet()); // 보안 헤더

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // IP당 100 요청
  message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
});

app.use('/v1/', limiter);
```

**체크리스트**:
- [ ] Render 대시보드에서 환경 변수 설정 (DATABASE_URL, JWT_SECRET 등)
- [ ] HTTPS 자동 활성화 확인 (Render에서 자동 제공)
- [ ] Rate limiting 추가
- [ ] Helmet.js 보안 헤더
- [ ] CORS_ORIGIN을 프론트엔드 Render URL로 설정
- [ ] 환경 변수 검증
- [ ] Render PostgreSQL 또는 외부 DB 연결 확인

#### 4.2 프론트엔드 빌드 최적화 (4시간)
```typescript
// vite.config.ts

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          maps: ['react-kakao-maps-sdk'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  plugins: [
    react(),
    // Gzip 압축
    viteCompression(),
  ],
});
```

**체크리스트**:
- [ ] Code splitting 설정
- [ ] Gzip/Brotli 압축
- [ ] 이미지 최적화
- [ ] 번들 사이즈 분석 (500KB 이하 목표)

#### 4.3 Render 배포 설정 (8시간)

**백엔드 배포 (Web Service)**:
```yaml
# render.yaml (선택사항 - Infrastructure as Code)

services:
  - type: web
    name: date-log-backend
    env: node
    region: singapore  # 또는 oregon
    plan: free  # 또는 starter/standard
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: datelog-db
          property: connectionString
      - key: CORS_ORIGIN
        value: https://your-frontend-app.onrender.com
      - key: JWT_SECRET
        generateValue: true
      - key: PORT
        value: 3001

databases:
  - name: datelog-db
    databaseName: datelog_prod
    user: datelog_user
    plan: free  # 또는 starter
```

**프론트엔드 배포 (Static Site)**:
```yaml
# render.yaml (프론트엔드)

services:
  - type: web
    name: date-log-frontend
    env: static
    buildCommand: npm install && npm run build
    staticPublishPath: ./dist
    envVars:
      - key: VITE_API_BASE_URL
        value: https://date-log-back.onrender.com/v1
      - key: VITE_KAKAO_MAP_API_KEY
        sync: false  # 대시보드에서 직접 설정
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

**수동 배포 방법 (GitHub 연동)**:
1. Render 대시보드 → New → Web Service
2. GitHub 저장소 연결
3. Build & Start 명령어 설정
4. 환경 변수 추가
5. Deploy 버튼 클릭

**체크리스트**:
- [ ] Render 계정 생성 및 GitHub 연동
- [ ] 백엔드 Web Service 생성 (기존 srv-d3pmoj0gjchc73anclpg 사용 또는 신규)
- [ ] PostgreSQL 데이터베이스 생성 및 연결
- [ ] 프론트엔드 Static Site 생성
- [ ] 환경 변수 설정 (대시보드 또는 render.yaml)
- [ ] Auto-Deploy 활성화 (main 브랜치)
- [ ] 배포 로그 확인 및 오류 수정
- [ ] Health Check 엔드포인트 확인 (/v1/health)

#### 4.4 모니터링 및 로깅 (6시간)
```typescript
// src/middlewares/logger.middleware.ts

import winston from 'winston';
import morgan from 'morgan';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

app.use(morgan('combined', { stream: { write: message => logger.info(message) } }));
```

**모니터링 도구**:
- **APM**: New Relic 또는 Datadog
- **에러 추적**: Sentry
- **로그 수집**: CloudWatch Logs 또는 Loggly

**체크리스트**:
- [ ] Winston 로깅 설정
- [ ] Sentry 에러 추적 통합
- [ ] APM 도구 설정
- [ ] 알림 설정 (에러율, 응답 시간)

#### 4.5 성능 테스트 (8시간)
```bash
# Artillery를 사용한 부하 테스트

artillery quick --count 100 --num 10 http://localhost:3001/v1/health
```

**목표 성능 지표**:
- **응답 시간**: p95 < 200ms
- **처리량**: 1000 req/s
- **에러율**: < 0.1%
- **가동률**: > 99.9%

**체크리스트**:
- [ ] 부하 테스트 실행 (Artillery, JMeter)
- [ ] 병목 지점 식별
- [ ] 데이터베이스 쿼리 최적화
- [ ] 캐싱 전략 구현 (Redis)

### Phase 4 완료 기준
- [x] 프로덕션 배포 완료
- [x] HTTPS 및 보안 설정 완료
- [x] 모니터링 및 알림 설정 완료
- [x] 성능 테스트 통과
- [x] 24시간 안정성 모니터링 완료

### 예상 소요 시간
**총 32시간 (약 1주)**

### 의존성
- **외부**: AWS/GCP/Azure 계정, 도메인
- **내부**: Phase 1-3 완료

### 위험 요소 및 대응
| 위험 | 영향도 | 대응 방안 |
|------|--------|----------|
| 배포 실패 | 높음 | Blue-Green 배포, 롤백 자동화 |
| 성능 저하 | 중 | 캐싱, CDN, 쿼리 최적화 |
| 보안 취약점 | 높음 | 정기적인 보안 스캔, 패치 적용 |

---

## 🔧 Phase 5: 최적화 및 개선 (5주차+)

### 목표
사용자 피드백 기반 개선 및 장기 운영 준비

### 구현 작업

#### 5.1 오프라인 지원 (Service Worker) (12시간)
```typescript
// public/service-worker.js

const CACHE_NAME = 'datelog-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/main.js',
  '/static/css/main.css',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

**체크리스트**:
- [ ] Service Worker 구현
- [ ] 오프라인 페이지
- [ ] 백그라운드 동기화
- [ ] PWA manifest 설정

#### 5.2 데이터 캐싱 전략 (8시간)
```typescript
// src/services/cache/CacheManager.ts

export class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private TTL = 5 * 60 * 1000; // 5분

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.TTL;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }
}
```

**체크리스트**:
- [ ] 인메모리 캐시 구현
- [ ] Redis 캐시 통합 (백엔드)
- [ ] 캐시 무효화 전략
- [ ] 캐시 히트율 모니터링

#### 5.3 페이지네이션 (6시간)
```typescript
// 백엔드 이미 구현됨, 프론트엔드에 적용

function DateList() {
  const [page, setPage] = useState(1);
  const { data, loading } = useDateEntries({ page, limit: 10 });

  return (
    <div>
      {data.map((entry) => <DateCard key={entry.id} entry={entry} />)}

      <Pagination
        currentPage={page}
        totalPages={data.meta.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
```

**체크리스트**:
- [ ] 무한 스크롤 또는 페이지네이션 UI
- [ ] 가상 스크롤 (react-window)
- [ ] 페이지 상태 URL 동기화

#### 5.4 사용자 피드백 수집 (4시간)
```tsx
// src/components/common/FeedbackButton.tsx

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (feedback: string) => {
    await apiClient.submitFeedback({
      message: feedback,
      url: window.location.href,
      userAgent: navigator.userAgent,
    });
  };

  return (
    <button onClick={() => setIsOpen(true)}>
      피드백 보내기
    </button>
  );
}
```

**체크리스트**:
- [ ] 피드백 버튼 추가
- [ ] 피드백 수집 API
- [ ] Google Analytics / Mixpanel 통합
- [ ] 사용자 행동 분석

### Phase 5 완료 기준
- [x] 오프라인 지원 구현
- [x] 캐싱 전략 적용
- [x] 페이지네이션 구현
- [x] 사용자 피드백 시스템 구축

### 예상 소요 시간
**총 30시간 (약 1주)**

---

## 📊 전체 프로젝트 타임라인

```
Week 1: Phase 1 - API Client & Adapter
├── Day 1-2: 프로젝트 구조 및 환경 설정
├── Day 3-4: ApiClient 구현
└── Day 5: DateLogAdapter & 테스트

Week 2: Phase 2 - Backend Integration
├── Day 1-2: useDateLog 훅 업데이트
├── Day 3-4: UI 컴포넌트 로딩/에러 처리
└── Day 5: E2E 테스트

Week 3: Phase 3 - Data Migration
├── Day 1-2: 마이그레이션 유틸리티
├── Day 3: 마이그레이션 UI
├── Day 4: 데이터 검증
└── Day 5: 마이그레이션 테스트

Week 4: Phase 4 - Production Deployment
├── Day 1-2: 프로덕션 설정 (보안, 최적화)
├── Day 3: CI/CD 파이프라인
├── Day 4: 모니터링 설정
└── Day 5: 성능 테스트 및 배포

Week 5+: Phase 5 - Optimization
├── 오프라인 지원
├── 캐싱 전략
├── 페이지네이션
└── 사용자 피드백
```

---

## 🎯 성공 지표 (KPIs)

### 기술 지표
- [ ] **API 응답 시간**: p95 < 200ms
- [ ] **에러율**: < 0.1%
- [ ] **가동률**: > 99.9%
- [ ] **번들 사이즈**: < 500KB (gzipped)
- [ ] **Lighthouse 점수**: > 90점

### 비즈니스 지표
- [ ] **마이그레이션 성공률**: 100%
- [ ] **데이터 손실**: 0건
- [ ] **사용자 불편 신고**: < 5건
- [ ] **성능 개선**: 로딩 시간 50% 감소

### 품질 지표
- [ ] **테스트 커버리지**: > 80%
- [ ] **코드 리뷰 완료율**: 100%
- [ ] **문서화 완성도**: 100%

---

## ⚠️ 위험 관리 매트릭스

| 위험 | 확률 | 영향도 | 우선순위 | 대응 방안 |
|------|------|--------|----------|----------|
| 데이터 손실 | 낮음 | 치명적 | 높음 | 백업/롤백 메커니즘 필수 |
| API 장애 | 중간 | 높음 | 높음 | localStorage 폴백, 모니터링 |
| CORS 이슈 | 낮음 | 중간 | 중간 | 개발 초기 검증 |
| 성능 저하 | 중간 | 중간 | 중간 | 캐싱, 최적화, 부하 테스트 |
| 보안 취약점 | 낮음 | 높음 | 높음 | 보안 스캔, 정기 패치 |

---

## 📚 참고 자료

### 내부 문서
- [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md) - 통합 설계 문서
- [API Specification](./api-specification.md) - API 명세
- [OpenAPI Spec](./openapi.yaml) - Swagger 문서

### 외부 리소스
- [React Query](https://tanstack.com/query/latest) - 데이터 페칭 라이브러리
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Vite Optimization](https://vitejs.dev/guide/build.html)

---

## ✅ 체크리스트 요약

### Phase 1: API Client & Adapter (1주)
- [ ] 프로젝트 구조 설정
- [ ] 환경 변수 설정
- [ ] ApiClient 클래스 구현
- [ ] DateLogAdapter 구현
- [ ] 단위 테스트 (80% 커버리지)

### Phase 2: Backend Integration (1주)
- [ ] CORS 설정 검증
- [ ] SyncManager 구현
- [ ] useDateLog 훅 API 연동
- [ ] UI 로딩/에러 상태 추가
- [ ] E2E 테스트

### Phase 3: Data Migration (1주)
- [ ] 마이그레이션 유틸리티 구현
- [ ] 마이그레이션 UI 구현
- [ ] 데이터 검증 도구
- [ ] 마이그레이션 테스트

### Phase 4: Production (1주)
- [ ] 프로덕션 보안 설정
- [ ] CI/CD 파이프라인
- [ ] 모니터링 및 로깅
- [ ] 성능 테스트

### Phase 5: Optimization (1주+)
- [ ] 오프라인 지원
- [ ] 캐싱 전략
- [ ] 페이지네이션
- [ ] 사용자 피드백

---

**작성일**: 2025-10-18
**작성자**: Development Team
**버전**: 1.0
**상태**: 승인 대기중
