FROM node:18-alpine

# 作業ディレクトリを設定
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm ci --only=production

# ソースコードをコピー
COPY . .

# Next.jsアプリケーションをビルド
RUN npm run build

# ポートを公開
EXPOSE 3000

# Next.jsアプリケーションを実行
CMD ["npm", "start"] 
