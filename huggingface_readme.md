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

### Chat & Search
- `GET /health` - Health check
- `POST /chat` - Send chat message
- `POST /search` - Semantic search
- `DELETE /chat/sessions/{id}` - End session

### Authentication
- `POST /api/auth/sign-up` - Register new user
- `POST /api/auth/sign-in` - Login
- `GET /api/auth/session` - Get current session
- `POST /api/auth/sign-out` - Logout

## Usage

This API is designed to be called from the frontend at https://2-book.vercel.app
