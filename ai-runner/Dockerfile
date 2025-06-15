FROM python:3.11-slim

# 必要なパッケージをインストール
RUN apt-get update && apt-get install -y \
    docker.io \
    && rm -rf /var/lib/apt/lists/*

# 作業ディレクトリを設定
WORKDIR /app

# Python依存関係をコピー
COPY requirements.txt .

# Python依存関係をインストール
RUN pip install --no-cache-dir -r requirements.txt

# ソースコードをコピー
COPY . .

# AI実行用のセキュアDockerfileテンプレートを作成
RUN mkdir -p /app/templates
COPY ai-execution-template.dockerfile /app/templates/

# アップロードディレクトリを作成
RUN mkdir -p /app/uploads

# ポートを公開
EXPOSE 5000

# AI実行サービスを起動
CMD ["python", "ai_executor.py"] 
