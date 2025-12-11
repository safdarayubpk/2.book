<!--
SYNC IMPACT REPORT
==================
Version change: 0.0.0 → 1.0.0
Bump rationale: Initial constitution creation (MAJOR - first release)

Modified principles:
- N/A (new constitution)

Added sections:
- 8 Core Principles (I-VIII)
- Technical Constraints (deployment stack, free tier limits)
- Definition of Done (quality gates)
- Governance

Removed sections:
- N/A (template placeholders replaced)

Templates requiring updates:
- .specify/templates/plan-template.md ✅ No updates needed (generic gates)
- .specify/templates/spec-template.md ✅ No updates needed (generic structure)
- .specify/templates/tasks-template.md ✅ No updates needed (generic structure)

Follow-up TODOs:
- None
-->

# AI-Native Textbook for Physical AI & Humanoid Robotics Constitution

## Core Principles

### I. Simplicity-First

All frontend code MUST prioritize readability and minimalism over feature density.

- No extra animations beyond minimal useful motion
- No overly long chapters (short + clear only)
- No complex robotics code - educational content only
- UI complexity MUST be justified before implementation
- Every component SHOULD be understandable by a new developer within 5 minutes

**Rationale**: Users reading on phones with limited bandwidth need fast, clean interfaces.
Complex UI increases cognitive load and defeats the educational purpose.

### II. Mobile-Ready Performance

The platform MUST perform well on low-end devices.

- Pages MUST load in under 3 seconds on 3G connections
- Total book reading time MUST be under 45 minutes
- All UI elements MUST be touch-friendly (minimum 44x44px tap targets)
- Images MUST be optimized and lazy-loaded
- Bundle size MUST be minimized (no heavy dependencies)

**Rationale**: Target users include students on phones with limited data plans.
Performance directly impacts learning outcomes.

### III. RAG Accuracy

The chatbot MUST answer questions ONLY from book content with grounded, cited responses.

- All RAG answers MUST include source citations from the textbook
- Answers MUST NOT hallucinate or reference external knowledge
- Chunking strategy MUST use MiniLM embeddings for optimal retrieval
- Confidence thresholds MUST be implemented to avoid low-quality responses
- Fallback behavior MUST gracefully handle unanswerable questions

**Rationale**: Educational integrity requires answers be traceable to course material.
Hallucinations undermine trust and educational value.

### IV. Personalization-Driven

Chapter content MUST adapt based on user background.

- User profiles MUST capture relevant background information at signup
- Content adaptation MUST be visibly different based on user context
- Personalization MUST improve comprehension, not just novelty
- Original content MUST remain accessible (personalization as enhancement)
- Background collection MUST be minimal and privacy-respecting

**Rationale**: Effective education meets learners where they are.
One-size-fits-all content fails diverse audiences.

### V. Free-Tier Compliance

All infrastructure MUST operate within free tier limits.

- Qdrant: MUST stay within free tier vector storage limits
- Neon: MUST stay within free tier PostgreSQL limits
- Vercel: MUST stay within free tier deployment limits
- Railway: MUST stay within free tier backend limits
- Token usage MUST be implemented in phases to control costs

**Rationale**: The project must be sustainable without recurring costs.
Exceeding free tiers defeats the accessibility mission.

### VI. Educational Focus

Content MUST prioritize learning outcomes over technical impressiveness.

- 6-8 short, clean, modern chapters only
- Each chapter MUST have auto-generated summaries and quizzes
- Urdu translation MUST be available for all chapters (one-click)
- No complex robotics code - only educational explanations
- Learning boosters MUST reinforce key concepts

**Rationale**: This is an educational platform, not a tech demo.
Every feature must serve the learning mission.

### VII. AI-Native Experience

The platform MUST feel like a real AI-powered education platform.

- Better-Auth MUST be used for user authentication
- AI features (chatbot, personalization, translation) MUST be seamlessly integrated
- Interactions MUST feel intelligent, not gimmicky
- AI capabilities MUST enhance, not replace, core reading experience
- Response latency for AI features MUST be under 2 seconds

**Rationale**: "AI-native" means AI is integral to the experience, not bolted on.
Users should feel they're using a next-generation learning tool.

### VIII. Rapid Deployment

The entire platform MUST be deployable and demonstrable within 90 seconds.

- Frontend deploys to Vercel
- Backend deploys to Railway
- Vectors stored in Qdrant
- Database in Neon
- Deployment MUST be automated and reproducible
- Health checks and logging MUST be implemented for reliability

**Rationale**: Demo-ability proves the platform works.
Complex deployment processes indicate hidden complexity.

## Technical Constraints

**Deployment Stack (Non-Negotiable)**:
- Frontend: Docusaurus on Vercel
- Backend: Railway
- Vector Store: Qdrant (free tier)
- Database: Neon PostgreSQL (free tier)

**Performance Constraints**:
- Clean UI, fast loading, mobile-friendly
- Support low-end devices (users reading on phones)
- Avoid complexity and heavy dependencies

**Risk Mitigations**:
- RAG low accuracy: Use chunking + MiniLM embeddings
- Token usage high: Implement in phases
- User confusion: Keep UI minimal and clean
- Backend errors: Add health checks + logging

## Definition of Done

A feature is complete when ALL of the following are true:

- [ ] All chapters visible and readable
- [ ] Chatbot fully functional with grounded answers
- [ ] Auth + personalization + translation working
- [ ] Quizzes + summaries per chapter generated
- [ ] Fully deployed URLs live and stable
- [ ] 90-second demo recorded
- [ ] Mobile testing passed on low-end device
- [ ] Free tier limits verified

## Governance

This constitution supersedes all other development practices for this project.

**Amendment Process**:
1. Propose change with rationale
2. Assess impact on existing features
3. Document version increment (MAJOR/MINOR/PATCH)
4. Update constitution and propagate to dependent templates

**Versioning Policy**:
- MAJOR: Backward-incompatible principle changes or removals
- MINOR: New principle or section additions
- PATCH: Clarifications and wording refinements

**Compliance Review**:
- All PRs MUST verify compliance with Core Principles
- Complexity additions MUST be justified against Simplicity-First principle
- Performance changes MUST be tested against Mobile-Ready constraints

**Version**: 1.0.0 | **Ratified**: 2025-12-09 | **Last Amended**: 2025-12-09
