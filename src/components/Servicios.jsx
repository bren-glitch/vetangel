import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, DollarSign, Edit } from 'lucide-react';

const Servicios = () => {
    const [servicios, setServicios] = useState([]);

    // Estados para el modal de CREAR/EDITAR
    const [modalFormulario, setModalFormulario] = useState(false);
    const [editandoId, setEditandoId] = useState(null);

    // Estados para el modal de COBRO
    const [modalCobro, setModalCobro] = useState(false);
    const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
    const [metodoPago, setMetodoPago] = useState('Efectivo');

    // NUEVO: Estado para el billete/monto con el que paga
    const [montoRecibido, setMontoRecibido] = useState('');

    // Estados del formulario
    const [nombre, setNombre] = useState('');
    const [desc, setDesc] = useState('');
    const [precio, setPrecio] = useState('');

    // Estados del formulario de cobro
    const [mascota, setMascota] = useState('');
    const [dueno, setDueno] = useState('');

    const cargarServicios = () => {
        fetch('http://localhost:3000/api/servicios')
            .then(res => res.json())
            .then(data => setServicios(data));
    };

    useEffect(() => { cargarServicios(); }, []);

    // --- ABRIR MODALES ---
    const abrirModalCrear = () => {
        setEditandoId(null);
        setNombre(''); setDesc(''); setPrecio('');
        setModalFormulario(true);
    };

    const abrirModalEditar = (e, servicio) => {
        e.stopPropagation();
        setEditandoId(servicio.id);
        setNombre(servicio.nombre);
        setDesc(servicio.desc);
        setPrecio(servicio.precio);
        setModalFormulario(true);
    };

    const abrirModalCobro = (servicio) => {
        setServicioSeleccionado(servicio);
        setMascota(''); setDueno(''); setMetodoPago('Efectivo');
        setMontoRecibido(''); // Limpiamos el monto al abrir
        setModalCobro(true);
    };

    // --- GUARDAR SERVICIO (CREAR O EDITAR) ---
    const guardarServicio = (e) => {
        e.preventDefault();
        const imagenPorDefecto = 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80';

        const datos = { nombre, desc, precio };
        if (!editandoId) datos.img = imagenPorDefecto;

        const url = editandoId
            ? `http://localhost:3000/api/servicios/${editandoId}`
            : 'http://localhost:3000/api/servicios';

        const metodo = editandoId ? 'PUT' : 'POST';

        fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        }).then(() => {
            cargarServicios();
            setModalFormulario(false);
        });
    };

    // --- ELIMINAR SERVICIO ---
    const eliminarServicio = (e, id) => {
        e.stopPropagation();
        if (window.confirm("¿Estás seguro de eliminar este servicio?")) {
            fetch(`http://localhost:3000/api/servicios/${id}`, { method: 'DELETE' })
                .then(() => cargarServicios());
        }
    };

    // --- PROCESAR COBRO ---
    const procesarCobro = (e) => {
        e.preventDefault();

        const nuevoPago = {
            folio: `#${Math.floor(Math.random() * 10000)}`,
            concepto: `${servicioSeleccionado.nombre} - ${mascota}`,
            monto: servicioSeleccionado.precio,
            estado: 'Pagado',
            fecha: new Date().toLocaleDateString(),
            metodo: metodoPago
        };

        fetch('http://localhost:3000/api/pagos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoPago)
        }).then(() => {
            // Si es efectivo, mostramos el cambio en el mensaje
            let mensaje = `¡Cobro exitoso a ${dueno} por ${mascota} vía ${metodoPago}!`;
            if (metodoPago === 'Efectivo' && montoRecibido) {
                const cambio = parseFloat(montoRecibido) - parseFloat(servicioSeleccionado.precio.replace('$', ''));
                mensaje += `\n\nCambio a devolver: $${cambio.toFixed(2)}`;
            }
            alert(mensaje);
            setModalCobro(false);
        });
    };

    // --- NUEVA FUNCIÓN: CALCULAR CAMBIO DINÁMICAMENTE ---
    const calcularCambio = () => {
        if (!montoRecibido || !servicioSeleccionado) return null;

        // Limpiamos el string del precio ($250.00 -> 250.00) para poder restar
        const precioLimpio = parseFloat(servicioSeleccionado.precio.replace('$', ''));
        const recibido = parseFloat(montoRecibido);

        if (isNaN(recibido)) return null;

        const cambio = recibido - precioLimpio;
        return cambio;
    };

    const cambioActual = calcularCambio();

    return (
        <div>
            <div className="header">
                <div>
                    <h1>Servicios</h1>
                    <p className="subtitle">Ofrece servicios veterinarios con precios personalizados.</p>
                </div>
                <button className="btn-primary" onClick={abrirModalCrear}>
                    <Plus size={18} /> Nuevo servicio
                </button>
            </div>

            <div className="grid-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {servicios.map((servicio) => (
                    <div
                        key={servicio.id}
                        className="card"
                        style={{ display: 'flex', flexDirection: 'column', padding: '15px', cursor: 'pointer' }}
                        onClick={() => abrirModalCobro(servicio)}
                    >
                        <img src={servicio.img} alt={servicio.nombre} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '10px', marginBottom: '15px' }} />
                        <h4 style={{ fontSize: '1rem', marginBottom: '5px' }}>{servicio.nombre}</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)', marginBottom: '15px', flex: 1 }}>{servicio.desc}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{servicio.precio}</span>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <Edit size={18} color="var(--primary-green)" style={{ cursor: 'pointer' }} onClick={(e) => abrirModalEditar(e, servicio)} />
                                <Trash2 size={18} color="#d32f2f" style={{ cursor: 'pointer' }} onClick={(e) => eliminarServicio(e, servicio.id)} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL DE CREAR / EDITAR SERVICIO */}
            {modalFormulario && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '400px', padding: '25px', position: 'relative' }}>
                        <button onClick={() => setModalFormulario(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer' }}>
                            <X size={24} color="var(--text-gray)" />
                        </button>

                        <h2 style={{ marginBottom: '20px', color: 'var(--primary-green)' }}>
                            {editandoId ? 'Editar Servicio' : 'Nuevo Servicio'}
                        </h2>

                        <form onSubmit={guardarServicio} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Nombre</label>
                                <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Descripción</label>
                                <input type="text" required value={desc} onChange={(e) => setDesc(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Precio</label>
                                <input type="text" required value={precio} onChange={(e) => setPrecio(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px' }} />
                            </div>

                            <button type="submit" className="btn-primary" style={{ marginTop: '10px', justifyContent: 'center' }}>
                                {editandoId ? 'Guardar Cambios' : 'Crear Servicio'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL DE COBRO */}
            {modalCobro && servicioSeleccionado && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '400px', padding: '25px', position: 'relative' }}>
                        <button onClick={() => setModalCobro(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer' }}>
                            <X size={24} color="var(--text-gray)" />
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: 'var(--primary-green)' }}>
                            <DollarSign size={28} />
                            <h2>Cobrar Servicio</h2>
                        </div>

                        <div style={{ backgroundColor: 'var(--light-green)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                            <p style={{ fontSize: '0.9rem', fontWeight: '500' }}>Servicio: <span style={{ fontWeight: 'normal' }}>{servicioSeleccionado.nombre}</span></p>
                            <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-green)', marginTop: '5px' }}>Total a pagar: {servicioSeleccionado.precio}</p>
                        </div>

                        <form onSubmit={procesarCobro} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Nombre de la mascota</label>
                                <input type="text" required value={mascota} onChange={(e) => setMascota(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Nombre del dueño</label>
                                <input type="text" required value={dueno} onChange={(e) => setDueno(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px' }} />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Método de Pago</label>
                                <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px', backgroundColor: 'white' }}>
                                    <option value="Efectivo">Efectivo</option>
                                    <option value="Tarjeta">Tarjeta</option>
                                    <option value="Transferencia">Transferencia</option>
                                </select>
                            </div>

                            {/* NUEVO: CAMPOS SOLO PARA EFECTIVO */}
                            {metodoPago === 'Efectivo' && (
                                <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
                                    <label style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--primary-green)' }}>¿Con cuánto paga el cliente?</label>
                                    <input
                                        type="number"
                                        value={montoRecibido}
                                        onChange={(e) => setMontoRecibido(e.target.value)}
                                        placeholder="Ej. 500"
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px', fontSize: '1.1rem' }}
                                    />

                                    {/* Muestra el cambio calculado en vivo */}
                                    {montoRecibido && (
                                        <div style={{ marginTop: '10px', fontSize: '1.1rem', fontWeight: 'bold', color: cambioActual >= 0 ? 'var(--primary-green)' : '#d32f2f' }}>
                                            {cambioActual >= 0
                                                ? `Cambio a devolver: $${cambioActual.toFixed(2)}`
                                                : `Falta dinero: $${Math.abs(cambioActual).toFixed(2)}`}
                                        </div>
                                    )}
                                </div>
                            )}

                            <button type="submit" className="btn-primary" style={{ marginTop: '10px', justifyContent: 'center' }}>
                                Confirmar Pago
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Servicios;