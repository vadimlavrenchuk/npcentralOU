# Security Guidelines

This document outlines general security practices for the project.

## Environment Variables

All sensitive data must be stored in `.env` files:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# Authentication
JWT_SECRET=your_secret_here

# Firebase (frontend)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
```

⚠️ **Never commit `.env` files to Git!**

## Protected Files

The following files are automatically ignored by Git:
- `.env` and `.env.*` files
- Security incident documentation
- Deployment configurations with credentials
- Internal scripts and tools

## Pre-commit Hooks

The project uses pre-commit hooks to prevent accidental leaks of:
- API keys
- Passwords
- Database connection strings
- SSH keys
- JWT secrets

If a commit is blocked, remove the sensitive data and use environment variables instead.

## Security Best Practices

1. **Never hardcode credentials** in source code
2. **Use environment variables** for all sensitive data
3. **Keep `.env` files local** - never commit to Git
4. **Rotate passwords regularly** if compromised
5. **Use strong passwords** (min 16 characters)
6. **Enable 2FA** on critical services
7. **Review code** before committing for accidental secrets

## Checking for Secrets

Run the security scanner (locally only, not in Git):

```powershell
# This script is not in the repository
# Contact admin for internal security tools
```

## In Case of Security Incident

1. Change compromised passwords immediately
2. Review access logs
3. Update environment variables on all environments
4. Document the incident (internal documentation only)

## Reporting Security Issues

If you discover a security vulnerability:
1. Do NOT create a public issue
2. Contact the project maintainers directly
3. Provide detailed information privately

---

**Note:** Detailed security procedures are maintained in internal documentation (not in this public repository).
