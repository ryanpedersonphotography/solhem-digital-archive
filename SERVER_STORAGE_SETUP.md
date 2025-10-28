# Server-Based Storage Setup Guide

This guide shows how to convert the Solhem Digital Archive from localStorage to server-based storage using Netlify Functions + GitHub API.

## 🎯 What This Achieves

- ✅ **Persistent edits** across all devices and browsers
- ✅ **Single source of truth** stored in your GitHub repo
- ✅ **Free hosting** on Netlify's free tier
- ✅ **Version history** via Git commits
- ✅ **Backup/restore** functionality
- ✅ **No database needed**

## 🛠 Setup Steps

### 1. Create GitHub Personal Access Token

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name: `Solhem Digital Archive Data`
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
5. Copy the token (you'll need it for Netlify)

### 2. Add Environment Variable to Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Open your `solhem-digital-archive` site
3. Go to **Site settings → Environment variables**
4. Click **Add a variable**:
   - **Key**: `GITHUB_TOKEN`
   - **Value**: `[paste your GitHub token]`
   - **Scopes**: All scopes
5. Click **Create variable**

### 3. Create Data Directory in Repository

The Netlify Function will store data files in your repo at:
```
data/
├── hidden-photos.json
├── photo-ratings.json
├── photo-tags.json
└── flagged-photos.json
```

Create this directory:
```bash
mkdir data
echo '{"version":"1.0","lastUpdated":"","hiddenPhotos":{}}' > data/hidden-photos.json
echo '{"version":"1.0","lastUpdated":"","ratings":{}}' > data/photo-ratings.json
echo '{"version":"1.0","lastUpdated":"","photoTags":{}}' > data/photo-tags.json
echo '{"version":"1.0","lastUpdated":"","flaggedPhotos":{}}' > data/flagged-photos.json
git add data/
git commit -m "Add data storage files for server-based persistence"
git push
```

### 4. Update Your Stores (Choose Your Approach)

#### Option A: Replace Existing Stores
Replace your current store imports:
```typescript
// Before
import useHiddenStore from './stores/hiddenStore';

// After  
import useHiddenStore from './stores/serverHiddenStore';
```

#### Option B: Gradual Migration
Keep both stores and switch gradually:
```typescript
import useHiddenStore from './stores/hiddenStore'; // localStorage version
import useServerHiddenStore from './stores/serverHiddenStore'; // server version

// Use server version when available, fallback to localStorage
const hiddenStore = useServerHiddenStore;
```

### 5. Initialize Data Loading

Add to your main App component:
```typescript
// src/App.tsx
import { useEffect } from 'react';
import useServerHiddenStore from './stores/serverHiddenStore';

function App() {
  const loadHiddenData = useServerHiddenStore(state => state.loadFromServer);
  
  useEffect(() => {
    // Load data from server on app start
    loadHiddenData().catch(console.error);
  }, [loadHiddenData]);

  // ... rest of your app
}
```

### 6. Deploy and Test

```bash
npm run build
netlify deploy --prod
```

## 🔧 How It Works

### Data Flow
1. **Read**: Netlify Function → GitHub API → JSON files in repo
2. **Write**: React App → Netlify Function → GitHub API → Commit to repo
3. **Backup**: All data versioned in Git history

### File Structure
```
netlify/functions/
└── data-store.js          # Handles all CRUD operations

src/
├── utils/dataApi.ts       # API client for functions
└── stores/
    └── serverHiddenStore.ts   # Server-backed store
```

### API Endpoints
- `GET /.netlify/functions/data-store/hidden` - Load hidden photos
- `PUT /.netlify/functions/data-store/hidden` - Save hidden photos
- `GET /.netlify/functions/data-store/ratings` - Load ratings
- `PUT /.netlify/functions/data-store/ratings` - Save ratings
- (Same pattern for tags and flags)

## 🎛 Usage Examples

### Hide a Photo (Server Persistence)
```typescript
const hidePhoto = useServerHiddenStore(state => state.hidePhoto);

// This will save to GitHub automatically
await hidePhoto('photo-123', 'event-456', 'Privacy request');
```

### Bulk Operations
```typescript
const hideMultiple = useServerHiddenStore(state => state.hideMultiplePhotos);

// Hide multiple photos with one server call
await hideMultiple(['photo-1', 'photo-2', 'photo-3'], 'event-456', 'Bulk hide');
```

### Error Handling
```typescript
const { error, isLoading } = useServerHiddenStore();

if (error) {
  console.error('Server error:', error);
  // Fallback to localStorage or show user message
}
```

## 🔄 Migration from localStorage

### Export Current Data
```typescript
// Get your current data
const currentHidden = useHiddenStore.getState().exportHidden();
console.log('Current hidden photos:', currentHidden);

// Save this JSON as backup
```

### Import to Server
```typescript
// Use the import function to migrate
const serverStore = useServerHiddenStore.getState();
const success = serverStore.importHidden(currentHidden);
if (success) {
  console.log('Migration successful!');
}
```

## 📊 Monitoring

### Check Function Logs
1. Go to Netlify Dashboard → Functions
2. Click on `data-store` function  
3. View logs and usage statistics

### View Data in GitHub
- Browse to your repo → `data/` folder
- See commit history for all data changes
- Use GitHub's blame view to see when changes were made

## 🚨 Troubleshooting

### Function Not Working
1. Check environment variable is set correctly
2. Verify GitHub token has `repo` permissions
3. Check function logs in Netlify dashboard

### Data Not Saving
1. Verify repo name and owner in function code
2. Check network tab for API errors
3. Ensure `data/` directory exists in repo

### Performance Considerations
- Each save triggers a Git commit (good for history, but adds latency)
- Consider batching changes for bulk operations
- GitHub API has rate limits (5000 requests/hour)

## 🔮 Future Enhancements

### Possible Upgrades
1. **Real-time sync** with WebSockets
2. **Conflict resolution** for multiple editors
3. **Optimistic updates** with retry logic
4. **Change notifications** via GitHub webhooks
5. **Admin dashboard** for data management

### Alternative Storage Options
1. **Netlify Blob Store** - Simpler but paid
2. **Supabase** - More features, generous free tier  
3. **GitHub Gists** - Simpler setup, less control
4. **JSONBin.io** - External service, easy setup

---

You now have a robust, server-backed storage system that persists across all devices while staying within Netlify's free tier! 🎉