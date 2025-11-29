# Vercel Build Fix Guide

## 🚨 Current Error

```
sh: line 1: vite: command not found
Error: Command "npm run build" exited with 127
```

**Cause:** Vite is not being installed or found in node_modules during build.

---

## ✅ SOLUTION 1: Configure in Vercel Dashboard (RECOMMENDED)

### Step 1: Go to Vercel Project Settings

1. Open your project in Vercel Dashboard
2. Go to **Settings** → **General**

### Step 2: Configure Build Settings

**Framework Preset:** Select **Vite**

**Build & Development Settings:**
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** Leave empty (or use `npm install`)

### Step 3: Environment Variables

Go to **Settings** → **Environment Variables** and add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_USE_MOCK_DATA` | `true` | Production, Preview, Development |
| `NODE_VERSION` | `18` | Production, Preview, Development |

### Step 4: Clear Build Cache

1. Go to **Deployments**
2. Click on latest failed deployment
3. Click **[...]** menu → **Redeploy**
4. ✅ Check **"Clear Cache"**
5. Click **Redeploy**

---

## ✅ SOLUTION 2: Fix package.json (If Solution 1 Doesn't Work)

The issue might be with how npm is caching or installing dependencies.

### Add engines field to package.json:

```json
{
  "name": "vite_react_shadcn_ts",
  "version": "0.0.0",
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## ✅ SOLUTION 3: Regenerate package-lock.json

Your package-lock.json might be corrupted. Fix it locally:

```bash
# Delete lock file and node_modules
rm package-lock.json
rm -rf node_modules

# Clean npm cache
npm cache clean --force

# Reinstall dependencies
npm install

# Test build locally
npm run build

# Commit and push
git add package-lock.json
git commit -m "Regenerate package-lock.json"
git push
```

---

## ✅ SOLUTION 4: Alternative vercel.json

Replace your `vercel.json` with this minimal configuration:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Then configure everything in Vercel Dashboard (Solution 1).

---

## ✅ SOLUTION 5: Use .npmrc File

Create `.npmrc` in project root:

```
legacy-peer-deps=true
engine-strict=false
```

Then:
```bash
git add .npmrc
git commit -m "Add .npmrc for build compatibility"
git push
```

---

## 🔍 Debugging Steps

### 1. Check Local Build

Before deploying, always test locally:

```bash
npm install
npm run build
npm run preview
```

If local build works but Vercel fails → cache issue (use Solution 1, Step 4)

### 2. Check Node Version

In Vercel Dashboard → **Settings** → **General** → **Node.js Version**

Should be: **18.x** or **20.x**

### 3. Check for Build Logs

In Vercel deployment details, look for:
- ✅ "Cloning completed"
- ✅ "Running install command"
- ❌ "vite: command not found" ← This is the error

### 4. Verify Dependencies

Make sure `vite` is in `devDependencies`:

```json
{
  "devDependencies": {
    "vite": "^5.4.19",
    "@vitejs/plugin-react-swc": "^3.11.0"
  }
}
```

---

## 🎯 RECOMMENDED WORKFLOW

1. **Clear Vercel build cache** (Solution 1, Step 4)
2. **Set Framework to Vite** in dashboard
3. **Add environment variable:** `VITE_USE_MOCK_DATA=true`
4. **Redeploy**

This fixes 90% of build issues!

---

## 🔧 Alternative: Deploy from Different Branch

If main branch has issues:

```bash
# Create new branch
git checkout -b deploy-fix

# Make any needed changes
git add .
git commit -m "Fix deployment configuration"
git push origin deploy-fix
```

Then in Vercel:
1. **Settings** → **Git**
2. Change **Production Branch** to `deploy-fix`
3. Redeploy

---

## 📋 Complete Checklist

Before redeploying, verify:

- [ ] `vite` exists in `package.json` devDependencies
- [ ] `package-lock.json` is committed to git
- [ ] `.npmrc` file created (optional)
- [ ] Vercel Framework set to **Vite**
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Environment variables added
- [ ] Build cache cleared
- [ ] Node version set to 18.x or 20.x

---

## 🚀 Expected Build Output (Success)

```
✓ Cloning completed: 1.5s
✓ Running install command: npm install
✓ added 352 packages in 3s
✓ Running build command: npm run build
✓ vite v5.4.19 building for production...
✓ 234 modules transformed
✓ dist/index.html built in 5.2s
✓ Build Completed in 8s
```

---

## 🆘 Still Not Working?

### Quick Fix: Use Default Vite Template

1. Vercel Dashboard → **Settings** → **General**
2. **Framework Preset:** Select **Other**
3. **Build Command:** `npx vite build`
4. **Output Directory:** `dist`
5. **Install Command:** `npm ci`
6. Clear cache and redeploy

### Nuclear Option: Fresh Deployment

1. Delete project from Vercel
2. Fix package-lock.json locally (Solution 3)
3. Push to GitHub
4. Import fresh to Vercel
5. Select Vite framework
6. Deploy

---

## 📞 Need More Help?

If still failing, share these details:

1. **Full build log** from Vercel
2. **package.json** scripts section
3. **Node version** you're using locally
4. **Does `npm run build` work locally?**

Common issues:
- Corrupted package-lock.json → Solution 3
- Vercel cache issue → Solution 1, Step 4
- Wrong Node version → Solution 1, Step 3
- Missing dependencies → Check package.json

---

## ✨ Pro Tips

1. **Always test locally first:** `npm run build`
2. **Use specific versions** in package.json (not `^` ranges)
3. **Commit package-lock.json** always
4. **Clear Vercel cache** when in doubt
5. **Use Vite framework preset** in Vercel

Good luck! 🚀