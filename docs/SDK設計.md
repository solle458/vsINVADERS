# AI開発用Python SDK設計

## 概要

INVADER Maze AI用のPython SDKは、AI開発者がゲームAPIを簡単に操作できるライブラリです。複雑なHTTPリクエストを抽象化し、直感的なAPIでゲームとの連携を可能にします。

---

## 1. SDK構成

### ディレクトリ構造
```
invader_maze_sdk/
├── __init__.py
├── client.py          # メインクライアントクラス
├── models.py          # データモデル（Position, Maze, Player等）
├── exceptions.py      # 例外クラス
├── utils.py          # ユーティリティ関数
└── examples/         # サンプルAI実装
    ├── random_ai.py
    ├── wall_follower_ai.py
    └── smart_ai.py
```

---

## 2. 基本的な使用方法

### 2.1 インストール
```bash
pip install invader-maze-sdk
```

### 2.2 基本的なAI実装例

```python
from invader_maze_sdk import MazeClient, Direction
import random

class RandomAI:
    def __init__(self, game_url="http://localhost:3001"):
        self.client = MazeClient(game_url)
        self.player_id = None
    
    def play(self, game_id, player_id):
        self.player_id = player_id
        
        while True:
            # ゲーム状態を取得
            game_state = self.client.get_game_state(game_id)
            
            # ゲーム終了判定
            if game_state.is_finished():
                break
            
            # 自分のターンか確認
            if game_state.current_turn != self.player_id:
                continue
            
            # アクションを決定・実行
            action = self.decide_action(game_state)
            self.execute_action(game_id, action)
    
    def decide_action(self, game_state):
        # ランダムに行動を選択
        my_player = game_state.get_player(self.player_id)
        actions = self.get_possible_actions(game_state, my_player)
        return random.choice(actions)
    
    def get_possible_actions(self, game_state, player):
        actions = []
        
        # 移動可能な方向をチェック
        for direction in Direction.ALL:
            if game_state.can_move(player.position, direction):
                actions.append(("move", direction))
        
        # 攻撃可能な方向をチェック
        for direction in Direction.ALL:
            if game_state.can_attack(player.position, direction):
                actions.append(("attack", direction))
        
        return actions
    
    def execute_action(self, game_id, action):
        action_type, direction = action
        
        try:
            if action_type == "move":
                result = self.client.move(game_id, self.player_id, direction)
            elif action_type == "attack":
                result = self.client.attack(game_id, self.player_id, direction)
            
            print(f"Action: {action_type} {direction} -> {result.result}")
        except Exception as e:
            print(f"Action failed: {e}")

# 使用例
if __name__ == "__main__":
    ai = RandomAI()
    ai.play("game-id-from-server", "player1")
```

---

## 3. クライアントクラス詳細

### 3.1 MazeClient

```python
class MazeClient:
    def __init__(self, base_url: str, timeout: int = 30):
        self.base_url = base_url
        self.timeout = timeout
        self.session = requests.Session()
    
    # ゲーム状態取得
    def get_game_state(self, game_id: str) -> GameState:
        """現在のゲーム状態を取得"""
        response = self._get(f"/game/{game_id}/state")
        return GameState.from_dict(response)
    
    # 移動アクション
    def move(self, game_id: str, player_id: str, direction: Direction) -> ActionResult:
        """指定方向に移動"""
        data = {"playerId": player_id, "direction": direction.value}
        response = self._post(f"/game/{game_id}/action/move", data)
        return ActionResult.from_dict(response)
    
    # 攻撃アクション
    def attack(self, game_id: str, player_id: str, direction: Direction) -> ActionResult:
        """指定方向に攻撃"""
        data = {"playerId": player_id, "direction": direction.value}
        response = self._post(f"/game/{game_id}/action/attack", data)
        return ActionResult.from_dict(response)
    
    # 迷路情報取得
    def get_maze_info(self, game_id: str) -> Maze:
        """迷路情報のみを取得"""
        game_state = self.get_game_state(game_id)
        return game_state.maze
    
    # プライベートメソッド
    def _get(self, endpoint: str) -> dict:
        url = f"{self.base_url}/api{endpoint}"
        response = self.session.get(url, timeout=self.timeout)
        return self._handle_response(response)
    
    def _post(self, endpoint: str, data: dict) -> dict:
        url = f"{self.base_url}/api{endpoint}"
        response = self.session.post(url, json=data, timeout=self.timeout)
        return self._handle_response(response)
    
    def _handle_response(self, response: requests.Response) -> dict:
        if response.status_code == 200:
            return response.json()
        elif response.status_code == 400:
            error_data = response.json()
            raise InvalidActionError(error_data.get("message", "Invalid action"))
        elif response.status_code == 404:
            raise GameNotFoundError("Game not found")
        else:
            raise APIError(f"API error: {response.status_code}")
```

