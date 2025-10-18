# DateLog REST API Specification

## Overview

**Service**: DateLog - 데이트 코스 기록 서비스
**API Version**: v1
**Base URL**: `https://api.datelog.app/v1`
**Authentication**: JWT Bearer Token (future implementation)
**Content-Type**: `application/json`

---

## API Design Principles

1. **RESTful**: Resource-based URLs with standard HTTP methods
2. **Stateless**: Each request contains all necessary information
3. **Consistent**: Uniform response structure and error handling
4. **Versioned**: API version in URL for backward compatibility
5. **HATEOAS-friendly**: Include navigation links in responses

---

## Resource Structure

### Primary Resources

- **Date Entries** (`/dates`) - Date-based course records
- **Places** (`/places`) - Individual locations (cafes, restaurants, spots)
- **Regions** (`/regions`) - Neighborhood/area information

### Nested Resources

- **Date Places** (`/dates/{date}/places`) - Places for a specific date
- **Category Places** (`/dates/{date}/cafes`, `/dates/{date}/restaurants`, `/dates/{date}/spots`)

---

## Core Endpoints

### 1. Date Entries

#### List All Date Entries
```http
GET /dates
```

**Query Parameters**:
- `region` (string, optional) - Filter by region (e.g., "삼송")
- `year` (integer, optional) - Filter by year
- `month` (integer, optional) - Filter by month (1-12)
- `has_visited` (boolean, optional) - Filter by visited status
- `sort` (string, optional) - Sort order: `date_asc`, `date_desc` (default)
- `page` (integer, optional) - Page number (default: 1)
- `limit` (integer, optional) - Items per page (default: 20, max: 100)

**Response** (200 OK):
```json
{
  "data": [
    {
      "date": "2025-10-18",
      "region": "삼송",
      "place_counts": {
        "cafe": 3,
        "restaurant": 5,
        "spot": 2
      },
      "visited_counts": {
        "cafe": 2,
        "restaurant": 4,
        "spot": 1
      },
      "created_at": "2025-10-15T09:00:00Z",
      "updated_at": "2025-10-18T14:30:00Z",
      "links": {
        "self": "/dates/2025-10-18",
        "places": "/dates/2025-10-18/places"
      }
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "total_pages": 3
  },
  "links": {
    "self": "/dates?page=1",
    "next": "/dates?page=2",
    "last": "/dates?page=3"
  }
}
```

---

#### Get Single Date Entry
```http
GET /dates/{date}
```

**Path Parameters**:
- `date` (string, required) - Date in ISO format (YYYY-MM-DD)

**Response** (200 OK):
```json
{
  "data": {
    "date": "2025-10-18",
    "region": "삼송",
    "categories": {
      "cafe": [
        {
          "id": "cafe_001",
          "name": "나무사이로",
          "memo": "분위기 좋은 창가 자리 있음",
          "image": "https://cdn.datelog.app/images/cafe1.jpg",
          "link": "https://map.naver.com/v5/entry/place/1234567890",
          "visited": true,
          "coordinates": {
            "latitude": 37.6789,
            "longitude": 126.9123
          },
          "created_at": "2025-10-15T09:00:00Z",
          "updated_at": "2025-10-18T10:30:00Z"
        }
      ],
      "restaurant": [
        {
          "id": "rest_001",
          "name": "이이요",
          "type": "한식",
          "memo": "고등어정식 맛있음",
          "image": "https://cdn.datelog.app/images/food1.jpg",
          "link": "https://map.naver.com/v5/entry/place/9876543210",
          "visited": true,
          "coordinates": {
            "latitude": 37.6790,
            "longitude": 126.9125
          },
          "created_at": "2025-10-15T09:00:00Z",
          "updated_at": "2025-10-18T12:00:00Z"
        }
      ],
      "spot": [
        {
          "id": "spot_001",
          "name": "북한산 둘레길",
          "memo": "산책로 좋음",
          "image": "https://cdn.datelog.app/images/spot1.jpg",
          "link": "https://map.naver.com/v5/entry/place/5555555555",
          "visited": false,
          "coordinates": {
            "latitude": 37.6800,
            "longitude": 126.9130
          },
          "created_at": "2025-10-15T09:00:00Z",
          "updated_at": "2025-10-15T09:00:00Z"
        }
      ]
    },
    "created_at": "2025-10-15T09:00:00Z",
    "updated_at": "2025-10-18T14:30:00Z"
  },
  "links": {
    "self": "/dates/2025-10-18",
    "cafes": "/dates/2025-10-18/cafes",
    "restaurants": "/dates/2025-10-18/restaurants",
    "spots": "/dates/2025-10-18/spots"
  }
}
```

