import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración para rutas de archivos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ==========================================
// CONEXIÓN A MONGODB ATLAS
// ==========================================
const MONGO_URI = 'mongodb+srv://brenebulosa:Odioso95@cluster0.znpr9ou.mongodb.net/vetangel?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Conectado a MongoDB Atlas'))
    .catch(err => console.error('❌ Error de conexión:', err));

// ==========================================
// ESQUEMAS DE LA BASE DE DATOS
// ==========================================
const Propietario = mongoose.model('Propietario', new mongoose.Schema({}, { strict: false }));
const Mascota = mongoose.model('Mascota', new mongoose.Schema({}, { strict: false }));
const Cita = mongoose.model('Cita', new mongoose.Schema({}, { strict: false }));
const Consulta = mongoose.model('Consulta', new mongoose.Schema({}, { strict: false }));
const Servicio = mongoose.model('Servicio', new mongoose.Schema({}, { strict: false }));
const Tienda = mongoose.model('Tienda', new mongoose.Schema({}, { strict: false }));
const Pago = mongoose.model('Pago', new mongoose.Schema({}, { strict: false }));

// ==========================================
// RUTAS GENÉRICAS (Para no repetir código)
// ==========================================
const crearRutas = (ruta, modelo) => {
    // GET (Todos)
    app.get(`/api/${ruta}`, async (req, res) => {
        try {
            const datos = await modelo.find();
            res.json(datos);
        } catch (error) { res.status(500).json({ error: error.message }); }
    });

    // POST (Crear)
    app.post(`/api/${ruta}`, async (req, res) => {
        try {
            const nuevo = new modelo({ ...req.body, id: Date.now() });
            await nuevo.save();
            res.status(201).json(nuevo);
        } catch (error) { res.status(500).json({ error: error.message }); }
    });

    // PUT (Editar) - Corregido para usar el ID de MongoDB
    app.put(`/api/${ruta}/:id`, async (req, res) => {
        try {
            const actualizado = await modelo.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true }
            );
            res.json(actualizado);
        } catch (error) { res.status(500).json({ error: error.message }); }
    });

    // DELETE (Eliminar) - Corregido para usar el ID de MongoDB
    app.delete(`/api/${ruta}/:id`, async (req, res) => {
        try {
            await modelo.findByIdAndDelete(req.params.id);
            res.json({ ok: true });
        } catch (error) { res.status(500).json({ error: error.message }); }
    });
};

// Creamos las rutas para cada colección
crearRutas('propietarios', Propietario);
crearRutas('mascotas', Mascota);
crearRutas('citas', Cita);
crearRutas('consultas', Consulta);
crearRutas('servicios', Servicio);
crearRutas('tienda', Tienda);
crearRutas('pagos', Pago);

// ==========================================
// SERVIR EL FRONTEND (React)
// ==========================================
app.use(express.static(path.join(__dirname, 'dist')));
app.get('/*splat', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`✅ Servidor API corriendo en el puerto ${PORT}`);
});