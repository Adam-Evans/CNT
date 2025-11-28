package main

import (
	"log"
	"os"

	"github.com/Adam-Evans/CNT/backend/ai"
	"github.com/Adam-Evans/CNT/backend/database"
	"github.com/Adam-Evans/CNT/backend/handlers"
	"github.com/Adam-Evans/CNT/backend/middleware"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Configure logging
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	log.Println("🐔 CNT API Server Starting...")

	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("INFO: No .env file found, relying on system environment variables")
	} else {
		log.Println("INFO: Loaded .env file")
	}

	// Log startup configuration
	log.Printf("Startup Configuration:")
	log.Printf("- GIN_MODE: %s", os.Getenv("GIN_MODE"))
	log.Printf("- PORT: %s", os.Getenv("PORT"))
	log.Printf("- DB_PATH: %s", os.Getenv("DB_PATH"))
	log.Printf("- JWT_SECRET Set: %v", os.Getenv("JWT_SECRET") != "")
	log.Printf("- GEMINI_API_KEY Set: %v", os.Getenv("GEMINI_API_KEY") != "")

	wd, _ := os.Getwd()
	log.Printf("- Working Directory: %s", wd)

	// Initialize database
	dbPath := database.GetDatabasePath()
	log.Printf("Initializing database at: %s", dbPath)
	if err := database.InitDB(dbPath); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer database.Close()

	// Initialize Gemini AI client
	if err := ai.InitGeminiClient(); err != nil {
		log.Printf("Warning: Failed to initialize Gemini client: %v", err)
	}
	defer ai.Close()

	// Set Gin mode
	if os.Getenv("GIN_MODE") == "" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()

	// Apply CORS middleware
	r.Use(middleware.CORSMiddleware())

	// Public routes
	public := r.Group("/api")
	{
		public.POST("/auth/login", handlers.Login)
		public.POST("/auth/register", handlers.Register)
		public.GET("/brokers", handlers.GetAllBrokers)
		public.GET("/brokers/:id", handlers.GetBrokerProfile)
		public.POST("/orders", handlers.CreateOrder)
		public.GET("/config", handlers.GetConfig)
		public.GET("/site-config", handlers.GetSiteConfig)
	}

	// Authenticated routes
	auth := r.Group("/api")
	auth.Use(middleware.AuthMiddleware())
	{
		auth.GET("/auth/me", handlers.GetCurrentUser)
		auth.PUT("/auth/change-password", handlers.ChangePassword)
		auth.GET("/my/profile", handlers.GetMyProfile)
		auth.PUT("/my/profile", handlers.UpdateMyProfile)
		auth.GET("/my/propaganda", handlers.GetMyPropaganda)
		auth.GET("/my/orders", handlers.GetMyOrders)
		auth.PUT("/my/orders/:id", handlers.UpdateMyOrder)
		auth.DELETE("/my/orders/:id", handlers.DeleteMyOrder)
	}

	// Super admin routes
	admin := r.Group("/api/admin")
	admin.Use(middleware.AuthMiddleware(), middleware.SuperAdminMiddleware())
	{
		admin.GET("/orders", handlers.GetAllOrders)
		admin.PUT("/orders/:id", handlers.UpdateOrder)
		admin.DELETE("/orders/:id", handlers.DeleteOrder)
		admin.GET("/stats", handlers.GetBrokerStats)
		admin.PUT("/config", handlers.UpdateConfig)
		admin.PUT("/site-config", handlers.UpdateSiteConfig)
		admin.PUT("/brokers/:id", handlers.UpdateBrokerProfile)
		admin.PUT("/brokers/:id/ai-content", handlers.UpdateBrokerAIContent)
		admin.PUT("/brokers/:id/reset-password", handlers.ResetBrokerPassword)
		admin.DELETE("/brokers/:id", handlers.DeleteBroker)
		admin.POST("/invites", handlers.GenerateInvite)
	}

	// Serve static files (React app)
	r.Static("/assets", "./frontend/dist/assets")
	r.StaticFile("/app", "./frontend/dist/index.html")
	r.NoRoute(func(c *gin.Context) {
		c.File("./frontend/dist/index.html")
	})

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
