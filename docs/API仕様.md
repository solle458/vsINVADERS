# INVADER Maze AI - API仕様書

## ドキュメント参照

このドキュメントは以下のドキュメントと密接に関連しています：

- [要件定義.md](./要件定義.md): 実装すべき機能要件の定義
- [技術選定.md](./技術選定.md): 採用技術の選定理由と実装方針
- [DB設計.md](./DB設計.md): データベーススキーマの設計
- [SDK設計.md](./SDK設計.md): AI開発用SDKの設計
- [ディレクトリ構成.md](./ディレクトリ構成.md): プロジェクトのディレクトリ構造

## 実装上の注意点

1. バックエンド実装
   - Node.js (Express) を使用
   - 技術選定ドキュメントの実装方針に従う
   - エラーハンドリングは標準エラーレスポンス形式に従う

2. データベース連携
   - PlanetScale (MySQL) を使用
   - DB設計ドキュメントのスキーマ定義に従う
   - トランザクション管理を適切に実装

3. AI実行環境
   - DockerコンテナでAIを実行
   - 技術選定ドキュメントのAI実行環境の仕様に従う
   - セキュリティとリソース制限を考慮

4. 認証・認可
   - JWTを使用した認証
   - エンドポイント別の認証要件に従う
   - レート制限を適切に実装

## 概要

INVADER Maze AIゲームのバックエンドAPIは、迷路ゲームの状態管理、プレイヤー（AI・人間）の操作、ゲーム進行を制御します。

**Base URL**: `http://localhost:3001/api/v1` (開発環境)

## バージョニング

- 現在のバージョン: v1
- バージョンはURLパスに含まれます（例: `/api/v1/game/start`）
- メジャーバージョンアップ時は新しいパスを使用（例: `/api/v2/`）
- マイナーバージョンアップは同一パスで互換性を維持

## 認証・認可

### 認証方式
- JWT (JSON Web Token) を使用
- トークンは `Authorization: Bearer <token>` ヘッダーで送信
- トークンの有効期限は24時間

### エンドポイント別認証要件

| エンドポイント | 認証要件 |
|------------|--------|
| `/auth/*` | 不要 |
| `/game/start` | 必須 |
| `/game/{gameId}/*` | 必須 |
| `/ai/*` | 必須 |
| `/games/history` | 必須 |
| `/replay/*` | 必須 |

### 認証エンドポイント

```http
POST /auth/login
```

**リクエストボディ**:
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**レスポンス**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 86400,
  "user": {
    "id": "uuid",
    "name": "User Name",
    "email": "user@example.com"
  }
}
```

## エラーレスポンス

すべてのエラーレスポンスは以下の形式に従います：

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      // エラー固有の詳細情報（オプション）
    }
  }
}
```

### 標準エラーコード

| コード | HTTPステータス | 説明 |
|-------|--------------|------|
| `INVALID_REQUEST` | 400 | リクエストの形式が不正 |
| `UNAUTHORIZED` | 401 | 認証が必要 |
| `FORBIDDEN` | 403 | 権限が不足 |
| `NOT_FOUND` | 404 | リソースが存在しない |
| `CONFLICT` | 409 | リソースの競合 |
| `RATE_LIMITED` | 429 | レート制限超過 |
| `INTERNAL_ERROR` | 500 | サーバー内部エラー |

### ゲーム固有のエラーコード

| コード | HTTPステータス | 説明 |
|-------|--------------|------|
| `INVALID_GAME_MODE` | 400 | 不正なゲームモード |
| `INVALID_ACTION` | 400 | 不正なアクション |
| `NOT_YOUR_TURN` | 400 | 自分のターンではない |
| `GAME_ALREADY_FINISHED` | 400 | ゲームは既に終了 |
| `AI_EXECUTION_ERROR` | 500 | AI実行エラー |

## ゲームモード

以下の2つのゲームモードをサポート：

1. `ai_vs_user`: AI vs 人間プレイヤー
2. `ai_vs_ai`: AI vs AI

## AI実行環境API

### AIコンテナの起動

```http
POST /ai/container/start
```

**リクエストボディ**:
```json
{
  "aiId": "uuid",
  "gameId": "uuid",
  "playerId": "player1"
}
```

**レスポンス**:
```json
{
  "containerId": "uuid",
  "status": "running",
  "startedAt": "2024-03-20T10:00:00Z"
}
```

### AIコンテナの状態確認

```http
GET /ai/container/{containerId}/status
```

**レスポンス**:
```json
{
  "containerId": "uuid",
  "status": "running" | "stopped" | "error",
  "startedAt": "2024-03-20T10:00:00Z",
  "lastHeartbeat": "2024-03-20T10:01:00Z",
  "error": null | {
    "code": "string",
    "message": "string"
  }
}
```

