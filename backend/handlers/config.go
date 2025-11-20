package handlers

import (
	"net/http"

	"github.com/Adam-Evans/CNT/backend/database"
	"github.com/Adam-Evans/CNT/backend/models"
	"github.com/gin-gonic/gin"
)

// GetConfig returns the current system configuration
func GetConfig(c *gin.Context) {
	db := database.GetDB()
	rows, err := db.Query("SELECT key, value, updated_at FROM config")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	config := make(map[string]interface{})
	for rows.Next() {
		var cfg models.Config
		if err := rows.Scan(&cfg.Key, &cfg.Value, &cfg.UpdatedAt); err != nil {
			continue
		}
		config[cfg.Key] = cfg.Value
	}

	c.JSON(http.StatusOK, config)
}

// UpdateConfig (Super Admin only) updates system configuration
func UpdateConfig(c *gin.Context) {
	var req models.ConfigUpdate
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := database.GetDB()

	if req.NuggetPrice != "" {
		_, err := db.Exec(`
			INSERT INTO config (key, value, updated_at) VALUES ('nugget_price', ?, CURRENT_TIMESTAMP)
			ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
		`, req.NuggetPrice)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update nugget price"})
			return
		}
	}

	if req.EventEndDate != "" {
		_, err := db.Exec(`
			INSERT INTO config (key, value, updated_at) VALUES ('event_end_date', ?, CURRENT_TIMESTAMP)
			ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
		`, req.EventEndDate)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update event end date"})
			return
		}
	}

	if req.OrdersClosingDate != "" {
		_, err := db.Exec(`
			INSERT INTO config (key, value, updated_at) VALUES ('orders_closing_date', ?, CURRENT_TIMESTAMP)
			ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
		`, req.OrdersClosingDate)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update orders closing date"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Configuration updated successfully"})
}
