-- =============================================================================
-- Lost & Found Platform - PostgreSQL + pgvector Schema Definition
-- Reference: L&F_export/architecture/system-overview.md & postgresql-vs-vector-db.md
-- =============================================================================

-- Enable pgvector extension (if installed on PostgreSQL server)
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'ROLE_USER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Lost Items table
CREATE TABLE IF NOT EXISTS lost_items (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    lost_date DATE NOT NULL,
    lost_time TIME,
    location_name VARCHAR(200),
    address VARCHAR(300),
    city VARCHAR(100),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    reward_amount NUMERIC(10, 2),
    contact_preference VARCHAR(30) DEFAULT 'IN_APP_ONLY',
    contact_phone VARCHAR(50),
    contact_email VARCHAR(100),
    brand VARCHAR(100),
    model VARCHAR(100),
    primary_color VARCHAR(50),
    secondary_color VARCHAR(50),
    serial_number VARCHAR(100),
    distinctive_marks VARCHAR(500),
    scratches_or_damage VARCHAR(500),
    stickers_or_accessories VARCHAR(500),
    dimensions VARCHAR(100),
    condition_notes VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lost_items_category_status ON lost_items(category, status);
CREATE INDEX IF NOT EXISTS idx_lost_items_city ON lost_items(city);
CREATE INDEX IF NOT EXISTS idx_lost_items_user_id ON lost_items(user_id);

-- 3. Found Items table
CREATE TABLE IF NOT EXISTS found_items (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    found_date DATE NOT NULL,
    found_time TIME,
    location_name VARCHAR(200),
    address VARCHAR(300),
    city VARCHAR(100),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    storage_location VARCHAR(200),
    current_custodian VARCHAR(100),
    verification_question VARCHAR(500),
    brand VARCHAR(100),
    model VARCHAR(100),
    primary_color VARCHAR(50),
    secondary_color VARCHAR(50),
    serial_number VARCHAR(100),
    distinctive_marks VARCHAR(500),
    scratches_or_damage VARCHAR(500),
    stickers_or_accessories VARCHAR(500),
    dimensions VARCHAR(100),
    condition_notes VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_found_items_category_status ON found_items(category, status);
CREATE INDEX IF NOT EXISTS idx_found_items_city ON found_items(city);
CREATE INDEX IF NOT EXISTS idx_found_items_user_id ON found_items(user_id);

-- 4. Item Images & Vector Embeddings table
CREATE TABLE IF NOT EXISTS item_images (
    id BIGSERIAL PRIMARY KEY,
    lost_item_id BIGINT REFERENCES lost_items(id) ON DELETE CASCADE,
    found_item_id BIGINT REFERENCES found_items(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    file_path VARCHAR(500),
    original_filename VARCHAR(255),
    file_size BIGINT,
    mime_type VARCHAR(50),
    is_primary BOOLEAN DEFAULT FALSE,
    embedding TEXT,                 -- Relational fallback string
    -- vector_embedding vector(512), -- Optional pgvector native column: vector(512)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_item_images_lost_id ON item_images(lost_item_id);
CREATE INDEX IF NOT EXISTS idx_item_images_found_id ON item_images(found_item_id);

-- 5. Candidate Matches table
CREATE TABLE IF NOT EXISTS candidate_matches (
    id BIGSERIAL PRIMARY KEY,
    lost_item_id BIGINT NOT NULL REFERENCES lost_items(id) ON DELETE CASCADE,
    found_item_id BIGINT NOT NULL REFERENCES found_items(id) ON DELETE CASCADE,
    overall_score DOUBLE PRECISION NOT NULL,
    visual_score DOUBLE PRECISION,
    category_score DOUBLE PRECISION,
    attributes_score DOUBLE PRECISION,
    text_score DOUBLE PRECISION,
    location_score DOUBLE PRECISION,
    temporal_score DOUBLE PRECISION,
    status VARCHAR(30) NOT NULL DEFAULT 'POTENTIAL',
    reviewer_notes VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_lost_found_match UNIQUE (lost_item_id, found_item_id)
);

CREATE INDEX IF NOT EXISTS idx_matches_lost_score ON candidate_matches(lost_item_id, overall_score DESC);
CREATE INDEX IF NOT EXISTS idx_matches_found_score ON candidate_matches(found_item_id, overall_score DESC);

-- 6. Claims table
CREATE TABLE IF NOT EXISTS claims (
    id BIGSERIAL PRIMARY KEY,
    found_item_id BIGINT NOT NULL REFERENCES found_items(id) ON DELETE CASCADE,
    lost_item_id BIGINT REFERENCES lost_items(id) ON DELETE SET NULL,
    claimant_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
    proof_description TEXT NOT NULL,
    verification_answers VARCHAR(1000),
    proof_image_urls VARCHAR(1000),
    reviewer_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    reviewer_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_claims_found_item ON claims(found_item_id);
CREATE INDEX IF NOT EXISTS idx_claims_claimant ON claims(claimant_id);

-- 7. Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    reference_id BIGINT,
    reference_type VARCHAR(50),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
