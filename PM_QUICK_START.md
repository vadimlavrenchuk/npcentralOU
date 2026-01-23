# Quick Start - Preventive Maintenance System

## 🚀 Start the Application

### 1. Start Backend
```bash
cd backend
npm install
npm run dev
```
Server will start on http://localhost:5000

### 2. Start Frontend
```bash
npm install
npm run dev
```
Application will start on http://localhost:5173

### 3. Seed Test Data (Optional)
```bash
cd backend
npx ts-node src/config/seedEquipment.ts
```
This will create 6 sample equipment items with different maintenance statuses.

## 📊 Using the Dashboard

1. Open http://localhost:5173
2. Navigate to Dashboard
3. Look for "Tuleva huolto" / "Upcoming Maintenance" card
4. You'll see urgent equipment with:
   - Red progress bars (urgent)
   - Days/hours remaining
   - Current motor hours

## 🔧 Managing Equipment

### View Equipment
1. Go to "Equipment" page
2. Click on any equipment
3. Scroll to "Preventive Maintenance Status" section

### Update Motor Hours
1. Click "Update" button next to "Current Hours"
2. Enter new meter reading
3. Click "Update Hours"
4. System automatically recalculates next service

### Record Service Completion
1. After completing maintenance, open equipment detail
2. Click "Record Service Completion"
3. Confirm the action
4. System resets the maintenance counter

## 📝 Creating New Equipment with PM

```javascript
// Example: Calendar-based (every 6 months)
{
  "name": "CNC Machine",
  "type": "CNC",
  "model": "ABC-123",
  "serialNumber": "SN12345",
  "location": "Workshop A",
  "maintenanceInterval": {
    "value": 6,
    "unit": "months"
  },
  "lastService": {
    "date": "2024-01-01",
    "hours": 1000
  },
  "currentHours": 1250,
  "checklistTemplate": [
    { "task": "Change oil", "required": true },
    { "task": "Check belts", "required": true }
  ]
}

// Example: Hours-based (every 500 hours)
{
  "name": "Milling Machine",
  "type": "Mill",
  "model": "XYZ-500",
  "serialNumber": "SN67890",
  "location": "Workshop B",
  "maintenanceInterval": {
    "value": 500,
    "unit": "hours"
  },
  "lastService": {
    "date": "2023-12-01",
    "hours": 800
  },
  "currentHours": 1285
}
```

## 🎨 Understanding Status Colors

| Color | Status | Meaning |
|-------|--------|---------|
| 🟢 Green | Healthy | > 50% remaining |
| 🟡 Yellow | Attention | 25-50% remaining |
| 🟠 Orange | Warning | 10-25% remaining |
| 🔴 Red | Urgent | < 10% or overdue |

## 🔍 API Testing

### Get Urgent Equipment
```bash
curl http://localhost:5000/api/equipment/urgent?limit=5
```

### Update Hours
```bash
curl -X PATCH http://localhost:5000/api/equipment/:id/hours \
  -H "Content-Type: application/json" \
  -d '{"hours": 1250.5}'
```

### Record Service
```bash
curl -X POST http://localhost:5000/api/equipment/:id/service
```

### Get Maintenance Stats
```bash
curl http://localhost:5000/api/equipment/stats/maintenance
```

## 📱 Mobile Usage

All features work on mobile:
- ✅ View urgent equipment
- ✅ Update motor hours
- ✅ View maintenance checklists
- ✅ Record service completion

## 🌍 Language Support

Switch languages using the language selector:
- 🇬🇧 English
- 🇷🇺 Русский
- 🇫🇮 Suomi
- 🇪🇪 Eesti

## 🐛 Troubleshooting

### Equipment not showing as urgent?
- Check that `maintenanceInterval` is set
- Verify `lastService` date is in the past
- Ensure `currentHours` is close to next service threshold

### Motor hours update not working?
- New hours must be >= current hours
- Check API endpoint is accessible
- Verify equipment ID is correct

### Dashboard widget empty?
- Seed test data first
- Check backend is running
- Verify API connection

## 📞 Need Help?

1. Check [PREVENTIVE_MAINTENANCE.md](PREVENTIVE_MAINTENANCE.md) for detailed docs
2. Read [PM_SYSTEM_RU.md](PM_SYSTEM_RU.md) for Russian guide
3. Review API endpoints in backend controller
4. Check browser console for errors

## ✅ Ready to Use!

The PM system is fully functional and ready for production use. Start by seeding test data, then explore the dashboard and equipment pages.

**Happy maintaining! 🛠️**
