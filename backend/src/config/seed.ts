import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Inventory from '../models/Inventory';
import User, { UserRole } from '../models/User';
import { connectDB } from '../config/db';

// Load environment variables
dotenv.config();

/**
 * Sample inventory data for testing
 */
const sampleData = [
  {
    sku: 'LAPTOP001',
    name: {
      en: 'Dell Latitude 5520',
      et: 'Dell Latitude 5520 sülearvuti',
      fi: 'Dell Latitude 5520 kannettava',
      ru: 'Ноутбук Dell Latitude 5520',
    },
    category: 'Electronics',
    quantity: 25,
    minQuantity: 5,
    unit: 'pcs',
    unitPrice: 899.99,
    location: 'Warehouse A',
    supplier: 'Dell',
  },
  {
    sku: 'DESK001',
    name: {
      en: 'Office Desk Standard',
      et: 'Kontorilaud standardne',
      fi: 'Toimistopöytä standardi',
      ru: 'Офисный стол стандартный',
    },
    category: 'Furniture',
    quantity: 15,
    minQuantity: 3,
    unit: 'pcs',
    unitPrice: 299.00,
    location: 'Warehouse B',
    supplier: 'IKEA',
  },
  {
    sku: 'CHAIR001',
    name: {
      en: 'Ergonomic Office Chair',
      et: 'Ergonoomiline kontoritool',
      fi: 'Ergonominen toimistotuoli',
      ru: 'Эргономичное офисное кресло',
    },
    category: 'Furniture',
    quantity: 30,
    minQuantity: 10,
    unit: 'pcs',
    unitPrice: 189.99,
    location: 'Warehouse B',
    supplier: 'Herman Miller',
  },
  {
    sku: 'PAPER001',
    name: {
      en: 'A4 Copy Paper 80gsm',
      et: 'A4 kopeerimispaber 80gsm',
      fi: 'A4 kopiopaperi 80gsm',
      ru: 'Бумага для копирования A4 80gsm',
    },
    category: 'Office Supplies',
    quantity: 500,
    minQuantity: 100,
    unit: 'box',
    unitPrice: 4.99,
    location: 'Warehouse C',
    supplier: 'Office Depot',
  },
  {
    sku: 'MONITOR001',
    name: {
      en: 'Dell 27" 4K Monitor',
      et: 'Dell 27" 4K monitor',
      fi: 'Dell 27" 4K näyttö',
      ru: 'Монитор Dell 27" 4K',
    },
    category: 'Electronics',
    quantity: 20,
    minQuantity: 5,
    unit: 'pcs',
    unitPrice: 449.00,
    location: 'Warehouse A',
    supplier: 'Dell',
  },
  {
    sku: 'CABLE001',
    name: {
      en: 'HDMI Cable 2m',
      et: 'HDMI kaabel 2m',
      fi: 'HDMI-kaapeli 2m',
      ru: 'HDMI кабель 2м',
    },
    category: 'Electronics',
    quantity: 100,
    minQuantity: 20,
    unit: 'pcs',
    unitPrice: 9.99,
    location: 'Warehouse C',
    supplier: 'AmazonBasics',
  },
  {
    sku: 'CLEAN001',
    name: {
      en: 'Multi-Surface Cleaner 5L',
      et: 'Universaalne puhastusvahend 5L',
      fi: 'Yleispuhdistusaine 5L',
      ru: 'Универсальное чистящее средство 5Л',
    },
    category: 'Cleaning',
    quantity: 45,
    minQuantity: 10,
    unit: 'L',
    unitPrice: 12.50,
    location: 'Warehouse C',
    supplier: 'Clorox',
  },
  {
    sku: 'KEYBOARD001',
    name: {
      en: 'Wireless Keyboard & Mouse',
      et: 'Juhtmevaba klaviatuur ja hiir',
      fi: 'Langaton näppäimistö ja hiiri',
      ru: 'Беспроводная клавиатура и мышь',
    },
    category: 'Electronics',
    quantity: 35,
    minQuantity: 10,
    unit: 'set',
    unitPrice: 49.99,
    location: 'Warehouse A',
    supplier: 'Logitech',
  },
  {
    sku: 'CABINET001',
    name: {
      en: 'Filing Cabinet 4-Drawer',
      et: 'Dokumendikapp 4 sahtliga',
      fi: 'Arkistokaappi 4-vetolaatikkoinen',
      ru: 'Картотечный шкаф 4 ящика',
    },
    category: 'Furniture',
    quantity: 8,
    minQuantity: 2,
    unit: 'pcs',
    unitPrice: 179.00,
    location: 'Warehouse B',
    supplier: 'Steelcase',
  },
  {
    sku: 'LAMP001',
    name: {
      en: 'LED Desk Lamp',
      et: 'LED laualamp',
      fi: 'LED-pöytävalaisin',
      ru: 'Светодиодная настольная лампа',
    },
    category: 'Electronics',
    quantity: 50,
    minQuantity: 15,
    unit: 'pcs',
    unitPrice: 29.99,
    location: 'Warehouse A',
    supplier: 'Philips',
  },
];

/**
 * Seed database with sample data
 */
const seedDatabase = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Inventory.deleteMany({});
    await User.deleteMany({});

    // Drop old indexes from User collection (removes old email_1 index)
    try {
      await User.collection.dropIndexes();
      console.log('🔧 Dropped old indexes from users collection');
    } catch (err) {
      console.log('ℹ️  No indexes to drop or already clean');
    }

    // Create default admin user
    console.log('👤 Creating default admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      username: 'admin',
      password: hashedPassword,
      name: 'Administrator',
      role: UserRole.ADMIN,
      isActive: true
    });
    console.log('✅ Default admin created: username="admin", password="admin123"');

    // Insert sample inventory data
    console.log('📦 Inserting sample inventory data...');
    await Inventory.insertMany(sampleData);

    console.log(`✅ Successfully seeded ${sampleData.length} inventory items`);
    console.log('\nSample items:');
    sampleData.forEach((item) => {
      console.log(`  - ${item.sku}: ${item.name.en} (${item.quantity} ${item.unit})`);
    });

    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Database seeding completed');
    console.log('\n🔐 Login credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();
