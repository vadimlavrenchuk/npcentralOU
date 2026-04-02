/**
 * Equipment Seed Data with Preventive Maintenance
 * Use this to populate the database with sample equipment for testing
 */

import dotenv from 'dotenv';
import Equipment from '../models/Equipment';
import { connectDB } from './db';

// Load environment variables
dotenv.config();

const sampleEquipment = [
  {
    name: 'CNC Lathe TL-3000',
    type: 'CNC Machine',
    model: 'TL-3000',
    serialNumber: 'CNC-001',
    manufacturer: 'HAAS Automation',
    status: 'operational',
    location: 'Workshop A',
    installDate: new Date('2023-01-15'),
    
    // Calendar-based maintenance (every 6 months)
    maintenanceInterval: {
      value: 6,
      unit: 'months',
    },
    lastService: {
      date: new Date(Date.now()),
      hours: 100,
    },
    currentHours: 150,
    
    checklistTemplate: [
      { task: 'Change hydraulic oil', required: true },
      { task: 'Check and adjust belts', required: true },
      { task: 'Lubricate all moving parts', required: true },
      { task: 'Inspect electrical connections', required: true },
      { task: 'Clean coolant tank', required: false },
      { task: 'Check tool calibration', required: true },
    ],
  },
  
  {
    name: 'Milling Machine VM-500',
    type: 'Milling Machine',
    model: 'VM-500',
    serialNumber: 'MILL-002',
    manufacturer: 'DMG MORI',
    status: 'operational',
    location: 'Workshop B',
    installDate: new Date('2023-06-20'),
    
    // Hours-based maintenance (every 500 hours)
    maintenanceInterval: {
      value: 500,
      unit: 'hours',
    },
    lastService: {
      date: new Date(Date.now()),
      hours: 200,
    },
    currentHours: 250,
    
    checklistTemplate: [
      { task: 'Replace spindle oil', required: true },
      { task: 'Check ball screws', required: true },
      { task: 'Inspect cooling system', required: true },
      { task: 'Clean chip conveyor', required: false },
    ],
  },
  
  {
    name: 'Hydraulic Press HP-200',
    type: 'Hydraulic Press',
    model: 'HP-200',
    serialNumber: 'PRESS-003',
    manufacturer: 'Schuler',
    status: 'operational',
    location: 'Workshop A',
    installDate: new Date('2023-03-10'),
    
    // Monthly maintenance (every 30 days)
    maintenanceInterval: {
      value: 1,
      unit: 'months',
    },
    lastService: {
      date: new Date(Date.now()),
      hours: 80,
    },
    currentHours: 95,
    
    checklistTemplate: [
      { task: 'Check hydraulic fluid level', required: true },
      { task: 'Inspect hoses for leaks', required: true },
      { task: 'Test safety systems', required: true },
      { task: 'Lubricate ram', required: true },
    ],
  },
];

/**
 * Seed the database with sample equipment
 */
export async function seedEquipment() {
  try {
    console.log('🌱 Seeding equipment data...');
    
    await connectDB();
    
    // Clear existing equipment
    await Equipment.deleteMany({});
    console.log('✓ Cleared existing equipment');
    
    // Insert sample equipment
    const created = await Equipment.insertMany(sampleEquipment);
    console.log(`✓ Created ${created.length} equipment items`);
    
    // Display urgent equipment
    const urgent = await Equipment.find({});
    console.log(`\n⚠️  Found ${urgent.length} equipment items`);
    
    console.log('\n✅ Equipment seeding complete!');
  } catch (error) {
    console.error('❌ Error seeding equipment:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedEquipment();
}
