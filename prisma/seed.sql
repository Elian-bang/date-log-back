-- Seed data for DateLog
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Insert date entry 1
INSERT INTO date_entries (id, date, region, created_at, updated_at)
VALUES (
    'a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6',
    '2025-10-18',
    '삼송',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Insert cafe for date entry 1
INSERT INTO cafes (id, name, memo, image, link, visited, latitude, longitude, date_entry_id, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    '나무사이로',
    '분위기 좋은 창가 자리 있음',
    NULL,
    'https://naver.me/cafe-example',
    TRUE,
    37.6789,
    126.9123,
    'a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Insert restaurant for date entry 1
INSERT INTO restaurants (id, name, type, memo, image, link, visited, latitude, longitude, date_entry_id, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    '이이요',
    '한식',
    '고등어정식 맛있음',
    NULL,
    NULL,
    TRUE,
    37.6790,
    126.9125,
    'a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Insert spot for date entry 1
INSERT INTO spots (id, name, memo, image, link, visited, latitude, longitude, date_entry_id, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    '북한산 둘레길',
    '산책로 좋음',
    NULL,
    NULL,
    FALSE,
    37.6800,
    126.9130,
    'a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Insert date entry 2
INSERT INTO date_entries (id, date, region, created_at, updated_at)
VALUES (
    'b2c3d4e5-f6g7-48h9-i0j1-k2l3m4n5o6p7',
    '2025-10-25',
    '은평',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Insert cafe for date entry 2
INSERT INTO cafes (id, name, memo, image, link, visited, latitude, longitude, date_entry_id, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    '카페 이태리',
    '티라미수가 맛있어요',
    NULL,
    NULL,
    FALSE,
    37.6123,
    126.9234,
    'b2c3d4e5-f6g7-48h9-i0j1-k2l3m4n5o6p7',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Insert restaurants for date entry 2
INSERT INTO restaurants (id, name, type, memo, image, link, visited, latitude, longitude, date_entry_id, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    '스시 하나',
    '일식',
    '신선한 회',
    NULL,
    NULL,
    FALSE,
    37.6124,
    126.9235,
    'b2c3d4e5-f6g7-48h9-i0j1-k2l3m4n5o6p7',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    uuid_generate_v4(),
    '마라탕 전문점',
    '중식',
    NULL,
    NULL,
    NULL,
    FALSE,
    NULL,
    NULL,
    'b2c3d4e5-f6g7-48h9-i0j1-k2l3m4n5o6p7',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Insert spot for date entry 2
INSERT INTO spots (id, name, memo, image, link, visited, latitude, longitude, date_entry_id, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    '북한산 등산로',
    '초보자 코스',
    NULL,
    NULL,
    FALSE,
    NULL,
    NULL,
    'b2c3d4e5-f6g7-48h9-i0j1-k2l3m4n5o6p7',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