---

## 4. データモデル

### 4.1 基本モデル

```python
from dataclasses import dataclass
from typing import List, Optional, Dict
from enum import Enum

class Direction(Enum):
    NORTH = "north"
    SOUTH = "south"
    EAST = "east"
    WEST = "west"
    
    @classmethod
    @property
    def ALL(cls):
        return [cls.NORTH, cls.SOUTH, cls.EAST, cls.WEST]

@dataclass
class Position:
    x: int
    y: int
    
    def move(self, direction: Direction) -> 'Position':
        """指定方向に移動した新しい座標を返す"""
        if direction == Direction.NORTH:
            return Position(self.x, self.y - 1)
        elif direction == Direction.SOUTH:
            return Position(self.x, self.y + 1)
        elif direction == Direction.EAST:
            return Position(self.x + 1, self.y)
        elif direction == Direction.WEST:
            return Position(self.x - 1, self.y)

@dataclass
class Player:
    id: str
    type: str
    position: Position
    health: int
    
    @classmethod
    def from_dict(cls, data: dict) -> 'Player':
        return cls(
            id=data["id"],
            type=data["type"],
            position=Position(data["position"]["x"], data["position"]["y"]),
            health=data["health"]
        )

@dataclass
class Maze:
    width: int
    height: int
    cells: List[List[int]]  # 0: 通路, 1: 壁
    start_positions: Dict[str, Position]
    
    def is_wall(self, position: Position) -> bool:
        """指定座標が壁かどうか"""
        if not self.is_valid_position(position):
            return True
        return self.cells[position.y][position.x] == 1
    
    def is_valid_position(self, position: Position) -> bool:
        """座標が迷路の範囲内かどうか"""
        return (0 <= position.x < self.width and 
                0 <= position.y < self.height)
    
    @classmethod
    def from_dict(cls, data: dict) -> 'Maze':
        start_positions = {}
        for key, pos_data in data["startPositions"].items():
            start_positions[key] = Position(pos_data["x"], pos_data["y"])
        
        return cls(
            width=data["width"],
            height=data["height"],
            cells=data["cells"],
            start_positions=start_positions
        )

@dataclass
class GameState:
    game_id: str
    maze: Maze
    players: Dict[str, Player]
    current_turn: str
    turn_count: int
    game_status: str
    winner: Optional[str] = None
    
    def get_player(self, player_id: str) -> Player:
        """指定プレイヤーの情報を取得"""
        return self.players[player_id]
    
    def get_opponent(self, player_id: str) -> Player:
        """相手プレイヤーの情報を取得"""
        for pid, player in self.players.items():
            if pid != player_id:
                return player
        raise ValueError(f"Opponent not found for player {player_id}")
    
    def is_finished(self) -> bool:
        """ゲームが終了しているかどうか"""
        return self.game_status == "finished"
    
    def can_move(self, from_position: Position, direction: Direction) -> bool:
        """指定方向に移動可能かどうか"""
        new_position = from_position.move(direction)
        return not self.maze.is_wall(new_position)
    
    def can_attack(self, from_position: Position, direction: Direction) -> bool:
        """指定方向に攻撃可能かどうか（壁または敵がいる）"""
        target_position = from_position.move(direction)
        
        # 範囲外は攻撃不可
        if not self.maze.is_valid_position(target_position):
            return False
        
        # 壁があるか、敵プレイヤーがいるかチェック
        if self.maze.is_wall(target_position):
            return True
        
        # 敵プレイヤーがいるかチェック
        for player in self.players.values():
            if player.position.x == target_position.x and player.position.y == target_position.y:
                return True
        
        return False
    
    @classmethod
    def from_dict(cls, data: dict) -> 'GameState':
        # プレイヤー情報の変換
        players = {}
        for player_id, player_data in data["players"].items():
            players[player_id] = Player.from_dict(player_data)
        
        return cls(
            game_id=data["gameId"],
            maze=Maze.from_dict(data["maze"]),
            players=players,
            current_turn=data["currentTurn"],
            turn_count=data["turnCount"],
            game_status=data["gameStatus"],
            winner=data.get("winner")
        )

@dataclass
class ActionResult:
    success: bool
    result: str
    new_position: Optional[Position] = None
    target: Optional[dict] = None
    game_state_update: Optional[dict] = None
    
    @classmethod
    def from_dict(cls, data: dict) -> 'ActionResult':
        new_position = None
        if "newPosition" in data:
            pos_data = data["newPosition"]
            new_position = Position(pos_data["x"], pos_data["y"])
        
        return cls(
            success=data["success"],
            result=data["result"],
            new_position=new_position,
            target=data.get("target"),
            game_state_update=data.get("gameState")
        )
```