**Response** (404 Not Found):
```json
{
  "error": {
    "code": "DATE_NOT_FOUND",
    "message": "Date entry not found",
    "details": {
      "date": "2025-10-18"
    }
  }
}
```

---

#### Create Date Entry
```http
POST /dates
```

**Request Body**:
```json
{
  "date": "2025-10-18",
  "region": "삼송"
}
```

**Validation Rules**:
- `date` (required, string, ISO date format)
- `region` (required, string, 1-50 characters)

**Response** (201 Created):
```json
{
  "data": {
    "date": "2025-10-18",
    "region": "삼송",
    "categories": {
      "cafe": [],
      "restaurant": [],
      "spot": []
    },
    "created_at": "2025-10-18T14:30:00Z",
    "updated_at": "2025-10-18T14:30:00Z"
  },
  "links": {
    "self": "/dates/2025-10-18"
  }
}
```

**Response** (409 Conflict):
```json
{
  "error": {
    "code": "DATE_ALREADY_EXISTS",
    "message": "Date entry already exists",
    "details": {
      "date": "2025-10-18"
    }
  }
}
```

---

#### Update Date Entry
```http
PATCH /dates/{date}
```

**Request Body** (partial update):
```json
{
  "region": "은평"
}
```

**Response** (200 OK):
```json
{
  "data": {
    "date": "2025-10-18",
    "region": "은평",
    "categories": { /* ... */ },
    "created_at": "2025-10-15T09:00:00Z",
    "updated_at": "2025-10-18T15:00:00Z"
  }
}
```

---

#### Delete Date Entry
```http
DELETE /dates/{date}
```

**Response** (204 No Content)

**Response** (404 Not Found):
```json
{
  "error": {
    "code": "DATE_NOT_FOUND",
    "message": "Date entry not found"
  }
}
```

---

### 2. Places Management

#### Get Places by Category
```http
GET /dates/{date}/cafes
GET /dates/{date}/restaurants
GET /dates/{date}/spots
```

