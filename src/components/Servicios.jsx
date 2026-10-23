import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Edit, Upload, CheckCircle } from 'lucide-react';

const Servicios = () => {
    const [servicios, setServicios] = useState([]);
    const [modalFormulario, setModalFormulario] = useState(false);
    const [modalCobro, setModalCobro] = useState(false);
    const [editandoId, setEditandoId] = useState(null);
    const [servicioSeleccionado, setServicioSeleccionado] = useState(null);

    // Formulario
    const [nombre, setNombre] = useState('');
    const [desc, setDesc] = useState('');
    const [precio, setPrecio] = useState('');
    const [fotoUrl, setFotoUrl] = useState('');
    const [fotoBase64, setFotoBase64] = useState('');

    // Cobro
    const [metodoPago, setMetodoPago] = useState('Efectivo');
    const [montoRecibido, setMontoRecibido] = useState('');
    const [mascota, setMascota] = useState('');

    const cargarServicios = () => {
        fetch('/api/servicios')
            .then(res => res.json())
            .then(data => setServicios(data))
            .catch(err => console.error("Error al cargar:", err));
    };

    useEffect(() => { cargarServicios(); }, []);

    const manejarSubidaImagen = (e) => {
        const archivo = e.target.files[0];
        if (archivo) {
            const reader = new FileReader();
            reader.onloadend = () => { setFotoBase64(reader.result); setFotoUrl(''); };
            reader.readAsDataURL(archivo);
        }
    };

    const abrirModalCrear = () => {
        setEditandoId(null);
        setNombre(''); setDesc(''); setPrecio(''); setFotoUrl(''); setFotoBase64('');
        setModalFormulario(true);
    };

    const abrirModalEditar = (e, servicio) => {
        e.stopPropagation();
        setEditandoId(servicio.id);
        setNombre(servicio.nombre);
        setDesc(servicio.desc);
        setPrecio(servicio.precio);
        if (servicio.img && servicio.img.startsWith('data:image')) {
            setFotoBase64(servicio.img); setFotoUrl('');
        } else {
            setFotoUrl(servicio.img || ''); setFotoBase64('');
        }
        setModalFormulario(true);
    };

    const guardarServicio = (e) => {
        e.preventDefault();
        const imagenPorDefecto = 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=300';
        let imagenFinal = imagenPorDefecto;
        if (fotoBase64) imagenFinal = fotoBase64;
        else if (fotoUrl) imagenFinal = fotoUrl;

        const datos = { nombre, desc, precio, img: imagenFinal };

        const url = editandoId
            ? `/api/servicios/${editandoId}`
            : '/api/servicios';
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

    // FUNCIÓN CORREGIDA PARA ELIMINAR
    const eliminarServicio = (e, id) => {
        e.stopPropagation();

        if (window.confirm("¿Eliminar este servicio?")) {
            // Usamos el ID directamente, sin convertirlo a número
            fetch(`/api/servicios/${id}`, { method: 'DELETE' })
                .then(res => {
                    if (!res.ok) throw new Error("Error en el servidor");
                    return res.json();
                })
                .then(() => {
                    cargarServicios(); // Recarga la lista si se borró con éxito
                })
                .catch(err => {
                    console.error("Error al eliminar:", err);
                    alert("No se pudo eliminar. Revisa la consola.");
                });
        }
    };

    const abrirModalCobro = (servicio) => {
        setServicioSeleccionado(servicio);
        setMetodoPago('Efectivo'); setMontoRecibido(''); setMascota('');
        setModalCobro(true);
    };

    const calcularCambio = () => {
        if (!montoRecibido || !servicioSeleccionado) return null;
        const precioLimpio = parseFloat(servicioSeleccionado.precio.replace('$', ''));
        const recibido = parseFloat(montoRecibido);
        if (isNaN(recibido)) return null;
        return recibido - precioLimpio;
    };
    const cambioActual = calcularCambio();

    const procesarCobro = (e) => {
        e.preventDefault();
        const nuevoPago = {
            folio: `#S-${Math.floor(Math.random() * 10000)}`,
            concepto: `Servicio: ${servicioSeleccionado.nombre} - ${mascota || 'Cliente'}`,
            monto: servicioSeleccionado.precio,
            estado: 'Pagado',
            fecha: new Date().toLocaleDateString(),
            metodo: metodoPago
        };

        fetch('/api/pagos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoPago)
        }).then(() => {
            let mensaje = `¡Cobro exitoso!`;
            if (metodoPago === 'Efectivo' && montoRecibido) mensaje += `\nCambio: $${cambioActual.toFixed(2)}`;
            alert(mensaje);
            setModalCobro(false);
        });
    };

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
                    <div key={servicio.id} className="card" style={{ padding: '15px', cursor: 'pointer' }} onClick={() => abrirModalCobro(servicio)}>
                        <img src={servicio.img} alt={servicio.nombre} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '10px', marginBottom: '15px' }} />
                        <h4 style={{ fontSize: '1rem', marginBottom: '5px' }}>{servicio.nombre}</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)', marginBottom: '15px', flex: 1 }}>{servicio.desc}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{servicio.precio}</span>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <Edit size={18} color="var(--primary-green)" onClick={(e) => abrirModalEditar(e, servicio._id)} />
                                <Trash2 size={18} color="#d32f2f" onClick={(e) => eliminarServicio(e, servicio._id)} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL CREAR/EDITAR */}
            {modalFormulario && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '400px', padding: '25px', position: 'relative' }}>
                        <button onClick={() => setModalFormulario(false)} style={{ position: 'absolute', top: '15px', right: '15px', border: 'none', background: 'none', cursor: 'pointer' }}><X size={24} /></button>
                        <h2 style={{ marginBottom: '20px', color: 'var(--primary-green)' }}>{editandoId ? 'Editar' : 'Nuevo'} Servicio</h2>
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
                                <input type="text" required value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="$0.00" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px' }} />
                            </div>
                            <div style={{ border: '1px dashed var(--border-color)', padding: '15px', borderRadius: '8px' }}>
                                <label style={{ fontSize: '0.9rem', fontWeight: '500', display: 'block', marginBottom: '10px' }}>Imagen del Servicio</label>
                                <label className="btn-primary" style={{ cursor: 'pointer', fontSize: '0.8rem', padding: '8px 12px', display: 'inline-flex' }}>
                                    <Upload size={16} /> Subir Foto
                                    <input type="file" accept="image/*" onChange={manejarSubidaImagen} style={{ display: 'none' }} />
                                </label>
                                {fotoBase64 && <span style={{ fontSize: '0.8rem', color: 'var(--primary-green)', marginLeft: '10px' }}>¡Cargada!</span>}
                            </div>
                            <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>{editandoId ? 'Guardar Cambios' : 'Crear Servicio'}</button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL COBRO */}
            {modalCobro && servicioSeleccionado && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '400px', padding: '25px', position: 'relative' }}>
                        <button onClick={() => setModalCobro(false)} style={{ position: 'absolute', top: '15px', right: '15px', border: 'none', background: 'none', cursor: 'pointer' }}><X size={24} /></button>
                        <h2 style={{ marginBottom: '20px', color: 'var(--primary-green)' }}>Cobrar: {servicioSeleccionado.nombre}</h2>
                        <form onSubmit={procesarCobro} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Mascota / Cliente</label>
                                <input type="text" required value={mascota} onChange={(e) => setMascota(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Método de Pago</label>
                                <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px', backgroundColor: 'white' }}>
                                    <option value="Efectivo">Efectivo</option>
                                    <option value="Tarjeta">Tarjeta</option>
                                </select>
                            </div>
                            {metodoPago === 'Efectivo' && (
                                <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
                                    <label style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--primary-green)' }}>¿Con cuánto paga?</label>
                                    <input type="number" value={montoRecibido} onChange={(e) => setMontoRecibido(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px' }} />
                                    {montoRecibido && (
                                        <div style={{ marginTop: '10px', fontWeight: 'bold', color: cambioActual >= 0 ? 'var(--primary-green)' : '#d32f2f' }}>
                                            {cambioActual >= 0 ? `Cambio: $${cambioActual.toFixed(2)}` : `Falta: $${Math.abs(cambioActual).toFixed(2)}`}
                                        </div>
                                    )}
                                </div>
                            )}
                            <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>Confirmar Cobro</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Servicios;