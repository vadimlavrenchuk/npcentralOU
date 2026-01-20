# Backend Setup Guide

## ✅ Completed Setup

Production-ready Express backend has been created with the following features:

### 📁 Project Structure
```
backend/
├── src/
│   ├── config/
│   │   └── db.ts                    # MongoDB Atlas connection
│   ├── controllers/
│   │   └── inventory.controller.ts  # Inventory business logic
│   ├── middleware/
│   │   ├── language.middleware.ts   # Accept-Language header parsing
│   │   └── errorHandler.middleware.ts # Centralized error handling
│   ├── models/
│   │   └── Inventory.ts             # Mongoose schema for Inventory
│   ├── routes/
│   │   └── inventory.routes.ts      # API route definitions
│   ├── types/
│   │   ├── common.ts                # Type definitions (i18n)
│   │   └── index.ts
│   └── server.ts                    # Main application entry
├── .env                             # Environment variables
├── .env.example                     # Template for environment setup
├── package.json
├── tsconfig.json
└── README.md                        # Full API documentation
```

### 🔐 Security Features
- ✅ Helmet.js for security headers
- ✅ CORS configured for frontend origin
- ✅ Input validation with Mongoose schemas
- ✅ Centralized error handling

### 🌍 i18n Support
- ✅ Accept-Language header parsing
- ✅ Multi-language error messages (en, et, fi, ru)
- ✅ i18n name field in Inventory model

### 📊 Inventory Model
```typescript
{
  sku: string (unique)
  name: {
    en: string (required)
    et?: string
    fi?: string  
    ru?: string
  }
  category: string
  quantity: number
  minQuantity: number
  unit: 'pcs' | 'kg' | 'l' | 'm' | 'box' | 'set'
  price: number
  createdAt: Date
  updatedAt: Date
}
```

### 🔌 API Endpoints

#### GET /api/inventory
Get all inventory items

#### GET /api/inventory/:id
Get single inventory item

#### POST /api/inventory
Create new inventory item

#### PATCH /api/inventory/:id
Update quantity (incoming/outgoing)
```json
{
  "quantityChange": 50,
  "operation": "add" // or "subtract"
}
```

#### PUT /api/inventory/:id
Full update of inventory item

#### DELETE /api/inventory/:id
Delete inventory item

#### GET /health
Health check endpoint

---

## 🚀 Next Steps

### 1. Configure MongoDB Atlas

**Update the `.env` file:**
```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/npcentralou?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

**How to get MongoDB Atlas connection string:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (if you don't have one)
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<username>`, `<password>`, and `<cluster>` with your values
6. Replace `<database>` with `npcentralou`

### 2. Start the Backend Server

**Development mode (with hot reload):**
```bash
cd backend
npm run dev
```

Or use the quick start script:
```bash
.\start-backend.bat
```

**Production mode:**
```bash
cd backend
npm run build
npm start
```

**Seed database with sample data (optional):**
```bash
cd backend
npm run seed
```
This will populate your database with 10 sample inventory items for testing.

### 3. Test the API

**Check if server is running:**
```bash
curl http://localhost:5000/health
```

**Create a test inventory item:**
```bash
curl -X POST http://localhost:5000/api/inventory \
  -H "Content-Type: application/json" \
  -H "Accept-Language: en" \
  -d "{
    \"sku\": \"TEST001\",
    \"name\": {
      \"en\": \"Test Item\",
      \"et\": \"Testi toode\"
    },
    \"category\": \"Test\",
    \"quantity\": 100,
    \"minQuantity\": 10,
    \"unit\": \"pcs\",
    \"price\": 19.99
  }"
```

**Get all inventory:**
```bash
curl http://localhost:5000/api/inventory
```

### 4. Connect Frontend to Backend

Update your frontend API client to point to:
```
http://localhost:5000/api
```

The backend is configured to accept requests from `http://localhost:5173` (Vite default).

---

## 📝 Features Implemented

✅ Express.js server with TypeScript
✅ MongoDB Atlas connection with Mongoose
✅ Security middleware (Helmet)
✅ CORS configuration
✅ Request body parsing
✅ Accept-Language header parsing
✅ Multi-language error messages
✅ Inventory CRUD operations
✅ Quantity update with validation (incoming/outgoing)
✅ Centralized error handling
✅ Health check endpoint
✅ Environment-based configuration
✅ TypeScript strict mode
✅ Development and production scripts
✅ Comprehensive documentation

---

## 🔧 Troubleshooting

### "Cannot connect to MongoDB"
- Check if your IP is whitelisted in MongoDB Atlas
- Verify connection string in `.env`
- Ensure MongoDB cluster is running

### "CORS error in browser"
- Verify `CORS_ORIGIN` in `.env` matches your frontend URL
- Check if backend server is running

### "Module not found"
- Run `npm install` in the backend directory
- Check if all dependencies are installed

---

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Atlas Guide](https://www.mongodb.com/docs/atlas/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 🎯 Future Enhancements

Consider adding these features:
- Authentication & Authorization (JWT)
- Request rate limiting
- API documentation (Swagger/OpenAPI)
- Unit and integration tests
- Logging system (Winston/Morgan)
- Data validation middleware (express-validator)
- Pagination for large datasets
- Search and filtering
- Audit trails for inventory changes
