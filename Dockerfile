# HuggingFace Spaces Docker configuration for Book RAG API
# Based on specs/009-huggingface-backend/contracts/dockerfile.md

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

# Run the FastAPI application
CMD ["uvicorn", "scripts.api:app", "--host", "0.0.0.0", "--port", "7860"]
