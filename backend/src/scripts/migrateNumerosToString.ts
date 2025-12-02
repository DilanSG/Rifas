import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Conectar a MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/rifas';
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error);
    process.exit(1);
  }
};

// Script de migración
const migrarNumerosAString = async () => {
  try {
    await connectDB();

    const db = mongoose.connection.db;
    const boletasCollection = db?.collection('boletas');

    if (!boletasCollection) {
      throw new Error('No se pudo acceder a la colección de boletas');
    }

    // Obtener todas las boletas
    const boletas = await boletasCollection.find({}).toArray();
    console.log(`\n📊 Total de boletas encontradas: ${boletas.length}`);

    let migradas = 0;
    let yaString = 0;
    let errores = 0;

    for (const boleta of boletas) {
      try {
        const numeroActual = boleta.numero;

        // Verificar si ya es string
        if (typeof numeroActual === 'string') {
          yaString++;
          console.log(`⏭️  Boleta ${numeroActual} ya es string, saltando...`);
          continue;
        }

        // Convertir de int a string con formato 00-99
        // Si el número es 1-100, convertirlo a 0-99 con padding
        let nuevoNumero: string;
        
        if (numeroActual >= 1 && numeroActual <= 100) {
          // Convertir 1-100 a 00-99
          const numeroAjustado = numeroActual - 1;
          nuevoNumero = numeroAjustado.toString().padStart(2, '0');
        } else {
          // Si está fuera de rango, mantener con padding
          nuevoNumero = numeroActual.toString().padStart(2, '0');
        }

        // Actualizar en la base de datos
        await boletasCollection.updateOne(
          { _id: boleta._id },
          { $set: { numero: nuevoNumero } }
        );

        migradas++;
        console.log(`✅ Boleta migrada: ${numeroActual} → "${nuevoNumero}" (Estado: ${boleta.estado})`);
        
      } catch (error) {
        errores++;
        console.error(`❌ Error al migrar boleta ${boleta.numero}:`, error);
      }
    }

    console.log('\n📈 Resumen de migración:');
    console.log(`   ✅ Boletas migradas: ${migradas}`);
    console.log(`   ⏭️  Ya eran string: ${yaString}`);
    console.log(`   ❌ Errores: ${errores}`);
    console.log(`   📊 Total procesadas: ${boletas.length}`);

    // Verificar el resultado
    console.log('\n🔍 Verificando resultado...');
    const boletasActualizadas = await boletasCollection.find({}).sort({ numero: 1 }).toArray();
    console.log('\nPrimeras 10 boletas después de la migración:');
    boletasActualizadas.slice(0, 10).forEach(b => {
      console.log(`   Número: "${b.numero}" (tipo: ${typeof b.numero}) - Estado: ${b.estado}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Migración completada y conexión cerrada');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Ejecutar migración
migrarNumerosAString();
