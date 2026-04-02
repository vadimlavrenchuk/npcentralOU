# 🚀 Quick Reference Guide

## Start Backend Server

```bash
cd backend
npm run dev
```

Or double-click: `start-backend.bat`

---

## Before Starting

1. ✅ Dependencies installed: `npm install` (already done!)
2. ⚠️ Update [backend/.env](backend/.env) with MongoDB connection:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/npcentralou
   ```

---

## Test Server is Running

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-01-20T..."
}
```

---

## Add Sample Data (Optional)

```bash
cd backend
npm run seed
```

Adds 10 inventory items:
- Laptops
- Monitors
- Office furniture
- Supplies
- etc.

---

## API Examples

### Get All Inventory
```bash
curl http://localhost:5000/api/inventory
```

### Create Item
```bash
curl -X POST http://localhost:5000/api/inventory \
  -H "Content-Type: application/json" \
  -d '{"sku":"ITEM001","name":{"en":"Test Item"},"category":"Test","quantity":100,"minQuantity":10,"unit":"pcs","price":19.99}'
```

### Update Quantity (Add Stock)
```bash
curl -X PATCH http://localhost:5000/api/inventory/ITEM_ID \
  -H "Content-Type: application/json" \
  -d '{"quantityChange":50,"operation":"add"}'
```

### Update Quantity (Remove Stock)
```bash
curl -X PATCH http://localhost:5000/api/inventory/ITEM_ID \
  -H "Content-Type: application/json" \
  -d '{"quantityChange":20,"operation":"subtract"}'
```

---

## Available Commands

```bash
npm run dev      # Development mode (hot reload)
npm run build    # Build TypeScript
npm start        # Production mode
npm run seed     # Add sample data
```

---

## Files to Know

- [backend/.env](backend/.env) - Configure MongoDB here
- [backend/src/server.ts](backend/src/server.ts) - Main server
- [backend/src/models/Inventory.ts](backend/src/models/Inventory.ts) - Data schema
- [backend/src/controllers/inventory.controller.ts](backend/src/controllers/inventory.controller.ts) - Business logic
- [backend/src/routes/inventory.routes.ts](backend/src/routes/inventory.routes.ts) - API routes

---

## Documentation

- **Setup Guide**: [BACKEND_SETUP.md](BACKEND_SETUP.md)
- **API Docs**: [backend/README.md](backend/README.md)
- **Testing**: [backend/API_TESTING.md](backend/API_TESTING.md)
- **Complete Info**: [BACKEND_COMPLETE.md](BACKEND_COMPLETE.md)

---

## Troubleshooting

**"Cannot connect to MongoDB"**
→ Check [backend/.env](backend/.env) MongoDB URI

**"CORS error"**
→ Verify `CORS_ORIGIN=http://localhost:5173` in [backend/.env](backend/.env)

**"Port 5000 in use"**
→ Change `PORT=5001` in [backend/.env](backend/.env)

---

## Next Steps

1. ✅ Backend created
2. ⚠️ Configure MongoDB Atlas in [backend/.env](backend/.env)
3. ⚠️ Start server: `npm run dev`
4. ✅ (Optional) Seed data: `npm run seed`
5. ⚠️ Connect your frontend to `http://localhost:5000/api`

---

**Need help?** Check [BACKEND_SETUP.md](BACKEND_SETUP.md) for detailed instructions!
