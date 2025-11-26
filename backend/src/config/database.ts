import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rifa';
    
    await mongoose.connect(mongoURI);
    
    console.log(' MongoDB conectado exitosamente');
  } catch (error) {
    console.error(' Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB desconectado');
});
