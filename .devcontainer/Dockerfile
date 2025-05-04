# syntax=docker/dockerfile:latest

FROM --platform=linux/amd64 node:22.12.0-bullseye-slim as builder

# Update and install common packages
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    git \
    curl \
    wget \
    vim \
    build-essential \
    ca-certificates \
    gnupg \
    lsb-release \
    gcc-multilib \
    g++-multilib \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*

# Install Go
ARG GO_VERSION=1.24.1
RUN wget https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz \
    && tar -C /usr/local -xzf go${GO_VERSION}.linux-amd64.tar.gz \
    && rm go${GO_VERSION}.linux-amd64.tar.gz

# Set Go environment variables
ENV PATH=$PATH:/usr/local/go/bin
ENV GOPATH=/go
ENV PATH=$PATH:$GOPATH/bin

# Create Go directory structure
RUN mkdir -p "$GOPATH/src" "$GOPATH/bin" "$GOPATH/pkg" \
    && chmod -R 777 "$GOPATH"

# Install common Go tools
RUN go install github.com/air-verse/air@latest
RUN go install golang.org/x/tools/gopls@latest
RUN go install github.com/go-delve/delve/cmd/dlv@latest
RUN go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest

# Set working directory
WORKDIR /workspace/frontend
COPY frontend .
RUN npm install

WORKDIR /workspace/backend
COPY backend .
