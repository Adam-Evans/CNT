package handlers

import (
	"database/sql"
	"net/http"
	"os"
	"time"

	"github.com/Adam-Evans/CNT/backend/database"
	"github.com/Adam-Evans/CNT/backend/models"
	"github.com/Adam-Evans/CNT/backend/utils"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// Login authenticates a user and returns a JWT token
func Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Super Admin Login
	if req.Username == "sa" {
		saPassword := os.Getenv("SUPER_ADMIN_PASSWORD")
		if saPassword == "" {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Super admin not configured"})
			return
		}

		if req.Password != saPassword {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}

		// Create a dummy user object for the token
		token, err := utils.GenerateToken(0, "sa", true)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
			return
		}

		c.JSON(http.StatusOK, models.LoginResponse{
			Token: token,
			User: models.User{
				ID:           0,
				Username:     "sa",
				IsSuperAdmin: true,
			},
		})
		return
	}

	db := database.GetDB()
	var user models.User
	err := db.QueryRow(
		"SELECT id, username, password_hash, is_super_admin, created_at FROM users WHERE username = ?",
		req.Username,
	).Scan(&user.ID, &user.Username, &user.PasswordHash, &user.IsSuperAdmin, &user.CreatedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if !utils.CheckPasswordHash(req.Password, user.PasswordHash) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	token, err := utils.GenerateToken(user.ID, user.Username, user.IsSuperAdmin)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, models.LoginResponse{
		Token: token,
		User:  user,
	})
}

// Register creates a new broker user
func Register(c *gin.Context) {
	var req struct {
		Username   string `json:"username" binding:"required"`
		Password   string `json:"password" binding:"required,min=6"`
		InviteCode string `json:"invite_code" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := database.GetDB()

	// Verify Invite Code
	var inviteID int
	err := db.QueryRow(
		"SELECT id FROM registration_invites WHERE code = ? AND is_used = 0 AND expires_at > CURRENT_TIMESTAMP",
		req.InviteCode,
	).Scan(&inviteID)

	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired invite code"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error checking invite"})
		return
	}

	passwordHash, err := utils.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	tx, err := db.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer tx.Rollback()

	// Mark invite as used
	_, err = tx.Exec("UPDATE registration_invites SET is_used = 1 WHERE id = ?", inviteID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to use invite code"})
		return
	}

	result, err := tx.Exec(
		"INSERT INTO users (username, password_hash, is_super_admin) VALUES (?, ?, 0)",
		req.Username, passwordHash,
	)

	if err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Username already exists"})
		return
	}

	userID, _ := result.LastInsertId()

	// Create default broker profile
	_, err = tx.Exec(
		"INSERT INTO broker_profiles (user_id, name) VALUES (?, ?)",
		userID, req.Username,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create profile"})
		return
	}

	if err := tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}

	token, err := utils.GenerateToken(int(userID), req.Username, false)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, models.LoginResponse{
		Token: token,
		User: models.User{
			ID:           int(userID),
			Username:     req.Username,
			IsSuperAdmin: false,
		},
	})
}

// GenerateInvite creates a new one-time registration invite
func GenerateInvite(c *gin.Context) {
	// Generate a random code
	code := uuid.New().String()

	// Set expiration (1 hour)
	expiresAt := time.Now().Add(1 * time.Hour)

	db := database.GetDB()
	_, err := db.Exec(
		"INSERT INTO registration_invites (code, expires_at) VALUES (?, ?)",
		code, expiresAt,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate invite"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":       code,
		"expires_at": expiresAt,
	})
}

// GetCurrentUser returns the currently authenticated user
func GetCurrentUser(c *gin.Context) {
	userID := c.GetInt("user_id")

	db := database.GetDB()
	var user models.User
	err := db.QueryRow(
		"SELECT id, username, is_super_admin, created_at FROM users WHERE id = ?",
		userID,
	).Scan(&user.ID, &user.Username, &user.IsSuperAdmin, &user.CreatedAt)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}
