# VSmaze Backend - クリーンアーキテクチャ基盤

VSmaze AI対戦ゲームプラットフォームのバックエンドAPIサーバーです。

## 🏗️ アーキテクチャ概要

クリーンアーキテクチャを採用し、以下の層で構成されています：

```
backend/
├── domain/                    # ドメイン層（ビジネスロジック）
│   ├── entity/               # エンティティ
│   │   ├── game.go           # ゲームエンティティ
│   │   ├── player.go         # プレイヤーエンティティ
│   │   └── ai.go             # AIエンティティ
│   ├── repository/           # リポジトリインターフェース
│   │   ├── game_repository.go
│   │   └── ai_repository.go
│   └── service/              # ドメインサービス
│       └── game_service.go   # ゲームビジネスロジック
├── usecase/                  # アプリケーション層
│   └── game_usecase.go       # ゲームユースケース
├── interfaces/               # インターフェース層
│   └── handler/              # HTTPハンドラー
│       └── game_handler.go   # ゲームAPIハンドラー
├── infrastructure/           # インフラ層（今後実装）
│   └── database/
│       └── schema.sql        # SQLiteスキーマ
├── cmd/
│   └── server/
│       └── main.go           # メインエントリーポイント
├── go.mod                    # Go modules設定
├── Dockerfile               # Docker設定
└── README.md                # このファイル
```

## 🎯 実装済み機能

### ✅ Phase 1 - MVP基盤（完了）
- **クリーンアーキテクチャ基盤**: ドメイン層、ユースケース層、インターフェース層
- **ゲームエンティティ**: 15×15盤面、ターン制システム、勝敗判定
- **プレイヤーエンティティ**: 行動システム（攻撃・移動・防御）
- **AIエンティティ**: AI管理、ランキングシステム
- **リポジトリインターフェース**: データ永続化の抽象化
- **ゲームサービス**: ゲームルール、バリデーション
- **ゲームユースケース**: アプリケーションロジック
- **HTTPハンドラー**: RESTful API エンドポイント
- **SQLiteスキーマ**: データベーステーブル設計

### 🎮 ゲーム仕様（確定実装済み）
- **盤面サイズ**: 15×15
- **攻撃範囲**: 前方、壁または対戦相手に当たるまで
- **勝利条件**: 対戦相手に攻撃が命中（一回）
- **対戦モード**: Human vs COM、AI vs COM、AI vs AI
- **COM AI**: Level 1-4（データベース初期化済み）

### 📡 API エンドポイント
```
GET  /health                    # ヘルスチェック
POST /api/v1/games              # ゲーム作成
GET  /api/v1/games              # ゲーム一覧
GET  /api/v1/games/active       # アクティブゲーム一覧
GET  /api/v1/games/:id          # ゲーム詳細
POST /api/v1/games/:id/start    # ゲーム開始
POST /api/v1/games/:id/move     # プレイヤー行動
GET  /api/v1/games/:id/history  # ゲーム履歴
DELETE /api/v1/games/:id        # ゲーム削除
GET  /ws                        # WebSocket（今後実装）
```

## 🛠️ セットアップ手順

### 1. 依存関係の解決
```bash
cd backend
go mod download
go mod tidy
```

### 2. データベース初期化（今後実装）
```bash
# データディレクトリ作成
mkdir -p ../data

# スキーマ適用（リポジトリ実装後）
# sqlite3 ../data/game.db < infrastructure/database/schema.sql
```

### 3. サーバー起動
```bash
# 開発モード（現在動作確認可能）
go run cmd/server/main.go

# ビルド & 実行
go build -o bin/server cmd/server/main.go
./bin/server
```

### 4. 動作確認
```bash
# ヘルスチェック（✅ 現在動作中）
curl http://localhost:8080/health

# レスポンス例
{
  "status": "ok",
  "service": "vsmaze-backend",
  "version": "v0.1.0"
}
```

## 🔧 開発用コマンド

```bash
# テスト実行
go test ./...

# リンター実行
golangci-lint run

# フォーマット
go fmt ./...

# モジュール整理
go mod tidy
```

## 🚀 次の開発ステップ

### 🔄 Phase 2: インフラ層実装（Day 5-6）- **次の作業**
- [ ] SQLiteリポジトリ実装（CRUD操作）
- [ ] データベース接続管理・マイグレーション
- [ ] 依存性注入（DI）設定
- [ ] main.goでのリポジトリ初期化

### 🎮 Phase 3: ゲームエンジン実装（Day 7-8）
- [ ] INVADERゲームルール完全実装
- [ ] COM AI Level 1-4 実装
- [ ] ゲーム盤面管理システム
- [ ] リアルタイム更新機能

### 🔗 Phase 4: API完成（Day 9-10）
- [ ] WebSocket通信実装
- [ ] エラーハンドリング強化
- [ ] ログ出力機能
- [ ] パフォーマンス最適化

## 🎯 技術仕様

### 依存関係
- **Go**: 1.21+
- **Gin**: Web フレームワーク
- **SQLite**: データベース
- **WebSocket**: リアルタイム通信（gorilla/websocket）
- **UUID**: 一意ID生成（google/uuid）
- **Testify**: テストライブラリ

### 環境設定
- **ポート**: 8080
- **データベース**: `../data/game.db`
- **ログレベル**: INFO（本番）、DEBUG（開発）
- **CORS**: フロントエンド連携対応

## 📊 プロジェクト進捗

| 項目 | 進捗 | 備考 |
|------|------|------|
| クリーンアーキテクチャ基盤 | ✅ 完了 | ドメイン・ユースケース・インターフェース層 |
| ゲームエンティティ | ✅ 完了 | 15×15盤面、ターン制システム |
| リポジトリインターフェース | ✅ 完了 | データ永続化抽象化 |
| HTTPハンドラー | ✅ 完了 | RESTful API基盤 |
| データベーススキーマ | ✅ 完了 | SQLite設計 |
| リポジトリ実装 | ⏳ 次フェーズ | SQLite接続・CRUD |
| ゲームエンジン | ⏳ 次フェーズ | INVADERルール・COM AI |
| WebSocket通信 | ⏳ 次フェーズ | リアルタイム更新 |

---

**🎮 VSmaze Backend - Ready for Game Engine Implementation! 🤖** 
