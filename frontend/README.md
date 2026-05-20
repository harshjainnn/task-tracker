# Team Task Manager - Frontend Setup

This folder holds the high-fidelity SPA React + Vite client application, styled with Tailwind CSS, mapped using React Router v6, and powered by Axios HTTP calls.

---

## 🛠️ Tech Stack & Styling Design

- **Build Tool**: Vite (v8+) for ultra-fast hot module replacement.
- **Library**: React (v19) SPA.
- **Styling**: Tailwind CSS (v3) configured with custom brand palettes, responsive breakpoints, and custom animations.
- **Client**: Axios pre-configured with token bearer request interceptors.
- **Typography**: Inter (UI/Body) & Outfit (Headers/Metrics).
- **Design Tokens**: Dark-mode primary accents, atmospheric blurred glow meshes, premium glassmorphism surfaces (`glass-panel`/`glass-card`), and micro-shadows.

---

## 📁 Modern Modular Folder Structure

```text
frontend/
├── public/             # Static public assets (e.g. icons, logos)
├── src/
│   ├── api/            # API configs (e.g., axios.js with interceptors)
│   ├── components/     # Reusable global design UI items (e.g., Navbar)
│   ├── context/        # Global React Context providers (future auth state)
│   ├── hooks/          # Reusable custom hooks (future useAuth, useTasks)
│   ├── layouts/        # Page framework wrappers (e.g., RootLayout)
│   ├── pages/          # Unified page modules (Home, Login, Signup, Dashboard)
│   ├── routes/         # Routing schema (index.jsx mapping paths)
│   ├── services/       # Feature API handlers (future authService, taskService)
│   ├── utils/          # Global client helper tools (date formatters, validators)
│   ├── App.jsx         # App router mount
│   ├── main.jsx        # App DOM bootstrapper wrapping BrowserRouter
│   └── index.css       # Tailwind layers & custom design classes
├── .env                # App environment details
├── tailwind.config.js  # Styling purge routes & configurations
├── postcss.config.js   # PostCSS processor hooks
├── package.json        # Dependencies & scripts
└── README.md           # Documentation
```

---

## 🚀 Getting Started

### 1. Install Dependencies
Run package setups inside the frontend folder:
```bash
npm install
```

### 2. Configure Environment Variables
Make sure to check the [.env](file:///c:/Users/shrey/OneDrive/Desktop/pro/frontend/.env) file. Update the backend URL pointer if your server is running on a port other than `5000`:
```env
VITE_API_URL="http://localhost:5000"
```

### 3. Boot Dev Server
Launch Vite's hot-reloading web server:
```bash
npm run dev
```
By default, the client app will run on `http://localhost:5173`. Open this URL in your web browser to interact with the high-fidelity UI dashboard.

---

## 📡 Axios Client Interceptor Setup

The client contains a pre-configured HTTP pipeline in [axios.js](file:///c:/Users/shrey/OneDrive/Desktop/pro/frontend/src/api/axios.js):
- **Authorization header**: Every request automatically scans for a `jwt_token` inside local storage and attaches it under `Authorization: Bearer <token>`.
- **401 Response interceptor**: Instantly captures token expiration signals and safely clears unauthenticated local cache parameters (like profiles and tokens) to prevent layout memory corruption.

---

## 🎨 Interactive Layout Details

- **Navbar Route Detection**: The Navbar applies glowing borders around active items by scanning React Router's URL parameters.
- **Dashboard Task Toggle**: You can click directly on any Task item card in the Dashboard. The card intercepts the trigger and toggles the task state reactively (Todo → In Progress → Completed) so you can preview all three design variations dynamically.