### AIコンテナの停止

```http
POST /ai/container/{containerId}/stop
```

**レスポンス**:
```json
{
  "success": true,
  "stoppedAt": "2024-03-20T10:05:00Z"
}
```

## リプレイ機能API

### リプレイデータの取得

```http
GET /replay/{gameId}
```

**レスポンス**:
```json
{
  "gameId": "uuid",
  "metadata": {
    "startedAt": "2024-03-20T10:00:00Z",
    "finishedAt": "2024-03-20T10:05:00Z",
    "mode": "ai_vs_user",
    "players": {
      "player1": {
        "type": "ai",
        "aiId": "uuid"
      },
      "player2": {
        "type": "user",
        "userId": "uuid"
      }
    }
  },
  "turns": [
    {
      "turnNumber": 1,
      "state": {
        // ゲーム状態のJSON
      },
      "actions": [
        {
          "playerId": "player1",
          "action": "move",
          "direction": "north",
          "timestamp": "2024-03-20T10:00:01Z"
        }
      ]
    }
    // ... 以降のターン
  ]
}
```

### リプレイの再生制御

```http
POST /replay/{gameId}/control
```

**リクエストボディ**:
```json
{
  "action": "play" | "pause" | "stop" | "seek",
  "turnNumber": 5  // seekの場合のみ必須
}
```

**レスポンス**:
```json
{
  "success": true,
  "currentTurn": 5,
  "status": "playing" | "paused" | "stopped"
}
```

## スコアリングシステム

### スコア計算

各ゲームのスコアは以下の要素から計算されます：

1. 勝利/敗北: +100/-50ポイント
2. ターン数: 1ターンあたり-1ポイント（早く終了するほど高得点）
3. 壁の破壊: 1つあたり+5ポイント
4. プレイヤーへの命中: 1回あたり+10ポイント

### スコア取得

```http
GET /games/{gameId}/score
```

**レスポンス**:
```json
{
  "gameId": "uuid",
  "scores": {
    "player1": {
      "total": 150,
      "breakdown": {
        "victory": 100,
        "turns": -20,
        "wallDestruction": 40,
        "playerHits": 30
      }
    },
    "player2": {
      "total": 80,
      "breakdown": {
        "victory": 0,
        "turns": -20,
        "wallDestruction": 60,
        "playerHits": 40
      }
    }
  },
  "winner": "player1"
}
```

## 1. ゲーム管理API

### 1.1 新しいゲームを開始

```http
POST /game/start
```

**リクエストボディ**:
```json
{
  "gameMode": "ai_vs_human" | "ai_vs_ai" | "human_vs_human",
  "mazeSize": {
    "width": 15,
    "height": 15
  }
}
```

**レスポンス**:
```json
{
  "gameId": "uuid",
  "maze": {
    "width": 15,
    "height": 15,
    "cells": [[0, 1, 0, ...], ...], // 0: 通路, 1: 壁
    "startPositions": {
      "player1": {"x": 1, "y": 1},
      "player2": {"x": 13, "y": 13}
    }
  },
  "players": {
    "player1": {
      "id": "player1",
      "type": "ai" | "human",
      "position": {"x": 1, "y": 1},
      "health": 100
    },
    "player2": {
      "id": "player2", 
      "type": "ai" | "human",
      "position": {"x": 13, "y": 13},
      "health": 100
    }
  },
  "currentTurn": "player1",
  "turnCount": 0,
  "gameStatus": "playing"
}
```

### 1.2 ゲーム状態を取得

```http
GET /game/{gameId}/state
```

**レスポンス**:
```json
{
  "gameId": "uuid",
  "maze": { /* 迷路情報 */ },
  "players": { /* プレイヤー情報 */ },
  "currentTurn": "player1",
  "turnCount": 5,
  "gameStatus": "playing" | "finished",
  "winner": null | "player1" | "player2",
  "lastAction": {
    "playerId": "player1",
    "action": "move",
    "direction": "north",
    "result": "success"
  }
}
```

## 2. プレイヤー操作API

### 2.1 移動アクション

```http
POST /game/{gameId}/action/move
```

**リクエストボディ**:
```json
{
  "playerId": "player1",
  "direction": "north" | "south" | "east" | "west"
}
```

**レスポンス**:
```json
{
  "success": true,
  "result": "moved" | "blocked" | "invalid_turn",
  "newPosition": {"x": 2, "y": 1},
  "gameState": {
    "currentTurn": "player2",
    "turnCount": 6,
    "gameStatus": "playing"
  }
}
```

### 2.2 攻撃アクション

