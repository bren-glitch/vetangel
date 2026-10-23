import React, { useState, useEffect } from 'react';
import { Search, MoreVertical, Trash2, Eye, X, CheckCircle, FileText, ShoppingCart, ArrowRight } from 'lucide-react';

const Pagos = () => {
    const [pagos, setPagos] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [menuAbiertoId, setMenuAbiertoId] = useState(null);

    const [modalRecibo, setModalRecibo] = useState(false);
    const [pagoSeleccionado, setPagoSeleccionado] = useState(null);

    // SURTIR RECETA
    const [modalReceta, setModalReceta] = useState(false);
    const [busquedaReceta, setBusquedaReceta] = useState('');
    const [recetaEncontrada, setRecetaEncontrada] = useState(null);
    const [consultas, setConsultas] = useState([]);

    // COBRO MANUAL (CARRITO)
    const [modalManual, setModalManual] = useState(false);
    const [busquedaProducto, setBusquedaProducto] = useState('');
    const [carrito, setCarrito] = useState([]);
    const [nombreClienteManual, setNombreClienteManual] = useState('');
    const [metodoPagoManual, setMetodoPagoManual] = useState('Efectivo');

    // LISTAS DE LA TIENDA Y SERVICIOS
    const [productosTienda, setProductosTienda] = useState([]);
    const [serviciosDisponibles, setServiciosDisponibles] = useState([]);

    const cargarDatos = () => {
        fetch('/api/pagos').then(res => res.json()).then(data => setPagos(data));
        fetch('/api/consultas').then(res => res.json()).then(data => setConsultas(data));
        fetch('/api/tienda').then(res => res.json()).then(data => setProductosTienda(data));
        fetch('/api/servicios').then(res => res.json()).then(data => setServiciosDisponibles(data));
    };

    useEffect(() => { cargarDatos(); }, []);

    const pagosFiltrados = pagos.filter(p =>
        p.concepto.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.folio.toLowerCase().includes(busqueda.toLowerCase())
    );

    const cambiarEstado = (id, nuevoEstado) => {
        fetch(`/api/pagos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
        }).then(() => { cargarDatos(); setMenuAbiertoId(null); });
    };

    const eliminarPago = (id) => {
        if (window.confirm("¿Eliminar este recibo?")) {
            fetch(`/api/pagos/${id}`, { method: 'DELETE' })
                .then(() => { cargarDatos(); setMenuAbiertoId(null); });
        }
    };

    const verRecibo = (pago) => {
        setPagoSeleccionado(pago);
        setModalRecibo(true);
        setMenuAbiertoId(null);
    };

    const buscarReceta = (e) => {
        e.preventDefault();
        const textoBusqueda = busquedaReceta.toLowerCase();
        const consultasMascota = consultas.filter(c => {
            const textoConsulta = `${c.mascota} ${c.dueno}`.toLowerCase();
            return textoConsulta.includes(textoBusqueda) && c.receta;
        });
        setRecetaEncontrada(consultasMascota.length > 0 ? consultasMascota[consultasMascota.length - 1] : 'no-encontrada');
    };

    // MAGIA: PASAR SOLO LO RECETADO Y LA CONSULTA AL CARRITO
    const pasarRecetaAlCarrito = () => {
        if (!recetaEncontrada) return;

        const nuevosItems = [];

        // 1. Agregar la consulta (con el costo que puso el doctor)
        if (recetaEncontrada.costo && parseFloat(recetaEncontrada.costo) > 0) {
            nuevosItems.push({
                nombre: `Consulta Médica: ${recetaEncontrada.motivo}`,
                precio: `$${parseFloat(recetaEncontrada.costo).toFixed(2)}`,
                tipo: 'Servicio Médico'
            });
        }

        // 2. Buscar medicamentos recetados (coincidencia con la Tienda)
        if (recetaEncontrada.receta) {
            // Separamos por comas o la letra "y"
            const palabrasReceta = recetaEncontrada.receta.toLowerCase().split(/[, y]+/);

            productosTienda.forEach(prod => {
                const nombreProd = prod.nombre.toLowerCase();
                // Solo lo agrega si el nombre del producto está escrito en la receta
                if (palabrasReceta.some(palabra => palabra.length > 2 && nombreProd.includes(palabra))) {
                    nuevosItems.push({ ...prod, tipo: 'Medicamento Recetado' });
                }
            });
        }

        setCarrito(nuevosItems);
        setNombreClienteManual(recetaEncontrada.dueno || '');
        setModalReceta(false);
        setModalManual(true);
    };

    // --- LÓGICA DEL CARRITO MANUAL ---
    const agregarAlCarrito = (item) => {
        setCarrito([...carrito, item]);
    };

    const quitarDelCarrito = (index) => {
        const nuevoCarrito = [...carrito];
        nuevoCarrito.splice(index, 1);
        setCarrito(nuevoCarrito);
    };

    const totalCarrito = carrito.reduce((sum, item) => {
        const precioNum = parseFloat(item.precio.replace('$', '')) || 0;
        return sum + precioNum;
    }, 0);

    const guardarCobroManual = (e) => {
        e.preventDefault();
        if (carrito.length === 0) return alert("Agrega al menos un artículo o servicio al cobro.");

        const conceptos = carrito.map(item => item.nombre).join(' + ');

        const nuevoPago = {
            folio: `#M-${Math.floor(Math.random() * 10000)}`,
            concepto: `${nombreClienteManual ? nombreClienteManual + ': ' : ''}${conceptos}`,
            medicamentos: '',
            monto: `$${totalCarrito.toFixed(2)}`,
            estado: 'Pagado',
            fecha: new Date().toLocaleDateString(),
            metodo: metodoPagoManual
        };

        fetch('/api/pagos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoPago)
        }).then(() => {
            cargarDatos();
            setModalManual(false);
            setCarrito([]); setNombreClienteManual(''); setBusquedaProducto(''); setMetodoPagoManual('Efectivo');
        });
    };

    const getEstadoStyle = (estado) => {
        if (estado === 'Pagado') return { backgroundColor: '#e8f5e9', color: '#2e7d32' };
        if (estado === 'Pendiente') return { backgroundColor: '#fff3e0', color: '#ef6c00' };
        return { backgroundColor: '#eeeeee', color: '#616161' };
    };

    // RESULTADOS DEL BUSCADOR DEL CARRITO
    const resultadosBusqueda = [
        ...productosTienda.filter(p => p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase())).map(p => ({ ...p, tipo: 'Producto' })),
        ...serviciosDisponibles.filter(s => s.nombre.toLowerCase().includes(busquedaProducto.toLowerCase())).map(s => ({ ...s, tipo: 'Servicio' }))
    ];

    return (
        <div>
            <div className="header">
                <div>
                    <h1>Pagos y recibos</h1>
                    <p className="subtitle">Consulta y administra todos los cobros realizados.</p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-primary" style={{ backgroundColor: 'white', color: 'var(--primary-green)', border: '1px solid var(--primary-green)' }} onClick={() => { setModalReceta(true); setRecetaEncontrada(null); setBusquedaReceta(''); }}>
                        <FileText size={18} /> Surtir Receta
                    </button>

                    <button className="btn-primary" onClick={() => setModalManual(true)}>
                        <ShoppingCart size={18} /> Cobro Libre
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div className="search-bar" style={{ width: '300px' }}>
                    <Search size={18} color="var(--text-gray)" />
                    <input type="text" placeholder="Buscar por folio o concepto..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                </div>
            </div>

            {/* TABLA DE PAGOS */}
            <div className="card" style={{ padding: 0, overflow: 'visible' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: 'var(--light-green)', color: 'var(--primary-green)' }}>
                        <tr>
                            <th style={{ padding: '15px' }}>Folio</th>
                            <th style={{ padding: '15px' }}>Concepto</th>
                            <th style={{ padding: '15px' }}>Monto</th>
                            <th style={{ padding: '15px' }}>Estado</th>
                            <th style={{ padding: '15px' }}>Fecha</th>
                            <th style={{ padding: '15px' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pagosFiltrados.map((pago) => (
                            <tr key={pago._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '15px', fontWeight: '500' }}>{pago.folio}</td>
                                <td style={{ padding: '15px' }}>{pago.concepto}</td>
                                <td style={{ padding: '15px', fontWeight: 'bold' }}>{pago.monto}</td>
                                <td style={{ padding: '15px' }}>
                                    <span style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '500', ...getEstadoStyle(pago.estado) }}>
                                        {pago.estado}
                                    </span>
                                </td>
                                <td style={{ padding: '15px', color: 'var(--text-gray)', fontSize: '0.9rem' }}>{pago.fecha}</td>
                                <td style={{ padding: '15px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <button onClick={() => verRecibo(pago)} style={{ border: 'none', backgroundColor: 'transparent', color: 'var(--primary-green)', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <Eye size={16} /> Ver
                                        </button>
                                        {pago.estado === 'Pendiente' && (
                                            <button onClick={() => cambiarEstado(pago._id, 'Pagado')} style={{ border: 'none', backgroundColor: 'var(--primary-green)', color: 'white', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                                Cobrar
                                            </button>
                                        )}
                                        <div style={{ position: 'relative' }}>
                                            <MoreVertical size={18} color="var(--text-gray)" style={{ cursor: 'pointer' }} onClick={() => setMenuAbiertoId(menuAbiertoId === pago._id ? null : pago._id)} />
                                            {menuAbiertoId === pago._id && (
                                                <div style={{ position: 'absolute', right: 0, top: '25px', backgroundColor: 'white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', borderRadius: '8px', padding: '5px', zIndex: 10, width: '150px' }}>
                                                    <button onClick={() => eliminarPago(pago._id)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.9rem', color: '#d32f2f', width: '100%' }}>
                                                        <Trash2 size={16} /> Eliminar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL DE RECIBO */}
            {modalRecibo && pagoSeleccionado && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '400px', padding: '0', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ backgroundColor: 'var(--primary-green)', padding: '20px', color: 'white', textAlign: 'center', position: 'relative' }}>
                            <button onClick={() => setModalRecibo(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}>
                                <X size={24} />
                            </button>
                            <h2 style={{ fontSize: '1.4rem', marginBottom: '5px' }}>VetAngel</h2>
                            <p style={{ fontSize: '0.8rem', opacity: 0.9 }}>Clínica Veterinaria</p>
                        </div>
                        <div style={{ padding: '25px' }}>
                            <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '1px dashed var(--border-color)', paddingBottom: '20px' }}>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-gray)' }}>Folio</p>
                                <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{pagoSeleccionado.folio}</p>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
                                <span style={{ color: 'var(--text-gray)' }}>Fecha:</span>
                                <span style={{ fontWeight: '500' }}>{pagoSeleccionado.fecha}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '0.9rem' }}>
                                <span style={{ color: 'var(--text-gray)' }}>Estado:</span>
                                <span style={{ fontWeight: '500', ...getEstadoStyle(pagoSeleccionado.estado), padding: '2px 10px', borderRadius: '10px' }}>{pagoSeleccionado.estado}</span>
                            </div>
                            <div style={{ borderTop: '1px dashed var(--border-color)', borderBottom: '1px dashed var(--border-color)', padding: '15px 0', marginBottom: '20px' }}>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-gray)', marginBottom: '5px' }}>Concepto:</p>
                                <p style={{ fontWeight: '500', marginBottom: '10px' }}>{pagoSeleccionado.concepto}</p>
                                {pagoSeleccionado.medicamentos && (
                                    <div style={{ backgroundColor: '#e3f2fd', padding: '10px', borderRadius: '5px', marginTop: '10px' }}>
                                        <p style={{ fontSize: '0.8rem', color: '#1976d2', fontWeight: 'bold' }}>💊 Tratamiento / Medicamentos:</p>
                                        <p style={{ fontSize: '0.9rem', color: '#333' }}>{pagoSeleccionado.medicamentos}</p>
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Total:</span>
                                <span style={{ fontWeight: 'bold', fontSize: '1.5rem', color: 'var(--primary-green)' }}>{pagoSeleccionado.monto}</span>
                            </div>
                            {pagoSeleccionado.estado === 'Pendiente' && (
                                <button onClick={() => { cambiarEstado(pagoSeleccionado._id, 'Pagado'); setModalRecibo(false); }} className="btn-primary" style={{ width: '100%', marginTop: '20px', justifyContent: 'center' }}>
                                    <CheckCircle size={18} /> Marcar como Pagado
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE SURTIR RECETA */}
            {modalReceta && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '450px', padding: '25px', position: 'relative' }}>
                        <button onClick={() => setModalReceta(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer' }}>
                            <X size={24} color="var(--text-gray)" />
                        </button>
                        <h2 style={{ marginBottom: '20px', color: 'var(--primary-green)' }}>Surtir Receta</h2>
                        <form onSubmit={buscarReceta} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                            <input
                                type="text"
                                placeholder="Mascota o dueño..."
                                value={busquedaReceta}
                                onChange={(e) => setBusquedaReceta(e.target.value)}
                                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                                required
                            />
                            <button type="submit" className="btn-primary">Buscar</button>
                        </form>
                        {recetaEncontrada === 'no-encontrada' && <p style={{ color: '#d32f2f', textAlign: 'center' }}>No se encontraron recetas para esta búsqueda.</p>}
                        {recetaEncontrada && recetaEncontrada !== 'no-encontrada' && (
                            <div style={{ backgroundColor: '#e3f2fd', padding: '20px', borderRadius: '8px' }}>
                                <h3 style={{ color: '#1976d2', marginBottom: '10px' }}>Receta de {recetaEncontrada.mascota}</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginBottom: '5px' }}>Fecha: {recetaEncontrada.fecha}</p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginBottom: '15px' }}>Diagnóstico: {recetaEncontrada.diagnostico}</p>

                                <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Medicamentos para surtir en casa:</p>
                                <p style={{ backgroundColor: 'white', padding: '10px', borderRadius: '5px', border: '1px solid #bbdefb' }}>{recetaEncontrada.receta}</p>

                                {recetaEncontrada.costo && (
                                    <p style={{ fontWeight: 'bold', marginTop: '15px' }}>Costo de consulta: <span style={{ color: 'var(--primary-green)' }}>${parseFloat(recetaEncontrada.costo).toFixed(2)}</span></p>
                                )}

                                <button onClick={pasarRecetaAlCarrito} className="btn-primary" style={{ width: '100%', marginTop: '20px', justifyContent: 'center' }}>
                                    <ArrowRight size={18} /> Pasar todo al Cobro de Caja
                                </button>

                                <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)', marginTop: '15px', fontStyle: 'italic' }}>* Esto agregará la consulta y los medicamentos encontrados en la tienda al carrito de cobro.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* MODAL DE COBRO DE CAJA */}
            {modalManual && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '750px', maxHeight: '90vh', overflowY: 'auto', padding: '25px', position: 'relative' }}>
                        <button onClick={() => setModalManual(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer' }}>
                            <X size={24} color="var(--text-gray)" />
                        </button>

                        <h2 style={{ marginBottom: '20px', color: 'var(--primary-green)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <ShoppingCart size={24} /> Cobro en Caja
                        </h2>

                        <div style={{ display: 'flex', gap: '20px' }}>

                            <div style={{ flex: 1, borderRight: '1px solid var(--border-color)', paddingRight: '20px' }}>
                                <h3 style={{ fontSize: '1rem', marginBottom: '10px' }}>1. Agregar Artículos / Servicios</h3>
                                <div className="search-bar" style={{ width: '100%', marginBottom: '15px' }}>
                                    <Search size={18} color="var(--text-gray)" />
                                    <input type="text" placeholder="Buscar producto o servicio..." value={busquedaProducto} onChange={(e) => setBusquedaProducto(e.target.value)} />
                                </div>

                                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {resultadosBusqueda.map((item) => (
                                        <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid var(--border-color)' }}>
                                            <div>
                                                <p style={{ fontSize: '0.9rem', fontWeight: '500' }}>{item.nombre}</p>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--primary-green)', fontWeight: 'bold' }}>{item.precio}</p>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-gray)' }}>{item.tipo}</span>
                                            </div>
                                            <button type="button" onClick={() => agregarAlCarrito(item)} style={{ border: 'none', backgroundColor: 'var(--light-green)', color: 'var(--primary-green)', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                                                + Agregar
                                            </button>
                                        </div>
                                    ))}
                                    {resultadosBusqueda.length === 0 && <p style={{ fontSize: '0.8rem', color: 'gray' }}>No hay resultados.</p>}
                                </div>
                            </div>

                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '1rem', marginBottom: '10px' }}>2. Resumen de Cobro</h3>

                                {carrito.length === 0 ? (
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-gray)', fontStyle: 'italic', marginTop: '20px' }}>No has agregado artículos.</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                                        {carrito.map((item, index) => (
                                            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '8px' }}>
                                                <div>
                                                    <p style={{ fontSize: '0.9rem', fontWeight: '500' }}>{item.nombre}</p>
                                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>{item.precio}</p>
                                                </div>
                                                <button type="button" onClick={() => quitarDelCarrito(index)} style={{ border: 'none', background: 'none', color: '#d32f2f', cursor: 'pointer' }}>
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <form onSubmit={guardarCobroManual}>
                                    <div style={{ marginBottom: '15px' }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: '500' }}>Nombre del Cliente</label>
                                        <input type="text" required value={nombreClienteManual} onChange={(e) => setNombreClienteManual(e.target.value)} placeholder="Ej. Ana López" style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px' }} />
                                    </div>
                                    <div style={{ marginBottom: '15px' }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: '500' }}>Método de Pago</label>
                                        <select value={metodoPagoManual} onChange={(e) => setMetodoPagoManual(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px', backgroundColor: 'white' }}>
                                            <option value="Efectivo">Efectivo</option>
                                            <option value="Tarjeta">Tarjeta</option>
                                            <option value="Transferencia">Transferencia</option>
                                        </select>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px dashed var(--border-color)', paddingTop: '15px', marginBottom: '20px' }}>
                                        <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Total a Cobrar:</span>
                                        <span style={{ fontWeight: 'bold', fontSize: '1.5rem', color: 'var(--primary-green)' }}>${totalCarrito.toFixed(2)}</span>
                                    </div>

                                    <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} disabled={carrito.length === 0}>
                                        <CheckCircle size={18} /> Confirmar Cobro
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Pagos;