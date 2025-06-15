package entity

import "time"

// ActionType represents the type of action a player can take
type ActionType string

const (
	ActionTypeAttack ActionType = "attack"
	ActionTypeMove   ActionType = "move"
	ActionTypeDefend ActionType = "defend"
)

// Direction represents the direction of an action
type Direction string

const (
	DirectionUp    Direction = "up"
	DirectionDown  Direction = "down"
	DirectionLeft  Direction = "left"
	DirectionRight Direction = "right"
)

// Player represents a player in the game
type Player struct {
	ID       string     `json:"id"`
	Type     PlayerType `json:"type"`
	Name     string     `json:"name"`
	Position Position   `json:"position"`
	HP       int        `json:"hp"`
	IsAlive  bool       `json:"is_alive"`
}

// Action represents a player action
type Action struct {
	Type      ActionType `json:"type"`
	Direction Direction  `json:"direction"`
	Target    *Position  `json:"target,omitempty"`
}

// GameMove represents a move in the game
type GameMove struct {
	ID         int64     `json:"id"`
	GameID     int64     `json:"game_id"`
	TurnNumber int       `json:"turn_number"`
	Player     string    `json:"player"` // "player1" or "player2"
	MoveType   string    `json:"move_type"`
	MoveData   string    `json:"move_data"` // JSON string of Action
	CreatedAt  time.Time `json:"created_at"`
}

// NewPlayer creates a new player instance
func NewPlayer(id string, playerType PlayerType, name string, position Position) *Player {
	return &Player{
		ID:       id,
		Type:     playerType,
		Name:     name,
		Position: position,
		HP:       1, // Single hit kill game
		IsAlive:  true,
	}
}

// MoveTo moves the player to a new position
func (p *Player) MoveTo(newPosition Position) {
	p.Position = newPosition
}

// TakeDamage applies damage to the player
func (p *Player) TakeDamage(damage int) {
	p.HP -= damage
	if p.HP <= 0 {
		p.HP = 0
		p.IsAlive = false
	}
}

// IsValidMove checks if a move is valid for the player
func (p *Player) IsValidMove(action Action, board GameBoard) bool {
	switch action.Type {
	case ActionTypeMove:
		return p.isValidMoveAction(action, board)
	case ActionTypeAttack:
		return p.isValidAttackAction(action, board)
	case ActionTypeDefend:
		return true // Defend is always valid
	default:
		return false
	}
}

// isValidMoveAction checks if a move action is valid
func (p *Player) isValidMoveAction(action Action, board GameBoard) bool {
	newPos := p.getNewPosition(action.Direction)

	// Check bounds
	if newPos.X < 0 || newPos.X >= board.Size || newPos.Y < 0 || newPos.Y >= board.Size {
		return false
	}

	// Check if target cell is empty
	return board.Cells[newPos.Y][newPos.X] == 0
}

// isValidAttackAction checks if an attack action is valid
func (p *Player) isValidAttackAction(action Action, board GameBoard) bool {
	// Attack is always valid in terms of direction
	// The actual hit detection is handled by game logic
	return true
}

// getNewPosition calculates new position based on direction
func (p *Player) getNewPosition(direction Direction) Position {
	newPos := p.Position

	switch direction {
	case DirectionUp:
		newPos.Y--
	case DirectionDown:
		newPos.Y++
	case DirectionLeft:
		newPos.X--
	case DirectionRight:
		newPos.X++
	}

	return newPos
}

// GetAttackPath returns the path of an attack until it hits a wall or player
func (p *Player) GetAttackPath(direction Direction, board GameBoard) []Position {
	var path []Position
	currentPos := p.Position

	for {
		// Calculate next position
		switch direction {
		case DirectionUp:
			currentPos.Y--
		case DirectionDown:
			currentPos.Y++
		case DirectionLeft:
			currentPos.X--
		case DirectionRight:
			currentPos.X++
		}

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
