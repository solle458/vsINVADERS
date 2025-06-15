package main

import (
	"log"
	"vsmaze-backend/interfaces/handler"
	"vsmaze-backend/usecase"

	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize services
	// gameService := service.NewGameService() // TODO: Enable when infrastructure layer is implemented

	// Initialize usecases
	// Note: Repository implementations will be added in infrastructure layer
	var gameUsecase *usecase.GameUsecase
	// gameUsecase = usecase.NewGameUsecase(gameRepo, gameMoveRepo, gameService)

	// Initialize handlers
	gameHandler := handler.NewGameHandler(gameUsecase)

	// Setup Gin router
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
			"status":  "ok",
			"service": "vsmaze-backend",
			"version": "v0.1.0",
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

	// WebSocket endpoint (placeholder)
	r.GET("/ws", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "WebSocket endpoint - to be implemented",
		})
	})

	// Start server
	port := ":8080"
	log.Printf("Starting VSmaze Backend Server on port %s", port)
	log.Printf("Health check: http://localhost%s/health", port)
	log.Printf("API base URL: http://localhost%s/api/v1", port)

	if err := r.Run(port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
