package ai

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/Adam-Evans/CNT/backend/database"
	"github.com/Adam-Evans/CNT/backend/utils"
	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

var geminiClient *genai.Client

// InitGeminiClient initializes the Google Gemini API client
func InitGeminiClient() error {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		log.Println("Warning: GEMINI_API_KEY not set, AI propaganda will not work")
		return nil
	}

	ctx := context.Background()
	var err error
	geminiClient, err = genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return fmt.Errorf("failed to create Gemini client: %w", err)
	}

	log.Println("Gemini AI client initialized successfully")
	return nil
}

// GeneratePropaganda generates anti-propaganda for a broker based on their profile
func GeneratePropaganda(brokerID int, bio, missionStatement, testimonials string) (string, error) {
	if geminiClient == nil {
		return "AI propaganda generation not available (API key not configured)", nil
	}

	// Check cache first
	bioHash := utils.HashString(bio + missionStatement + testimonials)
	cached, err := getCachedPropaganda(brokerID, bioHash)
	if err == nil && cached != "" {
		log.Printf("Using cached propaganda for broker %d", brokerID)
		return cached, nil
	}

	// Generate new propaganda
	ctx := context.Background()
	model := geminiClient.GenerativeModel("gemini-1.5-flash")

	prompt := fmt.Sprintf(`You are a satirical campaign manager creating humorous "opposite day" propaganda. 
Given the following broker profile, create a funny, tongue-in-cheek "anti-propaganda" message that playfully twists their own words against them. 
Keep it lighthearted and funny, not mean-spirited. Maximum 3-4 sentences.

Bio: %s
Mission Statement: %s
Testimonials: %s

Generate the anti-propaganda:`, bio, missionStatement, testimonials)

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		return "", fmt.Errorf("failed to generate content: %w", err)
	}

	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		return "", fmt.Errorf("no content generated")
	}

	propaganda := fmt.Sprintf("%v", resp.Candidates[0].Content.Parts[0])

	// Cache the result
	if err := cachePropaganda(brokerID, propaganda, bioHash); err != nil {
		log.Printf("Warning: failed to cache propaganda: %v", err)
	}

	return propaganda, nil
}

func getCachedPropaganda(brokerID int, bioHash string) (string, error) {
	db := database.GetDB()
	var content, hash string
	err := db.QueryRow("SELECT propaganda_content, bio_hash FROM ai_cache WHERE broker_id = ?", brokerID).Scan(&content, &hash)
	if err != nil {
		return "", err
	}

	if hash != bioHash {
		// Bio has changed, invalidate cache
		return "", fmt.Errorf("cache invalidated")
	}

	return content, nil
}

func cachePropaganda(brokerID int, content, bioHash string) error {
	db := database.GetDB()
	_, err := db.Exec(`
		INSERT OR REPLACE INTO ai_cache (broker_id, propaganda_content, bio_hash, created_at)
		VALUES (?, ?, ?, CURRENT_TIMESTAMP)
	`, brokerID, content, bioHash)
	return err
}

// Close closes the Gemini client
func Close() {
	if geminiClient != nil {
		geminiClient.Close()
	}
}
