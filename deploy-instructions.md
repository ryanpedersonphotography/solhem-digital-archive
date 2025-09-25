# Solhem Digital Archive - Deployment Instructions

## Quick Deploy to Netlify (Recommended)

### Option 1: Deploy via Netlify Dashboard (Easiest)

1. **Visit Netlify**: https://app.netlify.com/drop
2. **Drag and drop**: The `netlify-deploy.zip` file from this folder
3. **After upload completes**:
   - Click on the deployed site URL
   - Go to "Site settings" → "Site details"
   - Click "Change site name" 
   - Enter: `solhem-digital-archive`
   - Your site will be live at: https://solhem-digital-archive.netlify.app

### Option 2: Connect GitHub Repository (Best for updates)

1. **Visit**: https://app.netlify.com/start
2. **Click**: "Import an existing project"
3. **Select**: GitHub
4. **Choose repository**: `ryanpedersonphotography/solhem-digital-archive`
5. **Build settings** (should auto-detect):
   - Build command: `npm run build`
   - Publish directory: `dist`
6. **Click**: "Deploy site"
7. **After deployment**:
   - Go to "Site settings" → "Site details"
   - Change site name to: `solhem-digital-archive`

### Option 3: GitHub Actions (For CI/CD)

1. **Get Netlify credentials**:
   - Go to: https://app.netlify.com/user/applications#personal-access-tokens
   - Create new token, save it

2. **Create a new site on Netlify**:
   - Visit: https://app.netlify.com/sites
   - Click "Add new site" → "Configure manually"
   - Note the Site ID

3. **Add secrets to GitHub**:
   - Go to: https://github.com/ryanpedersonphotography/solhem-digital-archive/settings/secrets/actions
   - Add `NETLIFY_AUTH_TOKEN` (from step 1)
   - Add `NETLIFY_SITE_ID` (from step 2)

4. **Trigger deployment**:
   - Push any commit or manually run the workflow from Actions tab

## Files Included

- `dist/` - Built application ready for deployment
- `netlify-deploy.zip` - Pre-packaged deployment file
- `.github/workflows/deploy.yml` - GitHub Actions workflow
- `netlify.toml` - Netlify configuration

## Live URLs

Once deployed, your site will be available at:
- Primary: https://solhem-digital-archive.netlify.app
- GitHub Repo: https://github.com/ryanpedersonphotography/solhem-digital-archive

## Features Deployed

✅ 3 Solhem Properties (Archive, Lucille, Fred)
✅ Custom branding and colors
✅ Property details with amenities
✅ Floor plans and layouts
✅ Media library
✅ Download functionality
✅ Responsive design

## Support

For issues, check the build logs in Netlify dashboard or GitHub Actions.