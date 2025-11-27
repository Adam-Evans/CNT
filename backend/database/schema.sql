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
    show_ai_content BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Site configuration for customizable content (CEO section, etc.)
CREATE TABLE IF NOT EXISTS site_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

-- Registration Invites
CREATE TABLE IF NOT EXISTS registration_invites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    is_used BOOLEAN DEFAULT 0,
    expires_at DATETIME NOT NULL,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Insert default config values
INSERT OR IGNORE INTO config (key, value) VALUES 
    ('nugget_price', '5.00'),
    ('event_end_date', '2025-12-31T23:59:59Z');

-- Insert default site config values (CEO section)
INSERT OR IGNORE INTO site_config (key, value) VALUES 
    ('ceo_name', 'Dicky Tinds'),
    ('ceo_title', 'CEO'),
    ('ceo_image', ''),
    ('ceo_quote', 'Well, here we are sports fans!\n\nWinter is coming and Auto-Trail goes chicken nugget nutty. Never in my professional career have I seen such a thirst for poor quality, over processed meat, long may it continue!!!\n\nThe festive season is a time where we cherish what we have, appreciate our loved ones, give to charity, and butcher some poultry. When I first joined Auto-Trail the concept was very alien to me but knowing what I know now it''s very much an SOP of the business. As acting CEO is Mr. Spencer''s timely absence down under I empower all of you to get involved, order some nuggs and chow down with us on Tuesday 9th December. We must all come together to fuel this annual tradition and attempt to beat the previous year''s count. Using my fiscal contacts, I''ve managed to convince Mrs Reeves to hold off on the proposed tax rises for fast food so make hay while the sun shines and join the fun.\n\nVIVA LA NUGGET!');

-- Create default super admin (password: admin123 - CHANGE THIS!)
INSERT OR IGNORE INTO users (id, username, password_hash, is_super_admin) VALUES 
    (1, 'admin', '$2b$12$fL8tbuKjrzjhcdjp.WDjIOvQ59FoqlDJjKJ0q0kpUbJQylfLt7xS2', 1);
