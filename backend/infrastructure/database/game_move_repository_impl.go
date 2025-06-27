package database

import (
	"context"
	"database/sql"
	"fmt"
	"vsmaze-backend/domain/entity"
	"vsmaze-backend/domain/repository"
)

// gameMoveRepositoryImpl implements repository.GameMoveRepository
type gameMoveRepositoryImpl struct {
	db *DB
}

// NewGameMoveRepository creates a new game move repository
func NewGameMoveRepository(db *DB) repository.GameMoveRepository {
	return &gameMoveRepositoryImpl{db: db}
}

// Create creates a new game move
func (r *gameMoveRepositoryImpl) Create(ctx context.Context, move *entity.GameMove) error {
	query := `
		INSERT INTO game_moves (
			game_id, turn_number, player, move_type, move_data, created_at
		) VALUES (?, ?, ?, ?, ?, ?)
	`

	result, err := r.db.ExecContext(ctx, query,
		move.GameID, move.TurnNumber, move.Player,
		move.MoveType, move.MoveData, move.CreatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to create game move: %w", err)
	}

	// Get the generated ID
	id, err := result.LastInsertId()
	if err != nil {
		return fmt.Errorf("failed to get last insert id: %w", err)
	}

	move.ID = id
	return nil
}

// GetByGameID retrieves all moves for a game
func (r *gameMoveRepositoryImpl) GetByGameID(ctx context.Context, gameID int64) ([]*entity.GameMove, error) {
	query := `
		SELECT id, game_id, turn_number, player, move_type, move_data, created_at
		FROM game_moves
		WHERE game_id = ?
		ORDER BY turn_number ASC, created_at ASC
	`

	rows, err := r.db.QueryContext(ctx, query, gameID)
	if err != nil {
		return nil, fmt.Errorf("failed to get game moves: %w", err)
	}
	defer rows.Close()

	var moves []*entity.GameMove
	for rows.Next() {
		var move entity.GameMove

		err := rows.Scan(
			&move.ID, &move.GameID, &move.TurnNumber,
			&move.Player, &move.MoveType, &move.MoveData, &move.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan game move: %w", err)
		}

		moves = append(moves, &move)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows iteration error: %w", err)
	}

	return moves, nil
}

// GetByGameIDAndTurn retrieves moves for a specific game and turn
func (r *gameMoveRepositoryImpl) GetByGameIDAndTurn(ctx context.Context, gameID int64, turnNumber int) ([]*entity.GameMove, error) {
	query := `
		SELECT id, game_id, turn_number, player, move_type, move_data, created_at
		FROM game_moves
		WHERE game_id = ? AND turn_number = ?
		ORDER BY created_at ASC
	`

	rows, err := r.db.QueryContext(ctx, query, gameID, turnNumber)
	if err != nil {
		return nil, fmt.Errorf("failed to get game moves by turn: %w", err)
	}
	defer rows.Close()

	var moves []*entity.GameMove
	for rows.Next() {
		var move entity.GameMove

		err := rows.Scan(
			&move.ID, &move.GameID, &move.TurnNumber,
			&move.Player, &move.MoveType, &move.MoveData, &move.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan game move: %w", err)
		}

		moves = append(moves, &move)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows iteration error: %w", err)
	}

	return moves, nil
}

// GetLastMove retrieves the last move for a game
func (r *gameMoveRepositoryImpl) GetLastMove(ctx context.Context, gameID int64) (*entity.GameMove, error) {
	query := `
		SELECT id, game_id, turn_number, player, move_type, move_data, created_at
		FROM game_moves
		WHERE game_id = ?
		ORDER BY turn_number DESC, created_at DESC
		LIMIT 1
	`

	var move entity.GameMove

	err := r.db.QueryRowContext(ctx, query, gameID).Scan(
		&move.ID, &move.GameID, &move.TurnNumber,
		&move.Player, &move.MoveType, &move.MoveData, &move.CreatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("no moves found for game")
		}
		return nil, fmt.Errorf("failed to get last move: %w", err)
	}

	return &move, nil
}

// DeleteByGameID deletes moves by game ID
func (r *gameMoveRepositoryImpl) DeleteByGameID(ctx context.Context, gameID int64) error {
	query := `DELETE FROM game_moves WHERE game_id = ?`

	_, err := r.db.ExecContext(ctx, query, gameID)
	if err != nil {
		return fmt.Errorf("failed to delete game moves: %w", err)
	}

	return nil
}
