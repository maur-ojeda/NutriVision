<div align="center">

# NutriVision

**AI-Powered Nutrition Tracking PWA**

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-ready-5A0FC8?logo=pwa&logoColor=white)
![Status](https://img.shields.io/badge/status-in_development-yellow)

Snap a photo. Track your nutrition. That simple.

<!-- Uncomment when you have a screenshot:
![NutriVision Screenshot](./docs/screenshot.png)
-->

</div>

---

## Tech Stack

![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_1.5_Flash-AI-4285F4?logo=google&logoColor=white)
![Lucide](https://img.shields.io/badge/Lucide-Icons-FF6F61)

| Layer | Tech | Notes |
|-------|------|-------|
| Frontend | React + Vite + Tailwind CSS | Mobile-first PWA |
| PWA | vite-plugin-pwa + Workbox | Offline support, installable |
| Backend/BaaS | Supabase | Auth, PostgreSQL, Storage |
| AI Vision | Gemini 1.5 Flash API | Fast, low-cost food analysis |
| Icons | Lucide-react | Clean icon set |

## Features

- **AI Photo Analysis** — Snap a photo of your meal → get instant calorie and macro breakdown
- **Smart Dashboard** — Weekly tracking with progress charts vs daily goals
- **Offline Mode** — PWA with service workers for use without internet
- **Camera Integration** — Native camera capture or file upload
- **Confirmation Flow** — AI results shown as a review card before saving

## How It Works

```mermaid
flowchart LR
    A["📷 Snap Photo"] --> B["🤖 Gemini 1.5 Flash"]
    B --> C["📊 Nutrition Card"]
    C --> D{Confirm?}
    D -->|Yes| E["💾 Save to Supabase"]
    D -->|No| A
    E --> F["📈 Dashboard"]
```

## Data Model

```mermaid
erDiagram
    auth_users ||--o{ meals : "has"
    meals {
        uuid id PK
        uuid user_id FK
        text image_url
        text food_name
        integer calories
        jsonb macros
        timestamp created_at
    }
    auth_users {
        uuid id PK
        text email
    }
    macros {
        float protein
        float carbs
        float fat
    }
    meals }o--o| macros : "stores as JSONB"
```

## Setup

```bash
git clone https://github.com/maur-ojeda/NutriVision.git
cd NutriVision
npm install
```

Create a `.env` file (see `.env.example`):

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

```bash
npm run dev
```

> **Note:** You need a [Supabase](https://supabase.com) project and a [Google AI Studio](https://aistudio.google.com) API key. Never commit your `.env` file.

## Architecture

```
React PWA (Vite + Tailwind)
    ↓
Supabase Client SDK
    ├── Auth (Magic Link / Email)
    ├── PostgreSQL (meals history)
    └── Storage (food images)
    ↓
Gemini 1.5 Flash API (AI food analysis)
    ↓ (returns JSON: food, calories, macros)
```

## License

[MIT](./LICENSE)
