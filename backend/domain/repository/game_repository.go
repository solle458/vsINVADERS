package repository

import (
	"context"
	"vsmaze-backend/domain/entity"
)

// GameRepository defines the interface for game data operations
type GameRepository interface {
	// Create creates a new game
	Create(ctx context.Context, game *entity.Game) error

	// GetByID retrieves a game by ID
	GetByID(ctx context.Context, id int64) (*entity.Game, error)

	// Update updates an existing game
	Update(ctx context.Context, game *entity.Game) error

	// Delete deletes a game by ID
	Delete(ctx context.Context, id int64) error

	// List retrieves games with pagination
	List(ctx context.Context, limit, offset int) ([]*entity.Game, error)

	// GetByStatus retrieves games by status
	GetByStatus(ctx context.Context, status entity.GameStatus) ([]*entity.Game, error)

	// GetActiveGames retrieves currently active games
	GetActiveGames(ctx context.Context) ([]*entity.Game, error)

	// GetGamesByPlayer retrieves games by player (AI ID or player type)
	GetGamesByPlayer(ctx context.Context, playerID string, playerType entity.PlayerType) ([]*entity.Game, error)
}

// GameMoveRepository defines the interface for game move data operations
type GameMoveRepository interface {
	// Create creates a new game move
	Create(ctx context.Context, move *entity.GameMove) error

	// GetByGameID retrieves all moves for a game
	GetByGameID(ctx context.Context, gameID int64) ([]*entity.GameMove, error)

	// GetByGameIDAndTurn retrieves moves for a specific game and turn
	GetByGameIDAndTurn(ctx context.Context, gameID int64, turnNumber int) ([]*entity.GameMove, error)

	// GetLastMove retrieves the last move for a game
	GetLastMove(ctx context.Context, gameID int64) (*entity.GameMove, error)

	// Delete deletes moves by game ID (for cleanup)
	DeleteByGameID(ctx context.Context, gameID int64) error
}
