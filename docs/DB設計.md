# DB設計.md

## ドキュメント参照

このドキュメントは以下のドキュメントと密接に関連しています：

- [要件定義.md](./要件定義.md): 実装すべき機能要件の定義
- [技術選定.md](./技術選定.md): 採用技術の選定理由と実装方針
- [API仕様.md](./API仕様.md): バックエンドAPIの詳細仕様
- [SDK設計.md](./SDK設計.md): AI開発用SDKの設計
- [ディレクトリ構成.md](./ディレクトリ構成.md): プロジェクトのディレクトリ構造

## データベース概要

このプロジェクトでは、PlanetScale（MySQL互換）を使用します。主な特徴：

1. スキーマ管理
   - Gitのようなスキーマ管理
   - 安全なスキーマ変更
   - 自動スケーリング

2. テーブル設計方針
   - UUIDを主キーとして使用
   - 適切な外部キー制約
   - インデックスの最適化
   - JSONB型の活用

3. データ整合性
   - トランザクション管理
   - 参照整合性の維持
   - データの永続性確保

4. パフォーマンス考慮
   - 適切なインデックス設計
   - クエリの最適化
   - 接続プーリング

## 🎯 目的

このデータベース設計は、AI vs 人間または AI vs AI の迷路ゲームにおける、AI管理・ゲーム管理・スコア記録・ログ出力を行うための構造を提供します。

---

## 📁 テーブル定義一覧

---

### 1. `users`（人間プレイヤー）

| カラム名         | 型         | 説明              |
| ------------ | --------- | --------------- |
| `id`         | UUID (PK) | ユーザーID          |
| `name`       | VARCHAR   | 表示名             |
| `email`      | VARCHAR   | メールアドレス（任意/匿名可） |
| `created_at` | TIMESTAMP | 作成日時            |
| `last_login` | TIMESTAMP | 最終ログイン日時        |

---

### 2. `ai_scripts`（アップロードされたAI）

| カラム名          | 型         | 説明              |
| ------------- | --------- | --------------- |
| `id`          | UUID (PK) | AIの一意な識別子       |
| `name`        | VARCHAR   | AIの名前           |
| `owner_id`    | UUID (FK) | アップロードしたユーザーのID |
| `filename`    | VARCHAR   | pythonファイル名        |
| `uploaded_at` | TIMESTAMP | アップロード日時        |
| `status`      | ENUM      | `'active'`, `'inactive'`, `'error'` |
| `last_run_at` | TIMESTAMP | 最終実行日時          |

---

### 3. `games`（ゲーム履歴）

| カラム名           | 型         | 説明                           |
| -------------- | --------- | ---------------------------- |
| `id`           | UUID (PK) | ゲームID                        |
| `mode`         | ENUM      | `'ai_vs_user'`, `'ai_vs_ai'` |
| `player1_id`   | UUID (FK) | プレイヤー1のID（AIまたはユーザー）        |
| `player1_type` | ENUM      | `'ai'`, `'user'`            |
| `player2_id`   | UUID (FK) | プレイヤー2のID（AIまたはユーザー）        |
| `player2_type` | ENUM      | `'ai'`, `'user'`            |
| `maze_size`    | JSON      | `{"width": 15, "height": 15}` |
| `started_at`   | TIMESTAMP | ゲーム開始日時                      |
| `ended_at`     | TIMESTAMP | ゲーム終了日時                      |
| `status`       | ENUM      | `'waiting'`, `'playing'`, `'finished'`, `'error'` |

---

### 4. `game_turns`（ゲームの各ターン記録）

| カラム名          | 型           | 説明                 |
| ------------- | ----------- | ------------------ |
| `id`          | SERIAL (PK) | ターンID              |
| `game_id`     | UUID (FK)   | 対象ゲームID            |
| `turn_number` | INT         | ターン番号              |
| `state_json`  | JSONB       | 迷路や各プレイヤーの位置情報等の状態 |
| `timestamp`   | TIMESTAMP   | 実行時刻               |

---

### 5. `commands`（AI/ユーザの入力履歴）

