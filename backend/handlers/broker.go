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
		       bp.testimonials, bp.profile_picture, bp.created_at, bp.updated_at
		FROM users u
		LEFT JOIN broker_profiles bp ON u.id = bp.user_id
		WHERE u.is_super_admin = 0
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	var brokers []models.BrokerWithProfile
	for rows.Next() {
		var broker models.BrokerWithProfile
		var profile models.BrokerProfile
		var profileID sql.NullInt64
		var profileUserID sql.NullInt64
		var profileName sql.NullString
		var profileBio sql.NullString
		var profileMission sql.NullString
		var profileTestimonials sql.NullString
		var profilePicture sql.NullString
		var profileCreatedAt sql.NullTime
		var profileUpdatedAt sql.NullTime

		err := rows.Scan(
			&broker.ID, &broker.Username, &broker.IsSuperAdmin, &broker.CreatedAt,
			&profileID, &profileUserID, &profileName, &profileBio, &profileMission,
			&profileTestimonials, &profilePicture, &profileCreatedAt, &profileUpdatedAt,
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
			profile.CreatedAt = profileCreatedAt.Time
			profile.UpdatedAt = profileUpdatedAt.Time
			broker.Profile = &profile
		}

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
	err = db.QueryRow(`
		SELECT id, user_id, name, bio, mission_statement, testimonials, 
		       profile_picture, created_at, updated_at
		FROM broker_profiles
		WHERE user_id = ?
	`, brokerID).Scan(
		&profile.ID, &profile.UserID, &profile.Name, &profile.Bio,
		&profile.MissionStatement, &profile.Testimonials, &profile.ProfilePicture,
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

	c.JSON(http.StatusOK, profile)
}

// GetMyProfile returns the current user's broker profile
func GetMyProfile(c *gin.Context) {
	userID := c.GetInt("user_id")

	db := database.GetDB()
	var profile models.BrokerProfile
	err := db.QueryRow(`
		SELECT id, user_id, name, bio, mission_statement, testimonials, 
		       profile_picture, created_at, updated_at
		FROM broker_profiles
		WHERE user_id = ?
	`, userID).Scan(
		&profile.ID, &profile.UserID, &profile.Name, &profile.Bio,
		&profile.MissionStatement, &profile.Testimonials, &profile.ProfilePicture,
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

	c.JSON(http.StatusOK, gin.H{"message": "Profile updated successfully"})
}

// GetMyPropaganda returns AI-generated propaganda for the current broker
func GetMyPropaganda(c *gin.Context) {
	userID := c.GetInt("user_id")

	db := database.GetDB()
	var bio, missionStatement, testimonials string
	err := db.QueryRow(`
		SELECT bio, mission_statement, testimonials
		FROM broker_profiles
		WHERE user_id = ?
	`, userID).Scan(&bio, &missionStatement, &testimonials)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Profile not found"})
		return
	}

	propaganda, err := ai.GeneratePropaganda(userID, bio, missionStatement, testimonials)
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
