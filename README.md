# Apartment Management System with DAM Integration

A modern, enterprise-grade apartment management platform built with Vite, React, and Netlify.

## 🚀 Features

- **Property Management**: Multi-property and unit management
- **Tenant Portal**: Self-service tenant features
- **Maintenance System**: Work order tracking and vendor management
- **Financial Management**: Rent collection and expense tracking
- **Digital Asset Management**: Advanced media handling with Netlify
- **Real-time Updates**: Live dashboards and notifications

## 🛠 Tech Stack

- **Frontend**: Vite 5 + React 18 with TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand + TanStack Query
- **Backend**: Hono.js with Netlify Functions
- **Database**: PostgreSQL (Supabase)
- **Media**: Netlify Large Media + Image CDN
- **Auth**: Clerk
- **Deployment**: Netlify

## 📁 Project Structure

```
src/
├── components/     # React components
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── stores/        # Zustand stores
├── lib/           # Utilities and helpers
├── styles/        # Global styles
└── types/         # TypeScript types
```

## 🏃 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📚 Documentation

- [Project Roadmap](./PROJECT_ROADMAP.md)
- [Agent Specifications](./AGENT_SPECIFICATIONS.md)

## 🧪 Testing

```bash
# Run tests with Vitest
npm run test

# Run E2E tests with Puppeteer
npm run test:e2e
```

## 📦 Deployment

The project is configured for automatic deployment to Netlify on push to main branch.

## 📝 License

MIT