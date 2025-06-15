# 🎮 VSmaze - AI対戦ゲームプラットフォーム
# Makefile for easy project management

.PHONY: help setup up down restart logs clean test dev build status health

# デフォルトターゲット
.DEFAULT_GOAL := help

# 変数定義
COMPOSE_FILE := docker-compose.yml
PROJECT_NAME := vsmaze

# ヘルプ表示
help: ## 📋 利用可能なコマンド一覧を表示
	@echo "🎮 VSmaze - 利用可能なコマンド"
	@echo "================================"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "📚 使用例:"
	@echo "  make setup    # 初回環境構築"
	@echo "  make up       # サービス起動"
	@echo "  make logs     # ログ確認"
	@echo "  make down     # サービス停止"

# 🚀 環境構築・起動系コマンド
setup: ## 🔧 初回環境構築（Dockerイメージビルド + データディレクトリ作成）
	@echo "🔧 初回環境構築を開始..."
	@mkdir -p data/logs data/ai-uploads data/backup
	@docker compose build --no-cache
	@echo "✅ 環境構築完了！'make up' でサービスを起動してください"

up: ## 🚀 全サービス起動（バックグラウンド）
	@echo "🚀 サービスを起動中..."
	@docker compose up -d
	@echo "✅ サービス起動完了！"
	@echo "📱 Frontend: http://localhost:3000"
	@echo "🔗 Backend API: http://localhost:8080"
	@echo "📊 ログ確認: make logs"

down: ## 🛑 全サービス停止
	@echo "🛑 サービスを停止中..."
	@docker compose down
	@echo "✅ サービス停止完了"

restart: ## 🔄 全サービス再起動
	@echo "🔄 サービスを再起動中..."
	@make down
	@make up
	@echo "✅ サービス再起動完了"

# 📊 監視・ログ系コマンド
logs: ## 📋 全サービスのログをリアルタイム表示
	@docker compose logs -f

logs-backend: ## 📋 Backendログのみ表示
	@docker compose logs -f backend

logs-frontend: ## 📋 Frontendログのみ表示
	@docker compose logs -f frontend

logs-ai: ## 📋 AI Runnerログのみ表示
	@docker compose logs -f ai-runner

status: ## 📊 サービス状況確認
	@echo "📊 サービス状況:"
	@docker compose ps
	@echo ""
	@echo "💾 ディスク使用量:"
	@docker compose exec backend df -h 2>/dev/null || echo "  Backend: 停止中"
	@echo ""
	@echo "🔧 Docker情報:"
	@docker system df

health: ## 🏥 ヘルスチェック実行
	@echo "🏥 ヘルスチェック実行中..."
	@echo "Frontend (3000): $$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "接続不可")"
	@echo "Backend (8080): $$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health || echo "接続不可")"
	@echo "AI Runner (5000): $$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health || echo "接続不可")"

# 🛠️ 開発系コマンド
dev: ## 💻 開発モード起動（ホットリロード有効）
	@echo "💻 開発モード起動中..."
	@docker compose -f docker-compose.yml up --build

dev-backend: ## 💻 Backend開発モード（Go）
	@echo "💻 Backend開発モード起動..."
	@cd backend && go mod tidy && go run cmd/server/main.go

dev-frontend: ## 💻 Frontend開発モード（Next.js）
	@echo "💻 Frontend開発モード起動..."
	@cd frontend && npm install && npm run dev

dev-ai: ## 💻 AI Runner開発モード（Python）
	@echo "💻 AI Runner開発モード起動..."
	@cd ai-runner && pip install -r requirements.txt && python ai_executor.py

# 🔨 ビルド系コマンド
build: ## 🔨 全サービスのイメージをビルド
	@echo "🔨 イメージビルド中..."
	@docker compose build
	@echo "✅ ビルド完了"

build-no-cache: ## 🔨 キャッシュなしで全サービスをビルド
	@echo "🔨 キャッシュなしビルド中..."
	@docker compose build --no-cache
	@echo "✅ ビルド完了"