| カラム名          | 型           | 説明                         |
| ------------- | ----------- | -------------------------- |
| `id`          | SERIAL (PK) | コマンドID                     |
| `game_id`     | UUID (FK)   | ゲームID                      |
| `turn_number` | INT         | 該当ターン                      |
| `player_id`   | UUID (FK)   | プレイヤーID（AIまたはユーザー）        |
| `player_type` | ENUM        | `'ai'`, `'user'`           |
| `action`      | ENUM        | `'move'`, `'attack'`       |
| `direction`   | ENUM        | `'north'`, `'south'`, `'east'`, `'west'` |
| `result`      | ENUM        | `'success'`, `'blocked'`, `'hit'`, `'miss'` |
| `timestamp`   | TIMESTAMP   | 実行時刻                      |

---

### 6. `scores`（ゲーム結果）

| カラム名           | 型         | 説明                          |
| -------------- | --------- | --------------------------- |
| `game_id`      | UUID (PK) | ゲームID（外部キー）                 |
| `player1_id`   | UUID (FK) | プレイヤー1のID                    |
| `player1_type` | ENUM      | `'ai'`, `'user'`            |
| `player2_id`   | UUID (FK) | プレイヤー2のID                    |
| `player2_type` | ENUM      | `'ai'`, `'user'`            |
| `winner_id`    | UUID (FK) | 勝利者のID（nullの場合は引き分け）        |
| `winner_type`  | ENUM      | `'ai'`, `'user'`, `'none'`  |
| `total_turns`  | INT       | ゲーム終了までのターン数                |
| `player1_score`| INT       | プレイヤー1の総合スコア                |
| `player2_score`| INT       | プレイヤー2の総合スコア                |
| `score_details`| JSONB     | スコアの内訳（勝利/敗北、ターン数、壁破壊、命中） |

---

### 7. `ai_containers`（AI実行環境）

| カラム名           | 型         | 説明                          |
| -------------- | --------- | --------------------------- |
| `id`           | UUID (PK) | コンテナID                      |
| `ai_script_id` | UUID (FK) | 実行中のAIスクリプトID              |
| `game_id`      | UUID (FK) | 実行中のゲームID                  |
| `player_id`    | UUID (FK) | プレイヤーID（常にAI）              |
| `status`       | ENUM      | `'running'`, `'stopped'`, `'error'` |
| `started_at`   | TIMESTAMP | 起動時刻                       |
| `stopped_at`   | TIMESTAMP | 停止時刻（nullの場合は実行中）          |
| `last_heartbeat`| TIMESTAMP | 最終ハートビート時刻                 |
| `error_message`| TEXT      | エラーメッセージ（エラー時のみ）           |

---

## 🔗 リレーション図（ERD簡易表現）

```text
users ───┬─────< ai_scripts ───< ai_containers
         └─────< games ─────< game_turns
                        └────< commands
                        └────< scores
```

---

## ✏️ メモ

### スコアリングシステム詳細

1. スコア計算要素
   - 勝利: +100ポイント
   - 敗北: -50ポイント
   - ターン数: 1ターンあたり-1ポイント
   - 壁の破壊: 1つあたり+5ポイント
   - プレイヤーへの命中: 1回あたり+10ポイント

2. スコア保存
   - `scores`テーブルの`score_details`カラムにJSONB形式で保存
   - 例:
     ```json
     {
       "victory": 100,
       "turns": -20,
       "wallDestruction": 40,
       "playerHits": 30
     }
     ```

3. スコア集計
   - ユーザーごとの総合スコア
   - AIごとの勝率と平均スコア
   - ゲームモード別の統計

### プレイヤーIDの統一

- すべてのテーブルで`player1_id`/`player2_id`の形式を使用
- プレイヤータイプは`player1_type`/`player2_type`で区別
- AIプレイヤーの場合は`ai_scripts`テーブルを参照
- ユーザープレイヤーの場合は`users`テーブルを参照

### 状態管理

- ゲーム状態は`game_turns.state_json`に保存
- 各ターンのアクションは`commands`テーブルに記録
- リプレイは`game_turns`と`commands`の組み合わせで再現可能

### セキュリティ

- ユーザー認証はJWTを使用
- AI実行はDockerコンテナで分離
- アクセス制御は`users`テーブルの権限で管理

---
