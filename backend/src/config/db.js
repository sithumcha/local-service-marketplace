import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/local-service-marketplace');
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Auto-seed master categories if collection is empty
    const Service = (await import('../models/Service.model.js')).default;
    const count = await Service.countDocuments();
    if (count === 0) {
      console.log('Seeding default master service categories...');
      await Service.create([
        { name: 'Plumbing Service', category: 'plumbing', icon: '🔧' },
        { name: 'Electrical Work', category: 'electrical', icon: '⚡' },
        { name: 'Academic Tutoring', category: 'tutor', icon: '📚' },
        { name: 'AC & Fridge Repair', category: 'ac-repair', icon: '❄️' },
        { name: 'Home Cleaning', category: 'cleaning', icon: '🧹' }
      ]);
      console.log('Master service categories seeded successfully.');
    }

    // Auto-seed default admin user if not exists
    const User = (await import('../models/User.model.js')).default;
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      console.log('Seeding default system administrator account...');
      await User.create({
        name: 'System Administrator',
        email: 'admin@quickserve.lk',
        password: 'adminpassword123',
        phone: '+94112345678',
        role: 'admin',
        isVerified: true
      });
      console.log('Admin account (admin@quickserve.lk / adminpassword123) seeded successfully.');
    }


  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
