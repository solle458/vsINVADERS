package entity

import (
	"encoding/json"
	"time"
)

// GameStatus represents the current status of a game
type GameStatus string

const (
	GameStatusWaiting  GameStatus = "waiting"
	GameStatusPlaying  GameStatus = "playing"
	GameStatusFinished GameStatus = "finished"
)

// PlayerType represents the type of player
type PlayerType string

const (
	PlayerTypeHuman PlayerType = "human"
	PlayerTypeAI    PlayerType = "ai"
	PlayerTypeCOM   PlayerType = "com"
)

// Winner represents the game winner
type Winner string

const (
	WinnerPlayer1 Winner = "player1"
	WinnerPlayer2 Winner = "player2"
	WinnerDraw    Winner = "draw"
)

// Position represents a position on the game board
type Position struct {
	X int `json:"x"`
	Y int `json:"y"`
}

// GameBoard represents the 15x15 game board
type GameBoard struct {
	Size  int     `json:"size"`  // 15x15
	Cells [][]int `json:"cells"` // 0=empty, 1=wall, 2=player1, 3=player2
}

// GameState represents the current state of the game
type GameState struct {
	Board           GameBoard `json:"board"`
	Player1Position Position  `json:"player1_position"`
	Player2Position Position  `json:"player2_position"`
	CurrentTurn     int       `json:"current_turn"`
	TurnPlayer      string    `json:"turn_player"` // "player1" or "player2"
}

// Game represents a game entity
type Game struct {
	ID          int64      `json:"id"`
	Player1Type PlayerType `json:"player1_type"`
	Player1ID   *string    `json:"player1_id"` // AI ID or COM level
	Player2Type PlayerType `json:"player2_type"`
	Player2ID   *string    `json:"player2_id"`
	Status      GameStatus `json:"status"`
	CurrentTurn int        `json:"current_turn"`
	GameState   GameState  `json:"game_state"`
	Winner      *Winner    `json:"winner"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

// NewGame creates a new game instance
func NewGame(player1Type PlayerType, player1ID *string, player2Type PlayerType, player2ID *string) *Game {
	now := time.Now()

	// Initialize 15x15 board
	board := GameBoard{
		Size:  15,
		Cells: make([][]int, 15),
	}
	for i := range board.Cells {
		board.Cells[i] = make([]int, 15)
	}

	// Set initial positions (player1 at bottom-left, player2 at top-right)
	player1Pos := Position{X: 1, Y: 13}
	player2Pos := Position{X: 13, Y: 1}

	// Place players on board
	board.Cells[player1Pos.Y][player1Pos.X] = 2 // player1
	board.Cells[player2Pos.Y][player2Pos.X] = 3 // player2

	gameState := GameState{
		Board:           board,
		Player1Position: player1Pos,
		Player2Position: player2Pos,
		CurrentTurn:     1,
		TurnPlayer:      "player1",
	}

	return &Game{
		Player1Type: player1Type,
		Player1ID:   player1ID,
		Player2Type: player2Type,
		Player2ID:   player2ID,
		Status:      GameStatusWaiting,
		CurrentTurn: 1,
		GameState:   gameState,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
}

// StartGame starts the game
func (g *Game) StartGame() {
	g.Status = GameStatusPlaying
	g.UpdatedAt = time.Now()
}

// FinishGame finishes the game with a winner
func (g *Game) FinishGame(winner Winner) {
	g.Status = GameStatusFinished
	g.Winner = &winner
	g.UpdatedAt = time.Now()
}

// NextTurn advances the game to the next turn
func (g *Game) NextTurn() {
	g.CurrentTurn++
	if g.GameState.TurnPlayer == "player1" {
		g.GameState.TurnPlayer = "player2"
	} else {
		g.GameState.TurnPlayer = "player1"
	}
	g.UpdatedAt = time.Now()
}

// ToJSON converts game state to JSON string
func (g *Game) ToJSON() (string, error) {
	data, err := json.Marshal(g.GameState)
	if err != nil {
		return "", err
	}
	return string(data), nil
}

// FromJSON loads game state from JSON string
func (g *Game) FromJSON(jsonStr string) error {
	return json.Unmarshal([]byte(jsonStr), &g.GameState)
}
