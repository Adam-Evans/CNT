# CEO Section Configuration Guide

This document explains how to configure the CEO section on the home page using the new `site_config` table.

## Overview

The CEO section on the home page is now fully configurable through the Super Admin panel or directly via the database. This allows you to update the message, name, title, and image without code changes.

## Configuration Keys

| Key | Description | Default |
|-----|-------------|---------|
| `ceo_name` | Name displayed under the message | Dicky Tinds |
| `ceo_title` | Title displayed after the name | CEO |
| `ceo_image` | URL to the CEO's image | Uses bundled default image |
| `ceo_quote` | The main message/quote displayed | Uses default Christmas message |

## Method 1: Using the Super Admin Panel (Recommended)

1. Log in as super admin
2. Navigate to the Admin Dashboard
3. Find the "Site Content (CEO Section)" panel
4. Click "Edit Site Content"
5. Fill in the fields:
   - **CEO Name**: e.g., "Dicky Tinds"
   - **CEO Title**: e.g., "CEO"
   - **CEO Image URL**: URL to an image (leave empty for default)
   - **CEO Quote/Message**: The text to display
6. Click "Save Changes"

## Method 2: Direct Database Updates

You can also update the site configuration directly using SQL:

```sql
-- Update CEO Name
INSERT INTO site_config (key, value, updated_at) 
VALUES ('ceo_name', 'Dicky Tinds', CURRENT_TIMESTAMP)
ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at;

-- Update CEO Title  
INSERT INTO site_config (key, value, updated_at) 
VALUES ('ceo_title', 'CEO', CURRENT_TIMESTAMP)
ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at;

-- Update CEO Image (use empty string for default bundled image)
INSERT INTO site_config (key, value, updated_at) 
VALUES ('ceo_image', 'https://example.com/your-ceo-image.jpg', CURRENT_TIMESTAMP)
ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at;

-- Update CEO Quote/Message
INSERT INTO site_config (key, value, updated_at) 
VALUES ('ceo_quote', 'Your custom CEO message here...', CURRENT_TIMESTAMP)
ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at;
```

## Method 3: Using the API

You can also update the site configuration via the API:

```bash
curl -X PUT http://localhost:8080/api/admin/site-config \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ceo_name": "Dicky Tinds",
    "ceo_title": "CEO",
    "ceo_image": "https://example.com/image.jpg",
    "ceo_quote": "Your custom CEO message here..."
  }'
```

## Populating Default Values

The database schema includes default values that will be inserted on first run:

```sql
-- Default values from schema.sql
INSERT OR IGNORE INTO site_config (key, value) VALUES 
    ('ceo_name', 'Dicky Tinds'),
    ('ceo_title', 'CEO'),
    ('ceo_image', ''),
    ('ceo_quote', 'Well, here we are sports fans!...');
```

## Example: Setting Up for a New Event

```sql
-- Example: Configure for CNT 2025
INSERT INTO site_config (key, value, updated_at) VALUES 
    ('ceo_name', 'Richard Spencer', CURRENT_TIMESTAMP)
ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at;

INSERT INTO site_config (key, value, updated_at) VALUES 
    ('ceo_title', 'Acting CEO', CURRENT_TIMESTAMP)
ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at;

INSERT INTO site_config (key, value, updated_at) VALUES 
    ('ceo_quote', 'Welcome to Chicken Nugget Tuesday 2025! 
    
This year promises to be our biggest and best yet. Get your orders in early and support your favorite broker!

VIVA LA NUGGET!', CURRENT_TIMESTAMP)
ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at;
```

## Notes

- If any value is empty, the system will fall back to the default values
- The CEO image can be any valid image URL
- The message supports line breaks (use `\n` in SQL or actual line breaks in the admin panel)
- Changes take effect immediately - no restart required
