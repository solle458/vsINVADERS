FROM golang:1.21-alpine AS builder

# 作業ディレクトリを設定
WORKDIR /app

# Go modules初期化
COPY go.mod go.sum ./
RUN go mod download

# ソースコードをコピー
COPY . .

# バイナリをビルド
RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o main ./cmd/server

# 実行用の軽量イメージ
FROM alpine:latest

# 必要なパッケージをインストール
RUN apk --no-cache add ca-certificates sqlite

WORKDIR /root/

# ビルドしたバイナリをコピー
COPY --from=builder /app/main .

# データディレクトリを作成
RUN mkdir -p /app/data

# ポートを公開
EXPOSE 8080

# アプリケーションを実行
CMD ["./main"] 
