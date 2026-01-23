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
    installDate: new Date('2020-01-15'),
    
    // Calendar-based maintenance (every 6 months)
    maintenanceInterval: {
      value: 6,
      unit: 'months',
    },
    lastService: {
      date: new Date('2024-01-01'),
      hours: 1000,
    },
    currentHours: 1450,
    
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
    installDate: new Date('2019-06-20'),
    
    // Hours-based maintenance (every 500 hours) - URGENT
    maintenanceInterval: {
      value: 500,
      unit: 'hours',
    },
    lastService: {
      date: new Date('2023-12-01'),
      hours: 800,
    },
    currentHours: 1285, // 15 hours over due!
    
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
    installDate: new Date('2021-03-10'),
    
    // Monthly maintenance - URGENT (overdue by days)
    maintenanceInterval: {
      value: 1,
      unit: 'months',
    },
    lastService: {
      date: new Date('2024-12-15'),
      hours: 450,
    },
    currentHours: 485,
    
    checklistTemplate: [
      { task: 'Check hydraulic fluid level', required: true },
      { task: 'Inspect hoses for leaks', required: true },
      { task: 'Test safety systems', required: true },
      { task: 'Lubricate ram', required: true },
    ],
  },
  
  {
    name: 'Welding Robot RX-400',
    type: 'Welding Robot',
    model: 'RX-400',
    serialNumber: 'WELD-004',
    manufacturer: 'FANUC',
    status: 'operational',
    location: 'Workshop C',
    installDate: new Date('2022-08-01'),
    
    // Hours-based (every 1000 hours) - Still good
    maintenanceInterval: {
      value: 1000,
      unit: 'hours',
    },
    lastService: {
      date: new Date('2024-01-10'),
      hours: 500,
    },
    currentHours: 920,
    
    checklistTemplate: [
      { task: 'Clean welding torch', required: true },
      { task: 'Check cable connections', required: true },
      { task: 'Inspect robot arm joints', required: true },
      { task: 'Update software if needed', required: false },
      { task: 'Test emergency stop', required: true },
    ],
  },
  
  {
    name: 'Lathe L-250',
    type: 'Manual Lathe',
    model: 'L-250',
    serialNumber: 'LATHE-005',
    manufacturer: 'OPTIMUM',
    status: 'operational',
    location: 'Workshop A',
    installDate: new Date('2018-05-15'),
    
    // 3-month maintenance - WARNING (1 week left)
    maintenanceInterval: {
      value: 3,
      unit: 'months',
    },
    lastService: {
      date: new Date('2024-10-25'),
      hours: 200,
    },
    currentHours: 245,
    
    checklistTemplate: [
      { task: 'Change gearbox oil', required: true },
      { task: 'Adjust tailstock', required: false },
      { task: 'Check chuck jaws', required: true },
      { task: 'Clean bed ways', required: true },
    ],
  },
  
  {
    name: 'Grinding Machine GR-150',
    type: 'Surface Grinder',
    model: 'GR-150',
    serialNumber: 'GRIND-006',
    manufacturer: 'BLOHM',
    status: 'operational',
    location: 'Workshop B',
    installDate: new Date('2020-11-20'),
    
    // No maintenance schedule yet
    currentHours: 320,
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
    // @ts-ignore - static method exists
    const urgent = await Equipment.getUrgentEquipment(10);
    console.log(`\n⚠️  Found ${urgent.length} urgent equipment items:`);
    urgent.forEach((eq: any) => {
      console.log(`  - ${eq.name}: ${eq.nextServiceData?.percentRemaining.toFixed(0)}% remaining`);
    });
    
    console.log('\n✅ Equipment seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding equipment:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedEquipment();
}
