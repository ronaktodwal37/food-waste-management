# Zero-Waste  Food Sharing & Redistribution Platform

> A production-ready, full-stack web application connecting food businesses, verified NGOs, volunteers, and community members to eliminate food waste and ensure rapid, safe redistribution.

---

## 1. What Was Created in Phase 1

 1 establishes the complete foundation, architecture, and developer workflow:
1. **React 19 SPA (Vite)**: Clean light theme with Tailwind CSS, responsive modern design, role-based pages, and real-time backend health monitor.
2. **Node.js & Express REST API**: Modular backend with Helmet security headers, CORS protection, rate limiting, and structured error handling.
3. **Backend Health Check API**: Exposed at `/api/health` and `/api/v1/health` providing live system metrics, memory statistics, and integration status.
4. **Firebase Integration Placeholders**: Client and Admin SDK managers prepared for Phase 2 authentication and Firestore connection.
5. **Security Rules & Schemas**: Comprehensive baseline `firestore.rules`, `firestore.indexes.json`, and `storage.rules` covering all 17 platform collections.
6. **Documentation Suite**: `docs/architecture.md`, `docs/database-schema.md`, `docs/api-documentation.md`, and `.env.example`.

---

## 2. Folders Structure

```
zero-waste-platform/
├── package.json                   # Project manifest & scripts
├── tsconfig.json                  # TypeScript compiler settings
├── vite.config.ts                 # Vite bundler configuration
├── server.ts                      # Unified full-stack server (Express + Vite)
├── index.html                     # HTML5 entry with synced metadata
├── .env.example                   # Environment variable template
├── README.md                      # Documentation & developer guide
│
├── src/                           # Frontend React Client
│   ├── assets/                    # Static assets & icons
│   ├── components/                # Modular UI components
│   │   ├── common/                # Reusable widgets (HealthBadge, etc.)
│   │   └── layout/                # Navbar, Footer, Shell
│   ├── context/                   # Context API (AuthContext scaffold)
│   ├── firebase/                  # Client Firebase SDK configuration
│   ├── hooks/                     # Custom React hooks
│   ├── pages/                     # Public and role-based page views
│   │   ├── HomePage.tsx           # Landing page with live health monitor
│   │   ├── HowItWorksPage.tsx     # 5-step redistribution workflow
│   │   ├── ImpactPage.tsx         # Verified social & ecological metrics
│   │   └── AboutPage.tsx          # Safety framework & mission
│   ├── routes/                    # React Router configuration
│   ├── services/                  # Axios HTTP client & API bindings
│   ├── utils/                     # Formatting & calculation utilities
│   ├── App.tsx                    # Main root component & providers
│   ├── index.css                  # Tailwind CSS root imports
│   └── main.tsx                   # React DOM root entry
│
├── server/                        # Backend Node.js / Express Application
│   └── src/
│       ├── config/                # Environment & Firebase Admin configs
│       ├── controllers/           # API request controllers (Health, etc.)
│       ├── middleware/            # Error handling, rate limiter, 404
│       ├── routes/                # Express router definitions
│       ├── services/              # Business logic & algorithms
│       ├── validators/            # Zod validation schemas
│       ├── utils/                 # Geohash, OTP, and logging helpers
│       ├── jobs/                  # Background jobs & expiry checkers
│       ├── app.ts                 # Express application factory
│       └── server.ts              # Standalone backend server runner
│
├── firebase/                      # Firebase Deployment Configs
│   ├── firestore.rules            # Security rules for 17 collections
│   ├── firestore.indexes.json     # Firestore composite indexes
│   └── storage.rules              # Firebase Storage bucket permissions
│
└── docs/                          # Technical Documentation
    ├── architecture.md            # System design & data flow
    ├── database-schema.md         # Full 17-collection data dictionary
    └── api-documentation.md       # REST endpoints specification
```

---

## 3. Dependencies

### Frontend Dependencies
- `react` & `react-dom` (v19)
- `react-router-dom` (v7): Client routing and route guarding
- `axios` (v1): HTTP request client
- `lucide-react`: Modern vector icon set
- `leaflet` & `react-leaflet`: OpenStreetMap interactive mapping
- `tailwindcss` (v4): Modern utility-first CSS styling
- `firebase` (v11): Client-side Firebase SDK (Auth, Firestore listeners)

### Backend Dependencies
- `express` (v4): Fast, unopinionated Node.js web framework
- `firebase-admin` (v13): Privileged server SDK for ID token verification & Firestore
- `zod` (v3): Type-safe schema validation
- `helmet`: Security header hardening
- `cors`: Cross-Origin Resource Sharing middleware
- `express-rate-limit`: Brute-force & DDoS rate limiting
- `dotenv`: Environment variable loader
- `tsx`: TypeScript execution engine for Node.js

---

## 4. macOS Terminal (zsh) Commands to use

Open Terminal on macOS (`Terminal.app` or iTerm2):

```bash
# 1. Clone or navigate to the project directory
cd zero-waste-platform

# 2. Check Node.js and npm versions (Node >= 20 recommended)
node -v
npm -v

# 3. Install all dependencies (already satisfied in container, but for local setup):
npm install

# 4. Create your local .env configuration from the template:
cp .env.example .env
```

---

## 5. Environment Variable Setup

Edit `.env` using your preferred editor (`nano .env` or VS Code):

```bash
# Server port & environment
PORT=3000
NODE_ENV=development

# Firebase credentials (will be configured in Phase 2)
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_PROJECT_ID="your-project-id"

# OpenStreetMap
VITE_OSM_TILE_LAYER_URL="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
```

*Note: In Phase 1, graceful fallbacks are enabled so the application boots cleanly even before real Firebase credentials are provided.*

---

## 6. How to Run the Applications

### Option A: Unified Full-Stack Server (Recommended)
Runs Express backend API on `/api/*` and mounts Vite frontend on port 3000 simultaneously:

```bash
npm run dev
```
- Open browser at: `http://localhost:3000`

### Option B: Standalone Modes (Separate Terminals)

**Terminal 1 (Backend on Port 5000):**
```bash
npm run dev:server
```
Runs Express API at `http://localhost:5000`.

**Terminal 2 (Frontend on Port 3000):**
```bash
npm run dev:client
```
Runs Vite React dev server at `http://localhost:3000`.

---

## 7. How to Test the Backend Health Endpoint

### Method 1: Using macOS Terminal (curl)
Run:
```bash
curl -i http://localhost:3000/api/health
```

Expected HTTP 200 response:
```json
{
  "status": "healthy",
  "application": "Zero-Waste Food Sharing & Redistribution Platform API",
  "phase": "Phase 1 - Foundations & Architecture",
  "uptimeSeconds": 45,
  "environment": "development"
}
```

### Method 2: In Web Browser
Open:
```
http://localhost:3000/api/health
```

### Method 3: Live in the Web Application UI
1. Navigate to `http://localhost:3000/`
2. Scroll to the **"Backend Health Monitor"** card.
3. Click the **"Test Endpoint Now"** button.
4. View live round-trip latency (in milliseconds), uptime, heap memory usage, and click **"Inspect Raw JSON"** to view the full payload.
