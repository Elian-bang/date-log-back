-- Production Seed Data for DateLog
-- Generated from local-storage.json

-- PostgreSQL 13+ has gen_random_uuid() built-in, no extension needed

-- ========================================
-- 2025-10-18 - 삼송
-- ========================================
INSERT INTO date_entries (id, date, region, created_at, updated_at)
VALUES (
    'date-2025-10-18-삼송',
    '2025-10-18',
    '삼송',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Cafes for 2025-10-18 삼송
INSERT INTO cafes (id, name, memo, image, link, visited, latitude, longitude, date_entry_id, created_at, updated_at)
VALUES
(gen_random_uuid(), '엘리제과자점', '', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20190407_223%2F15545653791673q6Dr_JPEG%2FNnzkCdMZVFB85igI8b8Evj25.jpg', 'https://map.naver.com/p/entry/place/1943728714?c=14.26,0,0,0,dh&placePath=/home?bookmarkId=3865432496&from=map&fromPanelNum=1&additionalHeight=76&timestamp=202510181450&locale=ko&svcName=map_pcv5', false, NULL, NULL, 'date-2025-10-18-삼송', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), '몬드리안', '', '', 'https://place.map.kakao.com/1738807190', false, NULL, NULL, 'date-2025-10-18-삼송', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Restaurants for 2025-10-18 삼송
INSERT INTO restaurants (id, name, type, memo, image, link, visited, latitude, longitude, date_entry_id, created_at, updated_at)
VALUES
(gen_random_uuid(), '바앤다이닝', '일식', '', '', 'https://place.map.kakao.com/246556389', false, NULL, NULL, 'date-2025-10-18-삼송', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), '쇼타이', '일식', '', '', 'https://place.map.kakao.com/1058665093', false, NULL, NULL, 'date-2025-10-18-삼송', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), '더테이블', '양식', '', '', 'https://place.map.kakao.com/1758935202', false, NULL, NULL, 'date-2025-10-18-삼송', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), '포스터', '기타', '', '', 'https://place.map.kakao.com/105349534', false, NULL, NULL, 'date-2025-10-18-삼송', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ========================================
-- 2025-10-18 - 서오릉
-- ========================================
INSERT INTO date_entries (id, date, region, created_at, updated_at)
VALUES (
    'date-2025-10-18-서오릉',
    '2025-10-18',
    '서오릉',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Cafes for 2025-10-18 서오릉
INSERT INTO cafes (id, name, memo, image, link, visited, latitude, longitude, date_entry_id, created_at, updated_at)
VALUES
(gen_random_uuid(), '씨디에프 서오릉', '', 'https://img1.kakaocdn.net/cthumb/local/C800x800.q50/?fname=https%3A%2F%2Fpostfiles.pstatic.net%2FMjAyNTA3MjhfMTI5%2FMDAxNzUzNjgwOTE2Mzgw.F3axalLzqiAOxjr8412bqAmZYL3nCGfiYeQDC9NyI0cg.phiRGzXLIsKa5oVcGBasgZ_tmNwJpH_ay3gim1hrlT0g.JPEG%2FIMG%25EF%25BC%25BF9194.JPG%3Ftype%3Dw966', 'https://place.map.kakao.com/1566245848', false, NULL, NULL, 'date-2025-10-18-서오릉', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), '카페 산책', '', '', 'https://place.map.kakao.com/13075504', false, NULL, NULL, 'date-2025-10-18-서오릉', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), '이송당베이커리', '', '', 'https://place.map.kakao.com/2078347496', false, NULL, NULL, 'date-2025-10-18-서오릉', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Restaurants for 2025-10-18 서오릉
INSERT INTO restaurants (id, name, type, memo, image, link, visited, latitude, longitude, date_entry_id, created_at, updated_at)
VALUES
(gen_random_uuid(), '한우만', '고기집', '', '', 'https://place.map.kakao.com/16485346', false, NULL, NULL, 'date-2025-10-18-서오릉', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), '당구대장작통철판삼겹살', '고기집', '', '', 'https://place.map.kakao.com/1314159663', false, NULL, NULL, 'date-2025-10-18-서오릉', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ========================================
-- 2025-10-15 - 홍대
-- ========================================
INSERT INTO date_entries (id, date, region, created_at, updated_at)
VALUES (
    'date-2025-10-15-홍대',
    '2025-10-15',
    '홍대',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Cafes for 2025-10-15 홍대
INSERT INTO cafes (id, name, memo, image, link, visited, latitude, longitude, date_entry_id, created_at, updated_at)
VALUES
(gen_random_uuid(), '앤트러사이트', '넓고 쾌적함', '/images/cafe3.jpg', 'https://map.naver.com/', true, 37.5563, 126.9239, 'date-2025-10-15-홍대', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Restaurants for 2025-10-15 홍대
INSERT INTO restaurants (id, name, type, memo, image, link, visited, latitude, longitude, date_entry_id, created_at, updated_at)
VALUES
(gen_random_uuid(), '홍대 삼겹살', '고기집', '두툼한 삼겹살', '/images/food3.jpg', 'https://map.naver.com/', true, 37.5565, 126.924, 'date-2025-10-15-홍대', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Spots for 2025-10-15 홍대
INSERT INTO spots (id, name, memo, image, link, visited, latitude, longitude, date_entry_id, created_at, updated_at)
VALUES
(gen_random_uuid(), '홍대 거리', '버스킹 공연 많음', '/images/spot2.jpg', 'https://map.naver.com/', true, 37.556, 126.923, 'date-2025-10-15-홍대', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ========================================
-- 2025-10-10 - 강남
-- ========================================
INSERT INTO date_entries (id, date, region, created_at, updated_at)
VALUES (
    'date-2025-10-10-강남',
    '2025-10-10',
    '강남',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Restaurants for 2025-10-10 강남
INSERT INTO restaurants (id, name, type, memo, image, link, visited, latitude, longitude, date_entry_id, created_at, updated_at)
VALUES
(gen_random_uuid(), '청담 파스타', '양식', '크림 파스타 추천', '/images/food4.jpg', 'https://map.naver.com/', false, 37.5172, 127.0473, 'date-2025-10-10-강남', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Spots for 2025-10-10 강남
INSERT INTO spots (id, name, memo, image, link, visited, latitude, longitude, date_entry_id, created_at, updated_at)
VALUES
(gen_random_uuid(), '코엑스 별마당도서관', '사진 찍기 좋음', '/images/spot3.jpg', 'https://map.naver.com/', true, 37.5115, 127.0595, 'date-2025-10-10-강남', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ========================================
-- 2025-09-19 - 삼송
-- ========================================
INSERT INTO date_entries (id, date, region, created_at, updated_at)
VALUES (
    'date-2025-09-19-삼송',
    '2025-09-19',
    '삼송',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Restaurants for 2025-09-19 삼송
INSERT INTO restaurants (id, name, type, memo, image, link, visited, latitude, longitude, date_entry_id, created_at, updated_at)
VALUES
(gen_random_uuid(), '심야식당 세솔리', '일식', '', '', 'https://place.map.kakao.com/1640942760', true, NULL, NULL, 'date-2025-09-19-삼송', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ========================================
-- 2025-09-20 - 연신내 (empty)
-- ========================================
INSERT INTO date_entries (id, date, region, created_at, updated_at)
VALUES (
    'date-2025-09-20-연신내',
    '2025-09-20',
    '연신내',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ========================================
-- 2025-10-17 - 삼송
-- ========================================
INSERT INTO date_entries (id, date, region, created_at, updated_at)
VALUES (
    'date-2025-10-17-삼송',
    '2025-10-17',
    '삼송',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Cafes for 2025-10-17 삼송
INSERT INTO cafes (id, name, memo, image, link, visited, latitude, longitude, date_entry_id, created_at, updated_at)
VALUES
(gen_random_uuid(), '안녕스시', '', '', 'https://place.map.kakao.com/1970984560', false, NULL, NULL, 'date-2025-10-17-삼송', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ========================================
-- 2025-10-09 - 강릉
-- ========================================
INSERT INTO date_entries (id, date, region, created_at, updated_at)
VALUES (
    'date-2025-10-09-강릉',
    '2025-10-09',
    '강릉',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Cafes for 2025-10-09 강릉
INSERT INTO cafes (id, name, memo, image, link, visited, latitude, longitude, date_entry_id, created_at, updated_at)
VALUES
(gen_random_uuid(), '순두부젤라또 3호점', '', '', 'https://place.map.kakao.com/470543566', false, NULL, NULL, 'date-2025-10-09-강릉', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Restaurants for 2025-10-09 강릉
INSERT INTO restaurants (id, name, type, memo, image, link, visited, latitude, longitude, date_entry_id, created_at, updated_at)
VALUES
(gen_random_uuid(), '대게한마당 주문진본점', '일식', '', '', 'https://place.map.kakao.com/22838168', false, NULL, NULL, 'date-2025-10-09-강릉', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Spots for 2025-10-09 강릉
INSERT INTO spots (id, name, memo, image, link, visited, latitude, longitude, date_entry_id, created_at, updated_at)
VALUES
(gen_random_uuid(), '썬리치펜션', '', '', 'https://place.map.kakao.com/13096913', false, NULL, NULL, 'date-2025-10-09-강릉', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ========================================
-- 2025-10-16 - 삼송 (empty)
-- ========================================
INSERT INTO date_entries (id, date, region, created_at, updated_at)
VALUES (
    'date-2025-10-16-삼송',
    '2025-10-16',
    '삼송',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ========================================
-- 2025-10-23 - 삼송 (empty)
-- ========================================
INSERT INTO date_entries (id, date, region, created_at, updated_at)
VALUES (
    'date-2025-10-23-삼송',
    '2025-10-23',
    '삼송',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ========================================
-- 2025-10-02 - 삼송 (empty)
-- ========================================
INSERT INTO date_entries (id, date, region, created_at, updated_at)
VALUES (
    'date-2025-10-02-삼송',
    '2025-10-02',
    '삼송',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
