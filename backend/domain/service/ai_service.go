package service

import (
	"errors"
	"math/rand"
	"time"
	"vsmaze-backend/domain/entity"
)

// AIService handles COM AI logic
type AIService struct {
	rand *rand.Rand
}

// NewAIService creates a new AI service instance
func NewAIService() *AIService {
	return &AIService{
		rand: rand.New(rand.NewSource(time.Now().UnixNano())),
	}
}

// GetAIMove determines the next move for a COM AI player
func (s *AIService) GetAIMove(game *entity.Game, aiLevel string, playerName string) (entity.Action, error) {
	switch aiLevel {
	case "1":
		return s.getLevel1Move(game, playerName)
	case "2":
		return s.getLevel2Move(game, playerName)
	case "3":
		return s.getLevel3Move(game, playerName)
	case "4":
		return s.getLevel4Move(game, playerName)
	default:
		return entity.Action{}, errors.New("invalid AI level")
	}
}

// Level 1: Random moves
func (s *AIService) getLevel1Move(game *entity.Game, playerName string) (entity.Action, error) {
	// Get valid actions
	validActions := s.getValidActions(game, playerName)
	if len(validActions) == 0 {
		// Fallback to defend
		return entity.Action{Type: entity.ActionTypeDefend}, nil
	}

	// Pick random action
	index := s.rand.Intn(len(validActions))
	return validActions[index], nil
}

// Level 2: Simple strategy - prioritize attack towards opponent
func (s *AIService) getLevel2Move(game *entity.Game, playerName string) (entity.Action, error) {
	var currentPos, targetPos entity.Position
	if playerName == "player1" {
		currentPos = game.GameState.Player1Position
		targetPos = game.GameState.Player2Position
	} else {
		currentPos = game.GameState.Player2Position
		targetPos = game.GameState.Player1Position
	}

	// Try to attack towards opponent first
	if attack := s.findAttackTowardsTarget(game, currentPos, targetPos); attack != nil {
		return *attack, nil
	}

	// Try to move towards opponent
	if move := s.findMoveTowardsTarget(game, currentPos, targetPos, playerName); move != nil {
		return *move, nil
	}

	// Fallback to Level 1 behavior
	return s.getLevel1Move(game, playerName)
}

// Level 3: Medium strategy - considers defense and positioning
func (s *AIService) getLevel3Move(game *entity.Game, playerName string) (entity.Action, error) {
	var currentPos, targetPos entity.Position
	if playerName == "player1" {
		currentPos = game.GameState.Player1Position
		targetPos = game.GameState.Player2Position
	} else {
		currentPos = game.GameState.Player2Position
		targetPos = game.GameState.Player1Position
	}

	// Check if opponent can attack us next turn - if so, try to move
	if s.isInDanger(game, currentPos, targetPos) {
		if move := s.findSafeMove(game, currentPos, playerName); move != nil {
			return *move, nil
		}
	}

	// Try strategic attack
	if attack := s.findStrategicAttack(game, currentPos, targetPos); attack != nil {
		return *attack, nil
	}

	// Try positioning move
	if move := s.findPositioningMove(game, currentPos, targetPos, playerName); move != nil {
		return *move, nil
	}

	// Fallback to Level 2 behavior
	return s.getLevel2Move(game, playerName)
}

// Level 4: Advanced strategy - lookahead and tactical planning
func (s *AIService) getLevel4Move(game *entity.Game, playerName string) (entity.Action, error) {
	var currentPos, targetPos entity.Position
	if playerName == "player1" {
		currentPos = game.GameState.Player1Position
		targetPos = game.GameState.Player2Position
	} else {
		currentPos = game.GameState.Player2Position
		targetPos = game.GameState.Player1Position
	}

	// Advanced threat assessment
	if s.isImmediateThreat(game, currentPos, targetPos) {
		if move := s.findEvasiveMove(game, currentPos, playerName); move != nil {
			return *move, nil
		}
	}

	// Look for winning attacks (including wall destruction setups)
	if attack := s.findWinningAttack(game, currentPos, targetPos); attack != nil {
		return *attack, nil
	}

	// Strategic positioning for future attacks
	if move := s.findStrategicPosition(game, currentPos, targetPos, playerName); move != nil {
		return *move, nil
	}

	// Fallback to Level 3 behavior
	return s.getLevel3Move(game, playerName)
}

// Helper functions

func (s *AIService) getValidActions(game *entity.Game, playerName string) []entity.Action {
	var actions []entity.Action
	var currentPos entity.Position

	if playerName == "player1" {
		currentPos = game.GameState.Player1Position
	} else {
		currentPos = game.GameState.Player2Position
	}

	// Test move actions
	directions := []entity.Direction{
		entity.DirectionUp, entity.DirectionDown,
		entity.DirectionLeft, entity.DirectionRight,
	}

	for _, dir := range directions {
		// Test move
		moveAction := entity.Action{Type: entity.ActionTypeMove, Direction: dir}
		if s.isValidAction(game, currentPos, moveAction) {
			actions = append(actions, moveAction)
		}

		// Test attack
		attackAction := entity.Action{Type: entity.ActionTypeAttack, Direction: dir}
		actions = append(actions, attackAction) // Attacks are always valid to attempt
	}

	// Defend is always valid
	actions = append(actions, entity.Action{Type: entity.ActionTypeDefend})

	return actions
}

