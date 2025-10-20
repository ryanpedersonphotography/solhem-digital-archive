# Apartment Management System with DAM Integration
## Complete Project Roadmap - Vite + React Architecture

---

## 🎯 Project Overview

### System Description
Enterprise-grade apartment management platform integrating:
- **Core Management**: Tenant, maintenance, financial operations
- **DAM Integration**: Advanced digital asset management for property media
- **AI Enhancement**: Automated categorization, smart search, content generation
- **Real-time Operations**: Live dashboards, instant notifications, WebSocket updates

### Technology Stack
```yaml
Frontend:
  Framework: Vite + React 18
  UI: Tailwind CSS, shadcn/ui, Framer Motion
  State: Zustand, TanStack Query
  Router: React Router v6
  Forms: React Hook Form, Zod
  Build: Vite 5, SWC
  
Backend:
  Runtime: Bun
  Framework: Hono.js
  Database: PostgreSQL (Supabase)
  ORM: Drizzle
  Auth: Clerk
  
DAM:
  Storage: Netlify Large Media / Git LFS
  CDN: Netlify Edge (built-in)
  Processing: Sharp (build-time), Netlify Functions
  Optimization: Netlify Image CDN
  AI: OpenAI Vision API
  
DevOps:
  Deployment: Netlify (Frontend + Functions)
  Monitoring: Sentry, Posthog
  CI/CD: GitHub Actions
```

---

## 📋 Phase-by-Phase Implementation

### Phase 1: Foundation (Week 1-2)
**Goal**: Establish core infrastructure with Vite

#### Tasks:
1. **Project Setup**
   ```bash
   # Vite project initialization
   npm create vite@latest apartment-dam -- --template react-swc-ts
   cd apartment-dam
   npm install
   ```
   - Configure Vite with optimal settings
   - Set up path aliases
   - Configure environment variables
   - Create folder structure

2. **Database Design**
   - Design complete schema (40+ tables)
   - Set up Supabase project
   - Configure Drizzle ORM
   - Create migration system

3. **Authentication**
   - Integrate Clerk with React
   - Set up protected routes with React Router
   - Configure role-based access (Admin, Manager, Tenant, Vendor)
   - Implement auth context

4. **Base UI Components**
   - Install shadcn/ui for Vite
   - Create theme system
   - Build layout components
   - Set up responsive navigation

**Deliverables**: Working auth system, database schema, component library

---

### Phase 2: Core Tenant Management (Week 3-4)
**Goal**: Complete tenant lifecycle management

#### Tasks:
1. **Routing Structure**
   ```typescript
   // React Router v6 structure
   const router = createBrowserRouter([
     {
       path: "/",
       element: <RootLayout />,
       children: [
         { path: "dashboard", element: <Dashboard /> },
         { path: "tenants/*", element: <TenantRoutes /> },
         { path: "properties/*", element: <PropertyRoutes /> },
         { path: "maintenance/*", element: <MaintenanceRoutes /> },
       ]
     }
   ]);
   ```

2. **Tenant Module**
   - Tenant profiles with documents
   - Lease management & renewals
   - Rent payment tracking
   - Communication portal

3. **State Management**
   ```typescript
   // Zustand store example
   const useTenantStore = create((set) => ({
     tenants: [],
     loading: false,
     fetchTenants: async () => {
       set({ loading: true });
       // API call
       set({ tenants: data, loading: false });
     }
   }));
   ```

**Deliverables**: Full tenant management system

---

### Phase 3: DAM Core Integration (Week 5-6)
**Goal**: Implement Netlify-based DAM system

#### Tasks:
1. **DAM Infrastructure**
   ```typescript
   interface ViteDAMSystem {
     storage: {
       netlify: NetlifyLargeMedia;
       gitLFS: GitLFSIntegration;
       public: VitePublicAssets;
     };
     processing: {
       buildTime: ViteImageOptimizer;
       netlifyFunctions: ServerlessProcessor;
       imageCDN: NetlifyImageTransform;
     };
     optimization: {
       lazy: LazyLoadingSetup;
       responsive: SrcSetGenerator;
       formats: ModernFormatSupport;
     };
   }
   ```

