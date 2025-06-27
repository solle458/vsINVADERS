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

	// Initialize INVADER-style game board with walls
	initializeInvaderBoard(&board)

	// Set initial positions (player1 at bottom area, player2 at top area)
	player1Pos := Position{X: 7, Y: 12} // Bottom center
	player2Pos := Position{X: 7, Y: 2}  // Top center

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

// initializeInvaderBoard sets up INVADER-style board with walls
func initializeInvaderBoard(board *GameBoard) {
	// Create border walls
	for i := 0; i < board.Size; i++ {
		board.Cells[0][i] = 1            // Top border
		board.Cells[board.Size-1][i] = 1 // Bottom border
		board.Cells[i][0] = 1            // Left border
		board.Cells[i][board.Size-1] = 1 // Right border
	}

	// Create strategic walls in the middle area
	// Central barrier
	for i := 5; i <= 9; i++ {
		board.Cells[7][i] = 1 // Horizontal wall in center
	}

	// Corner obstacles
	board.Cells[3][3] = 1
	board.Cells[3][4] = 1
	board.Cells[4][3] = 1

	board.Cells[3][10] = 1
	board.Cells[3][11] = 1
	board.Cells[4][11] = 1

	board.Cells[10][3] = 1
	board.Cells[10][4] = 1
	board.Cells[11][3] = 1

	board.Cells[10][10] = 1
	board.Cells[10][11] = 1
	board.Cells[11][11] = 1

	// Create some cover walls
	board.Cells[5][2] = 1
	board.Cells[5][12] = 1
	board.Cells[9][2] = 1
	board.Cells[9][12] = 1
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

// DestroyWall destroys a wall at the specified position
func (g *Game) DestroyWall(pos Position) bool {
	if pos.X < 0 || pos.X >= g.GameState.Board.Size || pos.Y < 0 || pos.Y >= g.GameState.Board.Size {
		return false
	}

	// Only destroy walls (cell value 1), not players or empty cells
	if g.GameState.Board.Cells[pos.Y][pos.X] == 1 {
		g.GameState.Board.Cells[pos.Y][pos.X] = 0
		g.UpdatedAt = time.Now()
		return true
	}

	return false
}

// IsValidPosition checks if a position is within bounds and not a wall
func (g *Game) IsValidPosition(pos Position) bool {
	if pos.X < 0 || pos.X >= g.GameState.Board.Size || pos.Y < 0 || pos.Y >= g.GameState.Board.Size {
		return false
	}
	return g.GameState.Board.Cells[pos.Y][pos.X] == 0
}

// GetCellType returns the type of cell at the given position
func (g *Game) GetCellType(pos Position) int {
	if pos.X < 0 || pos.X >= g.GameState.Board.Size || pos.Y < 0 || pos.Y >= g.GameState.Board.Size {
		return -1 // Out of bounds
	}
	return g.GameState.Board.Cells[pos.Y][pos.X]
}
