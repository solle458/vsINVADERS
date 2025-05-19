FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy AI SDK and game environment
COPY ai_sdk /app/ai_sdk
COPY game_env /app/game_env

# Set environment variables
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Set resource limits
ENV MAX_MEMORY=512M
ENV MAX_CPU_TIME=30

# Create a non-root user
RUN useradd -m -u 1000 ai_user
USER ai_user

# Set the entrypoint
ENTRYPOINT ["python", "-m", "ai_sdk.runner"] 
