var equipment = db.equipment.find().toArray();

db.workorders.deleteMany({});

var orders = [
  {
    title: 'Scheduled Maintenance - VM-500',
    description: 'Regular maintenance service',
    equipmentId: equipment[0]._id,
    priority: 'medium',
    status: 'pending',
    estimatedHours: 4,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Hydraulic System Repair',
    description: 'Fix hydraulic leak',
    equipmentId: equipment[1]._id,
    priority: 'high',
    status: 'in_progress',
    estimatedHours: 8,
    actualHours: 3,
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Emergency Belt Replacement',
    description: 'Belt replacement due to wear',
    equipmentId: equipment[0]._id,
    priority: 'critical',
    status: 'pending',
    estimatedHours: 3,
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Monthly Inspection',
    description: 'Safety inspection completed',
    equipmentId: equipment[2]._id,
    priority: 'low',
    status: 'completed',
    estimatedHours: 2,
    actualHours: 1.5,
    completedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'CNC Calibration',
    description: 'Precision calibration service',
    equipmentId: equipment[2]._id,
    priority: 'medium',
    status: 'completed',
    estimatedHours: 5,
    actualHours: 4.5,
    completedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

var result = db.workorders.insertMany(orders);
print('Created ' + result.insertedIds.length + ' work orders');
