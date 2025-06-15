# AI実行専用のセキュアコンテナ
FROM python:3.11-alpine

# セキュリティ強化: 非rootユーザーを作成
RUN adduser -D -s /bin/sh aiuser

# 必要最小限のPythonパッケージのみインストール
RUN pip install --no-cache-dir numpy

# 作業ディレクトリを設定
WORKDIR /home/aiuser

# AIコードをコピー（実行時に動的に配置）
COPY ai_code.py .

# 実行権限を設定
RUN chown -R aiuser:aiuser /home/aiuser
USER aiuser

# リソース制限設定
# メモリ: 256MB
# CPU: 0.5 cores  
# 実行時間: 60秒
# ネットワーク: 無効

# AIを実行
CMD ["python", "ai_code.py"] 