```http
POST /game/{gameId}/action/attack
```

**リクエストボディ**:
```json
{
  "playerId": "player1",
  "direction": "north" | "south" | "east" | "west"
}
```

**レスポンス**:
```json
{
  "success": true,
  "result": "wall_destroyed" | "hit_player" | "miss" | "invalid_turn",
  "target": {
    "type": "wall" | "player",
    "position": {"x": 2, "y": 0}
  },
  "gameState": {
    "currentTurn": "player2",
    "turnCount": 7,
    "gameStatus": "playing" | "finished",
    "winner": null | "player1"
  }
}
```

## 3. AI管理API

### 3.1 AIアップロード

```http
POST /ai/upload
```

**リクエスト**: `multipart/form-data`
- `aiFile`: AI実装のpythonファイル
- `playerSlot`: "player1" | "player2"

**レスポンス**:
```json
{
  "success": true,
  "aiId": "uuid",
  "message": "AI uploaded successfully"
}
```

### 3.2 AI情報取得

```http
GET /ai/{aiId}/info
```

**レスポンス**:
```json
{
  "aiId": "uuid",
  "filename": "my_ai.python",
  "uploadedAt": "2025-05-19T10:00:00Z",
  "status": "ready" | "running" | "error"
}
```

## 4. 迷路API

### 4.1 迷路生成

```http
POST /maze/generate
```

**リクエストボディ**:
```json
{
  "width": 15,
  "height": 15,
  "seed": 12345 // オプショナル
}
```

**レスポンス**:
```json
{
  "maze": {
    "width": 15,
    "height": 15,
    "cells": [[0, 1, 0, ...], ...],
    "startPositions": {
      "player1": {"x": 1, "y": 1},
      "player2": {"x": 13, "y": 13}
    }
  }
}
```

## 5. ゲーム記録API

### 5.1 ゲーム履歴取得

```http
GET /games/history?limit=10&offset=0
```

**レスポンス**:
```json
{
  "games": [
    {
      "gameId": "uuid",
      "startedAt": "2025-05-19T10:00:00Z",
      "finishedAt": "2025-05-19T10:05:00Z",
      "winner": "player1",
      "players": {
        "player1": {"type": "ai"},
        "player2": {"type": "human"}
      },
      "totalTurns": 25
    }
  ],
  "total": 100,
  "hasMore": true
}
```

### 5.2 ゲーム詳細ログ取得

```http
GET /games/{gameId}/log
```

**レスポンス**:
```json
{
  "gameId": "uuid",
  "actions": [
    {
      "turn": 1,
      "playerId": "player1",
      "action": "move",
      "direction": "north",
      "result": "moved",
      "timestamp": "2025-05-19T10:00:01Z"
    },
    {
      "turn": 2,
      "playerId": "player2", 
      "action": "attack",
      "direction": "west",
      "result": "wall_destroyed",
      "timestamp": "2025-05-19T10:00:02Z"
    }
  ]
}
```

## 6. リアルタイム通信 (WebSocket)

### 6.1 ゲーム状態購読

```
WS /ws/game/{gameId}
```

**送信メッセージ**:
```json
{
  "type": "subscribe",
  "gameId": "uuid"
}
```

**受信メッセージ**:
```json
{
  "type": "game_update",
  "gameState": { /* 最新のゲーム状態 */ }
}
```

## 8. データ型定義

### Position
```typescript
interface Position {
  x: number;
  y: number;
}
```

### Maze
```typescript
interface Maze {
  width: number;
  height: number;
  cells: number[][]; // 0: 通路, 1: 壁
  startPositions: {
    player1: Position;
    player2: Position;
  };
}
```

### Player
```typescript
interface Player {
  id: string;
  type: 'ai' | 'human';
  position: Position;
  health: number;
}
```

### GameState
```typescript
interface GameState {
  gameId: string;
  maze: Maze;
  players: {
    player1: Player;
    player2: Player;
  };
  currentTurn: string;
  turnCount: number;
  gameStatus: 'playing' | 'finished';
  winner: string | null;
}
```

## 9. 認証・セキュリティ

現在のバージョンでは認証機能は実装せず、後のバージョンで追加予定。

### AI実行のセキュリティ
- AIはDockerコンテナ内で分離実行
- ファイルシステムへのアクセス制限
- 実行時間制限（30秒）
- メモリ使用量制限（512MB）

## 10. レート制限

| エンドポイント | 制限 |
|---------------|------|
| `/game/start` | 10回/分 |
| `/game/{gameId}/action/*` | 60回/分 |
| `/ai/upload` | 5回/分 |

この API 仕様に基づいて実装を進めることで、要件定義で定められた機能を満たすことができます。
