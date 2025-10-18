/**
 * API Common Types
 * Standard types used across all API endpoints
 */

// ===== Pagination Types =====

/**
 * Pagination query parameters
 */
export interface PaginationQuery {
  page?: number;
  limit?: number;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ===== API Response Types =====

/**
 * Standard API success response
 */
export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
  links?: {
    self?: string;
    next?: string;
    prev?: string;
    first?: string;
    last?: string;
  };
}

/**
 * Standard API error response
 */
export interface ApiError {
  code: string;
  message: string;
  details?: string | Record<string, unknown>;
  timestamp: string;
}

// ===== Date Entry Types =====

/**
 * Date Entry creation request
 */
export interface CreateDateEntryRequest {
  date: string; // ISO 8601 date format (YYYY-MM-DD)
  region: string;
}

/**
 * Date Entry update request
 */
export interface UpdateDateEntryRequest {
  date?: string;
  region?: string;
}

/**
 * Date Entry response
 */
export interface DateEntryResponse {
  id: string;
  date: string;
  region: string;
  cafes: CafeResponse[];
  restaurants: RestaurantResponse[];
  spots: SpotResponse[];
  createdAt: string;
  updatedAt: string;
}

// ===== Cafe Types =====

/**
 * Cafe creation request
 */
export interface CreateCafeRequest {
  name: string;
  memo?: string;
  image?: string;
  link?: string;
  visited?: boolean;
  latitude?: number;
  longitude?: number;
}

/**
 * Cafe update request
 */
export interface UpdateCafeRequest {
  name?: string;
  memo?: string;
  image?: string;
  link?: string;
  visited?: boolean;
  latitude?: number;
  longitude?: number;
}

/**
 * Cafe response
 */
export interface CafeResponse {
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

// ===== Restaurant Types =====

/**
 * Restaurant types enum
 */
export enum RestaurantType {
  KOREAN = '한식',
  JAPANESE = '일식',
  CHINESE = '중식',
  MEAT = '고기집',
  ALL = '전체',
}

/**
 * Restaurant creation request
 */
export interface CreateRestaurantRequest {
  name: string;
  type: RestaurantType;
  memo?: string;
  image?: string;
  link?: string;
  visited?: boolean;
  latitude?: number;
  longitude?: number;
}

/**
 * Restaurant update request
 */
export interface UpdateRestaurantRequest {
  name?: string;
  type?: RestaurantType;
  memo?: string;
  image?: string;
  link?: string;
  visited?: boolean;
  latitude?: number;
  longitude?: number;
}

/**
 * Restaurant response
 */
export interface RestaurantResponse {
  id: string;
  name: string;
  type: RestaurantType;
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

// ===== Spot Types =====

/**
 * Spot creation request
 */
export interface CreateSpotRequest {
  name: string;
  memo?: string;
  image?: string;
  link?: string;
  visited?: boolean;
  latitude?: number;
  longitude?: number;
}

/**
 * Spot update request
 */
export interface UpdateSpotRequest {
  name?: string;
  memo?: string;
  image?: string;
  link?: string;
  visited?: boolean;
  latitude?: number;
  longitude?: number;
}

/**
 * Spot response
 */
export interface SpotResponse {
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

// ===== Query Filter Types =====

/**
 * Date Entry list query filters
 */
export interface DateEntryQueryFilters extends PaginationQuery {
  startDate?: string;
  endDate?: string;
  region?: string;
}

/**
 * Restaurant list query filters
 */
export interface RestaurantQueryFilters extends PaginationQuery {
  type?: RestaurantType;
  visited?: boolean;
}

/**
 * Cafe/Spot list query filters
 */
export interface PlaceQueryFilters extends PaginationQuery {
  visited?: boolean;
}
