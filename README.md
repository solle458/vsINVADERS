# 🎮 VSmaze - AI対戦ゲームプラットフォーム

**プロジェクトID**: REQ-001  
**バージョン**: v0.1.0 (MVP開発中 - Frontend UI完成！)  
**開発期間**: 6週間  
**現在体験可能**: 🌌 http://localhost:3000 - コミカル×宇宙×ドット  

## 📋 プロジェクト概要

VSmazeは、INVADER風のターンベース対戦ゲームプラットフォームです。プレイヤーがCOMと対戦したり、自作AIを作成してAI同士を対戦させることができます。

### 🎯 ゲーム仕様（確定）
- **ゲームタイプ**: ターンベース対戦
- **盤面サイズ**: **15×15** 
- **攻撃範囲**: **前方、壁または対戦相手に当たるまで**
- **勝利条件**: **対戦相手に攻撃が命中したら（一回）**
- **対戦モード**: 
  - Human vs COM
  - AI vs COM  
  - AI vs AI

### 🤖 AI実行環境（確定）
- **実行時間制限**: **60秒**
- **メモリ制限**: **256MB**
- **CPU制限**: **0.5コア**
- **セキュリティ**: 非rootユーザー、ネットワーク無効化

### 🔧 技術スタック
- **フロントエンド**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **バックエンド**: Go 1.21 + Gin + SQLite
- **AI実行環境**: Python 3.11 + Docker
- **インフラ**: Docker Compose + WebSocket

---

## 🚀 クイックスタート

### 前提条件
- Docker & Docker Compose
- Make（オプション、簡単起動用）

### 🎯 1分で起動
```bash
# リポジトリクローン
git clone <repository-url>
cd VSmaze

# 🚀 フルスタック起動（Backend + Frontend）
# 1. Backend起動
cd backend
./main  # または go run cmd/server/main.go

# 2. Frontend起動（別ターミナル）
cd frontend
npm run dev

# 3. ブラウザでアクセス
open http://localhost:3000

# 🎮 体験内容
# - メイン画面: Human vs COM選択・COM難易度選択
# - ゲーム画面: 15×15ピクセル宇宙戦場でINVADERバトル
# - 操作: 移動・攻撃・防御の完全動作
```

### 🔧 手動起動
```bash
# 環境構築
docker compose build

# サービス起動
docker compose up -d

# ログ確認
docker compose logs -f
```

---

## 📂 プロジェクト構造

```
VSmaze/
├── README.md                   # プロジェクト概要
├── Makefile                    # 簡単操作コマンド
├── docker-compose.yml          # サービス連携設定
├── docs/                       # ドキュメント
│   └── REQ-001/               # 要件定義書
├── backend/                    # Go Backend ✅ 基盤完成！
│   ├── cmd/server/            # エントリーポイント
│   ├── domain/                # ドメイン層（完成）
│   │   ├── entity/           # エンティティ（game, player, ai）
│   │   ├── repository/       # リポジトリIF
│   │   └── service/          # ドメインサービス
│   ├── usecase/               # ユースケース層（完成）
│   ├── infrastructure/        # インフラ層（スキーマ完成）
│   │   └── database/
│   ├── interfaces/            # インターフェース層（完成）
│   │   └── handler/
│   ├── Dockerfile
│   ├── go.mod
│   └── README.md              # Backend詳細ドキュメント
├── frontend/                   # Next.js Frontend ✅ UI完成！
│   ├── app/                   # App Router（完成）
│   │   ├── page.tsx          # メイン画面（対戦モード選択）
│   │   ├── game/[id]/        # ゲーム画面（15×15ピクセルボード）
│   │   ├── ai/               # AI管理画面（Phase 2実装予定）
│   │   └── stats/            # 統計画面（戦績表示）
│   ├── components/            # React Components（完成）
│   │   ├── GameBoard.tsx     # 15×15ピクセルゲームボード
│   │   └── GameControls.tsx  # ゲーム操作パネル
│   ├── globals.css           # コミカル×宇宙×ドットデザイン
│   ├── Dockerfile
│   └── package.json
├── ai-runner/                  # AI実行環境
│   ├── ai_executor.py         # AI実行メイン
│   ├── game_interface.py      # ゲーム状態API
│   ├── security_manager.py    # セキュリティ管理
│   ├── Dockerfile
│   └── requirements.txt
└── data/                       # データ永続化
    ├── game.db                # SQLiteデータベース
    └── ai-uploads/            # AIファイル保存
```

---

## 🎮 対戦モード

### 1. Human vs COM
- Webブラウザ上でCOMと対戦
- COM AI難易度: Level 1-4
- リアルタイム盤面更新

### 2. AI vs COM  
- アップロードしたAI vs COM
- AI実行ログ表示
- 戦績自動記録

### 3. AI vs AI
- AI同士の自動対戦
- 観戦モード
- ランキング・レーティング更新

---

## 🤖 AI開発

### AI作成方法
1. Python 3.11でAIコードを作成
2. Webインターフェースからアップロード
3. 自動テスト実行
4. 対戦開始

