package repository

import (
	"context"
	"vsmaze-backend/domain/entity"
)

// AIRepository defines the interface for AI model data operations
type AIRepository interface {
	// Create creates a new AI model
	Create(ctx context.Context, ai *entity.AIModel) error

	// GetByID retrieves an AI model by ID
	GetByID(ctx context.Context, id string) (*entity.AIModel, error)

	// Update updates an existing AI model
	Update(ctx context.Context, ai *entity.AIModel) error

	// Delete deletes an AI model by ID
	Delete(ctx context.Context, id string) error

	// List retrieves AI models with pagination
	List(ctx context.Context, limit, offset int) ([]*entity.AIModel, error)

	// GetByStatus retrieves AI models by status
	GetByStatus(ctx context.Context, status entity.AIStatus) ([]*entity.AIModel, error)

	// GetActive retrieves all active AI models
	GetActive(ctx context.Context) ([]*entity.AIModel, error)

	// UpdateStats updates AI statistics
	UpdateStats(ctx context.Context, id string, won, lost, draw bool) error
}

// AIRankingRepository defines the interface for AI ranking data operations
type AIRankingRepository interface {
	// Create creates a new AI ranking entry
	Create(ctx context.Context, ranking *entity.AIRanking) error

	// GetByAIID retrieves ranking by AI ID
	GetByAIID(ctx context.Context, aiID string) (*entity.AIRanking, error)

	// Update updates an existing ranking
	Update(ctx context.Context, ranking *entity.AIRanking) error

	// Delete deletes a ranking by AI ID
	Delete(ctx context.Context, aiID string) error

	// GetTopRankings retrieves top rankings with limit
	GetTopRankings(ctx context.Context, limit int) ([]*entity.AIRanking, error)

	// GetRankingsByRange retrieves rankings by rank range
	GetRankingsByRange(ctx context.Context, startRank, endRank int) ([]*entity.AIRanking, error)

	// UpdateRanking updates ranking with game result
	UpdateRanking(ctx context.Context, aiID string, won, lost, draw bool, newRating float64) error

	// RecalculateAllRankings recalculates all ranking positions
	RecalculateAllRankings(ctx context.Context) error
}
