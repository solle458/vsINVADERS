package handler

import (
	"net/http"
	"strconv"
	"vsmaze-backend/domain/entity"
	"vsmaze-backend/usecase"

	"github.com/gin-gonic/gin"
)

// GameHandler handles HTTP requests for game operations
type GameHandler struct {
	gameUsecase *usecase.GameUsecase
}

// NewGameHandler creates a new game handler instance
func NewGameHandler(gameUsecase *usecase.GameUsecase) *GameHandler {
	return &GameHandler{
		gameUsecase: gameUsecase,
	}
}

// CreateGameRequest represents the request payload for creating a game
type CreateGameRequest struct {
	Player1Type string  `json:"player1_type" binding:"required"`
	Player1ID   *string `json:"player1_id"`
	Player2Type string  `json:"player2_type" binding:"required"`
	Player2ID   *string `json:"player2_id"`
}

// MakeMoveRequest represents the request payload for making a move
type MakeMoveRequest struct {
	Player    string `json:"player" binding:"required"`
	Action    string `json:"action" binding:"required"`
	Direction string `json:"direction" binding:"required"`
}

// GameResponse represents the response payload for game operations
type GameResponse struct {
	ID          int64            `json:"id"`
	Player1Type string           `json:"player1_type"`
	Player1ID   *string          `json:"player1_id"`
	Player2Type string           `json:"player2_type"`
	Player2ID   *string          `json:"player2_id"`
	Status      string           `json:"status"`
	CurrentTurn int              `json:"current_turn"`
	GameState   entity.GameState `json:"game_state"`
	Winner      *string          `json:"winner"`
	CreatedAt   string           `json:"created_at"`
	UpdatedAt   string           `json:"updated_at"`
}

// CreateGame handles POST /games
func (h *GameHandler) CreateGame(c *gin.Context) {
	var req CreateGameRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Convert string types to entity types
	player1Type := entity.PlayerType(req.Player1Type)
	player2Type := entity.PlayerType(req.Player2Type)

	// Create game
	game, err := h.gameUsecase.CreateGame(c.Request.Context(), player1Type, req.Player1ID, player2Type, req.Player2ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Convert to response
	response := h.gameToResponse(game)
	c.JSON(http.StatusCreated, response)
}

// GetGame handles GET /games/:id
func (h *GameHandler) GetGame(c *gin.Context) {
	gameID, err := h.parseGameID(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid game ID"})
		return
	}

	game, err := h.gameUsecase.GetGame(c.Request.Context(), gameID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "game not found"})
		return
	}

	response := h.gameToResponse(game)
	c.JSON(http.StatusOK, response)
}

// ListGames handles GET /games
func (h *GameHandler) ListGames(c *gin.Context) {
	// Parse query parameters
	limit := h.parseIntParam(c, "limit", 10)
	offset := h.parseIntParam(c, "offset", 0)

	games, err := h.gameUsecase.ListGames(c.Request.Context(), limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Convert to response
	responses := make([]GameResponse, len(games))
	for i, game := range games {
		responses[i] = h.gameToResponse(game)
	}

	c.JSON(http.StatusOK, gin.H{
		"games":  responses,
		"limit":  limit,
		"offset": offset,
		"total":  len(responses),
	})
}

// StartGame handles POST /games/:id/start
func (h *GameHandler) StartGame(c *gin.Context) {
	gameID, err := h.parseGameID(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid game ID"})
		return
	}

	game, err := h.gameUsecase.StartGame(c.Request.Context(), gameID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	response := h.gameToResponse(game)
	c.JSON(http.StatusOK, response)
}

// MakeMove handles POST /games/:id/move
func (h *GameHandler) MakeMove(c *gin.Context) {
	gameID, err := h.parseGameID(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid game ID"})
		return
	}

	var req MakeMoveRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Convert to entity action
	action := entity.Action{
		Type:      entity.ActionType(req.Action),
		Direction: entity.Direction(req.Direction),
	}

	game, err := h.gameUsecase.MakeMove(c.Request.Context(), gameID, req.Player, action)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	response := h.gameToResponse(game)
	c.JSON(http.StatusOK, response)
}

// GetGameHistory handles GET /games/:id/history
func (h *GameHandler) GetGameHistory(c *gin.Context) {
	gameID, err := h.parseGameID(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid game ID"})
		return
	}

	moves, err := h.gameUsecase.GetGameHistory(c.Request.Context(), gameID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"moves": moves})
}

// DeleteGame handles DELETE /games/:id
func (h *GameHandler) DeleteGame(c *gin.Context) {
	gameID, err := h.parseGameID(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid game ID"})
		return
	}

	if err := h.gameUsecase.DeleteGame(c.Request.Context(), gameID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}

// GetActiveGames handles GET /games/active
func (h *GameHandler) GetActiveGames(c *gin.Context) {
	games, err := h.gameUsecase.GetActiveGames(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Convert to response
	responses := make([]GameResponse, len(games))
	for i, game := range games {
		responses[i] = h.gameToResponse(game)
	}

	c.JSON(http.StatusOK, gin.H{"games": responses})
}

// parseGameID parses game ID from URL parameter
func (h *GameHandler) parseGameID(c *gin.Context) (int64, error) {
	idStr := c.Param("id")
	return strconv.ParseInt(idStr, 10, 64)
}

// parseIntParam parses integer parameter with default value
func (h *GameHandler) parseIntParam(c *gin.Context, key string, defaultValue int) int {
	valueStr := c.Query(key)
	if valueStr == "" {
		return defaultValue
	}

	value, err := strconv.Atoi(valueStr)
	if err != nil {
		return defaultValue
	}

	return value
}

// gameToResponse converts game entity to response
func (h *GameHandler) gameToResponse(game *entity.Game) GameResponse {
	var winner *string
	if game.Winner != nil {
		winnerStr := string(*game.Winner)
		winner = &winnerStr
	}

	return GameResponse{
		ID:          game.ID,
		Player1Type: string(game.Player1Type),
		Player1ID:   game.Player1ID,
		Player2Type: string(game.Player2Type),
		Player2ID:   game.Player2ID,
		Status:      string(game.Status),
		CurrentTurn: game.CurrentTurn,
		GameState:   game.GameState,
		Winner:      winner,
		CreatedAt:   game.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:   game.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}
