package database

import (
	"context"
	"database/sql"
	"fmt"
	"time"
	"vsmaze-backend/domain/entity"
	"vsmaze-backend/domain/repository"
)

// aiRepositoryImpl implements repository.AIRepository
type aiRepositoryImpl struct {
	db *DB
}

// NewAIRepository creates a new AI repository
func NewAIRepository(db *DB) repository.AIRepository {
	return &aiRepositoryImpl{db: db}
}

// Create creates a new AI model
func (r *aiRepositoryImpl) Create(ctx context.Context, ai *entity.AIModel) error {
	query := `
		INSERT INTO ai_models (
			id, name, description, file_path, status, win_rate,
			total_games, wins, losses, draws, created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`

	_, err := r.db.ExecContext(ctx, query,
		ai.ID, ai.Name, ai.Description, ai.FilePath,
		string(ai.Status), ai.WinRate, ai.TotalGames,
		ai.Wins, ai.Losses, ai.Draws,
		ai.CreatedAt, ai.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to create AI model: %w", err)
	}

	return nil
}

// GetByID retrieves an AI model by ID
func (r *aiRepositoryImpl) GetByID(ctx context.Context, id string) (*entity.AIModel, error) {
	query := `
		SELECT id, name, description, file_path, status, win_rate,
			   total_games, wins, losses, draws, created_at, updated_at
		FROM ai_models
		WHERE id = ?
	`

	var ai entity.AIModel
	var status string

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&ai.ID, &ai.Name, &ai.Description, &ai.FilePath,
		&status, &ai.WinRate, &ai.TotalGames,
		&ai.Wins, &ai.Losses, &ai.Draws,
		&ai.CreatedAt, &ai.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("AI model not found")
		}
		return nil, fmt.Errorf("failed to get AI model: %w", err)
	}

	ai.Status = entity.AIStatus(status)
	return &ai, nil
}

// Update updates an existing AI model
func (r *aiRepositoryImpl) Update(ctx context.Context, ai *entity.AIModel) error {
	query := `
		UPDATE ai_models
		SET name = ?, description = ?, file_path = ?, status = ?,
			win_rate = ?, total_games = ?, wins = ?, losses = ?, draws = ?,
			updated_at = ?
		WHERE id = ?
	`

	ai.UpdatedAt = time.Now()

	result, err := r.db.ExecContext(ctx, query,
		ai.Name, ai.Description, ai.FilePath, string(ai.Status),
		ai.WinRate, ai.TotalGames, ai.Wins, ai.Losses, ai.Draws,
		ai.UpdatedAt, ai.ID,
	)
	if err != nil {
		return fmt.Errorf("failed to update AI model: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("AI model not found")
	}

	return nil
}

// Delete deletes an AI model by ID
func (r *aiRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM ai_models WHERE id = ?`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete AI model: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("AI model not found")
	}

	return nil
}

// List retrieves AI models with pagination
func (r *aiRepositoryImpl) List(ctx context.Context, limit, offset int) ([]*entity.AIModel, error) {
	query := `
		SELECT id, name, description, file_path, status, win_rate,
			   total_games, wins, losses, draws, created_at, updated_at
		FROM ai_models
		ORDER BY created_at DESC
		LIMIT ? OFFSET ?
	`

	rows, err := r.db.QueryContext(ctx, query, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to list AI models: %w", err)
	}
	defer rows.Close()

	var ais []*entity.AIModel
	for rows.Next() {
		var ai entity.AIModel
		var status string

		err := rows.Scan(
			&ai.ID, &ai.Name, &ai.Description, &ai.FilePath,
			&status, &ai.WinRate, &ai.TotalGames,
			&ai.Wins, &ai.Losses, &ai.Draws,
			&ai.CreatedAt, &ai.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan AI model: %w", err)
		}

		ai.Status = entity.AIStatus(status)
		ais = append(ais, &ai)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows iteration error: %w", err)
	}

	return ais, nil
}

// GetByStatus retrieves AI models by status
func (r *aiRepositoryImpl) GetByStatus(ctx context.Context, status entity.AIStatus) ([]*entity.AIModel, error) {
	query := `
		SELECT id, name, description, file_path, status, win_rate,
			   total_games, wins, losses, draws, created_at, updated_at
		FROM ai_models
		WHERE status = ?
		ORDER BY created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query, string(status))
	if err != nil {
		return nil, fmt.Errorf("failed to get AI models by status: %w", err)
	}
	defer rows.Close()

	var ais []*entity.AIModel
	for rows.Next() {
		var ai entity.AIModel
		var statusStr string

		err := rows.Scan(
			&ai.ID, &ai.Name, &ai.Description, &ai.FilePath,
			&statusStr, &ai.WinRate, &ai.TotalGames,
			&ai.Wins, &ai.Losses, &ai.Draws,
			&ai.CreatedAt, &ai.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan AI model: %w", err)
		}

		ai.Status = entity.AIStatus(statusStr)
		ais = append(ais, &ai)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows iteration error: %w", err)
	}

	return ais, nil
}