func (s *AIService) isValidAction(game *entity.Game, currentPos entity.Position, action entity.Action) bool {
	if action.Type == entity.ActionTypeMove {
		newPos := s.getNewPosition(currentPos, action.Direction)
		return game.IsValidPosition(newPos)
	}
	return true // Attack and defend are always valid to attempt
}

func (s *AIService) getNewPosition(pos entity.Position, direction entity.Direction) entity.Position {
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

func (s *AIService) findAttackTowardsTarget(game *entity.Game, currentPos, targetPos entity.Position) *entity.Action {
	directions := []entity.Direction{
		entity.DirectionUp, entity.DirectionDown,
		entity.DirectionLeft, entity.DirectionRight,
	}

	for _, dir := range directions {
		// Simple heuristic: attack in the general direction of the target
		if s.isDirectionTowardsTarget(currentPos, targetPos, dir) {
			return &entity.Action{Type: entity.ActionTypeAttack, Direction: dir}
		}
	}
	return nil
}

func (s *AIService) findMoveTowardsTarget(game *entity.Game, currentPos, targetPos entity.Position, playerName string) *entity.Action {
	// Try to move closer to target
	var bestDir entity.Direction
	bestDistance := float64(999)

	directions := []entity.Direction{
		entity.DirectionUp, entity.DirectionDown,
		entity.DirectionLeft, entity.DirectionRight,
	}

	for _, dir := range directions {
		newPos := s.getNewPosition(currentPos, dir)
		if game.IsValidPosition(newPos) {
			distance := s.calculateDistance(newPos, targetPos)
			if distance < bestDistance {
				bestDistance = distance
				bestDir = dir
			}
		}
	}

	if bestDistance < 999 {
		return &entity.Action{Type: entity.ActionTypeMove, Direction: bestDir}
	}
	return nil
}

func (s *AIService) isDirectionTowardsTarget(currentPos, targetPos entity.Position, direction entity.Direction) bool {
	switch direction {
	case entity.DirectionUp:
		return targetPos.Y < currentPos.Y
	case entity.DirectionDown:
		return targetPos.Y > currentPos.Y
	case entity.DirectionLeft:
		return targetPos.X < currentPos.X
	case entity.DirectionRight:
		return targetPos.X > currentPos.X
	}
	return false
}

func (s *AIService) calculateDistance(pos1, pos2 entity.Position) float64 {
	dx := float64(pos1.X - pos2.X)
	dy := float64(pos1.Y - pos2.Y)
	return dx*dx + dy*dy // Using squared distance for performance
}

// Advanced AI helper functions (Level 3-4)

func (s *AIService) isInDanger(game *entity.Game, currentPos, opponentPos entity.Position) bool {
	// Check if opponent can hit us from their current position
	directions := []entity.Direction{
		entity.DirectionUp, entity.DirectionDown,
		entity.DirectionLeft, entity.DirectionRight,
	}

	for _, dir := range directions {
		attackPath := s.simulateAttackPath(opponentPos, dir, game.GameState.Board)
		for _, pos := range attackPath {
			if pos.X == currentPos.X && pos.Y == currentPos.Y {
				return true
			}
		}
	}
	return false
}

func (s *AIService) findSafeMove(game *entity.Game, currentPos entity.Position, playerName string) *entity.Action {
	directions := []entity.Direction{
		entity.DirectionUp, entity.DirectionDown,
		entity.DirectionLeft, entity.DirectionRight,
	}

	for _, dir := range directions {
		newPos := s.getNewPosition(currentPos, dir)
		if game.IsValidPosition(newPos) {
			return &entity.Action{Type: entity.ActionTypeMove, Direction: dir}
		}
	}
	return nil
}

func (s *AIService) findStrategicAttack(game *entity.Game, currentPos, targetPos entity.Position) *entity.Action {
	// More sophisticated attack logic - considering wall destruction
	return s.findAttackTowardsTarget(game, currentPos, targetPos)
}

func (s *AIService) findPositioningMove(game *entity.Game, currentPos, targetPos entity.Position, playerName string) *entity.Action {
	// Try to find a good strategic position
	return s.findMoveTowardsTarget(game, currentPos, targetPos, playerName)
}

func (s *AIService) isImmediateThreat(game *entity.Game, currentPos, opponentPos entity.Position) bool {
	return s.isInDanger(game, currentPos, opponentPos)
}

func (s *AIService) findEvasiveMove(game *entity.Game, currentPos entity.Position, playerName string) *entity.Action {
	return s.findSafeMove(game, currentPos, playerName)
}

func (s *AIService) findWinningAttack(game *entity.Game, currentPos, targetPos entity.Position) *entity.Action {
	return s.findAttackTowardsTarget(game, currentPos, targetPos)
}

func (s *AIService) findStrategicPosition(game *entity.Game, currentPos, targetPos entity.Position, playerName string) *entity.Action {
	return s.findMoveTowardsTarget(game, currentPos, targetPos, playerName)
}

func (s *AIService) simulateAttackPath(startPos entity.Position, direction entity.Direction, board entity.GameBoard) []entity.Position {
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