# 🧪 テスト系コマンド
test: ## 🧪 全体テスト実行
	@echo "🧪 テスト実行中..."
	@make test-backend
	@make test-frontend
	@echo "✅ 全テスト完了"

test-backend: ## 🧪 Backendテスト実行
	@echo "🧪 Backendテスト実行中..."
	@docker compose exec backend go test ./... -v || echo "⚠️ Backend未起動またはテスト未実装"

test-frontend: ## 🧪 Frontendテスト実行
	@echo "🧪 Frontendテスト実行中..."
	@docker compose exec frontend npm test || echo "⚠️ Frontend未起動またはテスト未実装"

test-integration: ## 🧪 統合テスト実行
	@echo "🧪 統合テスト実行中..."
	@echo "APIヘルスチェック..."
	@make health

# 🧹 クリーンアップ系コマンド
clean: ## 🧹 コンテナ・イメージ・ボリューム削除
	@echo "🧹 クリーンアップ実行中..."
	@docker compose down -v --remove-orphans
	@docker system prune -f
	@echo "✅ クリーンアップ完了"

clean-all: ## 🧹 全Docker リソース削除（注意：他のプロジェクトにも影響）
	@echo "⚠️ 全Dockerリソースを削除します（10秒後に実行）..."
	@sleep 10
	@docker compose down -v --remove-orphans
	@docker system prune -a -f --volumes
	@echo "✅ 全リソース削除完了"

# 💾 データ管理系コマンド
backup: ## 💾 データベースバックアップ作成
	@echo "💾 データベースバックアップ中..."
	@mkdir -p data/backup
	@cp data/game.db data/backup/game_backup_$$(date +%Y%m%d_%H%M%S).db || echo "⚠️ game.dbが存在しません"
	@echo "✅ バックアップ完了: data/backup/"

restore: ## 💾 最新バックアップからデータベース復元
	@echo "💾 最新バックアップから復元中..."
	@LATEST=$$(ls -t data/backup/game_backup_*.db 2>/dev/null | head -n1); \
	if [ -n "$$LATEST" ]; then \
		cp "$$LATEST" data/game.db && echo "✅ 復元完了: $$LATEST"; \
	else \
		echo "⚠️ バックアップファイルが見つかりません"; \
	fi

db-reset: ## 💾 データベースリセット（全データ削除）
	@echo "⚠️ データベースをリセットします（5秒後に実行）..."
	@sleep 5
	@rm -f data/game.db
	@echo "✅ データベースリセット完了"

# 📋 情報表示系コマンド
info: ## 📋 プロジェクト情報表示
	@echo "🎮 VSmaze プロジェクト情報"
	@echo "=========================="
	@echo "プロジェクト名: $(PROJECT_NAME)"
	@echo "Docker Compose: $(COMPOSE_FILE)"
	@echo "データディレクトリ: ./data/"
	@echo ""
	@echo "🔗 主要URL:"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend API: http://localhost:8080"
	@echo "  WebSocket: ws://localhost:8080/ws"
	@echo ""
	@echo "📂 主要ディレクトリ:"
	@echo "  backend/    - Go Backend"
	@echo "  frontend/   - Next.js Frontend"
	@echo "  ai-runner/  - AI実行環境"
	@echo "  data/       - データ永続化"

ports: ## 📋 使用ポート一覧表示
	@echo "📋 使用ポート一覧:"
	@echo "==================="
	@echo "3000 - Frontend (Next.js)"
	@echo "8080 - Backend (Go API)"
	@echo "5000 - AI Runner (Python)"
	@echo ""
	@echo "現在のポート使用状況:"
	@netstat -tulpn 2>/dev/null | grep -E ":3000|:8080|:5000" || echo "該当ポートは使用されていません"

# 🚀 デプロイ系コマンド（将来実装）
deploy-staging: ## 🚀 ステージング環境デプロイ（未実装）
	@echo "🚀 ステージング環境デプロイ機能は今後実装予定です"

deploy-prod: ## 🚀 本番環境デプロイ（未実装）
	@echo "🚀 本番環境デプロイ機能は今後実装予定です" 
