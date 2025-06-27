package database

import (
	"database/sql"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3"
)

// DB holds the database connection
type DB struct {
	*sql.DB
}

// NewDB creates a new database connection
func NewDB(dataSourceName string) (*DB, error) {
	// Ensure the data directory exists
	if err := ensureDataDir(dataSourceName); err != nil {
		return nil, fmt.Errorf("failed to create data directory: %w", err)
	}

	// Open SQLite connection
	db, err := sql.Open("sqlite3", dataSourceName)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Test the connection
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	// Enable foreign key constraints
	if _, err := db.Exec("PRAGMA foreign_keys = ON"); err != nil {
		return nil, fmt.Errorf("failed to enable foreign keys: %w", err)
	}

	return &DB{db}, nil
}

// ensureDataDir creates the data directory if it doesn't exist
func ensureDataDir(dataSourceName string) error {
	dir := filepath.Dir(dataSourceName)
	if dir != "." && dir != "" {
		return os.MkdirAll(dir, 0755)
	}
	return nil
}

// Migrate runs database migrations
func (db *DB) Migrate() error {
	// Read schema file
	schemaPath := filepath.Join("infrastructure", "database", "schema.sql")
	schema, err := ioutil.ReadFile(schemaPath)
	if err != nil {
		return fmt.Errorf("failed to read schema file: %w", err)
	}

	// Execute schema
	if _, err := db.Exec(string(schema)); err != nil {
		return fmt.Errorf("failed to execute schema: %w", err)
	}

	return nil
}

// Close closes the database connection
func (db *DB) Close() error {
	return db.DB.Close()
}

// BeginTx starts a new transaction
func (db *DB) BeginTx() (*sql.Tx, error) {
	return db.DB.Begin()
}
