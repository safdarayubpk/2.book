# Data Model: Textbook Generation

**Feature**: 001-textbook-generation
**Date**: 2025-12-09

## Overview

This feature is primarily static content served by Docusaurus. The data model focuses on content structure rather than database entities. Progress tracking entities are defined here but implemented in the auth feature.

## Content Entities

### Chapter

Represents a single unit of course content stored as MDX files.

| Field | Type | Description |
|-------|------|-------------|
| id | string | Folder name (e.g., "chapter-1") |
| title | string | Human-readable title from frontmatter |
| position | number | Order in sidebar (1-8) |
| description | string | Brief summary for TOC and SEO |
| estimatedReadTime | number | Minutes to read (target: <7) |
| content | MDX | Chapter body with text, images, components |

**File Structure**:
```yaml
# docs/chapter-1/index.md frontmatter
---
sidebar_position: 1
title: "Introduction to Physical AI"
description: "What is Physical AI and how it differs from traditional AI"
---
```

**Validation Rules**:
- Title: 3-80 characters
- Description: 50-200 characters
- Content: 800-1,500 words (targets <7 min read time)
- Position: 1-8 (matches chapter number)

### TableOfContents

Auto-generated from Docusaurus sidebar configuration.

| Field | Type | Description |
|-------|------|-------------|
| chapters | Chapter[] | Ordered list of all chapters |
| totalReadTime | number | Sum of all chapter read times |

**Derived from**: `sidebars.ts` configuration

### UserProgress (Defined here, implemented in auth feature)

Tracks which chapters a user has completed.

| Field | Type | Description |
|-------|------|-------------|
| userId | string | User identifier from auth system |
| chaptersRead | string[] | Array of chapter IDs read |
| lastReadChapter | string | Most recently viewed chapter |
| lastReadAt | timestamp | When user last read |
| completionPercentage | number | Calculated: chaptersRead.length / totalChapters |

**Note**: This entity requires the auth feature. The ProgressIndicator component will be stubbed until auth is implemented.

## Relationships

```
┌─────────────────┐
│     Chapter     │
│  (MDX content)  │
└────────┬────────┘
         │ 1:many
         ▼
┌─────────────────┐
│ TableOfContents │
│  (sidebar.ts)   │
└─────────────────┘

┌─────────────────┐
│  UserProgress   │
│  (backend API)  │──────────▶ references chapter IDs
└─────────────────┘
```

## State Transitions

### Chapter Reading State

```
[Not Visited] ──(user opens)──▶ [Reading] ──(scroll to end)──▶ [Completed]
                                    │
                                    └──(navigate away)──▶ [Partially Read]
```

**Note**: State tracking requires UserProgress entity (auth feature).

## Validation Summary

| Entity | Validation | Enforced By |
|--------|------------|-------------|
| Chapter.title | 3-80 chars | Docusaurus build |
| Chapter.content | 800-1,500 words | Manual review + CI check |
| Chapter.position | 1-8 | sidebars.ts |
| UserProgress | Valid chapter IDs | Backend API (auth feature) |
