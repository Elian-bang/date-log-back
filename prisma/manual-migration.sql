-- Manual Migration for DateLog Database
-- Created to bypass Prisma migration issues

-- Create date_entries table
CREATE TABLE IF NOT EXISTS date_entries (
    id VARCHAR(36) PRIMARY KEY,
    date DATE UNIQUE NOT NULL,
    region VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for date_entries
CREATE INDEX IF NOT EXISTS idx_date_entries_region ON date_entries(region);
CREATE INDEX IF NOT EXISTS idx_date_entries_date ON date_entries(date);

-- Create cafes table
CREATE TABLE IF NOT EXISTS cafes (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    memo VARCHAR(500),
    image TEXT,
    link TEXT,
    visited BOOLEAN NOT NULL DEFAULT FALSE,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    date_entry_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (date_entry_id) REFERENCES date_entries(id) ON DELETE CASCADE
);

-- Create indexes for cafes
CREATE INDEX IF NOT EXISTS idx_cafes_date_entry_id ON cafes(date_entry_id);
CREATE INDEX IF NOT EXISTS idx_cafes_visited ON cafes(visited);

-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,
    memo VARCHAR(500),
    image TEXT,
    link TEXT,
    visited BOOLEAN NOT NULL DEFAULT FALSE,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    date_entry_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (date_entry_id) REFERENCES date_entries(id) ON DELETE CASCADE
);

-- Create indexes for restaurants
CREATE INDEX IF NOT EXISTS idx_restaurants_date_entry_id ON restaurants(date_entry_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_type ON restaurants(type);
CREATE INDEX IF NOT EXISTS idx_restaurants_visited ON restaurants(visited);

-- Create spots table
CREATE TABLE IF NOT EXISTS spots (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    memo VARCHAR(500),
    image TEXT,
    link TEXT,
    visited BOOLEAN NOT NULL DEFAULT FALSE,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    date_entry_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (date_entry_id) REFERENCES date_entries(id) ON DELETE CASCADE
);

-- Create indexes for spots
CREATE INDEX IF NOT EXISTS idx_spots_date_entry_id ON spots(date_entry_id);
CREATE INDEX IF NOT EXISTS idx_spots_visited ON spots(visited);