2. **Vite Asset Pipeline**
   ```javascript
   // vite.config.ts
   import { defineConfig } from 'vite';
   import imagemin from 'vite-plugin-imagemin';
   
   export default defineConfig({
     plugins: [
       imagemin({
         gifsicle: { optimizationLevel: 3 },
         mozjpeg: { quality: 75 },
         pngquant: { quality: [0.65, 0.9] },
         svgo: { plugins: [{ name: 'removeViewBox' }] },
         webp: { quality: 75 }
       })
     ],
     build: {
       rollupOptions: {
         output: {
           assetFileNames: 'assets/[name].[hash][extname]'
         }
       }
     }
   });
   ```

3. **Smart Features**
   - AI-powered tagging (OpenAI Vision)
   - Automatic alt text generation
   - Netlify On-demand Builders
   - Progressive image loading
   - Dynamic imports for large assets

**Deliverables**: Complete DAM system optimized for Vite

---

### Phase 4: Maintenance Operations (Week 7-8)
**Goal**: Comprehensive maintenance management

#### Tasks:
1. **Work Order System**
   - Request submission with React Hook Form
   - Priority & categorization
   - Vendor assignment
   - Real-time status with WebSocket
   - Photo attachments via Netlify

2. **Component Architecture**
   ```typescript
   // Vite component with code splitting
   const MaintenanceModule = lazy(() => 
     import('./modules/maintenance/MaintenanceModule')
   );
   ```

**Deliverables**: Full maintenance workflow system

---

### Phase 5: Financial Management (Week 9-10)
**Goal**: Complete accounting and reporting

#### Tasks:
1. **Payment Integration**
   - Stripe Elements with React
   - Payment history dashboard
   - Invoice generation

2. **Reporting with Vite**
   ```typescript
   // Dynamic chart imports
   const ChartModule = lazy(() => 
     import('./components/charts/ChartModule')
   );
   ```

**Deliverables**: Financial management system

---

### Phase 6: Advanced DAM Features (Week 11-12)
**Goal**: Premium media capabilities

#### Tasks:
1. **Virtual Tours**
   - 360° viewer component
   - Lazy loading for performance
   - Netlify CDN delivery

2. **Vite Optimization**
   ```javascript
   // Advanced chunking
   build: {
     rollupOptions: {
       output: {
         manualChunks: {
           'vendor-react': ['react', 'react-dom', 'react-router-dom'],
           'vendor-ui': ['@radix-ui', 'framer-motion'],
           'vendor-utils': ['lodash', 'date-fns', 'zod']
         }
       }
     }
   }
   ```

**Deliverables**: Professional marketing tools

---

### Phase 7: Analytics & Intelligence (Week 13-14)
**Goal**: Data-driven insights with optimized loading

#### Tasks:
1. **Dashboard Performance**
   - Code splitting for analytics
   - Web Workers for calculations
   - Virtual scrolling for large datasets

2. **Vite PWA Setup**
   ```javascript
   import { VitePWA } from 'vite-plugin-pwa';
   
   VitePWA({
     registerType: 'autoUpdate',
     workbox: {
       globPatterns: ['**/*.{js,css,html,ico,png,svg}']
     }
   })
   ```

**Deliverables**: Complete analytics suite

---

### Phase 8: Testing & Deployment (Week 15-16)
**Goal**: Production-ready deployment

#### Tasks:
1. **Testing Setup**
   ```json
   {
     "scripts": {
       "dev": "vite",
       "build": "tsc && vite build",
       "preview": "vite preview",
       "test": "vitest",
       "test:e2e": "playwright test",
       "lint": "eslint src --ext ts,tsx"
     }
   }
   ```

