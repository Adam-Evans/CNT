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
	model := geminiClient.GenerativeModel("gemini-flash-latest")

	prompt := fmt.Sprintf(`You are a satirical campaign manager creating humorous "opposite day" propaganda. 
Given the following broker profile, create a funny, tongue-in-cheek "anti-propaganda" message that twists their own words against them.
What we essentially want is to flip their own words against them. They claim to be reliable? Untrustworthy! Great service? Terrible service 0/10 etc.
Do not acknowledge that this is satire, just present the propaganda as fact as a direct replacement for the content.

Structure the output using HTML with inline styles to match the following layout exactly (mimicking the user's real profile style but with twisted content):

1. **Mission Statement Section**:
   - Container: background-color: white; padding: 1rem; border-radius: 0.5rem; box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); border: 1px solid #fef3c7; margin-bottom: 1rem;
   - Title ("Mission Statement"): font-weight: bold; color: #92400e; margin-bottom: 0.25rem; font-family: sans-serif; display: block;
   - Content: font-style: italic; color: #4b5563; display: block;

2. **About Section** (Bio):
   - Container: background-color: white; padding: 1rem; border-radius: 0.5rem; box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); border: 1px solid #fef3c7; margin-bottom: 1rem;
   - Title ("About"): font-weight: bold; color: #92400e; margin-bottom: 0.25rem; font-family: sans-serif; display: block;
   - Content: color: #4b5563; line-height: 1.5; display: block;

3. **Testimonials Section**:
   - Container: background-color: #fef3c7; padding: 1rem; border-radius: 0.5rem; border: 1px solid #fde68a;
   - Title ("Testimonials"): font-weight: bold; color: #78350f; margin-bottom: 0.5rem; font-family: sans-serif; display: block;
   - Content: Generate 2-3 fake negative/sarcastic testimonials.
   - Each Testimonial Item: display: flex; gap: 0.5rem; margin-bottom: 0.5rem; align-items: flex-start;
   - Quote Icon: content "❝"; color: #f59e0b; font-size: 1.2em; line-height: 1;
   - Text: font-style: italic; color: #78350f;

Input Data:
Bio: %s
Mission Statement: %s
Testimonials: %s

Generate the HTML now, starting with the Mission Statement div. Do not include markdown code blocks or html tags.`, bio, missionStatement, testimonials)

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
