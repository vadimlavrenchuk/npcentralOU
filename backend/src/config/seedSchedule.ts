import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User, { UserRole } from '../models/User';
import Schedule, { ScheduleType } from '../models/Schedule';
import { connectDB } from './db';

dotenv.config();

const sampleUsers = [
  {
    username: 'ivan.petrov',
    password: 'password123',
    name: 'Иван Петров',
    role: UserRole.MECHANIC,
    phoneNumber: '+372 5123 4567',
    emergencyContact: '+372 5987 6543'
  },
  {
    username: 'maria.ivanova',
    password: 'password123',
    name: 'Мария Иванова',
    role: UserRole.MECHANIC,
    phoneNumber: '+372 5234 5678',
    emergencyContact: '+372 5876 5432'
  },
  {
    username: 'sergey.sidorov',
    password: 'password123',
    name: 'Сергей Сидоров',
    role: UserRole.MECHANIC,
    phoneNumber: '+372 5345 6789',
    emergencyContact: '+372 5765 4321'
  },
  {
    username: 'elena.kuznetsova',
    password: 'password123',
    name: 'Елена Кузнецова',
    role: UserRole.ACCOUNTANT,
    phoneNumber: '+372 5456 7890',
    emergencyContact: '+372 5654 3210'
  },
  {
    username: 'dmitry.volkov',
    password: 'password123',
    name: 'Дмитрий Волков',
    role: UserRole.CHIEF_MECHANIC,
    phoneNumber: '+372 5567 8901',
    emergencyContact: '+372 5543 2109'
  }
];

const getRandomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const getRandomShiftHours = (): string => {
  const shifts = ['08:00-16:00', '09:00-17:00', '10:00-18:00', '16:00-00:00', '00:00-08:00'];
  return shifts[Math.floor(Math.random() * shifts.length)];
};

const seedSchedule = async () => {
  try {
    await connectDB();

    console.log('🔄 Starting schedule seed...');

    // Clear existing data
    await Schedule.deleteMany({});
    console.log('✅ Cleared existing schedules');

    // Check if users exist, if not create them
    let users = await User.find({ username: { $in: sampleUsers.map(u => u.username) } });
    
    if (users.length === 0) {
      console.log('📝 Creating sample users...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const usersToCreate = sampleUsers.map(user => ({
        ...user,
        password: hashedPassword,
        isActive: true
      }));

      users = await User.insertMany(usersToCreate);
      console.log(`✅ Created ${users.length} users`);
    } else {
      console.log(`✅ Found ${users.length} existing users`);
    }

    // Get admin user for createdBy field
    const adminUser = await User.findOne({ role: UserRole.ADMIN });
    if (!adminUser) {
      console.error('❌ Admin user not found. Please create admin user first.');
      process.exit(1);
    }

    // Generate schedule for current month and next month
    const schedules = [];
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);

    for (const user of users) {
      // Generate 15-20 shift days
      const numberOfShifts = Math.floor(Math.random() * 6) + 15; // 15-20 shifts
      
      for (let i = 0; i < numberOfShifts; i++) {
        const shiftDate = getRandomDate(startOfMonth, endOfNextMonth);
        
        schedules.push({
          userId: user._id,
          type: ScheduleType.SHIFT,
          startDate: new Date(shiftDate.setHours(0, 0, 0, 0)),
          endDate: new Date(shiftDate.setHours(23, 59, 59, 999)),
          shiftHours: getRandomShiftHours(),
          notes: '',
          createdBy: adminUser._id
        });
      }

      // Add 1-2 vacation or sick leave entries randomly
      if (Math.random() > 0.5) {
        const vacationType = Math.random() > 0.3 ? ScheduleType.VACATION : ScheduleType.SICK_LEAVE;
        const vacationStart = getRandomDate(startOfMonth, endOfNextMonth);
        const vacationDays = Math.floor(Math.random() * 5) + 2; // 2-6 days
        const vacationEnd = new Date(vacationStart);
        vacationEnd.setDate(vacationEnd.getDate() + vacationDays);

        schedules.push({
          userId: user._id,
          type: vacationType,
          startDate: vacationStart,
          endDate: vacationEnd,
          notes: vacationType === ScheduleType.VACATION ? 'Planned vacation' : 'Medical leave',
          createdBy: adminUser._id
        });
      }
    }

    // Sort by date and remove duplicates
    const uniqueSchedules = schedules.filter((schedule, index, self) => {
      return index === self.findIndex((s) => (
        s.userId.toString() === schedule.userId.toString() &&
        s.startDate.getTime() === schedule.startDate.getTime()
      ));
    });

    await Schedule.insertMany(uniqueSchedules);
    console.log(`✅ Created ${uniqueSchedules.length} schedule entries`);

    console.log('\n📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Schedule entries: ${uniqueSchedules.length}`);
    console.log('\n✅ Schedule seed completed successfully!');
    console.log('\n📝 Login credentials for all users:');
    console.log('   Password: password123');
    sampleUsers.forEach(user => {
      console.log(`   - ${user.username} (${user.role})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding schedule:', error);
    process.exit(1);
  }
};

seedSchedule();
