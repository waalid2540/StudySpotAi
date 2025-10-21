# StudySpot AI - Learning Platform

AI-Powered Homework Help & Learning Platform with gamification, parent monitoring, and personalized learning paths.

## 🏗️ Monorepo Structure

```
StudySpotAi/
├── frontend/          # React + TypeScript frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/           # Node.js + Express + PostgreSQL backend
│   ├── src/
│   └── package.json
└── render.yaml        # Render.com deployment config
```

## 🚀 Features

### Student Features
- 📚 Homework management and AI assistance
- 🤖 AI Tutor chat (OpenAI + Anthropic Claude)
- 📝 Interactive quizzes
- 🏆 Gamification with points and badges
- 📊 Progress tracking and analytics
- ⏰ Study timer with Pomodoro technique
- 🌙 Dark mode support

### Parent Features
- 👨‍👩‍👧‍👦 Children management
- 📈 Progress reports and analytics
- 💬 Messaging system
- 💳 Subscription and billing
- 🔔 Real-time notifications

### Admin Features
- 👥 User management
- 📋 Homework oversight
- 📊 Platform analytics
- ⚙️ System settings

## 🛠️ Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast builds
- Tailwind CSS for styling
- React Router v6
- Firebase Auth (with demo mode)
- WebSocket for real-time features

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL with TypeORM
- JWT authentication
- OpenAI + Anthropic Claude APIs
- Stripe payment integration
- WebSocket (Socket.io)

## 🚀 Deployment

This project is configured for deployment on Render.com with a single `render.yaml` file that deploys:
- **Backend API** (Node.js web service)
- **PostgreSQL Database** (managed database)
- **Frontend** (static site)

### Deploy to Render

1. Push this repo to GitHub
2. Go to [Render.com](https://render.com)
3. Click "New +" → "Blueprint"
4. Connect your GitHub repository
5. Render will automatically detect `render.yaml` and deploy all services

### Environment Variables

See the deployment guide in `DEPLOYMENT.md` for required environment variables.

## 💻 Local Development

### Frontend
```bash
npm install
npm run dev
```
Runs on http://localhost:5173

### Backend
```bash
cd backend
npm install
npm run dev
```
Runs on http://localhost:5000

## 📝 License

MIT
