package service

import (
	"errors"
	"vsmaze-backend/domain/entity"
)

// GameService defines the business logic for game operations
type GameService struct{}

// NewGameService creates a new game service instance
func NewGameService() *GameService {
	return &GameService{}
}

// ValidateGameCreation validates game creation parameters
func (s *GameService) ValidateGameCreation(player1Type entity.PlayerType, player1ID *string, player2Type entity.PlayerType, player2ID *string) error {
	// Validate player types
	if !s.isValidPlayerType(player1Type) {
		return errors.New("invalid player1 type")
	}
	if !s.isValidPlayerType(player2Type) {
		return errors.New("invalid player2 type")
	}

	// Validate AI IDs if player type is AI
	if player1Type == entity.PlayerTypeAI && (player1ID == nil || *player1ID == "") {
		return errors.New("player1 AI ID is required when player type is AI")
	}
	if player2Type == entity.PlayerTypeAI && (player2ID == nil || *player2ID == "") {
		return errors.New("player2 AI ID is required when player type is AI")
	}

	// Validate COM levels if player type is COM
	if player1Type == entity.PlayerTypeCOM && (player1ID == nil || !s.isValidCOMLevel(*player1ID)) {
		return errors.New("invalid COM level for player1")
	}
	if player2Type == entity.PlayerTypeCOM && (player2ID == nil || !s.isValidCOMLevel(*player2ID)) {
		return errors.New("invalid COM level for player2")
	}

	return nil
}

// ProcessMove processes a player move and updates game state
func (s *GameService) ProcessMove(game *entity.Game, action entity.Action, playerName string) error {
	// Validate it's the correct player's turn
	if game.GameState.TurnPlayer != playerName {
		return errors.New("not your turn")
	}

	// Get current player position
	var currentPos entity.Position
	var playerCell int
	if playerName == "player1" {
		currentPos = game.GameState.Player1Position
		playerCell = 2
	} else {
		currentPos = game.GameState.Player2Position
		playerCell = 3
	}

	// Create temporary player for validation
	player := entity.NewPlayer(playerName, entity.PlayerTypeHuman, playerName, currentPos)

	// Validate move
	if !player.IsValidMove(action, game.GameState.Board) {
		return errors.New("invalid move")
	}

	// Process the action
	switch action.Type {
	case entity.ActionTypeMove:
		return s.processMove(game, action, playerName, currentPos, playerCell)
	case entity.ActionTypeAttack:
		return s.processAttack(game, action, playerName, currentPos)
	case entity.ActionTypeDefend:
		return s.processDefend(game, playerName)
	default:
		return errors.New("invalid action type")
	}
}

// CheckWinCondition checks if the game has ended
func (s *GameService) CheckWinCondition(game *entity.Game) (bool, entity.Winner) {
	// Check if any player has been hit (HP <= 0 or !IsAlive)
	// For now, we'll implement basic position-based win checking
	// This will be enhanced when we implement proper attack mechanics

	player1Pos := game.GameState.Player1Position
	player2Pos := game.GameState.Player2Position

	// Check if players are in the same position (collision)
	if player1Pos.X == player2Pos.X && player1Pos.Y == player2Pos.Y {
		return true, entity.WinnerDraw
	}

	// For now, return no winner (game continues)
	return false, ""
}

// isValidPlayerType validates player type
func (s *GameService) isValidPlayerType(playerType entity.PlayerType) bool {
	switch playerType {
	case entity.PlayerTypeHuman, entity.PlayerTypeAI, entity.PlayerTypeCOM:
		return true
	default:
		return false
	}
}

// isValidCOMLevel validates COM difficulty level
func (s *GameService) isValidCOMLevel(level string) bool {
	switch level {
	case "1", "2", "3", "4":
		return true
	default:
		return false
	}
}

// processMove handles move action
func (s *GameService) processMove(game *entity.Game, action entity.Action, playerName string, currentPos entity.Position, playerCell int) error {
	// Calculate new position
	newPos := s.getNewPosition(currentPos, action.Direction)

	// Validate bounds
	if newPos.X < 0 || newPos.X >= game.GameState.Board.Size || newPos.Y < 0 || newPos.Y >= game.GameState.Board.Size {
		return errors.New("move out of bounds")
	}

	// Check if target cell is empty
	if game.GameState.Board.Cells[newPos.Y][newPos.X] != 0 {
		return errors.New("target cell is not empty")
	}

	// Update board
	game.GameState.Board.Cells[currentPos.Y][currentPos.X] = 0  // Clear old position
	game.GameState.Board.Cells[newPos.Y][newPos.X] = playerCell // Set new position

	// Update player position
	if playerName == "player1" {
		game.GameState.Player1Position = newPos
	} else {
		game.GameState.Player2Position = newPos
	}

	return nil
}

// processAttack handles attack action
func (s *GameService) processAttack(game *entity.Game, action entity.Action, playerName string, currentPos entity.Position) error {
	// Get attack path
	attackPath := s.getAttackPath(currentPos, action.Direction, game.GameState.Board)

	// Check if attack hits the opponent
	var targetPos entity.Position
	if playerName == "player1" {
		targetPos = game.GameState.Player2Position
	} else {
		targetPos = game.GameState.Player1Position
	}

	// Process attack path - check for walls and opponents
	for _, pos := range attackPath {
		cellType := game.GetCellType(pos)

		// Check if hit opponent
		if pos.X == targetPos.X && pos.Y == targetPos.Y {
			// Hit! End the game
			var winner entity.Winner
			if playerName == "player1" {
				winner = entity.WinnerPlayer1
			} else {
				winner = entity.WinnerPlayer2
			}
			game.FinishGame(winner)
			return nil
		}

		// Check if hit wall
		if cellType == 1 {
			// Destroy the wall and stop attack
			game.DestroyWall(pos)
			return nil
		}
	}

	// Attack missed, continue game
	return nil
}

// processDefend handles defend action
func (s *GameService) processDefend(game *entity.Game, playerName string) error {
	// Defend action - for now, this just passes the turn
	// Future enhancement: could provide temporary protection
	return nil
}

// getNewPosition calculates new position based on direction
func (s *GameService) getNewPosition(pos entity.Position, direction entity.Direction) entity.Position {
	newPos := pos

	switch direction {
	case entity.DirectionUp:
		newPos.Y--
	case entity.DirectionDown:
		newPos.Y++
	case entity.DirectionLeft:
		newPos.X--
	case entity.DirectionRight:
		newPos.X++
	}

	return newPos
}

// getAttackPath returns the path of an attack until it hits a wall or player
func (s *GameService) getAttackPath(startPos entity.Position, direction entity.Direction, board entity.GameBoard) []entity.Position {
	var path []entity.Position
	currentPos := startPos

	for {
		// Calculate next position
		currentPos = s.getNewPosition(currentPos, direction)

		// Check bounds
		if currentPos.X < 0 || currentPos.X >= board.Size || currentPos.Y < 0 || currentPos.Y >= board.Size {
			break
		}

		path = append(path, currentPos)

		// Check if hit something (wall or player)
		cell := board.Cells[currentPos.Y][currentPos.X]
		if cell != 0 { // Hit wall or player
			break
		}
	}

	return path
}
