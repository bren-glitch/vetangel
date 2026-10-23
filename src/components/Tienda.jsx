import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Edit, Trash2, ShoppingCart, Upload } from 'lucide-react';

const Tienda = () => {
    const [productos, setProductos] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [modalFormulario, setModalFormulario] = useState(false);
    const [modalCobro, setModalCobro] = useState(false);
    const [editandoId, setEditandoId] = useState(null);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);

    // Formulario
    const [nombre, setNombre] = useState('');
    const [categoria, setCategoria] = useState('Alimentos');
    const [precio, setPrecio] = useState('');
    const [stock, setStock] = useState('');
    const [fotoUrl, setFotoUrl] = useState('');
    const [fotoBase64, setFotoBase64] = useState('');

    // Cobro
    const [dueno, setDueno] = useState('');
    const [metodoPago, setMetodoPago] = useState('Efectivo');
    const [montoRecibido, setMontoRecibido] = useState('');

    const cargarProductos = () => {
        fetch('/api/tienda')
            .then(res => res.json())
            .then(data => setProductos(data))
            .catch(err => console.error(err));
    };

    useEffect(() => { cargarProductos(); }, []);

    const productosFiltrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

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
        setNombre(''); setCategoria('Alimentos'); setPrecio(''); setStock(''); setFotoUrl(''); setFotoBase64('');
        setModalFormulario(true);
    };

    const abrirModalEditar = (e, producto) => {
        e.stopPropagation();
        setEditandoId(producto._id); // <-- ID de MongoDB
        setNombre(producto.nombre);
        setCategoria(producto.categoria);
        setPrecio(producto.precio);
        setStock(producto.stock);
        if (producto.img && producto.img.startsWith('data:image')) {
            setFotoBase64(producto.img); setFotoUrl('');
        } else {
            setFotoUrl(producto.img || ''); setFotoBase64('');
        }
        setModalFormulario(true);
    };

    const guardarProducto = (e) => {
        e.preventDefault();
        const imagenPorDefecto = 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=300';
        let imagenFinal = fotoBase64 || fotoUrl || imagenPorDefecto;

        const datos = { nombre, categoria, precio, stock: Number(stock), img: imagenFinal };

        const url = editandoId
            ? `/api/tienda/${editandoId}`
            : '/api/tienda';
        const metodo = editandoId ? 'PUT' : 'POST';

        fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        }).then(() => {
            cargarProductos();
            setModalFormulario(false);
        });
    };

    const eliminarProducto = (e, id) => {
        e.stopPropagation();
        if (window.confirm("¿Eliminar este producto?")) {
            fetch(`/api/tienda/${id}`, { method: 'DELETE' }) // <-- ID de MongoDB
                .then(() => cargarProductos())
                .catch(err => alert("Error al eliminar"));
        }
    };

    const abrirModalCobro = (producto) => {
        if (producto.stock <= 0) return alert("¡No hay stock de este producto!");
        setProductoSeleccionado(producto);
        setDueno(''); setMetodoPago('Efectivo'); setMontoRecibido('');
        setModalCobro(true);
    };

    const calcularCambio = () => {
        if (!montoRecibido || !productoSeleccionado) return null;
        const precioLimpio = parseFloat(productoSeleccionado.precio.replace('$', ''));
        const recibido = parseFloat(montoRecibido);
        if (isNaN(recibido)) return null;
        return recibido - precioLimpio;
    };
    const cambioActual = calcularCambio();

    const procesarCobro = (e) => {
        e.preventDefault();
        const nuevoPago = {
            folio: `#V-${Math.floor(Math.random() * 10000)}`,
            concepto: `Venta: ${productoSeleccionado.nombre}`,
            monto: productoSeleccionado.precio,
            estado: 'Pagado',
            fecha: new Date().toLocaleDateString(),
            metodo: metodoPago
        };

        fetch('/api/pagos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoPago)
        });

        // Actualizamos el stock
        const nuevoStock = productoSeleccionado.stock - 1;
        fetch(`/api/tienda/${productoSeleccionado._id}`, { // <-- ID de MongoDB
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...productoSeleccionado, stock: nuevoStock })
        }).then(() => {
            let mensaje = `¡Venta exitosa a ${dueno || 'Cliente'}!`;
            if (metodoPago === 'Efectivo' && montoRecibido) mensaje += `\n\nCambio: $${cambioActual.toFixed(2)}`;
            alert(mensaje);
            setModalCobro(false);
            cargarProductos();
        });
    };

    return (
        <div>
            <div className="header">
                <div>
                    <h1>Tienda / Inventario</h1>
                    <p className="subtitle">Gestiona los productos y accesorios para tus mascotas.</p>
                </div>
                <button className="btn-primary" onClick={abrirModalCrear}>
                    <Plus size={18} /> Nuevo producto
                </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div className="search-bar" style={{ width: '300px' }}>
                    <Search size={18} color="var(--text-gray)" />
                    <input type="text" placeholder="Buscar producto..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                </div>
            </div>

            <div className="grid-4">
                {productosFiltrados.map((prod) => (
                    <div
                        key={prod._id} // <-- ID de MongoDB
                        className="card"
                        style={{ padding: '15px', cursor: prod.stock > 0 ? 'pointer' : 'not-allowed', opacity: prod.stock > 0 ? 1 : 0.6 }}
                        onClick={() => abrirModalCobro(prod)}
                    >
                        <img src={prod.img} alt={prod.nombre} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '10px', marginBottom: '15px' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h4 style={{ fontSize: '1rem', marginBottom: '2px' }}>{prod.nombre}</h4>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)', marginBottom: '8px' }}>{prod.categoria}</p>
                                <p style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--primary-green)' }}>{prod.precio}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <Edit size={18} color="var(--text-gray)" style={{ cursor: 'pointer' }} onClick={(e) => abrirModalEditar(e, prod)} />
                                <Trash2 size={18} color="#d32f2f" style={{ cursor: 'pointer' }} onClick={(e) => eliminarProducto(e, prod._id)} /> {/* <-- ID de MongoDB */}
                            </div>
                        </div>
                        <span style={{ display: 'inline-block', marginTop: '10px', fontSize: '0.8rem', color: prod.stock > 5 ? 'var(--primary-green)' : '#d32f2f', fontWeight: '500' }}>
                            Stock: {prod.stock}
                        </span>
                    </div>
                ))}
            </div>

            {/* MODAL CREAR/EDITAR */}
            {modalFormulario && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '400px', maxHeight: '90vh', overflowY: 'auto', padding: '25px', position: 'relative' }}>
                        <button onClick={() => setModalFormulario(false)} style={{ position: 'absolute', top: '15px', right: '15px', border: 'none', background: 'none', cursor: 'pointer' }}><X size={24} /></button>
                        <h2 style={{ marginBottom: '20px', color: 'var(--primary-green)' }}>{editandoId ? 'Editar' : 'Nuevo'} Producto</h2>
                        <form onSubmit={guardarProducto} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Nombre</label>
                                <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Categoría</label>
                                <select value={categoria} onChange={(e) => setCategoria(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px' }}>
                                    <option value="Alimentos">Alimentos</option>
                                    <option value="Accesorios">Accesorios</option>
                                    <option value="Juguetes">Juguetes</option>
                                    <option value="Higiene">Higiene</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Precio</label>
                                    <input type="text" required value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="$0.00" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Stock</label>
                                    <input type="number" required value={stock} onChange={(e) => setStock(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px' }} />
                                </div>
                            </div>
                            <div style={{ border: '1px dashed var(--border-color)', padding: '15px', borderRadius: '8px' }}>
                                <label style={{ fontSize: '0.9rem', fontWeight: '500', display: 'block', marginBottom: '10px' }}>Imagen del Producto</label>
                                <label className="btn-primary" style={{ cursor: 'pointer', fontSize: '0.8rem', padding: '8px 12px', display: 'inline-flex' }}>
                                    <Upload size={16} /> Subir Foto
                                    <input type="file" accept="image/*" onChange={manejarSubidaImagen} style={{ display: 'none' }} />
                                </label>
                                {fotoBase64 && <span style={{ fontSize: '0.8rem', color: 'var(--primary-green)', marginLeft: '10px' }}>¡Cargada!</span>}
                            </div>
                            <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>{editandoId ? 'Guardar Cambios' : 'Crear Producto'}</button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL COBRO CON PRECIO DESTACADO */}
            {modalCobro && productoSeleccionado && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '400px', padding: '25px', position: 'relative' }}>
                        <button onClick={() => setModalCobro(false)} style={{ position: 'absolute', top: '15px', right: '15px', border: 'none', background: 'none', cursor: 'pointer' }}><X size={24} /></button>

                        <h2 style={{ marginBottom: '15px', color: 'var(--primary-green)' }}>Cobrar: {productoSeleccionado.nombre}</h2>

                        {/* AQUI MOSTRAMOS EL PRECIO EN GRANDE */}
                        <div style={{ backgroundColor: 'var(--light-green)', padding: '10px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-gray)', marginBottom: '5px' }}>Total a pagar</p>
                            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary-green)' }}>{productoSeleccionado.precio}</p>
                        </div>

                        <form onSubmit={procesarCobro} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Nombre del cliente</label>
                                <input type="text" required value={dueno} onChange={(e) => setDueno(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px' }} />
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
                            <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>Confirmar Venta</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tienda;