---

## 5. 例外クラス

```python
class MazeSDKError(Exception):
    """SDK基底例外クラス"""
    pass

class APIError(MazeSDKError):
    """API通信エラー"""
    pass

class GameNotFoundError(MazeSDKError):
    """ゲームが見つからない"""
    pass

class InvalidActionError(MazeSDKError):
    """無効なアクション"""
    pass

class InvalidTurnError(MazeSDKError):
    """無効なターン"""
    pass
```

---

## 6. ユーティリティ関数

```python
import time
from typing import Callable

def wait_for_turn(client: MazeClient, game_id: str, player_id: str, 
                  check_interval: float = 0.5) -> GameState:
    """自分のターンになるまで待機"""
    while True:
        game_state = client.get_game_state(game_id)
        
        if game_state.is_finished():
            return game_state
        
        if game_state.current_turn == player_id:
            return game_state
        
        time.sleep(check_interval)

def retry_action(action_func: Callable, max_retries: int = 3, 
                delay: float = 1.0):
    """アクション実行のリトライ"""
    for attempt in range(max_retries):
        try:
            return action_func()
        except APIError as e:
            if attempt == max_retries - 1:
                raise e
            time.sleep(delay)

def calculate_distance(pos1: Position, pos2: Position) -> int:
    """マンハッタン距離を計算"""
    return abs(pos1.x - pos2.x) + abs(pos1.y - pos2.y)

def find_path_to_enemy(maze: Maze, start: Position, 
                      enemy_position: Position) -> List[Direction]:
    """敵への最短経路を計算（簡易版）"""
    # A*アルゴリズムの簡易実装
    # 実際の実装ではより効率的なアルゴリズムを使用
    pass
```

---

## 7. 高度なAI実装例

### 7.1 壁伝いAI

```python
class WallFollowerAI:
    def __init__(self, game_url="http://localhost:3001"):
        self.client = MazeClient(game_url)
        self.player_id = None
        self.last_direction = Direction.NORTH
    
    def decide_action(self, game_state):
        my_player = game_state.get_player(self.player_id)
        
        # 右手法で壁伝い移動
        right_direction = self.get_right_direction(self.last_direction)
        
        # 右に壁があるかチェック
        if game_state.maze.is_wall(my_player.position.move(right_direction)):
            # 前進可能かチェック
            if game_state.can_move(my_player.position, self.last_direction):
                return ("move", self.last_direction)
            else:
                # 左に回転
                self.last_direction = self.get_left_direction(self.last_direction)
                return ("move", self.last_direction)
        else:
            # 右に回転して前進
            self.last_direction = right_direction
            return ("move", self.last_direction)
    
    def get_right_direction(self, direction: Direction) -> Direction:
        mapping = {
            Direction.NORTH: Direction.EAST,
            Direction.EAST: Direction.SOUTH,
            Direction.SOUTH: Direction.WEST,
            Direction.WEST: Direction.NORTH
        }
        return mapping[direction]
    
    def get_left_direction(self, direction: Direction) -> Direction:
        mapping = {
            Direction.NORTH: Direction.WEST,
            Direction.WEST: Direction.SOUTH,
            Direction.SOUTH: Direction.EAST,
            Direction.EAST: Direction.NORTH
        }
        return mapping[direction]
```

### 7.2 戦略的AI

