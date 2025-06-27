package main

import (
	"log"
	"os"
	"path/filepath"
	"vsmaze-backend/domain/service"
	"vsmaze-backend/infrastructure/database"
	"vsmaze-backend/interfaces/handler"
	"vsmaze-backend/usecase"

	"github.com/gin-gonic/gin"
)

func main() {
	// Database configuration
	dataDir := filepath.Join("..", "data")
	dbPath := filepath.Join(dataDir, "game.db")

	// Initialize database connection
	db, err := database.NewDB(dbPath)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	// Run database migrations
	if err := db.Migrate(); err != nil {
		log.Fatal("Failed to run database migrations:", err)
	}

	log.Printf("Database connected and migrated successfully: %s", dbPath)

	// Initialize repositories
	gameRepo := database.NewGameRepository(db)
	gameMoveRepo := database.NewGameMoveRepository(db)
	// aiRepo := database.NewAIRepository(db)           // Phase 2
	// aiRankingRepo := database.NewAIRankingRepository(db) // Phase 2

	// Initialize services
	gameService := service.NewGameService()
	aiService := service.NewAIService()

	// Initialize usecases
	gameUsecase := usecase.NewGameUsecase(gameRepo, gameMoveRepo, gameService, aiService)

	// Initialize handlers
	gameHandler := handler.NewGameHandler(gameUsecase)

	// Setup Gin router
	gin.SetMode(gin.ReleaseMode) // Set production mode
	if os.Getenv("GIN_MODE") == "debug" {
		gin.SetMode(gin.DebugMode)
	}

	r := gin.Default()

	// Add CORS middleware
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":    "ok",
			"service":   "vsmaze-backend",
			"version":   "v0.1.0",
			"database":  "connected",
			"timestamp": "2024-12-18T10:00:00Z",
		})
	})

	// API routes
	api := r.Group("/api/v1")

	// Game routes
	games := api.Group("/games")
	{
		games.POST("", gameHandler.CreateGame)                // POST /api/v1/games
		games.GET("", gameHandler.ListGames)                  // GET /api/v1/games
		games.GET("/active", gameHandler.GetActiveGames)      // GET /api/v1/games/active
		games.GET("/:id", gameHandler.GetGame)                // GET /api/v1/games/:id
		games.POST("/:id/start", gameHandler.StartGame)       // POST /api/v1/games/:id/start
		games.POST("/:id/move", gameHandler.MakeMove)         // POST /api/v1/games/:id/move
		games.GET("/:id/history", gameHandler.GetGameHistory) // GET /api/v1/games/:id/history
		games.DELETE("/:id", gameHandler.DeleteGame)          // DELETE /api/v1/games/:id
	}

	// AI routes (placeholder for Phase 2)
	ais := api.Group("/ais")
	{
		ais.GET("", func(c *gin.Context) {
			c.JSON(200, gin.H{"message": "AI management endpoints - Phase 2"})
		})
	}

	// WebSocket endpoint (placeholder)
	r.GET("/ws", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "WebSocket endpoint - to be implemented in Phase 1",
		})
	})

	// Start server
	port := ":8080"
	log.Printf("🚀 VSmaze Backend Server starting...")
	log.Printf("📊 Health check: http://localhost%s/health", port)
	log.Printf("🎮 API base URL: http://localhost%s/api/v1", port)
	log.Printf("💾 Database: %s", dbPath)
	log.Printf("🔧 Environment: %s", gin.Mode())

	if err := r.Run(port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
