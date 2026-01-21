# Security Guidelines for Backend

## Environment Variables

**CRITICAL**: Never commit real credentials to Git!

### Setup Instructions

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your actual credentials in `.env`:
   ```
   MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/YOUR_DATABASE
   ```

3. **NEVER** commit `.env` file to Git!

### Protected Files

The following files are protected by `.gitignore`:
- `.env` - Your actual credentials
- `.env.local` - Local overrides
- `.env.*.local` - Environment-specific local configs

### What to Commit

✅ **Safe to commit:**
- `.env.example` - Template with placeholders
- Code that reads from `process.env.MONGODB_URI`

❌ **NEVER commit:**
- `.env` - Real credentials
- Any file with actual passwords/keys
- Connection strings with real usernames/passwords

### Verification

Before committing, always check:
```bash
git status
git diff --cached
```

Make sure no `.env` files or credentials are staged!

### If You Accidentally Committed Credentials

1. **Immediately rotate** (change) the exposed credentials
2. Remove from Git history:
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch backend/.env" \
     --prune-empty --tag-name-filter cat -- --all
   ```
3. Force push: `git push origin --force --all`

### GitGuardian Alerts

If you receive a GitGuardian alert:
1. **Rotate credentials immediately** in MongoDB Atlas
2. Clean Git history (see above)
3. Verify `.gitignore` is working
4. Use `git secrets` tool to prevent future leaks
