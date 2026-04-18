# 追忆 Zhuīyì 📜

<div align="center">
  <h3>AI-Powered Photo Chronicle Generator</h3>
  <p>Upload your photos, let AI awaken your memories.</p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square" alt="Next.js">
    <img src="https://img.shields.io/badge/AI-Gemini%20Flash-8A2BE2?style=flat-square" alt="Gemini">
    <img src="https://img.shields.io/badge/Frontend-React-61DAFB?style=flat-square" alt="React">
    <img src="https://img.shields.io/badge/State-Zustand-orange?style=flat-square" alt="Zustand">
    <img src="https://img.shields.io/badge/License-MIT-lightgrey?style=flat-square" alt="License">
  </p>

  <p>
    <a href="#-features">Features</a> •
    <a href="#-screenshots">Screenshots</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-quick-start">Quick Start</a>
  </p>

  <p>
    <a href="./README.md">简体中文</a> |
    <strong>English</strong>
  </p>
</div>

---

**Zhuīyì** is an AI-driven photo narrative app. It automatically clusters, analyzes, and generates literary narratives from your uploaded photos—presented through an immersive experience ranging from photo flow to memory scrolls, star maps, and sharing. Every journey becomes a chronicle worth revisiting.

## ✨ Features

- 📸 **Smart Photo Analysis** — Extracts EXIF (GPS, timestamps) and uses AI to identify scenes, moods, and locations
- 📖 **Multi-Style Narratives** — Three literary styles: Ancient Chronicle, Proustian Remembrance, and Cyberpunk
- 🖼️ **Three View Modes** — Photo Flow (full-screen swipe), Memory Scroll (timeline narrative), Star Map (trajectory visualization)
- 🎨 **AI Scene Generation** — Generates a unique panoramic cover image for your journey
- 💾 **Local History** — All records persisted to localStorage, revisit anytime
- 🔄 **Route Recovery** — Hash-based state management, survives page refreshes

## 📸 Screenshots

| | |
| :---: | :---: |
| ![Landing](docs/screenshots/landing.png) <br> Landing | ![Processing](docs/screenshots/processing.png) <br> Processing |
| ![Photo Flow](docs/screenshots/photo-flow.png) <br> Photo Flow | ![Memory Scroll](docs/screenshots/memory-scroll.png) <br> Memory Scroll |
| ![Star Map](docs/screenshots/star-map.png) <br> Star Map | ![Share](docs/screenshots/share.png) <br> Share |

## 🏗️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| Framework | Next.js 14 (App Router) |
| AI | Gemini 3 Flash (analysis + narration), Gemini 3.1 Flash (image generation) |
| State | Zustand + localStorage persistence |
| Animation | Framer Motion |
| Styling | Tailwind CSS + CSS-in-JS theming |
| Routing | Hash-based SPA routing |

## 🚀 Quick Start

```bash
# Clone the project
git clone https://github.com/your-username/zhuiyi.git
cd zhuiyi

# Install dependencies
npm install

# Configure environment variables
cp .env.local.example .env.local
# Edit .env.local with your API key

# Start dev server
npm run dev
```

### Environment Variables

| Variable | Description |
| :--- | :--- |
| `GEMINI_API_KEY` | Google AI Studio API Key |

## 📄 License

MIT License