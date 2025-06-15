package entity

import "time"

// AIStatus represents the status of an AI model
type AIStatus string

const (
	AIStatusActive   AIStatus = "active"
	AIStatusInactive AIStatus = "inactive"
	AIStatusError    AIStatus = "error"
)

// AIModel represents an AI model entity
type AIModel struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	FilePath    string    `json:"file_path"`
	Status      AIStatus  `json:"status"`
	WinRate     float64   `json:"win_rate"`
	TotalGames  int       `json:"total_games"`
	Wins        int       `json:"wins"`
	Losses      int       `json:"losses"`
	Draws       int       `json:"draws"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// AIRanking represents an AI ranking entry
type AIRanking struct {
	ID           int64      `json:"id"`
	AIID         string     `json:"ai_id"`
	RankPosition int        `json:"rank_position"`
	Rating       float64    `json:"rating"` // ELO rating
	WinRate      float64    `json:"win_rate"`
	TotalGames   int        `json:"total_games"`
	Wins         int        `json:"wins"`
	Losses       int        `json:"losses"`
	Draws        int        `json:"draws"`
	LastGameDate *time.Time `json:"last_game_date"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

// NewAIModel creates a new AI model instance
func NewAIModel(id, name, description, filePath string) *AIModel {
	now := time.Now()
	return &AIModel{
		ID:          id,
		Name:        name,
		Description: description,
		FilePath:    filePath,
		Status:      AIStatusActive,
		WinRate:     0.0,
		TotalGames:  0,
		Wins:        0,
		Losses:      0,
		Draws:       0,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
}

// UpdateStats updates the AI model statistics
func (ai *AIModel) UpdateStats(won, lost, draw bool) {
	if won {
		ai.Wins++
	} else if lost {
		ai.Losses++
	} else if draw {
		ai.Draws++
	}

	ai.TotalGames = ai.Wins + ai.Losses + ai.Draws
	if ai.TotalGames > 0 {
		ai.WinRate = float64(ai.Wins) / float64(ai.TotalGames)
	}
	ai.UpdatedAt = time.Now()
}

// Deactivate deactivates the AI model
func (ai *AIModel) Deactivate() {
	ai.Status = AIStatusInactive
	ai.UpdatedAt = time.Now()
}

// Activate activates the AI model
func (ai *AIModel) Activate() {
	ai.Status = AIStatusActive
	ai.UpdatedAt = time.Now()
}

// SetError sets the AI model status to error
func (ai *AIModel) SetError() {
	ai.Status = AIStatusError
	ai.UpdatedAt = time.Now()
}

// NewAIRanking creates a new AI ranking entry
func NewAIRanking(aiID string) *AIRanking {
	now := time.Now()
	return &AIRanking{
		AIID:         aiID,
		RankPosition: 0,
		Rating:       1200.0, // Default ELO rating
		WinRate:      0.0,
		TotalGames:   0,
		Wins:         0,
		Losses:       0,
		Draws:        0,
		UpdatedAt:    now,
	}
}

// UpdateRanking updates the ranking with new game result
func (r *AIRanking) UpdateRanking(won, lost, draw bool, newRating float64) {
	if won {
		r.Wins++
	} else if lost {
		r.Losses++
	} else if draw {
		r.Draws++
	}

	r.TotalGames = r.Wins + r.Losses + r.Draws
	if r.TotalGames > 0 {
		r.WinRate = float64(r.Wins) / float64(r.TotalGames)
	}

	r.Rating = newRating
	now := time.Now()
	r.LastGameDate = &now
	r.UpdatedAt = now
}