// GetActive retrieves all active AI models
func (r *aiRepositoryImpl) GetActive(ctx context.Context) ([]*entity.AIModel, error) {
	return r.GetByStatus(ctx, entity.AIStatusActive)
}

// UpdateStats updates AI statistics
func (r *aiRepositoryImpl) UpdateStats(ctx context.Context, id string, won, lost, draw bool) error {
	// First, get current stats
	ai, err := r.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to get AI model for stats update: %w", err)
	}

	// Update stats
	ai.UpdateStats(won, lost, draw)

	// Save updated stats
	return r.Update(ctx, ai)
}

// aiRankingRepositoryImpl implements repository.AIRankingRepository
type aiRankingRepositoryImpl struct {
	db *DB
}

// NewAIRankingRepository creates a new AI ranking repository
func NewAIRankingRepository(db *DB) repository.AIRankingRepository {
	return &aiRankingRepositoryImpl{db: db}
}

// Create creates a new AI ranking entry
func (r *aiRankingRepositoryImpl) Create(ctx context.Context, ranking *entity.AIRanking) error {
	query := `
		INSERT INTO ai_rankings (
			ai_id, rank_position, rating, win_rate, total_games,
			wins, losses, draws, last_game_date, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`

	result, err := r.db.ExecContext(ctx, query,
		ranking.AIID, ranking.RankPosition, ranking.Rating,
		ranking.WinRate, ranking.TotalGames, ranking.Wins,
		ranking.Losses, ranking.Draws, ranking.LastGameDate,
		ranking.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to create AI ranking: %w", err)
	}

	// Get the generated ID
	id, err := result.LastInsertId()
	if err != nil {
		return fmt.Errorf("failed to get last insert id: %w", err)
	}

	ranking.ID = id
	return nil
}

// GetByAIID retrieves ranking by AI ID
func (r *aiRankingRepositoryImpl) GetByAIID(ctx context.Context, aiID string) (*entity.AIRanking, error) {
	query := `
		SELECT id, ai_id, rank_position, rating, win_rate, total_games,
			   wins, losses, draws, last_game_date, updated_at
		FROM ai_rankings
		WHERE ai_id = ?
	`

	var ranking entity.AIRanking
	var lastGameDate sql.NullTime

	err := r.db.QueryRowContext(ctx, query, aiID).Scan(
		&ranking.ID, &ranking.AIID, &ranking.RankPosition,
		&ranking.Rating, &ranking.WinRate, &ranking.TotalGames,
		&ranking.Wins, &ranking.Losses, &ranking.Draws,
		&lastGameDate, &ranking.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("AI ranking not found")
		}
		return nil, fmt.Errorf("failed to get AI ranking: %w", err)
	}

	// Handle nullable last_game_date
	if lastGameDate.Valid {
		ranking.LastGameDate = &lastGameDate.Time
	}

	return &ranking, nil
}

