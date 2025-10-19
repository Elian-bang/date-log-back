# Frontend-Backend Integration Design
**DateLog Application Architecture**

## 📋 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Frontend Analysis](#frontend-analysis)
3. [Integration Strategy](#integration-strategy)
4. [API Contract](#api-contract)
5. [Data Migration](#data-migration)
6. [Security & CORS](#security--cors)
7. [Error Handling](#error-handling)
8. [Implementation Plan](#implementation-plan)

---

## 🏗️ Architecture Overview

### Current State (Frontend)
- **Framework**: React 18.3.1 + TypeScript
- **Build Tool**: Vite 5.4.9
- **Routing**: React Router v6
- **State Management**: Custom hooks (`useDateLog`, `useLocalStorage`)
- **Data Storage**: localStorage (client-side only)
- **Maps**: Kakao Maps SDK

### Target State (Full-Stack)
```
┌─────────────────────────────────────────────────┐
│          React Frontend (Port 3000)             │
│  - UI Components                                 │
│  - State Management (useDateLog)                │
│  - API Client Layer (NEW)                       │
└─────────────────────┬───────────────────────────┘
                      │ HTTP/REST
                      │ (CORS enabled)
┌─────────────────────▼───────────────────────────┐
│      Express Backend (Port 3000 or 3001)        │
│  - REST API (v1)                                 │
│  - Business Logic                                │
│  - Validation Layer                              │
└─────────────────────┬───────────────────────────┘
                      │ Prisma ORM
┌─────────────────────▼───────────────────────────┐
│      PostgreSQL Database (Port 5432)            │
│  - date_entries                                  │
│  - cafes, restaurants, spots                    │
└──────────────────────────────────────────────────┘
```

---

## 🔍 Frontend Analysis

### Current Data Model
```typescript
// Frontend Types (src/types/index.ts)
interface DateLog {
  date: string;               // YYYY-MM-DD
  regions: RegionSection[];   // Multiple regions per date
}

interface RegionSection {
  id: string;                 // Client-generated UUID
  name: string;               // Region name (e.g., "삼송")
  categories: Categories;
}

interface Categories {
  cafe: Cafe[];
  restaurant: Restaurant[];
  spot: Spot[];
}

interface Place {
  id: string;                 // Client-generated UUID
  name: string;
  memo?: string;
  image?: string;
  link: string;               // Map URL
  visited: boolean;
  coordinates?: { lat: number; lng: number };
}

interface Restaurant extends Place {
  type: '전체' | '한식' | '일식' | '중식' | '고기집' | '양식' | '기타';
}
```

### Backend Data Model
```typescript
// Backend Types (src/types/api.types.ts)
interface DateEntryResponse {
  id: string;                 // Server UUID
  date: string;               // YYYY-MM-DD
  region: string;             // Single region per entry
  cafes: CafeResponse[];
  restaurants: RestaurantResponse[];
  spots: SpotResponse[];
  createdAt: string;
  updatedAt: string;
}

interface CafeResponse {
  id: string;
  name: string;
  memo?: string;
  image?: string;
  link?: string;
  visited: boolean;
  latitude?: number;
  longitude?: number;
  dateEntryId: string;
  createdAt: string;
  updatedAt: string;
}
```

### Key Differences
| Aspect | Frontend | Backend |
|--------|----------|---------|
| **Region Model** | Multiple regions per date (array) | Single region per date entry |
| **ID Generation** | Client-side (timestamp-random) | Server-side (UUID v4) |
| **Coordinates** | Nested object `{lat, lng}` | Separate fields `latitude`, `longitude` |
| **Map Link** | Required field | Optional field |
| **Timestamps** | No tracking | `createdAt`, `updatedAt` |
| **Data Storage** | localStorage | PostgreSQL |

---

## 🔗 Integration Strategy

### Strategy 1: Adapter Pattern (Recommended)
**Description**: Create an adapter layer that transforms between frontend and backend data structures.

**Pros**:
- ✅ Minimal changes to existing frontend code
- ✅ Clean separation of concerns
- ✅ Easy to maintain and test
- ✅ Gradual migration possible

**Implementation**:
```typescript
// Frontend: src/services/api/adapter.ts
export class DateLogAdapter {
  // Backend → Frontend
  static toFrontendModel(backendData: DateEntryResponse[]): DateLogData {
    // Group by date, transform to multi-region structure
  }

  // Frontend → Backend
  static toBackendModel(frontendLog: DateLog): CreateDateEntryRequest[] {
    // Split regions into separate date entries
  }
}
```

### Strategy 2: Backend Schema Change (NOT Recommended)
**Why**: Would require major backend refactoring and breaking database schema changes.

### Strategy 3: Dual Model Support (Fallback)
**Description**: Support both localStorage and API, with localStorage as offline fallback.

---

## 📡 API Contract

### Base URL
```
Development: http://localhost:3001/v1
Production:  https://date-log-back.onrender.com/v1
```

**Deployment Platform**: Render (https://render.com)
- **Backend Service ID**: `srv-d3pmoj0gjchc73anclpg`
- **Backend URL**: `https://date-log-back.onrender.com`
- **Frontend**: Render Static Site (동일 플랫폼 권장)

### Response Format
```typescript
// Success Response
interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
  links?: {
    self?: string;
    next?: string;
    prev?: string;
  };
}

// Error Response
interface ApiError {
  code: string;
  message: string;
  details?: string | Record<string, unknown>;
  timestamp: string;
}
```

### Endpoint Mapping

#### 1. GET All Date Entries
```http
GET /v1/dates?startDate=2025-10-01&endDate=2025-10-31&region=삼송
```

**Frontend Method**:
```typescript
async function fetchDateLogs(filters?: {
  startDate?: string;
  endDate?: string;
  region?: string;
}): Promise<DateLogData>
```

**Response** (Backend → Adapter → Frontend):
```json
{
  "data": [
    {
      "id": "uuid-1",
      "date": "2025-10-18",
      "region": "삼송",
      "cafes": [...],
      "restaurants": [...],
      "spots": [...],
      "createdAt": "2025-10-18T10:00:00Z",
      "updatedAt": "2025-10-18T10:00:00Z"
    }
  ],
  "meta": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1
  }
}
```

#### 2. GET Single Date Entry
```http
GET /v1/dates/:id
GET /v1/dates/by-date/:date
```

**Frontend Method**:
```typescript
async function fetchDateLog(date: string): Promise<DateLog | null>
```

#### 3. POST Create Date Entry
```http
POST /v1/dates
Content-Type: application/json

{
  "date": "2025-10-18",
  "region": "삼송"
}
```

**Frontend Method**:
```typescript
async function createDateEntry(date: string, regionName: string): Promise<DateLog>
```

#### 4. POST Create Place (Cafe/Restaurant/Spot)
```http
POST /v1/dates/:dateEntryId/cafes
POST /v1/dates/:dateEntryId/restaurants
POST /v1/dates/:dateEntryId/spots

Content-Type: application/json
{
  "name": "나무사이로",
  "memo": "분위기 좋음",
  "link": "https://map.kakao.com/...",
  "visited": true,
  "latitude": 37.6789,
  "longitude": 126.9123
}
```

**Frontend Method**:
```typescript
async function addPlace(
  date: string,
  regionId: string,
  category: CategoryType,
  place: Omit<Place, 'id'>
): Promise<Place>
```

#### 5. PUT Update Place
```http
PUT /v1/cafes/:id
PUT /v1/restaurants/:id
PUT /v1/spots/:id

Content-Type: application/json
{
  "visited": true,
  "memo": "Updated memo"
}
```

#### 6. DELETE Place
```http
DELETE /v1/cafes/:id
DELETE /v1/restaurants/:id
DELETE /v1/spots/:id
```

---

## 🔄 Data Migration

### Phase 1: Initial Data Transfer (One-Time)
```typescript
// src/services/api/migration.ts

export async function migrateLocalStorageToBackend(
  localData: DateLogData,
  apiClient: ApiClient
): Promise<void> {
  console.log('🚀 Starting data migration...');

  for (const [date, dateLog] of Object.entries(localData)) {
    for (const region of dateLog.regions) {
      // 1. Create date entry for each region
      const dateEntry = await apiClient.createDateEntry(date, region.name);

      // 2. Migrate cafes
      for (const cafe of region.categories.cafe) {
        await apiClient.createCafe(dateEntry.id, {
          name: cafe.name,
          memo: cafe.memo,
          link: cafe.link,
          visited: cafe.visited,
          latitude: cafe.coordinates?.lat,
          longitude: cafe.coordinates?.lng,
        });
      }

      // 3. Migrate restaurants
      for (const restaurant of region.categories.restaurant) {
        await apiClient.createRestaurant(dateEntry.id, {
          name: restaurant.name,
          type: mapRestaurantType(restaurant.type),
          memo: restaurant.memo,
          link: restaurant.link,
          visited: restaurant.visited,
          latitude: restaurant.coordinates?.lat,
          longitude: restaurant.coordinates?.lng,
        });
      }

      // 4. Migrate spots
      for (const spot of region.categories.spot) {
        await apiClient.createSpot(dateEntry.id, {
          name: spot.name,
          memo: spot.memo,
          link: spot.link,
          visited: spot.visited,
          latitude: spot.coordinates?.lat,
          longitude: spot.coordinates?.lng,
        });
      }
    }
  }

  console.log('✅ Migration completed successfully');
}
```

### Phase 2: Sync Strategy
```typescript
export enum SyncMode {
  API_ONLY = 'api_only',           // Use backend only
  LOCALSTORAGE_ONLY = 'local',     // Use localStorage only (current)
  HYBRID = 'hybrid'                // API with localStorage cache
}

export class DataSync {
  constructor(private mode: SyncMode) {}

  async getData(): Promise<DateLogData> {
    switch (this.mode) {
      case SyncMode.API_ONLY:
        return await this.fetchFromAPI();

      case SyncMode.LOCALSTORAGE_ONLY:
        return this.loadFromLocalStorage();

      case SyncMode.HYBRID:
        try {
          const apiData = await this.fetchFromAPI();
          this.saveToLocalStorage(apiData); // Cache for offline
          return apiData;
        } catch (error) {
          console.warn('API unavailable, using cached data');
          return this.loadFromLocalStorage();
        }
    }
  }
}
```

---

## 🔒 Security & CORS

### CORS Configuration (Backend)
```typescript
// src/app.ts - Already configured
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',  // Set to frontend URL in production
    credentials: true,
  })
);
```

### Environment Variables

**개발 환경**:
```env
# Backend (.env.development)
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000  # Frontend dev server
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/datelog_dev
```

```env
# Frontend (.env.development)
VITE_API_BASE_URL=http://localhost:3001/v1
VITE_KAKAO_MAP_API_KEY=your_kakao_map_key
```

**프로덕션 환경 (Render)**:
```env
# Backend (.env.production or Render Dashboard)
PORT=3001  # Render가 자동 설정
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-app.onrender.com  # 프론트엔드 Render URL
DATABASE_URL=postgresql://user:pass@db-host.render.com:5432/datelog_prod
JWT_SECRET=your-256-bit-secret
RATE_LIMIT_MAX=100
```

```env
# Frontend (.env.production)
VITE_API_BASE_URL=https://date-log-back.onrender.com/v1
VITE_KAKAO_MAP_API_KEY=your_kakao_map_key
```

### Security Best Practices
1. **Input Validation**: All API requests validated at controller level
2. **SQL Injection**: Protected by Prisma ORM parameterized queries
3. **XSS Protection**: React's built-in XSS protection + Content Security Policy
4. **Rate Limiting**: TODO - Add express-rate-limit middleware
5. **HTTPS**: Required in production

---

## ⚠️ Error Handling

### Frontend Error Handling Strategy
```typescript
// src/services/api/client.ts

export class ApiClient {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: ApiError = await response.json();

      // Map backend error codes to user-friendly messages
      switch (error.code) {
        case 'NOT_FOUND':
          throw new Error('데이터를 찾을 수 없습니다.');
        case 'VALIDATION_ERROR':
          throw new Error(`입력값이 올바르지 않습니다: ${error.details}`);
        case 'INTERNAL_ERROR':
          throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        default:
          throw new Error(error.message || '알 수 없는 오류가 발생했습니다.');
      }
    }

    const data: ApiResponse<T> = await response.json();
    return data.data;
  }

  async get<T>(url: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      return await this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('서버에 연결할 수 없습니다. 네트워크를 확인해주세요.');
      }
      throw error;
    }
  }
}
```

### Error UI Component
```typescript
// Update useDateLog hook
export const useDateLog = (): UseDateLogReturn => {
  const [error, setError] = useState<Error | null>(null);

  // Add error handling to all operations
  const addDate = async (date: string, regionName: string) => {
    try {
      setError(null);
      // Call API
      await apiClient.createDateEntry(date, regionName);
      // Update local state
      setData(/* ... */);
    } catch (err) {
      setError(err as Error);
      logger.error('Failed to add date:', err);
      // Keep local state unchanged on error
    }
  };

  return { data, loading, error, /* ... */ };
};
```

---

## 🚀 Implementation Plan

### Phase 1: API Client Setup (Week 1)
- [ ] Create `src/services/api/` directory structure
- [ ] Implement `ApiClient` class with base HTTP methods
- [ ] Add environment variable configuration
- [ ] Create `DateLogAdapter` for data transformation
- [ ] Write unit tests for adapter

### Phase 2: Backend Integration (Week 2)
- [ ] Update `useDateLog` hook to use API
- [ ] Implement hybrid sync mode (API + localStorage cache)
- [ ] Add loading states and error handling to UI
- [ ] Test CRUD operations with backend

### Phase 3: Data Migration (Week 3)
- [ ] Create migration utility for existing localStorage data
- [ ] Add migration UI in settings page
- [ ] Test migration with real user data
- [ ] Implement rollback mechanism

### Phase 4: Production Deployment (Week 4) - Render Platform
- [ ] Render 계정 생성 및 GitHub 저장소 연동
- [ ] 백엔드 Web Service 배포 (Service ID: srv-d3pmoj0gjchc73anclpg)
  - [ ] 환경 변수 설정 (CORS_ORIGIN, DATABASE_URL, JWT_SECRET)
  - [ ] PostgreSQL 데이터베이스 연결
  - [ ] Health check 확인 (/v1/health)
- [ ] 프론트엔드 Static Site 배포
  - [ ] VITE_API_BASE_URL을 https://date-log-back.onrender.com/v1로 설정
  - [ ] Build 및 배포 확인
- [ ] CORS 설정 업데이트 (프론트엔드 Render URL)
- [ ] HTTPS 자동 활성화 확인 (Render에서 자동 제공)
- [ ] Rate limiting 및 보안 헤더 추가
- [ ] 배포 후 통합 테스트 및 성능 모니터링

### Phase 5: Optimization (Week 5+)
- [ ] Implement data caching strategy
- [ ] Add offline support with service workers
- [ ] Optimize API response times
- [ ] Add pagination for large datasets

---

## 📝 Code Examples

### Frontend API Client
```typescript
// src/services/api/client.ts

export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = import.meta.env.VITE_API_BASE_URL) {
    this.baseURL = baseURL;
  }

  // Date Entry Operations
  async getDateEntries(filters?: {
    startDate?: string;
    endDate?: string;
    region?: string;
  }): Promise<DateEntryResponse[]> {
    const params = new URLSearchParams(filters as Record<string, string>);
    const response = await this.get<DateEntryResponse[]>(`/dates?${params}`);
    return response;
  }

  async getDateByDate(date: string): Promise<DateEntryResponse> {
    return await this.get<DateEntryResponse>(`/dates/by-date/${date}`);
  }

  async createDateEntry(date: string, region: string): Promise<DateEntryResponse> {
    return await this.post<DateEntryResponse>('/dates', { date, region });
  }

  // Place Operations
  async createCafe(dateEntryId: string, cafe: CreateCafeRequest): Promise<CafeResponse> {
    return await this.post<CafeResponse>(`/dates/${dateEntryId}/cafes`, cafe);
  }

  async updateCafe(cafeId: string, updates: UpdateCafeRequest): Promise<CafeResponse> {
    return await this.put<CafeResponse>(`/cafes/${cafeId}`, updates);
  }

  async deleteCafe(cafeId: string): Promise<void> {
    return await this.delete(`/cafes/${cafeId}`);
  }

  // Generic HTTP methods (private)
  private async get<T>(url: string): Promise<T> { /* ... */ }
  private async post<T>(url: string, body: any): Promise<T> { /* ... */ }
  private async put<T>(url: string, body: any): Promise<T> { /* ... */ }
  private async delete(url: string): Promise<void> { /* ... */ }
}

// Export singleton instance
export const apiClient = new ApiClient();
```

### Data Adapter
```typescript
// src/services/api/adapter.ts

export class DateLogAdapter {
  /**
   * Transform backend date entries to frontend DateLogData structure
   * Groups by date and creates multi-region structure
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
        id: entry.id, // Use backend ID as region ID
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

  private static toCafe(cafe: CafeResponse): Cafe {
    return {
      id: cafe.id,
      name: cafe.name,
      memo: cafe.memo,
      image: cafe.image,
      link: cafe.link || '',
      visited: cafe.visited,
      coordinates: cafe.latitude && cafe.longitude
        ? { lat: cafe.latitude, lng: cafe.longitude }
        : undefined,
    };
  }

  private static toRestaurant(restaurant: RestaurantResponse): Restaurant {
    return {
      id: restaurant.id,
      name: restaurant.name,
      type: this.mapRestaurantType(restaurant.type),
      memo: restaurant.memo,
      image: restaurant.image,
      link: restaurant.link || '',
      visited: restaurant.visited,
      coordinates: restaurant.latitude && restaurant.longitude
        ? { lat: restaurant.latitude, lng: restaurant.longitude }
        : undefined,
    };
  }

  private static mapRestaurantType(backendType: string): RestaurantType {
    const typeMap: Record<string, RestaurantType> = {
      '한식': '한식',
      '일식': '일식',
      '중식': '중식',
      '고기집': '고기집',
      '전체': '전체',
    };
    return typeMap[backendType] || '기타';
  }
}
```

### Updated useDateLog Hook
```typescript
// src/hooks/useDateLog.ts (API-enabled version)

import { apiClient } from '@/services/api/client';
import { DateLogAdapter } from '@/services/api/adapter';

export const useDateLog = (): UseDateLogReturn => {
  const [data, setData] = useState<DateLogData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load data from API on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const entries = await apiClient.getDateEntries();
        const frontendData = DateLogAdapter.toFrontendModel(entries);
        setData(frontendData);
        setError(null);
      } catch (err) {
        setError(err as Error);
        logger.error('Failed to load data:', err);

        // Fallback to localStorage
        const cached = loadFromLocalStorage();
        if (cached) {
          setData(cached);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // API-enabled addDate
  const addDate = async (date: string, regionName: string) => {
    try {
      const entry = await apiClient.createDateEntry(date, regionName);

      // Update local state optimistically
      setData((prev) => {
        const frontendModel = DateLogAdapter.toFrontendModel([entry]);
        return { ...prev, ...frontendModel };
      });

      setError(null);
    } catch (err) {
      setError(err as Error);
      throw err; // Re-throw for UI error handling
    }
  };

  // ... other operations follow same pattern

  return { data, loading, error, addDate, /* ... */ };
};
```

---

## 🎯 Success Criteria

### Technical Metrics
- [ ] All API endpoints return within 200ms (p95)
- [ ] Zero data loss during migration
- [ ] 99.9% uptime for backend API
- [ ] Offline mode works for read operations
- [ ] All unit tests passing (backend + frontend adapters)

### User Experience
- [ ] Seamless transition (users don't notice backend change)
- [ ] Loading states for all async operations
- [ ] Clear error messages in Korean
- [ ] Data persists across browser sessions
- [ ] Works on mobile and desktop

---

## 📚 References

### Backend Documentation
- API Specification: `backend/docs/api-specification.md`
- OpenAPI Spec: `backend/docs/openapi.yaml`
- Database Schema: `prisma/schema.prisma`

### Frontend Documentation
- Component Structure: `src/components/`
- Type Definitions: `src/types/index.ts`
- Hooks: `src/hooks/`

### External Resources
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Query](https://tanstack.com/query/latest) - Consider for data fetching
- [SWR](https://swr.vercel.app/) - Alternative data fetching library
