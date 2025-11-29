# CareFlow Nexus - Deployment Guide

## 🚀 Deploy to Vercel

This guide will help you deploy CareFlow Nexus to Vercel with proper configuration.

---

## Prerequisites

- GitHub account
- Vercel account (free tier works)
- Your code pushed to GitHub repository

---

## Quick Deploy Steps

### 1. Push to GitHub

```bash
cd CareFlow_Nexus-main
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Vercel will auto-detect it's a **Vite** project

### 3. Configure Environment Variables

In Vercel dashboard, add these environment variables:

#### Required Variables:

```
VITE_USE_MOCK_DATA=true
```

#### Optional (if using Supabase):

```
VITE_SUPABASE_URL=https://mlyigztcpkdxqqbmrbit.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**Note:** Start with mock mode (`VITE_USE_MOCK_DATA=true`) for testing!

### 4. Deploy

Click **"Deploy"** and wait ~2-3 minutes.

Your app will be live at: `https://your-project-name.vercel.app`

---

## Configuration Details

### vercel.json Breakdown

The included `vercel.json` file configures:

```json
{
  "framework": "vite",              // Auto-detected Vite build
  "buildCommand": "npm run build",  // Production build
  "outputDirectory": "dist",        // Build output folder
  "rewrites": [...]                 // SPA routing support
}
```

### Build Settings

**Framework Preset:** Vite  
**Build Command:** `npm run build`  
**Output Directory:** `dist`  
**Install Command:** `npm install`

These are auto-configured by the `vercel.json` file.

---

## Environment Variables Setup

### In Vercel Dashboard:

1. Go to your project → **Settings** → **Environment Variables**
2. Add each variable:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `VITE_USE_MOCK_DATA` | `true` | Production, Preview, Development |
| `VITE_SUPABASE_URL` | Your Supabase URL | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase Key | Production, Preview, Development |

**Important:** Check all three environments (Production, Preview, Development)

### Local Development:

Your `.env.local` file (not committed to git):

```env
VITE_USE_MOCK_DATA=true
VITE_SUPABASE_URL=https://mlyigztcpkdxqqbmrbit.supabase.co
VITE_SUPABASE_ANON_KEY=your_key_here
```

---

## Deployment Modes

### Mode 1: Mock Data (Recommended for Testing)

**Environment Variable:**
```
VITE_USE_MOCK_DATA=true
```

**Pros:**
- ✅ Works immediately
- ✅ No database setup needed
- ✅ Fast and reliable
- ✅ Great for demos

**Cons:**
- ❌ Data doesn't persist between sessions
- ❌ No multi-user support

### Mode 2: Supabase (Production)

**Environment Variables:**
```
VITE_USE_MOCK_DATA=false
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**Pros:**
- ✅ Real database
- ✅ Data persists
- ✅ Multi-user support
- ✅ Production-ready

**Cons:**
- ❌ Requires Supabase setup
- ❌ Needs all tables created

---

## Supabase Setup (Optional)

If deploying with real database:

### 1. Create Supabase Tables

Run this SQL in Supabase SQL Editor:

```sql
-- Patients table
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT NOT NULL,
  emergency_type TEXT NOT NULL,
  status TEXT,
  age INTEGER,
  gender TEXT,
  contact_phone TEXT,
  admission_time TIMESTAMPTZ,
  assigned_bed_id TEXT,
  assigned_nurse_id UUID,
  assigned_doctor_id UUID,
  severity TEXT,
  medical_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Beds table
CREATE TABLE beds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bed_number TEXT NOT NULL,
  floor INTEGER,
  status TEXT,
  type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff table
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  target_role TEXT,
  agent_role TEXT,
  assigned_to TEXT,
  patient_id TEXT,
  bed_id TEXT,
  status TEXT,
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admissions table
CREATE TABLE admissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT NOT NULL,
  bed_id TEXT NOT NULL,
  admitted_at TIMESTAMPTZ DEFAULT NOW(),
  discharged_at TIMESTAMPTZ,
  status TEXT
);

-- Events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  payload JSONB,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Enable Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for development
CREATE POLICY "Allow all operations" ON patients FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON beds FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON staff FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON tasks FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON admissions FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON events FOR ALL USING (true);
```

**Note:** These policies are permissive for development. Implement proper RLS for production.

### 3. Get API Keys

1. Go to Supabase Dashboard → Settings → API
2. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`
3. Add to Vercel environment variables

---

## Custom Domain (Optional)

### Add Custom Domain:

1. Go to Vercel project → **Settings** → **Domains**
2. Add your domain: `careflow.yourdomain.com`
3. Follow Vercel's DNS instructions
4. Wait for DNS propagation (~5 minutes to 48 hours)

