# 🎟️ Sistema de Venta de Boletas

Sistema de venta de boletas numeradas del 1 al 100 con pasarela de pago integrada.

## ✨ Características

- 100 boletas numeradas con estados visuales en tiempo real
- Sistema de reservas temporales (10 minutos)
- Integración con pasarela de pago Wompi
- Liberación automática de reservas expiradas
- UI moderna y responsive
- Modo demo (funciona sin Wompi configurado)

## 🛠️ Stack Tecnológico

**Backend:** Node.js + Express + TypeScript + MongoDB  
**Frontend:** React + Vite + TypeScript + TailwindCSS  
**Pago:** Wompi  
**Deploy:** Vercel (Frontend) + Render (Backend)

## 📁 Estructura

```
Rifa/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuración MongoDB
│   │   ├── controllers/     # Lógica de negocio
│   │   ├── models/          # Modelos de datos
│   │   ├── routes/          # Rutas API
│   │   ├── scripts/         # Script para crear boletas
│   │   ├── types/           # Tipos TypeScript
│   │   ├── utils/           # Utilidades (cron jobs)
│   │   └── index.ts         # Entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/      # Componentes React
    │   ├── pages/           # Páginas
    │   ├── services/        # API calls
    │   ├── types/           # Tipos TypeScript
    │   └── main.tsx         # Entry point
    ├── .env.example
    └── package.json
```

## 🚀 Instalación Local

### 1. Clonar repositorio
```bash
git clone <tu-repo>
cd Rifa
```

### 2. Backend
```bash
cd backend
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales

# Crear las 100 boletas en MongoDB
npm run seed

# Iniciar servidor
npm run dev
```

### 3. Frontend
```bash
cd frontend
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env

# Iniciar aplicación
npm run dev
```

Abre http://localhost:5173

## ⚙️ Variables de Entorno

### Backend (.env)
```env
PORT=5000
MONGODB_URI=tu_mongodb_connection_string
NODE_ENV=development
WOMPI_PUBLIC_KEY=pub_test_xxxxx
WOMPI_PRIVATE_KEY=prv_test_xxxxx
WOMPI_EVENT_SECRET=xxxxx
WOMPI_CALLBACK_URL=https://tu-backend.com/api/webhooks/wompi
FRONTEND_URL=https://tu-frontend.com
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_WOMPI_PUBLIC_KEY=pub_test_xxxxx
```

## 🌐 Deployment en Producción

### Frontend en Vercel

1. **Subir a GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/tu-usuario/rifa.git
git push -u origin main
```

2. **Deploy en Vercel**
   - Ve a https://vercel.com
   - Click "Import Project"
   - Selecciona tu repositorio
   - Configura:
     - **Root Directory:** `frontend`
     - **Framework Preset:** Vite
   - Agrega las variables de entorno:
     - `VITE_API_URL`
     - `VITE_WOMPI_PUBLIC_KEY`
   - Click "Deploy"

### Backend en Render

1. **Crear Web Service**
   - Ve a https://render.com
   - Click "New" → "Web Service"
   - Conecta tu repositorio GitHub

2. **Configuración**
   - **Name:** rifa-backend
   - **Root Directory:** `backend`
   - **Environment:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`

3. **Variables de Entorno**
   - Agrega todas las variables del `.env.example`
   - Usa la URL de Render para `WOMPI_CALLBACK_URL`
   - Usa la URL de Vercel para `FRONTEND_URL`

4. **Crear las boletas**
   - Después del deploy, ejecuta el seed desde local con MongoDB URI de producción

### MongoDB Atlas

1. Crea cuenta en https://mongodb.com/cloud/atlas
2. Crea un cluster gratuito (M0)
3. En "Database Access": crea un usuario
4. En "Network Access": agrega `0.0.0.0/0` (permitir todas las IPs)
5. Copia el connection string y úsalo en `MONGODB_URI`

### Configurar Wompi

1. Crea cuenta en https://wompi.com
2. Obtén tus credenciales en el dashboard
3. Configura el webhook:
   - URL: `https://tu-backend.onrender.com/api/webhooks/wompi`
   - Eventos: `transaction.updated`

## 📡 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/boletas` | Listar todas las boletas |
| GET | `/api/boletas/:numero` | Obtener una boleta |
| POST | `/api/boletas/:numero/reservar` | Reservar boleta |
| GET | `/api/boletas/estadisticas` | Estadísticas |
| POST | `/api/pagos/crear` | Crear pago |
| GET | `/api/pagos/:transactionId` | Consultar pago |
| POST | `/api/webhooks/wompi` | Webhook Wompi |

## 🎨 Estados de Boletas

- 🟢 **Verde (Disponible)** - Puede ser comprada
- 🔴 **Rojo (Pagada)** - Ya vendida

Las boletas reservadas se liberan automáticamente después de 10 minutos.

## 🎭 Modo Demo

El sistema incluye modo demo que funciona sin Wompi:
- Los pagos se aprueban automáticamente en 5 segundos
- Útil para testing y mostrar funcionalidad
- Se activa automáticamente si las credenciales de Wompi son de prueba

## 🔧 Comandos Útiles

```bash
# Backend
npm run dev        # Desarrollo
npm run build      # Compilar
npm start          # Producción
npm run seed       # Crear boletas

# Frontend
npm run dev        # Desarrollo
npm run build      # Compilar
npm run preview    # Vista previa
```

## 🆘 Solución de Problemas

**Error: Cannot connect to MongoDB**
- Verifica el connection string en `MONGODB_URI`
- Asegúrate de permitir tu IP en MongoDB Atlas

**Las boletas no aparecen**
- Ejecuta `npm run seed` en el backend
- Verifica que MongoDB esté conectado

**Error al reservar boleta**
- Revisa que el backend esté corriendo
- Verifica CORS en backend (variable `FRONTEND_URL`)

**Webhooks no funcionan en local**
- Es normal, Wompi no puede alcanzar localhost
- Usa ngrok para testing local: https://ngrok.com

## 📄 Licencia

ISC
