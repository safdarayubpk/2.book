# Dockerfile Contract

**Feature**: 009-huggingface-backend
**Purpose**: Define the Docker container configuration for HuggingFace Spaces deployment

## Dockerfile Specification

```dockerfile
# Use Python 3.11 slim for smaller image size
FROM python:3.11-slim

# Create non-root user with ID 1000 (required by HuggingFace)
RUN useradd -m -u 1000 user

# Switch to non-root user
USER user

# Set environment variables
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    PYTHONUNBUFFERED=1

# Set working directory
WORKDIR $HOME/app

# Copy and install dependencies first (better caching)
COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY --chown=user scripts/ ./scripts/

# Expose the port HuggingFace expects
EXPOSE 7860

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:7860/health || exit 1

# Run the FastAPI application
CMD ["uvicorn", "scripts.api:app", "--host", "0.0.0.0", "--port", "7860"]
```

## Build Requirements

| Requirement | Value |
|-------------|-------|
| Base Image | python:3.11-slim |
| User ID | 1000 |
| Working Directory | /home/user/app |
| Exposed Port | 7860 |
| Entry Point | uvicorn scripts.api:app |

## Files to Copy

| Source | Destination | Required |
|--------|-------------|----------|
| requirements.txt | /home/user/app/requirements.txt | Yes |
| scripts/ | /home/user/app/scripts/ | Yes |

## Environment Variables (Runtime)

These are NOT in Dockerfile - they are set via HuggingFace Secrets:

| Variable | Description |
|----------|-------------|
| COHERE_API_KEY | Cohere API key |
| OPENAI_API_KEY | OpenAI API key |
| QDRANT_URL | Qdrant Cloud URL |
| QDRANT_API_KEY | Qdrant API key |
| DATABASE_URL | PostgreSQL connection string |

## Health Check

- **Endpoint**: GET /health
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Start Period**: 5 seconds (allow startup)
- **Retries**: 3

## Image Size Optimization

1. Use `-slim` base image (not full Python)
2. Use `--no-cache-dir` with pip
3. Copy only necessary files (not entire repo)
4. Single RUN command for pip operations
5. No development dependencies
