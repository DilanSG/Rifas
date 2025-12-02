import { connectDB } from '../config/database';
import { Sorteo } from '../models/Sorteo';
import dotenv from 'dotenv';

dotenv.config();

async function resetSorteo() {
  try {
    await connectDB();
    
    // Eliminar registro de sorteo finalizado
    const result = await Sorteo.deleteMany({});
    
    console.log('✅ Sorteo eliminado exitosamente');
    console.log(`   Registros eliminados: ${result.deletedCount}`);
    console.log('');
    console.log('🎉 La página principal ahora mostrará la selección de boletas');
    console.log('   (Las boletas mantienen su estado actual)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al resetear sorteo:', error);
    process.exit(1);
  }
}

resetSorteo();