**Query Parameters** (for restaurants):
- `type` (string, optional) - Filter by type: "한식", "일식", "중식", "고기집"

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "cafe_001",
      "name": "나무사이로",
      "memo": "분위기 좋은 창가 자리 있음",
      "image": "https://cdn.datelog.app/images/cafe1.jpg",
      "link": "https://map.naver.com/v5/entry/place/1234567890",
      "visited": true,
      "coordinates": {
        "latitude": 37.6789,
        "longitude": 126.9123
      },
      "created_at": "2025-10-15T09:00:00Z",
      "updated_at": "2025-10-18T10:30:00Z"
    }
  ],
  "meta": {
    "total": 3,
    "category": "cafe"
  }
}
```

---

#### Add Place to Date
```http
POST /dates/{date}/cafes
POST /dates/{date}/restaurants
POST /dates/{date}/spots
```

**Request Body** (Cafe):
```json
{
  "name": "카페 이름",
  "memo": "메모 내용",
  "image": "https://cdn.datelog.app/images/new_cafe.jpg",
  "link": "https://map.naver.com/v5/entry/place/1234567890",
  "visited": false,
  "coordinates": {
    "latitude": 37.6789,
    "longitude": 126.9123
  }
}
```

**Request Body** (Restaurant):
```json
{
  "name": "음식점 이름",
  "type": "한식",
  "memo": "메모 내용",
  "image": "https://cdn.datelog.app/images/new_restaurant.jpg",
  "link": "https://map.naver.com/v5/entry/place/9876543210",
  "visited": false,
  "coordinates": {
    "latitude": 37.6790,
    "longitude": 126.9125
  }
}
```

**Validation Rules**:
- `name` (required, string, 1-100 characters)
- `type` (required for restaurants, enum: "한식", "일식", "중식", "고기집", "전체")
- `memo` (optional, string, max 500 characters)
- `image` (optional, string, valid URL)
- `link` (optional, string, valid URL)
- `visited` (optional, boolean, default: false)
- `coordinates.latitude` (optional, number, -90 to 90)
- `coordinates.longitude` (optional, number, -180 to 180)

**Response** (201 Created):
```json
{
  "data": {
    "id": "cafe_002",
    "name": "카페 이름",
    "memo": "메모 내용",
    "image": "https://cdn.datelog.app/images/new_cafe.jpg",
    "link": "https://map.naver.com/v5/entry/place/1234567890",
    "visited": false,
    "coordinates": {
      "latitude": 37.6789,
      "longitude": 126.9123
    },
    "created_at": "2025-10-18T15:30:00Z",
    "updated_at": "2025-10-18T15:30:00Z"
  },
  "links": {
    "self": "/dates/2025-10-18/cafes/cafe_002",
    "date": "/dates/2025-10-18"
  }
}
```

---

#### Update Place
```http
PATCH /dates/{date}/cafes/{placeId}
PATCH /dates/{date}/restaurants/{placeId}
PATCH /dates/{date}/spots/{placeId}
```

**Request Body** (partial update):
```json
{
  "visited": true,
  "memo": "업데이트된 메모"
}
```

**Response** (200 OK):
```json
{
  "data": {
    "id": "cafe_001",
    "name": "나무사이로",
    "memo": "업데이트된 메모",
    "image": "https://cdn.datelog.app/images/cafe1.jpg",
    "link": "https://map.naver.com/v5/entry/place/1234567890",
    "visited": true,
    "coordinates": {
      "latitude": 37.6789,
      "longitude": 126.9123
    },
    "created_at": "2025-10-15T09:00:00Z",
    "updated_at": "2025-10-18T16:00:00Z"
  }
}
```

---

#### Delete Place
```http
DELETE /dates/{date}/cafes/{placeId}
DELETE /dates/{date}/restaurants/{placeId}
DELETE /dates/{date}/spots/{placeId}
```

**Response** (204 No Content)

---

### 3. Regions

#### List All Regions
```http
GET /regions
```

**Query Parameters**:
- `with_counts` (boolean, optional) - Include place counts per region

**Response** (200 OK):
```json
{
  "data": [
    {
      "name": "삼송",
      "place_counts": {
        "total": 10,
        "cafe": 3,
        "restaurant": 5,
        "spot": 2
      },
      "date_count": 5
    },
    {
      "name": "은평",
      "place_counts": {
        "total": 8,
        "cafe": 2,
        "restaurant": 4,
        "spot": 2
      },
      "date_count": 3
    }
  ],
  "meta": {
    "total": 2
  }
}
```

---

### 4. Bulk Operations

#### Export All Data
```http
GET /export
```

**Query Parameters**:
- `format` (string, optional) - Export format: "json" (default), "csv"

**Response** (200 OK):
```json
{
  "data": {
    "2025-10-18": {
      "region": "삼송",
      "categories": { /* full data structure */ }
    }
  },
  "meta": {
    "exported_at": "2025-10-18T16:30:00Z",
    "total_dates": 45,
    "total_places": 120
  }
}
```

---

#### Import Data
```http
POST /import
```

**Request Body**:
```json
{
  "data": {
    "2025-10-18": {
      "region": "삼송",
      "categories": { /* full data structure */ }
    }
  },
  "options": {
    "merge_strategy": "replace",
    "validate_only": false
  }
}
```

**Merge Strategies**:
- `replace` - Replace existing data
- `merge` - Merge with existing data (keep both)
- `skip` - Skip duplicates

**Response** (200 OK):
```json
{
  "data": {
    "imported_dates": 1,
    "imported_places": 10,
    "skipped": 0,
    "errors": []
  },
  "meta": {
    "imported_at": "2025-10-18T17:00:00Z"
  }
}
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional context"
    },
    "timestamp": "2025-10-18T17:30:00Z",
    "request_id": "req_abc123xyz"
  }
}
```

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid request body or parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Maintenance mode |

### Error Codes

| Code | Description |
|------|-------------|
| `DATE_NOT_FOUND` | Date entry not found |
| `DATE_ALREADY_EXISTS` | Date entry already exists |
| `PLACE_NOT_FOUND` | Place not found |
| `INVALID_DATE_FORMAT` | Invalid date format |
| `INVALID_CATEGORY` | Invalid category type |
| `INVALID_RESTAURANT_TYPE` | Invalid restaurant type |
| `VALIDATION_ERROR` | Request validation failed |
| `RATE_LIMIT_EXCEEDED` | Too many requests |

---

## Validation Rules

### Date Entry
- `date`: ISO 8601 format (YYYY-MM-DD), valid date
- `region`: 1-50 characters, non-empty

### Place (All Categories)
- `name`: 1-100 characters, required
- `memo`: max 500 characters, optional
- `image`: valid URL or relative path, optional
- `link`: valid URL, optional
- `visited`: boolean, default false
- `coordinates.latitude`: -90 to 90, optional
- `coordinates.longitude`: -180 to 180, optional

### Restaurant Specific
- `type`: enum ["한식", "일식", "중식", "고기집", "전체"], required

---

## Rate Limiting

**Limits**:
- Anonymous: 100 requests/hour
- Authenticated: 1000 requests/hour
- Burst: 20 requests/second

**Headers**:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1634567890
```

