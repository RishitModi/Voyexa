CREATE TABLE IF NOT EXISTS traveler_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    relation VARCHAR(20) CHECK (relation IN ('self', 'spouse', 'child', 'parent', 'friend', 'other')),
    dob DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    dietary_preferences VARCHAR(20) CHECK (dietary_preferences IN ('veg', 'non_veg', 'vegan')),
    mobility_level VARCHAR(30) CHECK (mobility_level IN ('none', 'limited_walking', 'wheelchair', 'elderly_friendly')),
    nationality VARCHAR(50),
    interests JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_traveler_profiles_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_traveler_profiles_user_id ON traveler_profiles (user_id);
