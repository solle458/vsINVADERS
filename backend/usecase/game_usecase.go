package usecase

import (
	"context"
	"encoding/json"
	"fmt"
	"vsmaze-backend/domain/entity"
	"vsmaze-backend/domain/repository"
	"vsmaze-backend/domain/service"

	"github.com/google/uuid"
)

// GameUsecase defines the application logic for game operations
type GameUsecase struct {
	gameRepo     repository.GameRepository
	gameMoveRepo repository.GameMoveRepository
	gameService  *service.GameService
	aiService    *service.AIService
}

// NewGameUsecase creates a new game usecase instance
func NewGameUsecase(
	gameRepo repository.GameRepository,
	gameMoveRepo repository.GameMoveRepository,
	gameService *service.GameService,
	aiService *service.AIService,
) *GameUsecase {
	return &GameUsecase{
		gameRepo:     gameRepo,
		gameMoveRepo: gameMoveRepo,
		gameService:  gameService,
		aiService:    aiService,
	}
}

// CreateGame creates a new game
func (uc *GameUsecase) CreateGame(ctx context.Context, player1Type entity.PlayerType, player1ID *string, player2Type entity.PlayerType, player2ID *string) (*entity.Game, error) {
	// Validate game creation parameters
	if err := uc.gameService.ValidateGameCreation(player1Type, player1ID, player2Type, player2ID); err != nil {
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	// Create new game
	game := entity.NewGame(player1Type, player1ID, player2Type, player2ID)

	// Save to repository
	if err := uc.gameRepo.Create(ctx, game); err != nil {
		return nil, fmt.Errorf("failed to create game: %w", err)
	}

	return game, nil
}

// StartGame starts a game
func (uc *GameUsecase) StartGame(ctx context.Context, gameID int64) (*entity.Game, error) {
	// Get game
	game, err := uc.gameRepo.GetByID(ctx, gameID)
	if err != nil {
		return nil, fmt.Errorf("failed to get game: %w", err)
	}

	// Check if game can be started
	if game.Status != entity.GameStatusWaiting {
		return nil, fmt.Errorf("game is not in waiting status")
	}

	// Start game
	game.StartGame()

	// Update repository
	if err := uc.gameRepo.Update(ctx, game); err != nil {
		return nil, fmt.Errorf("failed to update game: %w", err)
	}

	return game, nil
}

// MakeMove processes a player move
func (uc *GameUsecase) MakeMove(ctx context.Context, gameID int64, playerName string, action entity.Action) (*entity.Game, error) {
	// Get game
	game, err := uc.gameRepo.GetByID(ctx, gameID)
	if err != nil {
		return nil, fmt.Errorf("failed to get game: %w", err)
	}

	// Check if game is in playing status
	if game.Status != entity.GameStatusPlaying {
		return nil, fmt.Errorf("game is not in playing status")
	}

	// Process move using game service
	if err := uc.gameService.ProcessMove(game, action, playerName); err != nil {
		return nil, fmt.Errorf("failed to process move: %w", err)
	}

	// Create game move record
	actionData, err := json.Marshal(action)
	if err != nil {
		return nil, fmt.Errorf("failed to serialize action: %w", err)
	}

	gameMove := &entity.GameMove{
		GameID:     gameID,
		TurnNumber: game.CurrentTurn,
		Player:     playerName,
		MoveType:   string(action.Type),
		MoveData:   string(actionData),
	}

	// Save move to repository
	if err := uc.gameMoveRepo.Create(ctx, gameMove); err != nil {
		return nil, fmt.Errorf("failed to save game move: %w", err)
	}

	// Check win condition
	if gameEnded, winner := uc.gameService.CheckWinCondition(game); gameEnded {
		game.FinishGame(winner)
	} else {
		// Advance to next turn
		game.NextTurn()
	}

	// Update game in repository
	if err := uc.gameRepo.Update(ctx, game); err != nil {
		return nil, fmt.Errorf("failed to update game: %w", err)
	}

	return game, nil
}

// GetGame retrieves a game by ID
func (uc *GameUsecase) GetGame(ctx context.Context, gameID int64) (*entity.Game, error) {
	game, err := uc.gameRepo.GetByID(ctx, gameID)
	if err != nil {
		return nil, fmt.Errorf("failed to get game: %w", err)
	}

	return game, nil
}

// ListGames retrieves games with pagination
func (uc *GameUsecase) ListGames(ctx context.Context, limit, offset int) ([]*entity.Game, error) {
	games, err := uc.gameRepo.List(ctx, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to list games: %w", err)
	}

	return games, nil
}

// GetActiveGames retrieves currently active games
func (uc *GameUsecase) GetActiveGames(ctx context.Context) ([]*entity.Game, error) {
	games, err := uc.gameRepo.GetActiveGames(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get active games: %w", err)
	}

	return games, nil
}

// GetGameHistory retrieves the move history for a game
func (uc *GameUsecase) GetGameHistory(ctx context.Context, gameID int64) ([]*entity.GameMove, error) {
	moves, err := uc.gameMoveRepo.GetByGameID(ctx, gameID)
	if err != nil {
		return nil, fmt.Errorf("failed to get game history: %w", err)
	}

	return moves, nil
}

// DeleteGame deletes a game and its moves
func (uc *GameUsecase) DeleteGame(ctx context.Context, gameID int64) error {
	// Delete game moves first
	if err := uc.gameMoveRepo.DeleteByGameID(ctx, gameID); err != nil {
		return fmt.Errorf("failed to delete game moves: %w", err)
	}

	// Delete game
	if err := uc.gameRepo.Delete(ctx, gameID); err != nil {
		return fmt.Errorf("failed to delete game: %w", err)
	}

	return nil
}

// GenerateGameID generates a unique game ID
func (uc *GameUsecase) GenerateGameID() string {
	return uuid.New().String()
}

// ProcessAITurn processes a COM AI turn
func (uc *GameUsecase) ProcessAITurn(ctx context.Context, gameID int64) (*entity.Game, error) {
	// Get game
	game, err := uc.gameRepo.GetByID(ctx, gameID)
	if err != nil {
		return nil, fmt.Errorf("failed to get game: %w", err)
	}

	// Check if game is in playing status
	if game.Status != entity.GameStatusPlaying {
		return nil, fmt.Errorf("game is not in playing status")
	}

	// Determine current player and check if it's a COM player
	var playerType entity.PlayerType
	var playerID *string
	var playerName string

	if game.GameState.TurnPlayer == "player1" {
		playerType = game.Player1Type
		playerID = game.Player1ID
		playerName = "player1"
	} else {
		playerType = game.Player2Type
		playerID = game.Player2ID
		playerName = "player2"
	}

	// Only process if current player is COM
	if playerType != entity.PlayerTypeCOM {
		return nil, fmt.Errorf("current player is not COM")
	}

	if playerID == nil {
		return nil, fmt.Errorf("COM player ID is nil")
	}

	// Get AI move
	action, err := uc.aiService.GetAIMove(game, *playerID, playerName)
	if err != nil {
		return nil, fmt.Errorf("failed to get AI move: %w", err)
	}

	// Process the AI move
	return uc.MakeMove(ctx, gameID, playerName, action)
}

// CheckAndProcessAITurn checks if current player is AI and processes the turn automatically
func (uc *GameUsecase) CheckAndProcessAITurn(ctx context.Context, game *entity.Game) (*entity.Game, error) {
	// Check if current player is COM
	var playerType entity.PlayerType
	if game.GameState.TurnPlayer == "player1" {
		playerType = game.Player1Type
	} else {
		playerType = game.Player2Type
	}

	// If current player is COM, process AI turn automatically
	if playerType == entity.PlayerTypeCOM && game.Status == entity.GameStatusPlaying {
		return uc.ProcessAITurn(ctx, game.ID)
	}

	return game, nil
}