---

## Pagination

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response Meta**:
```json
{
  "meta": {
    "total": 150,
    "page": 2,
    "limit": 20,
    "total_pages": 8
  },
  "links": {
    "self": "/dates?page=2&limit=20",
    "first": "/dates?page=1&limit=20",
    "prev": "/dates?page=1&limit=20",
    "next": "/dates?page=3&limit=20",
    "last": "/dates?page=8&limit=20"
  }
}
```

---

## Sorting

**Query Parameter**: `sort`

**Available Options**:
- `date_asc` - Date ascending
- `date_desc` - Date descending (default)
- `name_asc` - Name ascending
- `name_desc` - Name descending
- `created_asc` - Creation date ascending
- `created_desc` - Creation date descending

---

## Filtering

**Common Filters**:
- `region`: Filter by region name
- `visited`: Filter by visited status (true/false)
- `year`: Filter by year
- `month`: Filter by month (1-12)
- `type`: Filter restaurants by type

**Example**:
```http
GET /dates?region=삼송&visited=true&year=2025&month=10
```

---

## CORS Configuration

**Allowed Origins**: Configurable per environment
**Allowed Methods**: GET, POST, PATCH, DELETE, OPTIONS
**Allowed Headers**: Content-Type, Authorization, X-Request-ID
**Exposed Headers**: X-RateLimit-*, X-Total-Count

---

## Versioning Strategy

**Current Version**: v1
**URL Pattern**: `/v1/...`
**Deprecation Policy**: 12 months notice
**Version Header**: `Accept: application/vnd.datelog.v1+json`

---

## Authentication (Future)

**Method**: JWT Bearer Token
**Header**: `Authorization: Bearer <token>`

**Token Payload**:
```json
{
  "sub": "user_id",
  "iat": 1634567890,
  "exp": 1634654290,
  "scopes": ["read:dates", "write:dates"]
}
```

---

## WebSocket Support (Future)

**Endpoint**: `wss://api.datelog.app/v1/ws`

