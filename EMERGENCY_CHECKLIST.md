# 🚨 EMERGENCY CHECKLIST

## ✅ Completed Actions

- [x] Removed `ЗАДАЧА_ВЫПОЛНЕНА.md` from Git history (all 35 commits)
- [x] Cleaned Git references and pruned objects
- [x] Force pushed to GitHub
- [x] Verified file removal from repository
- [x] Created incident documentation (English)
- [x] Created password change guide (Russian)
- [x] Committed documentation to repository

## ⚠️ URGENT - Action Required NOW

### YOU MUST DO THIS IMMEDIATELY:

- [ ] **Login to MongoDB Atlas** → https://cloud.mongodb.com/
- [ ] **Navigate to:** Database Access → Users
- [ ] **Find user:** vadimlavrenchuk
- [ ] **Click:** Edit → Edit Password
- [ ] **Generate:** Autogenerate Secure Password
- [ ] **Copy:** New password to clipboard
- [ ] **Save:** Password to password manager
- [ ] **Update:** `backend/.env` file with new password
- [ ] **Restart:** Backend server (`cd backend && npm run dev`)
- [ ] **Verify:** Connection successful message
- [ ] **Test:** Open http://localhost:5173 and check Inventory page

## 📋 Old Credentials (COMPROMISED)

```
Username: vadimlavrenchuk
Password: Vad525549vad  ← DO NOT USE ANYMORE!
Database: MechanicPro
Cluster: mechanicpro.wjylube.mongodb.net
```

## 🔐 New Credentials Template

Update `backend/.env`:

```env
MONGODB_URI=mongodb+srv://vadimlavrenchuk:NEW_PASSWORD_HERE@mechanicpro.wjylube.mongodb.net/MechanicPro?retryWrites=true&w=majority&appName=MechanicPro
```

Replace `NEW_PASSWORD_HERE` with the generated password from Atlas.

## 🛡️ Optional Security Hardening

- [ ] Set up IP Whitelist in MongoDB Atlas (Network Access)
- [ ] Enable database audit logging
- [ ] Review other environment files for leaks
- [ ] Install git-secrets or similar pre-commit hooks
- [ ] Rotate credentials every 90 days (calendar reminder)

## 📚 Documentation

- **Detailed incident report:** `SECURITY_INCIDENT_RESPONSE.md`
- **Step-by-step guide (Russian):** `СРОЧНО_СМЕНА_ПАРОЛЯ.md`

## ⏰ Timeline

| Time | Action | Status |
|------|--------|--------|
| 23:11 | Leak detected by scanner | ✅ Detected |
| +5 min | File removed from Git history | ✅ Completed |
| +8 min | Force push to GitHub | ✅ Completed |
| +10 min | Documentation created | ✅ Completed |
| **NOW** | **Password change required** | ⏳ **PENDING** |

## 🎯 Success Criteria

✅ Task complete when:
- New password generated in Atlas
- `backend/.env` updated
- Backend connects successfully
- Application works normally
- Old password deleted from all locations

---

**Status:** 🟡 PARTIAL - Git cleaned, password change pending  
**Priority:** 🔴 P0 - CRITICAL  
**ETA:** 5 minutes  
**Responsible:** Vadim Lavrenchuk
