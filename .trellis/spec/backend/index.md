# Backend Development Guidelines

> Best practices for backend development in the Zhuīyì project.

---

## Overview

This project has a minimal backend — only 2 API route handlers that proxy to Gemini. There is no database, no authentication, no user management. The "backend" exists solely to keep API keys server-side.

---

## Guidelines Index

| Guide | Description | Status |
|-------|-------------|--------|
| [Directory Structure](./directory-structure.md) | API route organization | Done |
| [Error Handling](./error-handling.md) | Error types, handling strategies | Done |
| [Quality Guidelines](./quality-guidelines.md) | Code standards, forbidden patterns | Done |

**Note**: Database Guidelines and Logging Guidelines are not applicable for this hackathon project (no database, minimal logging needs). They are kept as placeholder files.

---

## Pre-Development Checklist

Before writing any backend code, read:

1. **Directory Structure** — know where API routes live
2. **Error Handling** — know how errors are handled and returned

---

**Language**: All documentation should be written in **English**.