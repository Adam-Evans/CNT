package database

import (
	"database/sql"
	"embed"
	"log"
	"os"

	_ "github.com/mattn/go-sqlite3"
)

//go:embed schema.sql
var schemaFS embed.FS

var DB *sql.DB

func InitDB(dbPath string) error {
	var err error
	DB, err = sql.Open("sqlite3", dbPath)
	if err != nil {
		return err
	}

	// Enable foreign keys
	if _, err := DB.Exec("PRAGMA foreign_keys = ON"); err != nil {
		return err
	}

	// Read and execute schema
	schema, err := schemaFS.ReadFile("schema.sql")
	if err != nil {
		return err
	}

	if _, err := DB.Exec(string(schema)); err != nil {
		return err
	}

	// Run migrations
	if err := runMigrations(); err != nil {
		return err
	}

	log.Println("Database initialized successfully")
	return nil
}

// runMigrations applies any necessary database migrations for existing databases
func runMigrations() error {
	// Migration: Add show_ai_content column to broker_profiles if it doesn't exist
	// This is needed for databases created before the individual AI content control feature
	var columnExists int
	err := DB.QueryRow(`
		SELECT COUNT(*) FROM pragma_table_info('broker_profiles') WHERE name = 'show_ai_content'
	`).Scan(&columnExists)
	if err != nil {
		return err
	}

	if columnExists == 0 {
		log.Println("Running migration: Adding show_ai_content column to broker_profiles")
		_, err := DB.Exec(`ALTER TABLE broker_profiles ADD COLUMN show_ai_content BOOLEAN DEFAULT 1`)
		if err != nil {
			return err
		}
		log.Println("Migration complete: show_ai_content column added")
	}

	return nil
}

func GetDB() *sql.DB {
	return DB
}

func Close() error {
	if DB != nil {
		return DB.Close()
	}
	return nil
}

// GetDatabasePath returns the database path from env or default
func GetDatabasePath() string {
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "./cnt.db"
	}
	return dbPath
}
