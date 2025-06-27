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
├── infrastructure/           # インフラ層 ✅ 完了！
│   └── database/
│       ├── schema.sql        # SQLiteスキーマ
│       ├── connection.go     # データベース接続管理
│       ├── game_repository_impl.go      # ゲームリポジトリ実装
│       ├── game_move_repository_impl.go # ゲームムーブリポジトリ実装
│       └── ai_repository_impl.go        # AIリポジトリ実装
├── cmd/
│   └── server/
│       └── main.go           # メインエントリーポイント（DI設定完了）
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

### ✅ Phase 1.5 - インフラ層実装（完了）- **🎉 新実装！**
- **SQLiteデータベース接続**: 自動マイグレーション機能付き
- **ゲームリポジトリ実装**: 完全CRUD操作（作成・取得・更新・削除）
- **ゲームムーブリポジトリ実装**: 履歴管理・再生機能
- **AIリポジトリ実装**: AI管理・統計機能
- **AIランキングリポジトリ実装**: レーティング・ランキング管理
- **依存性注入（DI）**: 全リポジトリの統合完了
- **データベースマイグレーション**: スキーマ自動適用

### 🎮 ゲーム仕様（確定実装済み）
- **盤面サイズ**: 15×15
- **攻撃範囲**: 前方、壁または対戦相手に当たるまで
- **勝利条件**: 対戦相手に攻撃が命中（一回）
- **対戦モード**: Human vs COM、AI vs COM、AI vs AI
- **COM AI**: Level 1-4（データベース初期化済み）

### 📡 API エンドポイント（**データベース連携動作済み**）
```
GET  /health                    # ヘルスチェック ✅ DB接続確認
POST /api/v1/games              # ゲーム作成 ✅ DB保存対応
GET  /api/v1/games              # ゲーム一覧 ✅ DB取得対応
GET  /api/v1/games/active       # アクティブゲーム一覧 ✅ DB取得対応
GET  /api/v1/games/:id          # ゲーム詳細 ✅ DB取得対応
POST /api/v1/games/:id/start    # ゲーム開始 ✅ DB更新対応
POST /api/v1/games/:id/move     # プレイヤー行動 ✅ DB保存対応
GET  /api/v1/games/:id/history  # ゲーム履歴 ✅ DB取得対応
DELETE /api/v1/games/:id        # ゲーム削除 ✅ DB削除対応
GET  /ws                        # WebSocket（Phase 1で実装予定）
```

## 🛠️ セットアップ手順

### 1. 依存関係の解決
```bash
cd backend
go mod download
go mod tidy
```

### 2. データベース初期化（✅ 自動実行）
```bash
# データディレクトリは自動作成されます
# スキーマは起動時に自動適用されます
```

### 3. サーバー起動
```bash
# 開発モード（✅ SQLite連携動作確認済み）
go run cmd/server/main.go

# ビルド & 実行
go build -o bin/server cmd/server/main.go
./bin/server
```

### 4. 動作確認
```bash
# ヘルスチェック（✅ データベース接続確認済み）
curl http://localhost:8080/health

# レスポンス例（更新済み）
{
  "database": "connected",
  "service": "vsmaze-backend", 
  "status": "ok",
  "timestamp": "2024-12-18T10:00:00Z",
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

### 🎮 Phase 2: ゲームエンジン実装（Day 7-8）- **次の作業**
- [ ] INVADERゲームルール完全実装
- [ ] COM AI Level 1-4 実装
- [ ] ゲーム盤面管理システム
- [ ] ターン制システムの完全実装

### 🔗 Phase 3: API完成（Day 9-10）
- [ ] WebSocket通信実装
- [ ] エラーハンドリング強化
- [ ] ログ出力機能
- [ ] パフォーマンス最適化

## 🎯 技術仕様

### 依存関係
- **Go**: 1.21+
- **Gin**: Web フレームワーク
- **SQLite**: データベース（**go-sqlite3 v1.14.28**）
- **WebSocket**: リアルタイム通信（gorilla/websocket）
- **UUID**: 一意ID生成（google/uuid）
- **Testify**: テストライブラリ

### 環境設定
- **ポート**: 8080
- **データベース**: `../data/game.db`（自動作成）
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
| **SQLiteリポジトリ実装** | ✅ **完了** | **SQLite接続・CRUD・マイグレーション** |
| **依存性注入（DI）** | ✅ **完了** | **全リポジトリ統合** |
| ゲームエンジン | ⏳ 次フェーズ | INVADERルール・COM AI |
| WebSocket通信 | ⏳ 次フェーズ | リアルタイム更新 |

---

**🎮 VSmaze Backend - Database Connected & API Ready! 🚀**

**現在の状況**: Phase 1 Day 5-6完了 - SQLiteリポジトリ実装・データベース連携API動作確認済み