// Update updates an existing ranking
func (r *aiRankingRepositoryImpl) Update(ctx context.Context, ranking *entity.AIRanking) error {
	query := `
		UPDATE ai_rankings
		SET rank_position = ?, rating = ?, win_rate = ?, total_games = ?,
			wins = ?, losses = ?, draws = ?, last_game_date = ?, updated_at = ?
		WHERE ai_id = ?
	`

	ranking.UpdatedAt = time.Now()

	result, err := r.db.ExecContext(ctx, query,
		ranking.RankPosition, ranking.Rating, ranking.WinRate,
		ranking.TotalGames, ranking.Wins, ranking.Losses,
		ranking.Draws, ranking.LastGameDate, ranking.UpdatedAt,
		ranking.AIID,
	)
	if err != nil {
		return fmt.Errorf("failed to update AI ranking: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("AI ranking not found")
	}

	return nil
}

// Delete deletes a ranking by AI ID
func (r *aiRankingRepositoryImpl) Delete(ctx context.Context, aiID string) error {
	query := `DELETE FROM ai_rankings WHERE ai_id = ?`

	result, err := r.db.ExecContext(ctx, query, aiID)
	if err != nil {
		return fmt.Errorf("failed to delete AI ranking: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("AI ranking not found")
	}

	return nil
}

// GetTopRankings retrieves top rankings with limit
func (r *aiRankingRepositoryImpl) GetTopRankings(ctx context.Context, limit int) ([]*entity.AIRanking, error) {
	query := `
		SELECT id, ai_id, rank_position, rating, win_rate, total_games,
			   wins, losses, draws, last_game_date, updated_at
		FROM ai_rankings
		ORDER BY rating DESC
		LIMIT ?
	`

	rows, err := r.db.QueryContext(ctx, query, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get top rankings: %w", err)
	}
	defer rows.Close()

	var rankings []*entity.AIRanking
	for rows.Next() {
		var ranking entity.AIRanking
		var lastGameDate sql.NullTime

		err := rows.Scan(
			&ranking.ID, &ranking.AIID, &ranking.RankPosition,
			&ranking.Rating, &ranking.WinRate, &ranking.TotalGames,
			&ranking.Wins, &ranking.Losses, &ranking.Draws,
			&lastGameDate, &ranking.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan AI ranking: %w", err)
		}

		// Handle nullable last_game_date
		if lastGameDate.Valid {
			ranking.LastGameDate = &lastGameDate.Time
		}

		rankings = append(rankings, &ranking)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows iteration error: %w", err)
	}

	return rankings, nil
}

// GetRankingsByRange retrieves rankings by rank range
func (r *aiRankingRepositoryImpl) GetRankingsByRange(ctx context.Context, startRank, endRank int) ([]*entity.AIRanking, error) {
	query := `
		SELECT id, ai_id, rank_position, rating, win_rate, total_games,
			   wins, losses, draws, last_game_date, updated_at
		FROM ai_rankings
		WHERE rank_position BETWEEN ? AND ?
		ORDER BY rank_position ASC
	`

	rows, err := r.db.QueryContext(ctx, query, startRank, endRank)
	if err != nil {
		return nil, fmt.Errorf("failed to get rankings by range: %w", err)
	}
	defer rows.Close()

	var rankings []*entity.AIRanking
	for rows.Next() {
		var ranking entity.AIRanking
		var lastGameDate sql.NullTime

		err := rows.Scan(
			&ranking.ID, &ranking.AIID, &ranking.RankPosition,
			&ranking.Rating, &ranking.WinRate, &ranking.TotalGames,
			&ranking.Wins, &ranking.Losses, &ranking.Draws,
			&lastGameDate, &ranking.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan AI ranking: %w", err)
		}

		// Handle nullable last_game_date
		if lastGameDate.Valid {
			ranking.LastGameDate = &lastGameDate.Time
		}

		rankings = append(rankings, &ranking)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows iteration error: %w", err)
	}

	return rankings, nil
}

// UpdateRanking updates ranking with game result
func (r *aiRankingRepositoryImpl) UpdateRanking(ctx context.Context, aiID string, won, lost, draw bool, newRating float64) error {
	// First, get current ranking
	ranking, err := r.GetByAIID(ctx, aiID)
	if err != nil {
		return fmt.Errorf("failed to get AI ranking for update: %w", err)
	}

	// Update ranking
	ranking.UpdateRanking(won, lost, draw, newRating)

	// Save updated ranking
	return r.Update(ctx, ranking)
}

// RecalculateAllRankings recalculates all ranking positions
func (r *aiRankingRepositoryImpl) RecalculateAllRankings(ctx context.Context) error {
	// Get all rankings ordered by rating
	query := `
		SELECT ai_id, rating
		FROM ai_rankings
		ORDER BY rating DESC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return fmt.Errorf("failed to get rankings for recalculation: %w", err)
	}
	defer rows.Close()

	// Update rank positions
	rankPosition := 1
	for rows.Next() {
		var aiID string
		var rating float64

		err := rows.Scan(&aiID, &rating)
		if err != nil {
			return fmt.Errorf("failed to scan ranking data: %w", err)
		}

		// Update rank position
		updateQuery := `UPDATE ai_rankings SET rank_position = ? WHERE ai_id = ?`
		_, err = r.db.ExecContext(ctx, updateQuery, rankPosition, aiID)
		if err != nil {
			return fmt.Errorf("failed to update rank position: %w", err)
		}

		rankPosition++
	}

	if err := rows.Err(); err != nil {
		return fmt.Errorf("rows iteration error: %w", err)
	}

	return nil
}
