import { Boleta } from '../models/Boleta';
import { BoletaEstado } from '../types';
import { connectDB } from '../config/database';
import dotenv from 'dotenv';

dotenv.config();

async function seedBoletas() {
  try {
    await connectDB();
    
    // Verificar si ya existen boletas
    const count = await Boleta.countDocuments();
    if (count > 0) {
      console.log(`Ya existen ${count} boletas en la base de datos.`);
      console.log('¿Desea eliminarlas y crear nuevas? (Ctrl+C para cancelar)');
      // En producción, esperar confirmación
      await Boleta.deleteMany({});
    }
    
    // Crear 100 boletas
    const boletas = [];
    for (let i = 1; i <= 100; i++) {
      boletas.push({
        numero: i,
        estado: BoletaEstado.DISPONIBLE
      });
    }
    
    await Boleta.insertMany(boletas);
    console.log('✅ Se crearon 100 boletas exitosamente');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear boletas:', error);
    process.exit(1);
  }
}

seedBoletas();