```python
class StrategicAI:
    def __init__(self, game_url="http://localhost:3001"):
        self.client = MazeClient(game_url)
        self.player_id = None
        self.strategy = "explore"  # explore, attack, defend
    
    def decide_action(self, game_state):
        my_player = game_state.get_player(self.player_id)
        enemy_player = game_state.get_opponent(self.player_id)
        
        # 敵との距離を計算
        distance = calculate_distance(my_player.position, enemy_player.position)
        
        # 戦略を決定
        if distance <= 2:
            self.strategy = "attack"
        elif distance > 5:
            self.strategy = "explore"
        else:
            self.strategy = "approach"
        
        if self.strategy == "attack":
            return self.attack_strategy(game_state, my_player, enemy_player)
        elif self.strategy == "explore":
            return self.explore_strategy(game_state, my_player)
        else:
            return self.approach_strategy(game_state, my_player, enemy_player)
    
    def attack_strategy(self, game_state, my_player, enemy_player):
        # 敵への直接攻撃を試行
        for direction in Direction.ALL:
            target_pos = my_player.position.move(direction)
            if (target_pos.x == enemy_player.position.x and 
                target_pos.y == enemy_player.position.y):
                return ("attack", direction)
        
        # 壁を壊して敵への道を作る
        return self.break_wall_towards_enemy(game_state, my_player, enemy_player)
    
    def explore_strategy(self, game_state, my_player):
        # 未探索エリアに向かう
        # 簡単な実装として、ランダムに移動
        possible_moves = []
        for direction in Direction.ALL:
            if game_state.can_move(my_player.position, direction):
                possible_moves.append(("move", direction))
        
        if possible_moves:
            return random.choice(possible_moves)
        else:
            # 移動できない場合は壁を壊す
            for direction in Direction.ALL:
                if game_state.can_attack(my_player.position, direction):
                    return ("attack", direction)
    
    def approach_strategy(self, game_state, my_player, enemy_player):
        # 敵に向かって移動
        dx = enemy_player.position.x - my_player.position.x
        dy = enemy_player.position.y - my_player.position.y
        
        # より大きな差がある軸を優先
        if abs(dx) > abs(dy):
            direction = Direction.EAST if dx > 0 else Direction.WEST
        else:
            direction = Direction.SOUTH if dy > 0 else Direction.NORTH
        
        if game_state.can_move(my_player.position, direction):
            return ("move", direction)
        elif game_state.can_attack(my_player.position, direction):
            return ("attack", direction)
        else:
            # 別の方向を試す
            return self.explore_strategy(game_state, my_player)
    
    def break_wall_towards_enemy(self, game_state, my_player, enemy_player):
        # 敵に向かう方向の壁を破壊
        dx = enemy_player.position.x - my_player.position.x
        dy = enemy_player.position.y - my_player.position.y
        
        if abs(dx) > abs(dy):
            direction = Direction.EAST if dx > 0 else Direction.WEST
        else:
            direction = Direction.SOUTH if dy > 0 else Direction.NORTH
        
        if game_state.can_attack(my_player.position, direction):
            return ("attack", direction)
        
        # 他の攻撃可能な方向を探す
        for direction in Direction.ALL:
            if game_state.can_attack(my_player.position, direction):
                return ("attack", direction)
        
        # 攻撃できない場合は移動
        return self.explore_strategy(game_state, my_player)
```

---

## 8. AIのエントリーポイント

### 8.1 標準的なエントリーポイント

```python
# main.py - AIのメインエントリーポイント
import sys
import json
import os
from your_ai_implementation import YourAI

def main():
    # 環境変数または引数からゲーム情報を取得
    game_url = os.environ.get("GAME_URL", "http://localhost:3001")
    game_id = os.environ.get("GAME_ID")
    player_id = os.environ.get("PLAYER_ID")
    
    # コマンドライン引数があれば優先
    if len(sys.argv) >= 4:
        game_url = sys.argv[1]
        game_id = sys.argv[2]
        player_id = sys.argv[3]
    
    if not game_id or not player_id:
        print("Error: GAME_ID and PLAYER_ID are required")
        sys.exit(1)
    
    # AI初期化・実行
    ai = YourAI(game_url)
    
    try:
        ai.play(game_id, player_id)
        print("AI finished successfully")
    except Exception as e:
        print(f"AI error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
```

### 8.2 設定ファイル対応

```python
# config.py
import json
import os

class Config:
    def __init__(self, config_file: str = "config.json"):
        self.config_file = config_file
        self.load_config()
    
    def load_config(self):
        default_config = {
            "ai_name": "MyAI",
            "strategy": "balanced",
            "aggressive_distance": 3,
            "exploration_weight": 0.5,
            "debug_mode": False
        }
        
        if os.path.exists(self.config_file):
            with open(self.config_file, 'r') as f:
                user_config = json.load(f)
                default_config.update(user_config)
        
        for key, value in default_config.items():
            setattr(self, key, value)
    
    def save_config(self):
        config_dict = {
            key: getattr(self, key) 
            for key in dir(self) 
            if not key.startswith('_') and key != 'config_file'
        }
        
        with open(self.config_file, 'w') as f:
            json.dump(config_dict, f, indent=2)

# 設定を使用するAI
class ConfigurableAI:
    def __init__(self, game_url: str):
        self.client = MazeClient(game_url)
        self.config = Config()
        
    def decide_action(self, game_state):
        if self.config.debug_mode:
            print(f"Turn {game_state.turn_count}: Deciding action...")
        
        # 設定値を使用した戦略実装
        # ...
```

