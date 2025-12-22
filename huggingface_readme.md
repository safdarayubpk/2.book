---
title: Book RAG API
emoji: 📚
colorFrom: blue
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
---

# Book RAG API

RAG-powered chatbot API for the Physical AI & Humanoid Robotics textbook.

## Endpoints

- `GET /health` - Health check
- `POST /chat` - Send chat message
- `POST /search` - Semantic search
- `DELETE /chat/sessions/{id}` - End session

## Usage

This API is designed to be called from the frontend at https://2-book.vercel.app
