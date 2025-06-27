package database

import (
	"context"
	"database/sql"
	"fmt"
	"time"
	"vsmaze-backend/domain/entity"
	"vsmaze-backend/domain/repository"
)

// gameRepositoryImpl implements repository.GameRepository
type gameRepositoryImpl struct {
	db *DB
}

// NewGameRepository creates a new game repository
func NewGameRepository(db *DB) repository.GameRepository {
	return &gameRepositoryImpl{db: db}
}

// Create creates a new game
func (r *gameRepositoryImpl) Create(ctx context.Context, game *entity.Game) error {
	// Convert game state to JSON
	gameStateJSON, err := game.ToJSON()
	if err != nil {
		return fmt.Errorf("failed to serialize game state: %w", err)
	}

	query := `
		INSERT INTO games (
			player1_type, player1_id, player2_type, player2_id,
			status, current_turn, game_state, winner,
			created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`

	result, err := r.db.ExecContext(ctx, query,
		string(game.Player1Type), game.Player1ID,
		string(game.Player2Type), game.Player2ID,
		string(game.Status), game.CurrentTurn,
		gameStateJSON, game.Winner,
		game.CreatedAt, game.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to create game: %w", err)
	}

	// Get the generated ID
	id, err := result.LastInsertId()
	if err != nil {
		return fmt.Errorf("failed to get last insert id: %w", err)
	}

	game.ID = id
	return nil
}

// GetByID retrieves a game by ID
func (r *gameRepositoryImpl) GetByID(ctx context.Context, id int64) (*entity.Game, error) {
	query := `
		SELECT id, player1_type, player1_id, player2_type, player2_id,
			   status, current_turn, game_state, winner,
			   created_at, updated_at
		FROM games
		WHERE id = ?
	`

	var game entity.Game
	var gameStateJSON string
	var winner sql.NullString

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&game.ID, &game.Player1Type, &game.Player1ID,
		&game.Player2Type, &game.Player2ID,
		&game.Status, &game.CurrentTurn,
		&gameStateJSON, &winner,
		&game.CreatedAt, &game.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("game not found")
		}
		return nil, fmt.Errorf("failed to get game: %w", err)
	}

	// Parse game state from JSON
	if err := game.FromJSON(gameStateJSON); err != nil {
		return nil, fmt.Errorf("failed to deserialize game state: %w", err)
	}

	// Handle nullable winner
	if winner.Valid {
		w := entity.Winner(winner.String)
		game.Winner = &w
	}

	return &game, nil
}

