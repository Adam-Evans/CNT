package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/Adam-Evans/CNT/backend/ai"
	"github.com/Adam-Evans/CNT/backend/database"
	"github.com/Adam-Evans/CNT/backend/models"
	"github.com/gin-gonic/gin"
)

// GetAllBrokers returns all brokers with their profiles (for customer selection)
func GetAllBrokers(c *gin.Context) {
	db := database.GetDB()
	rows, err := db.Query(`
		SELECT u.id, u.username, u.is_super_admin, u.created_at,
		       bp.id, bp.user_id, bp.name, bp.bio, bp.mission_statement, 
		       bp.testimonials, bp.profile_picture, bp.show_ai_content, bp.created_at, bp.updated_at,
		       ac.propaganda_content,
		       (SELECT COALESCE(SUM(quantity), 0) FROM orders WHERE broker_id = u.id AND is_paid = 1) as total_sold
		FROM users u
		LEFT JOIN broker_profiles bp ON u.id = bp.user_id
		LEFT JOIN ai_cache ac ON u.id = ac.broker_id
		WHERE u.is_super_admin = 0
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	// Define a struct that includes propaganda
	type BrokerWithPropaganda struct {
		models.BrokerWithProfile
		Propaganda string `json:"propaganda"`
		TotalSold  int    `json:"total_sold"`
	}

	var brokers []BrokerWithPropaganda
	for rows.Next() {
		var broker BrokerWithPropaganda
		var profile models.BrokerProfile
		var profileID sql.NullInt64
		var profileUserID sql.NullInt64
		var profileName sql.NullString
		var profileBio sql.NullString
		var profileMission sql.NullString
		var profileTestimonials sql.NullString
		var profilePicture sql.NullString
		var showAIContent sql.NullBool
		var profileCreatedAt sql.NullTime
		var profileUpdatedAt sql.NullTime
		var propagandaContent sql.NullString
		var totalSold int

		err := rows.Scan(
			&broker.ID, &broker.Username, &broker.IsSuperAdmin, &broker.CreatedAt,
			&profileID, &profileUserID, &profileName, &profileBio, &profileMission,
			&profileTestimonials, &profilePicture, &showAIContent, &profileCreatedAt, &profileUpdatedAt,
			&propagandaContent, &totalSold,
		)
		if err != nil {
			continue
		}

		if profileID.Valid {
			profile.ID = int(profileID.Int64)
			profile.UserID = int(profileUserID.Int64)
			profile.Name = profileName.String
			profile.Bio = profileBio.String
			profile.MissionStatement = profileMission.String
			profile.Testimonials = profileTestimonials.String
			profile.ProfilePicture = profilePicture.String
			profile.ShowAIContent = showAIContent.Bool
			profile.CreatedAt = profileCreatedAt.Time
			profile.UpdatedAt = profileUpdatedAt.Time
			broker.Profile = &profile
		}

		broker.Propaganda = propagandaContent.String
		broker.TotalSold = totalSold
		brokers = append(brokers, broker)
	}

	c.JSON(http.StatusOK, brokers)
}

// GetBrokerProfile returns a specific broker's profile
func GetBrokerProfile(c *gin.Context) {
	brokerID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid broker ID"})
		return
	}

	db := database.GetDB()
	var profile models.BrokerProfile
	var bio, missionStatement, testimonials, profilePicture sql.NullString
	var showAIContent sql.NullBool

	err = db.QueryRow(`
		SELECT id, user_id, name, bio, mission_statement, testimonials, 
		       profile_picture, show_ai_content, created_at, updated_at
		FROM broker_profiles
		WHERE user_id = ?
	`, brokerID).Scan(
		&profile.ID, &profile.UserID, &profile.Name, &bio,
		&missionStatement, &testimonials, &profilePicture, &showAIContent,
		&profile.CreatedAt, &profile.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "Profile not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	profile.Bio = bio.String
	profile.MissionStatement = missionStatement.String
	profile.Testimonials = testimonials.String
	profile.ProfilePicture = profilePicture.String
	profile.ShowAIContent = showAIContent.Bool

	c.JSON(http.StatusOK, profile)
}

// GetMyProfile returns the current user's broker profile
func GetMyProfile(c *gin.Context) {
	userID := c.GetInt("user_id")

	db := database.GetDB()
	var profile models.BrokerProfile
	var bio, missionStatement, testimonials, profilePicture sql.NullString
	var showAIContent sql.NullBool

	err := db.QueryRow(`
		SELECT id, user_id, name, bio, mission_statement, testimonials, 
		       profile_picture, show_ai_content, created_at, updated_at
		FROM broker_profiles
		WHERE user_id = ?
	`, userID).Scan(
		&profile.ID, &profile.UserID, &profile.Name, &bio,
		&missionStatement, &testimonials, &profilePicture, &showAIContent,
		&profile.CreatedAt, &profile.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "Profile not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	profile.Bio = bio.String
	profile.MissionStatement = missionStatement.String
	profile.Testimonials = testimonials.String
	profile.ProfilePicture = profilePicture.String
	profile.ShowAIContent = showAIContent.Bool

	c.JSON(http.StatusOK, profile)
}

// UpdateMyProfile updates the current user's broker profile
func UpdateMyProfile(c *gin.Context) {
	userID := c.GetInt("user_id")

	var req models.BrokerProfileUpdate
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := database.GetDB()
	_, err := db.Exec(`
		UPDATE broker_profiles
		SET name = ?, bio = ?, mission_statement = ?, testimonials = ?, 
		    profile_picture = ?, updated_at = CURRENT_TIMESTAMP
		WHERE user_id = ?
	`, req.Name, req.Bio, req.MissionStatement, req.Testimonials, req.ProfilePicture, userID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	// Re-run anti-propaganda
	propaganda, err := ai.GeneratePropaganda(userID, req.Bio, req.MissionStatement, req.Testimonials)
	if err == nil {
		// Cache the result
		// Check if cache exists
		var exists bool
		err = db.QueryRow("SELECT EXISTS(SELECT 1 FROM ai_cache WHERE broker_id = ?)", userID).Scan(&exists)
		if err == nil {
			if exists {
				_, _ = db.Exec("UPDATE ai_cache SET propaganda_content = ?, created_at = CURRENT_TIMESTAMP WHERE broker_id = ?", propaganda, userID)
			} else {
				// We need a bio_hash, but for now let's just use a placeholder or empty string as it seems unused in the logic provided so far
				// Or better, calculate a simple hash
				_, _ = db.Exec("INSERT INTO ai_cache (broker_id, propaganda_content, bio_hash) VALUES (?, ?, ?)", userID, propaganda, "updated_hash")
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Profile updated successfully"})
}

// GetMyPropaganda returns AI-generated propaganda for the current broker
func GetMyPropaganda(c *gin.Context) {
	userID := c.GetInt("user_id")

	db := database.GetDB()
	var bio, missionStatement, testimonials sql.NullString
	err := db.QueryRow(`
		SELECT bio, mission_statement, testimonials
		FROM broker_profiles
		WHERE user_id = ?
	`, userID).Scan(&bio, &missionStatement, &testimonials)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Profile not found"})
		return
	}

	propaganda, err := ai.GeneratePropaganda(userID, bio.String, missionStatement.String, testimonials.String)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate propaganda"})
		return
	}

	c.JSON(http.StatusOK, models.PropagandaResponse{Content: propaganda})
}

// UpdateBrokerProfile (Super Admin only) updates any broker's profile
func UpdateBrokerProfile(c *gin.Context) {
	brokerID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid broker ID"})
		return
	}

	var req models.BrokerProfileUpdate
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := database.GetDB()
	_, err = db.Exec(`
		UPDATE broker_profiles
		SET name = ?, bio = ?, mission_statement = ?, testimonials = ?, 
		    profile_picture = ?, updated_at = CURRENT_TIMESTAMP
		WHERE user_id = ?
	`, req.Name, req.Bio, req.MissionStatement, req.Testimonials, req.ProfilePicture, brokerID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Profile updated successfully"})
}

// UpdateBrokerAIContent (Super Admin only) toggles the AI content visibility for a specific broker
func UpdateBrokerAIContent(c *gin.Context) {
	brokerID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid broker ID"})
		return
	}

	var req models.BrokerAIContentUpdate
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := database.GetDB()
	_, err = db.Exec(`
		UPDATE broker_profiles
		SET show_ai_content = ?, updated_at = CURRENT_TIMESTAMP
		WHERE user_id = ?
	`, req.ShowAIContent, brokerID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update AI content setting"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "AI content setting updated successfully"})
}

// DeleteBroker deletes a broker and all their related data
func DeleteBroker(c *gin.Context) {
	brokerID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid broker ID"})
		return
	}

	db := database.GetDB()
	tx, err := db.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
		return
	}
	defer tx.Rollback()

	// Delete all orders for this broker
	if _, err := tx.Exec("DELETE FROM orders WHERE broker_id = ?", brokerID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete orders"})
		return
	}

	// Delete broker profile
	if _, err := tx.Exec("DELETE FROM broker_profiles WHERE user_id = ?", brokerID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete profile"})
		return
	}

	// Delete AI cache for broker
	if _, err := tx.Exec("DELETE FROM ai_cache WHERE broker_id = ?", brokerID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear cache"})
		return
	}

	// Delete the user itself
	if _, err := tx.Exec("DELETE FROM users WHERE id = ?", brokerID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}

	if err := tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Broker deleted successfully"})
}
