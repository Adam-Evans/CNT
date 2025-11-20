-- Users table (brokers and super admin)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_super_admin BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Broker profiles
CREATE TABLE IF NOT EXISTS broker_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    name TEXT NOT NULL,
    bio TEXT,
    mission_statement TEXT,
    testimonials TEXT,
    profile_picture TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    broker_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK(quantity >= 1 AND quantity <= 10),
    cost REAL NOT NULL,
    is_paid BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (broker_id) REFERENCES users(id) ON DELETE CASCADE
);

-- System configuration
CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- AI cache for propaganda
CREATE TABLE IF NOT EXISTS ai_cache (
    broker_id INTEGER PRIMARY KEY,
    propaganda_content TEXT NOT NULL,
    bio_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (broker_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default config values
INSERT OR IGNORE INTO config (key, value) VALUES 
    ('nugget_price', '5.00'),
    ('event_end_date', '2025-12-31T23:59:59Z');

-- Create default super admin (password: admin123 - CHANGE THIS!)
INSERT OR IGNORE INTO users (id, username, password_hash, is_super_admin) VALUES 
    (1, 'admin', '$2a$10$rLjVqF8cqN9gqZPZqYGqwO7Z3qN6vXQkF3qN6vXQkF3qN6vXQkF3q', 1);
