# API Testing Examples

## Using cURL (Command Line)

### 1. Health Check
```bash
curl http://localhost:5000/health
```

### 2. Create Inventory Item
```bash
curl -X POST http://localhost:5000/api/inventory \
  -H "Content-Type: application/json" \
  -H "Accept-Language: en" \
  -d "{\"sku\":\"LAPTOP001\",\"name\":{\"en\":\"Dell Laptop\",\"et\":\"Dell Sülearvuti\",\"fi\":\"Dell-kannettava\",\"ru\":\"Ноутбук Dell\"},\"category\":\"Electronics\",\"quantity\":50,\"minQuantity\":10,\"unit\":\"pcs\",\"price\":899.99}"
```

### 3. Get All Inventory
```bash
curl http://localhost:5000/api/inventory
```

### 4. Get Single Item (replace {id} with actual ID)
```bash
curl http://localhost:5000/api/inventory/{id}
```

### 5. Update Quantity - Add Stock
```bash
curl -X PATCH http://localhost:5000/api/inventory/{id} \
  -H "Content-Type: application/json" \
  -d "{\"quantityChange\":25,\"operation\":\"add\"}"
```

### 6. Update Quantity - Remove Stock
```bash
curl -X PATCH http://localhost:5000/api/inventory/{id} \
  -H "Content-Type: application/json" \
  -d "{\"quantityChange\":10,\"operation\":\"subtract\"}"
```

### 7. Update Item (Full Update)
```bash
curl -X PUT http://localhost:5000/api/inventory/{id} \
  -H "Content-Type: application/json" \
  -d "{\"name\":{\"en\":\"Updated Laptop\"},\"price\":849.99}"
```

### 8. Delete Item
```bash
curl -X DELETE http://localhost:5000/api/inventory/{id}
```

---

## Using PowerShell

### 1. Health Check
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/health" -Method Get
```

### 2. Create Inventory Item
```powershell
$body = @{
    sku = "LAPTOP001"
    name = @{
        en = "Dell Laptop"
        et = "Dell Sülearvuti"
        fi = "Dell-kannettava"
        ru = "Ноутбук Dell"
    }
    category = "Electronics"
    quantity = 50
    minQuantity = 10
    unit = "pcs"
    price = 899.99
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
    "Accept-Language" = "en"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/inventory" -Method Post -Body $body -Headers $headers
```

### 3. Get All Inventory
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/inventory" -Method Get
```

### 4. Update Quantity - Add Stock
```powershell
$body = @{
    quantityChange = 25
    operation = "add"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/inventory/{id}" -Method Patch -Body $body -ContentType "application/json"
```

### 5. Update Quantity - Remove Stock
```powershell
$body = @{
    quantityChange = 10
    operation = "subtract"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/inventory/{id}" -Method Patch -Body $body -ContentType "application/json"
```

---

## Using JavaScript (Fetch API)

### 1. Get All Inventory
```javascript
fetch('http://localhost:5000/api/inventory', {
  headers: {
    'Accept-Language': 'en'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

### 2. Create Inventory Item
```javascript
fetch('http://localhost:5000/api/inventory', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept-Language': 'en'
  },
  body: JSON.stringify({
    sku: 'LAPTOP001',
    name: {
      en: 'Dell Laptop',
      et: 'Dell Sülearvuti',
      fi: 'Dell-kannettava',
      ru: 'Ноутбук Dell'
    },
    category: 'Electronics',
    quantity: 50,
    minQuantity: 10,
    unit: 'pcs',
    price: 899.99
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

### 3. Update Quantity (Add Stock)
```javascript
fetch('http://localhost:5000/api/inventory/{id}', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Accept-Language': 'en'
  },
  body: JSON.stringify({
    quantityChange: 25,
    operation: 'add'
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

### 4. Update Quantity (Remove Stock)
```javascript
fetch('http://localhost:5000/api/inventory/{id}', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Accept-Language': 'ru'
  },
  body: JSON.stringify({
    quantityChange: 10,
    operation: 'subtract'
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

---

## Testing i18n Support

### English
```bash
curl http://localhost:5000/api/inventory/invalid-id \
  -H "Accept-Language: en"
```
Response: "Resource not found"

### Estonian
```bash
curl http://localhost:5000/api/inventory/invalid-id \
  -H "Accept-Language: et"
```
Response: "Ressurssi ei leitud"

### Finnish
```bash
curl http://localhost:5000/api/inventory/invalid-id \
  -H "Accept-Language: fi"
```
Response: "Resurssia ei löytynyt"

### Russian
```bash
curl http://localhost:5000/api/inventory/invalid-id \
  -H "Accept-Language: ru"
```
Response: "Ресурс не найден"

---

## Expected Response Formats

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message in requested language"
}
```

### List Response
```json
{
  "success": true,
  "count": 10,
  "data": [...]
}
```