// Update updates an existing game
func (r *gameRepositoryImpl) Update(ctx context.Context, game *entity.Game) error {
	// Convert game state to JSON
	gameStateJSON, err := game.ToJSON()
	if err != nil {
		return fmt.Errorf("failed to serialize game state: %w", err)
	}

	query := `
		UPDATE games
		SET player1_type = ?, player1_id = ?, player2_type = ?, player2_id = ?,
			status = ?, current_turn = ?, game_state = ?, winner = ?,
			updated_at = ?
		WHERE id = ?
	`

	game.UpdatedAt = time.Now()

	result, err := r.db.ExecContext(ctx, query,
		string(game.Player1Type), game.Player1ID,
		string(game.Player2Type), game.Player2ID,
		string(game.Status), game.CurrentTurn,
		gameStateJSON, game.Winner,
		game.UpdatedAt, game.ID,
	)
	if err != nil {
		return fmt.Errorf("failed to update game: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("game not found")
	}

	return nil
}

// Delete deletes a game by ID
func (r *gameRepositoryImpl) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM games WHERE id = ?`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete game: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("game not found")
	}

	return nil
}

// List retrieves games with pagination
func (r *gameRepositoryImpl) List(ctx context.Context, limit, offset int) ([]*entity.Game, error) {
	query := `
		SELECT id, player1_type, player1_id, player2_type, player2_id,
			   status, current_turn, game_state, winner,
			   created_at, updated_at
		FROM games
		ORDER BY created_at DESC
		LIMIT ? OFFSET ?
	`

	rows, err := r.db.QueryContext(ctx, query, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to list games: %w", err)
	}
	defer rows.Close()

	var games []*entity.Game
	for rows.Next() {
		var game entity.Game
		var gameStateJSON string
		var winner sql.NullString

		err := rows.Scan(
			&game.ID, &game.Player1Type, &game.Player1ID,
			&game.Player2Type, &game.Player2ID,
			&game.Status, &game.CurrentTurn,
			&gameStateJSON, &winner,
			&game.CreatedAt, &game.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan game: %w", err)
		}

		// Parse game state from JSON
		if err := game.FromJSON(gameStateJSON); err != nil {
			return nil, fmt.Errorf("failed to deserialize game state: %w", err)
		}

		// Handle nullable winner
		if winner.Valid {
			w := entity.Winner(winner.String)
			game.Winner = &w
		}

		games = append(games, &game)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows iteration error: %w", err)
	}

	return games, nil
}

// GetByStatus retrieves games by status
func (r *gameRepositoryImpl) GetByStatus(ctx context.Context, status entity.GameStatus) ([]*entity.Game, error) {
	query := `
		SELECT id, player1_type, player1_id, player2_type, player2_id,
			   status, current_turn, game_state, winner,
			   created_at, updated_at
		FROM games
		WHERE status = ?
		ORDER BY created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query, string(status))
	if err != nil {
		return nil, fmt.Errorf("failed to get games by status: %w", err)
	}
	defer rows.Close()

	var games []*entity.Game
	for rows.Next() {
		var game entity.Game
		var gameStateJSON string
		var winner sql.NullString

		err := rows.Scan(
			&game.ID, &game.Player1Type, &game.Player1ID,
			&game.Player2Type, &game.Player2ID,
			&game.Status, &game.CurrentTurn,
			&gameStateJSON, &winner,
			&game.CreatedAt, &game.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan game: %w", err)
		}

		// Parse game state from JSON
		if err := game.FromJSON(gameStateJSON); err != nil {
			return nil, fmt.Errorf("failed to deserialize game state: %w", err)
		}

		// Handle nullable winner
		if winner.Valid {
			w := entity.Winner(winner.String)
			game.Winner = &w
		}

		games = append(games, &game)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows iteration error: %w", err)
	}

	return games, nil
}

// GetActiveGames retrieves currently active games
func (r *gameRepositoryImpl) GetActiveGames(ctx context.Context) ([]*entity.Game, error) {
	return r.GetByStatus(ctx, entity.GameStatusPlaying)
}

// GetGamesByPlayer retrieves games by player
func (r *gameRepositoryImpl) GetGamesByPlayer(ctx context.Context, playerID string, playerType entity.PlayerType) ([]*entity.Game, error) {
	query := `
		SELECT id, player1_type, player1_id, player2_type, player2_id,
			   status, current_turn, game_state, winner,
			   created_at, updated_at
		FROM games
		WHERE (player1_type = ? AND player1_id = ?)
		   OR (player2_type = ? AND player2_id = ?)
		ORDER BY created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query,
		string(playerType), playerID,
		string(playerType), playerID,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get games by player: %w", err)
	}
	defer rows.Close()

	var games []*entity.Game
	for rows.Next() {
		var game entity.Game
		var gameStateJSON string
		var winner sql.NullString

		err := rows.Scan(
			&game.ID, &game.Player1Type, &game.Player1ID,
			&game.Player2Type, &game.Player2ID,
			&game.Status, &game.CurrentTurn,
			&gameStateJSON, &winner,
			&game.CreatedAt, &game.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan game: %w", err)
		}

		// Parse game state from JSON
		if err := game.FromJSON(gameStateJSON); err != nil {
			return nil, fmt.Errorf("failed to deserialize game state: %w", err)
		}

		// Handle nullable winner
		if winner.Valid {
			w := entity.Winner(winner.String)
			game.Winner = &w
		}

		games = append(games, &game)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows iteration error: %w", err)
	}

	return games, nil
}