2. **Netlify Deployment**
   - Configure build settings
   - Set up environment variables
   - Enable Large Media
   - Configure Functions

**Deliverables**: Production-ready system

---

## 🤖 Vite-Specific Agent Specifications

### Agent Updates for Vite

#### Frontend Builder Agent
```yaml
Name: vite-ui-architect
Expertise:
  - Vite configuration & optimization
  - React 18 patterns
  - Code splitting strategies
  - Bundle optimization
  - HMR configuration
  
Key Files:
  - vite.config.ts
  - src/main.tsx
  - src/router.tsx
```

#### Build Optimization Agent
```yaml
Name: vite-performance-expert
Expertise:
  - Rollup configuration
  - Chunk splitting
  - Asset optimization
  - Tree shaking
  - Dependency pre-bundling
```

---

## 📊 Vite Project Structure

```
apartment-dam/
├── public/                    # Static assets
│   └── images/               # Optimized images
├── src/
│   ├── assets/               # Source assets
│   ├── components/           # React components
│   │   ├── ui/              # shadcn/ui components
│   │   └── features/        # Feature components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities
│   │   ├── api/            # API client
│   │   └── dam/            # DAM utilities
│   ├── pages/              # Page components
│   ├── routes/             # React Router setup
│   ├── stores/             # Zustand stores
│   ├── styles/             # Global styles
│   ├── types/              # TypeScript types
│   ├── App.tsx             # Root component
│   ├── main.tsx            # Entry point
│   └── vite-env.d.ts       # Vite types
├── netlify/
│   └── functions/          # Netlify Functions
├── .env                    # Environment variables
├── .env.example
├── .gitignore
├── index.html              # HTML entry
├── netlify.toml            # Netlify config
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts          # Vite configuration
└── README.md
```

---

## 🔑 Key Vite Patterns

### 1. Dynamic Imports
```typescript
// Lazy load heavy components
const HeavyComponent = lazy(() => 
  import(/* webpackChunkName: "heavy" */ './HeavyComponent')
);

// Use with Suspense
<Suspense fallback={<Loading />}>
  <HeavyComponent />
</Suspense>
```

### 2. Environment Variables
```typescript
// Access in Vite
const apiUrl = import.meta.env.VITE_API_URL;
const isProduction = import.meta.env.PROD;
```

### 3. Asset Handling
```typescript
// Import assets
import logo from './assets/logo.svg';
import imageUrl from './assets/property.jpg?url';
import imageOptimized from './assets/property.jpg?w=400&h=300&format=webp';
```

### 4. Hot Module Replacement
```typescript
if (import.meta.hot) {
  import.meta.hot.accept();
  import.meta.hot.dispose(() => {
    // cleanup
  });
}
```

---

## 🚀 Development Workflow

### Vite Commands
```bash
# Development
npm run dev          # Start dev server with HMR
npm run build        # Production build
npm run preview      # Preview production build

# Testing
npm run test         # Run Vitest
npm run test:ui      # Vitest UI
npm run test:e2e     # Playwright tests

# Analysis
npm run build -- --analyze  # Bundle analysis
npm run lighthouse           # Performance audit
```

### Build Optimization Checklist
- [ ] Enable compression (vite-plugin-compression)
- [ ] Configure chunk splitting
- [ ] Optimize dependencies
- [ ] Enable PWA features
- [ ] Configure image optimization
- [ ] Set up CDN for assets
- [ ] Enable HTTP/2 push

---

## 📈 Performance Targets

### Vite Metrics
- **Dev Server Start**: <500ms
- **HMR Update**: <100ms
- **Production Build**: <30s
- **Bundle Size**: <200KB initial
- **Lighthouse Score**: >95

### Runtime Performance
- **First Contentful Paint**: <1.5s
- **Time to Interactive**: <3s
- **Core Web Vitals**: All green

---

## 🎓 Vite-Specific Documentation