### AIインターフェース
```python
# ai_code.py 例
import numpy as np

class MyAI:
    def get_action(self, game_state):
        """
        Args:
            game_state: {
                'board': 15x15 numpy array,
                'my_position': [x, y],
                'enemy_position': [x, y],
                'turn': int
            }
        
        Returns:
            {
                'action': 'attack' | 'move' | 'defend',
                'direction': 'up' | 'down' | 'left' | 'right'
            }
        """
        # AI logic here
        return {'action': 'attack', 'direction': 'up'}
```

### 制限事項
- **実行時間**: 60秒以内
- **メモリ**: 256MB以内  
- **CPU**: 0.5コア以内
- **ネットワーク**: 無効
- **ファイルアクセス**: 制限あり

---

## 🛠️ 開発・運用コマンド

### Make コマンド（推奨）
```bash
make setup          # 初回環境構築
make up              # サービス起動
make down            # サービス停止
make restart         # サービス再起動
make logs            # ログ表示
make clean           # コンテナ・イメージ削除
make test            # テスト実行
make dev             # 開発モード起動
```

### Docker Compose コマンド
```bash
docker compose build         # イメージビルド
docker compose up -d         # バックグラウンド起動
docker compose down          # サービス停止
docker compose logs -f       # ログ監視
docker compose ps            # コンテナ状況確認
```

### 開発用コマンド
```bash
# Backend開発（✅ 基盤完成！）
cd backend
go mod tidy
go run cmd/server/main.go      # サーバー起動
curl http://localhost:8080/health  # ヘルスチェック

# Frontend開発（✅ UI完成！）
cd frontend
npm install
npm run dev                    # http://localhost:3000

# AI Runner開発
cd ai-runner
pip install -r requirements.txt
python ai_executor.py
```

---

## 📊 開発進捗

### ✅ Phase 1: MVP（完了目標: 2週間）
- [x] Docker環境構築
- [x] プロジェクト基盤設定
- [x] **Backend基盤（クリーンアーキテクチャ）** ← **完了！**
- [x] **ゲームエンジン（15×15盤面）** ← **完了！**
- [x] **COM AI（Level 1-4）** ← **完了！**
- [x] **Frontend UI（コミカル×宇宙×ドット）** ← **完了！**
- [ ] **WebSocket通信** ← **次のタスク**

### ⏳ Phase 2: AI連携（完了目標: 4週間）
- [ ] AI実行環境（Docker-in-Docker）
- [ ] セキュリティ機能
- [ ] AI管理API
- [ ] AI管理画面
- [ ] SDK・サンプルAI

### 🔄 Phase 3: 拡張機能（完了目標: 6週間） 
- [ ] ランキングシステム
- [ ] 戦績詳細機能
- [ ] パフォーマンス最適化
- [ ] 高負荷対応

---

## 🔧 環境設定

### ポート番号
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **WebSocket**: ws://localhost:8080
- **AI Runner**: http://localhost:5000 (内部通信のみ)

### データベース
- **種類**: SQLite
- **場所**: `./data/game.db`
- **バックアップ**: `./data/backup/`（予定）

### ログ
- **Backend**: `./data/logs/backend.log`
- **AI実行**: `./data/logs/ai-execution.log`
- **システム**: Docker Compose logs

---

## 🚨 トラブルシューティング

### よくある問題

#### 1. Dockerコンテナが起動しない
```bash
# コンテナ状況確認
make logs

# 強制再起動
make clean
make setup
```

#### 2. AI実行がタイムアウトする
- AI実行時間: 60秒以内に最適化
- メモリ使用量: 256MB以内に最適化
- 無限ループの回避

#### 3. フロントエンドが接続できない
```bash
# APIサーバー起動確認
curl http://localhost:8080/health

# WebSocket接続確認
wscat -c ws://localhost:8080/ws
```

#### 4. データベースエラー
```bash
# SQLiteファイル確認
ls -la ./data/
sqlite3 ./data/game.db ".tables"
```

---

## 📈 監視・メトリクス

### 主要指標
- **レスポンス時間**: < 100ms (API)
- **AI実行成功率**: > 95%
- **同時接続数**: 最大100接続（目標）
- **メモリ使用量**: < 2GB (全体)

### ログ監視
```bash
# リアルタイムログ監視
make logs

# エラーログ抽出
docker compose logs backend | grep ERROR
```

---

## 🤝 コントリビューション

### 開発フロー
1. Issue作成・確認
2. ブランチ作成（`feature/xxx`）
3. 開発・テスト
4. Pull Request作成
5. レビュー・マージ

### コーディング規約
- **Go**: `gofmt` + `golint`
- **TypeScript**: ESLint + Prettier  
- **Python**: PEP8 + Black

---

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照

---

## 🔗 関連リンク

- [要件定義書](./docs/REQ-001/REQ-001_GAME_REQUIREMENTS.md)
- [詳細タスクスケジュール](./docs/REQ-001/DETAILED_TASKS_SCHEDULE.md)
- [API仕様書](./docs/api/README.md)（作成予定）
- [AI SDK ドキュメント](./docs/ai-sdk/README.md)（作成予定）

---

**🎮 Let's build the ultimate AI battle platform! 🤖**
