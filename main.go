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
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Initialize database
	dbPath := database.GetDatabasePath()
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
	}

	// Authenticated routes
	auth := r.Group("/api")
	auth.Use(middleware.AuthMiddleware())
	{
		auth.GET("/auth/me", handlers.GetCurrentUser)
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
		admin.GET("/stats", handlers.GetBrokerStats)
		admin.PUT("/config", handlers.UpdateConfig)
		admin.PUT("/brokers/:id", handlers.UpdateBrokerProfile)
		admin.POST("/invites", handlers.GenerateInvite)
	}

	// Serve static files (React app)
	r.Static("/assets", "./frontend/dist/assets")
	r.StaticFile("/", "./frontend/dist/index.html")
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