### Key Topics
1. **Vite Configuration**: Advanced setup and optimization
2. **React Integration**: Best practices with Vite
3. **Asset Pipeline**: Image and media optimization
4. **Code Splitting**: Strategic chunking
5. **Deployment**: Netlify-specific optimizations

---

## ⚡ Quick Start with Vite

```bash
# Create project
npm create vite@latest apartment-dam -- --template react-swc-ts
cd apartment-dam

# Install dependencies
npm install
npm install -D @types/node
npm install tailwindcss postcss autoprefixer
npm install @tanstack/react-router zustand
npm install react-hook-form zod

# Configure Tailwind
npx tailwindcss init -p

# Start development
npm run dev
```

---

## 🏆 Success Criteria with Vite

1. **Performance**: Sub-second dev server starts
2. **Bundle Size**: Optimized chunks under 200KB
3. **Developer Experience**: Instant HMR
4. **Production Ready**: 95+ Lighthouse scores
5. **Scalable**: Handles 10,000+ components
6. **Type Safe**: Full TypeScript coverage

---

## 🎉 Recent Achievements (October 2025)

### ✅ Download All Photos Feature (Completed)
**Implementation Date**: October 20, 2025

#### What was delivered:
- **Download All Photos button** in main gallery pages showing filtered photo count
- **Lightbox download functionality** with real-time progress indicator  
- **Smart filtering integration** - downloads only visible/filtered photos
- **JSZip integration** for client-side zip file creation
- **Progress tracking** with current/total count display
- **Error handling** with graceful fallbacks for failed downloads

#### Technical details:
- Added JSZip dependency for browser-based zip creation
- Enhanced EventGallery component with download state management
- Added filteredPhotos prop to pass current filter context
- Implemented async download with progress callbacks
- Generated sanitized filenames based on event titles
- Downloads respect admin/public mode visibility rules

#### User experience:
- Dynamic button text shows exact count: "Download All Photos Below (47)"
- Progress indicator in lightbox: "Downloading... 23/47"
- Works with all filters: tags, ratings, hidden photos, search terms
- Graceful error handling with user-friendly messages

---

### ✅ Filter Statistics Fix (Completed)
**Implementation Date**: October 20, 2025

#### Problem solved:
- **Before**: Users in public mode saw "kids (23)" in filter tags but only 15 photos displayed
- **After**: Users see "kids (15)" and get exactly 15 photos when clicking
- **Root cause**: Tag statistics included hidden photos but display excluded them

#### Technical implementation:
- Replaced global `getTagStats(event.id)` with local calculation
- Used `photosWithMeta` (already filtered by visibility) for tag statistics
- Ensured filter dropdown and popular tags use consistent photo counting
- Removed unused imports for cleaner code

#### Impact:
- **Public mode**: Filter counts now match displayed photos exactly
- **Admin mode**: Unchanged behavior - all photos included in counts
- **Consistency**: Dropdown filters and popular tags show same accurate numbers
- **User trust**: No more misleading filter counts

---

### 🔄 Current Status

#### Deployment:
- **Production URL**: https://solhem-digital-archive.netlify.app
- **Site correctly linked**: solhem-digital-archive (verified)
- **Latest commit**: 1088554 - Filter statistics fix
- **Branch**: main (up to date)

#### Features in production:
1. ✅ **Admin mode** via `?admin` URL parameter
2. ✅ **Download All Photos** with filter integration
3. ✅ **Accurate filter statistics** in public/admin modes
4. ✅ **Lightbox scroll lock** functionality
5. ✅ **Archive 2025 event** with 468 photos
6. ✅ **Lucille 2025 event** with 218 photos

#### Next potential enhancements:
- [ ] Download progress persistence across page refreshes
- [ ] Batch download size optimization for large photo sets
- [ ] Download format options (original/thumbnail quality)
- [ ] Download history tracking for users
- [ ] Bulk photo management improvements

---

*This roadmap is optimized for Vite + React development with Netlify deployment.*