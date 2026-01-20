# NPCentral OU Backend

Production-ready Express backend with TypeScript, MongoDB Atlas, and i18n support.

## Features

- ✅ Express.js with TypeScript
- ✅ MongoDB Atlas integration with Mongoose
- ✅ Security with Helmet
- ✅ CORS configuration
- ✅ Multi-language support (en, et, fi, ru)
- ✅ RESTful API for Inventory management
- ✅ Error handling with localized messages
- ✅ Environment-based configuration

## Project Structure

```
backend/
├── src/
│   ├── config/          # Database and app configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Custom middleware (i18n, error handling)
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── types/           # TypeScript type definitions
│   └── server.ts        # Main application entry point
├── .env                 # Environment variables
├── .env.example         # Environment variables template
├── package.json
└── tsconfig.json
```

## Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update `MONGODB_URI` with your MongoDB Atlas connection string
   - Update other variables as needed

3. **Run in development mode:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## API Endpoints

### Inventory Management

#### Get all inventory items
```
GET /api/inventory
```

#### Get single inventory item
```
GET /api/inventory/:id
```

#### Create inventory item
```
POST /api/inventory
Content-Type: application/json

{
  "sku": "ITEM001",
  "name": {
    "en": "Example Item",
    "et": "Näidis Toode",
    "fi": "Esimerkki tuote",
    "ru": "Пример товара"
  },
  "category": "Electronics",
  "quantity": 100,
  "minQuantity": 10,
  "unit": "pcs",
  "price": 29.99
}
```

#### Update inventory quantity (incoming/outgoing)
```
PATCH /api/inventory/:id
Content-Type: application/json

{
  "quantityChange": 50,
  "operation": "add"  // or "subtract"
}
```

#### Update inventory item (full update)
```
PUT /api/inventory/:id
Content-Type: application/json

{
  "name": {
    "en": "Updated Item"
  },
  "quantity": 150,
  "price": 34.99
}
```

#### Delete inventory item
```
DELETE /api/inventory/:id
```

### Health Check
```
GET /health
```

## I18n Support

The API supports multi-language error messages. Send the `Accept-Language` header with your requests:

```
Accept-Language: en
Accept-Language: et
Accept-Language: fi
Accept-Language: ru
```

Supported languages:
- `en` - English (default)
- `et` - Estonian
- `fi` - Finnish
- `ru` - Russian

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | Required |
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment (development/production) | development |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:5173 |

## Security Features

- **Helmet**: Sets various HTTP headers for security
- **CORS**: Configured to allow requests from frontend only
- **Input Validation**: Mongoose schema validation
- **Error Handling**: Centralized error handler with sanitized responses

## Data Model

### Inventory Schema

```typescript
{
  sku: string (required, unique)
  name: {
    en: string (required)
    et?: string
    fi?: string
    ru?: string
  }
  category: string (required)
  quantity: number (required, min: 0)
  minQuantity: number (required, min: 0)
  unit: 'pcs' | 'kg' | 'l' | 'm' | 'box' | 'set' (required)
  price: number (required, min: 0)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

## Development

- **Hot reload**: The dev server uses `ts-node-dev` for automatic reload on file changes
- **TypeScript**: Strict mode enabled for type safety
- **Linting**: Configure ESLint as needed

## Production Deployment

1. Build the TypeScript code:
   ```bash
   npm run build
   ```

2. Set environment variables on your server

3. Start the server:
   ```bash
   npm start
   ```

## Testing API with cURL

### Create an inventory item:
```bash
curl -X POST http://localhost:5000/api/inventory \
  -H "Content-Type: application/json" \
  -H "Accept-Language: en" \
  -d '{
    "sku": "LAPTOP001",
    "name": {
      "en": "Dell Laptop",
      "et": "Dell Sülearvuti"
    },
    "category": "Electronics",
    "quantity": 50,
    "minQuantity": 10,
    "unit": "pcs",
    "price": 899.99
  }'
```

### Get all inventory:
```bash
curl http://localhost:5000/api/inventory \
  -H "Accept-Language: et"
```

### Update quantity (add stock):
```bash
curl -X PATCH http://localhost:5000/api/inventory/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "quantityChange": 25,
    "operation": "add"
  }'
```

### Update quantity (remove stock):
```bash
curl -X PATCH http://localhost:5000/api/inventory/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "quantityChange": 10,
    "operation": "subtract"
  }'
```

## License

ISC