---

## Continuous Deployment

Every push to `main` branch will auto-deploy:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Vercel automatically:
- ✅ Detects changes
- ✅ Runs build
- ✅ Deploys to production
- ✅ Provides preview URL

### Preview Deployments

Every pull request gets a unique preview URL:
- Test features before merging
- Share with team for review
- No impact on production

---

## Build Optimization

### Performance Tips:

1. **Enable Compression** (Vercel does this automatically)
2. **Use CDN** (Vercel Edge Network included)
3. **Optimize Images** (consider `vite-plugin-imagemin`)
4. **Code Splitting** (Vite does this by default)

### Build Time Optimization:

```json
// vite.config.ts
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select']
        }
      }
    }
  }
}
```

---

## Troubleshooting

### Build Fails

**Error:** `Module not found`
```bash
# Solution: Check package.json dependencies
npm install
npm run build  # Test locally first
```

**Error:** `Out of memory`
```json
// package.json - increase memory
"scripts": {
  "build": "NODE_OPTIONS=--max-old-space-size=4096 vite build"
}
```

### Environment Variables Not Working

1. Check variable names start with `VITE_`
2. Verify in Vercel dashboard they're set for all environments
3. Redeploy after adding variables:
   - Vercel → Deployments → [...] → Redeploy

### 404 on Refresh

This means SPA routing isn't working:
- ✅ Check `vercel.json` includes rewrites
- ✅ Redeploy if you added `vercel.json` after initial deploy

### Slow Initial Load

- Use Vercel Analytics to identify bottlenecks
- Consider lazy loading routes:
  ```jsx
  const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
  ```

---

## Monitoring & Analytics

### Enable Vercel Analytics:

1. Go to project → **Analytics** tab
2. Click **"Enable Analytics"**
3. View real-time metrics:
   - Page views
   - Load times
   - User sessions
   - Geographic distribution

### Enable Speed Insights:

```bash
npm install @vercel/speed-insights

// Add to main.tsx
import { SpeedInsights } from '@vercel/speed-insights/react';

<SpeedInsights />
```

---

## Security Checklist

Before deploying to production:

- [ ] Environment variables are set (not hardcoded)
- [ ] Supabase RLS policies are configured properly
- [ ] API keys are in Vercel environment variables (not in code)
- [ ] CORS settings are configured in Supabase
- [ ] Authentication is enabled (if using Supabase Auth)
- [ ] Rate limiting is configured
- [ ] Error pages are user-friendly (not showing stack traces)

---

## Cost Estimation

### Vercel (Free Tier Limits):

- ✅ 100 GB bandwidth/month
- ✅ Unlimited personal projects
- ✅ Automatic HTTPS
- ✅ 6,000 build minutes/month
- ✅ Serverless functions

**Upgrade needed if:**
- Traffic > 100 GB/month
- Team collaboration required
- Custom build minutes needed

### Supabase (Free Tier):

- ✅ 500 MB database
- ✅ 1 GB file storage
- ✅ 2 GB bandwidth
- ✅ 50,000 monthly active users

**Upgrade needed if:**
- Database > 500 MB
- High traffic (> 2 GB bandwidth)

---

## Post-Deployment Testing

### Checklist:

1. [ ] Homepage loads correctly
2. [ ] Login/authentication works
3. [ ] Admin dashboard accessible
4. [ ] Patient admission works
5. [ ] All role dashboards load
6. [ ] Navigation between pages works
7. [ ] Browser console has no errors
8. [ ] Mobile responsive design works
9. [ ] Forms submit successfully
10. [ ] Data persists (if using Supabase)

### Test Commands:

```bash
# Test production build locally
npm run build
npm run preview

# Visit: http://localhost:4173
```

---

## Rollback

If deployment has issues:

1. Go to Vercel → **Deployments**
2. Find previous working deployment
3. Click **[...]** → **"Promote to Production"**
4. Instant rollback (no rebuild needed)

---

## Support & Resources

- **Vercel Docs:** https://vercel.com/docs
- **Vite Docs:** https://vitejs.dev
- **Supabase Docs:** https://supabase.com/docs
- **Project Issues:** Check `QUICK_FIX.md` for common problems

---

## Next Steps

1. ✅ Deploy with mock mode first
2. ✅ Test all features on deployed URL
3. ✅ Set up Supabase (optional)
4. ✅ Switch to real database
5. ✅ Add custom domain
6. ✅ Enable analytics
7. ✅ Share with team!

---

**Deployment Time:** ~5 minutes  
**First Deploy:** Use mock mode  
**Production:** Switch to Supabase when ready

Good luck! 🚀