---

## 9. デバッグ・テスト支援

### 9.1 ローカルデバッグ

```python
# debug_runner.py
from invader_maze_sdk import MazeClient
from your_ai_implementation import YourAI
import time

class DebugRunner:
    def __init__(self, ai_class, game_url="http://localhost:3001"):
        self.ai_class = ai_class
        self.game_url = game_url
        self.client = MazeClient(game_url)
    
    def run_test_game(self, maze_size=(15, 15)):
        # テスト用ゲームを開始
        game_response = self.client._post("/game/start", {
            "gameMode": "ai_vs_ai",
            "mazeSize": {"width": maze_size[0], "height": maze_size[1]}
        })
        
        game_id = game_response["gameId"]
        
        # AI初期化
        ai1 = self.ai_class(self.game_url)
        ai2 = self.ai_class(self.game_url)
        
        print(f"Starting test game: {game_id}")
        
        # 並列実行（実際の実装では適切なスレッド処理）
        import threading
        
        def run_ai(ai, player_id):
            try:
                ai.play(game_id, player_id)
            except Exception as e:
                print(f"AI {player_id} error: {e}")
        
        thread1 = threading.Thread(target=run_ai, args=(ai1, "player1"))
        thread2 = threading.Thread(target=run_ai, args=(ai2, "player2"))
        
        thread1.start()
        thread2.start()
        
        thread1.join()
        thread2.join()
        
        # 結果表示
        final_state = self.client.get_game_state(game_id)
        print(f"Game finished. Winner: {final_state.winner}")
        
        return game_id

# 使用例
if __name__ == "__main__":
    runner = DebugRunner(YourAI)
    runner.run_test_game()
```

### 9.2 パフォーマンス測定

```python
# performance_tester.py
import time
import statistics
from typing import List

class PerformanceTester:
    def __init__(self, ai_class):
        self.ai_class = ai_class
        self.results = []
    
    def benchmark_ai(self, num_games: int = 10) -> dict:
        game_times = []
        wins = 0
        
        for i in range(num_games):
            print(f"Running game {i+1}/{num_games}")
            
            start_time = time.time()
            game_id = self.run_single_game()
            end_time = time.time()
            
            # 結果確認
            final_state = self.client.get_game_state(game_id)
            if final_state.winner == "player1":  # AI が player1 と仮定
                wins += 1
            
            game_times.append(end_time - start_time)
        
        return {
            "total_games": num_games,
            "wins": wins,
            "win_rate": wins / num_games,
            "avg_game_time": statistics.mean(game_times),
            "min_game_time": min(game_times),
            "max_game_time": max(game_times)
        }
```

---

## 10. パッケージ配布

### 10.1 setup.py

```python
from setuptools import setup, find_packages

setup(
    name="invader-maze-sdk",
    version="1.0.0",
    description="Python SDK for INVADER Maze AI development",
    author="Your Team",
    packages=find_packages(),
    install_requires=[
        "requests>=2.25.0",
        "dataclasses-json>=0.5.0",
    ],
    extras_require={
        "dev": [
            "pytest>=6.0.0",
            "black>=21.0.0",
            "flake8>=3.8.0",
        ]
    },
    python_requires=">=3.7",
    entry_points={
        "console_scripts": [
            "maze-ai-test=invader_maze_sdk.debug_runner:main",
        ]
    }
)
```

### 10.2 使用方法ドキュメント

```markdown
# INVADER Maze AI SDK

## クイックスタート

1. SDKをインストール
```bash
pip install invader-maze-sdk
```

2. 基本的なAIを実装
```python
from invader_maze_sdk import MazeClient, Direction

class MyAI:
    def __init__(self, game_url):
        self.client = MazeClient(game_url)
    
    def play(self, game_id, player_id):
        # AI実装
        pass
```

3. ローカルでテスト
```bash
maze-ai-test --ai my_ai.MyAI
```

## 詳細な使用方法

- [APIリファレンス](docs/api_reference.md)
- [AI実装ガイド](docs/ai_guide.md)
- [サンプルAI](examples/)
```

---

このPython SDKにより、AI開発者は複雑なHTTP通信を意識せずに、ゲームロジックに集中してAIを開発できます。特に重要なのは：

1. **簡単な導入**: pip installで即座に使用開始
2. **直感的なAPI**: ゲームの概念に沿ったメソッド名
3. **豊富なサンプル**: 段階的な学習が可能
4. **デバッグ支援**: ローカルテストやパフォーマンス測定

このSDKについて、特定の部分の詳細実装や追加機能があれば、お気軽にお聞かせください！