**Events**:
- `date.created`
- `date.updated`
- `date.deleted`
- `place.created`
- `place.updated`
- `place.deleted`
- `place.visited`

---

## Best Practices

### Client Implementation
1. **Idempotency**: Use idempotency keys for POST requests
2. **Retry Logic**: Implement exponential backoff for retries
3. **Caching**: Cache GET responses with appropriate TTL
4. **Error Handling**: Handle all error codes gracefully
5. **Pagination**: Always handle pagination for list endpoints

### Performance
1. **Conditional Requests**: Use ETag/If-None-Match headers
2. **Compression**: Accept gzip/brotli encoding
3. **Field Selection**: Request only needed fields (future feature)
4. **Batch Operations**: Use bulk endpoints when possible

### Security
1. **HTTPS Only**: Always use HTTPS in production
2. **Input Validation**: Validate all inputs on client side
3. **Rate Limiting**: Respect rate limits and implement backoff
4. **Authentication**: Store tokens securely (future feature)

---

## Migration Path

### From localStorage to API

**Phase 1**: Read-only API
- Export localStorage data using export endpoint
- Implement GET endpoints
- Test with existing data

**Phase 2**: Write Operations
- Implement POST/PATCH/DELETE
- Add conflict resolution
- Migrate data gradually

**Phase 3**: Real-time Sync
- Add WebSocket support
- Implement offline-first strategy
- Add conflict resolution

---

## Example Workflows

### 1. Creating a New Date Entry with Places

```javascript
// Step 1: Create date entry
const dateResponse = await fetch('https://api.datelog.app/v1/dates', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    date: '2025-10-18',
    region: '삼송'
  })
});

const { data: dateEntry } = await dateResponse.json();

// Step 2: Add a cafe
const cafeResponse = await fetch(`https://api.datelog.app/v1/dates/2025-10-18/cafes`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: '나무사이로',
    memo: '분위기 좋은 창가 자리 있음',
    link: 'https://map.naver.com/v5/entry/place/1234567890',
    visited: false
  })
});

// Step 3: Add a restaurant
const restaurantResponse = await fetch(`https://api.datelog.app/v1/dates/2025-10-18/restaurants`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: '이이요',
    type: '한식',
    memo: '고등어정식 맛있음',
    visited: false
  })
});
```

### 2. Marking a Place as Visited

```javascript
const response = await fetch('https://api.datelog.app/v1/dates/2025-10-18/cafes/cafe_001', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    visited: true
  })
});
```

### 3. Fetching Dates with Filters

```javascript
// Get all dates in 삼송 region with visited places
const response = await fetch(
  'https://api.datelog.app/v1/dates?region=삼송&has_visited=true&sort=date_desc'
);

const { data, meta, links } = await response.json();
```

### 4. Exporting All Data

```javascript
const response = await fetch('https://api.datelog.app/v1/export');
const exportData = await response.json();

// Save to localStorage as backup
localStorage.setItem('datelog_backup', JSON.stringify(exportData.data));
```

---

## Testing Recommendations

### Unit Tests
- Validate request/response schemas
- Test all validation rules
- Verify error handling

### Integration Tests
- Test full CRUD workflows
- Verify pagination and filtering
- Test rate limiting

### Performance Tests
- Load testing with realistic data volumes
- Concurrent request handling
- Database query optimization

---

## Monitoring & Observability

**Metrics to Track**:
- Request latency (p50, p95, p99)
- Error rate by endpoint
- Rate limit violations
- Database query performance
- API version usage

**Logging**:
- Request/response logging
- Error stack traces
- Performance metrics
- Security events

---

## Future Enhancements

1. **GraphQL Endpoint**: Alternative query interface
2. **Real-time Sync**: WebSocket-based live updates
3. **Image Upload**: Direct image upload to CDN
4. **Search**: Full-text search across places
5. **Recommendations**: ML-based place recommendations
6. **Social Features**: Share dates with friends
7. **Analytics**: Visit statistics and insights
8. **Offline Support**: Offline-first mobile app sync
