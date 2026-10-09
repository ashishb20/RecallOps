import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);

    // Ensure indexes (task indexes only; user indexes auto-created from schema unique: true)
    await Promise.all([
      conn.connection.db.collection('tasks').createIndex({ user: 1, nextReviewDate: 1 }),
      conn.connection.db.collection('tasks').createIndex({ user: 1, completed: 1 }),
      conn.connection.db.collection('tasks').createIndex({ nextReviewDate: 1 }),
    ]);
    console.log('MongoDB indexes ensured');

    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to MongoDB');
    });
    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error: ', err);
    });
    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected from MongoDB');
    });
    return conn;
  } catch (error) {
    console.error(`MongoDB connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;