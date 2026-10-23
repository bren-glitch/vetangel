import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Edit, Trash2, ShoppingCart, Upload } from 'lucide-react';

const Tienda = () => {
    const [productos, setProductos] = useState([]);
    const [busqueda, setBusqueda] = useState('');

    const [modalFormulario, setModalFormulario] = useState(false);
    const [modalCobro, setModalCobro] = useState(false);

    const [editandoId, setEditandoId] = useState(null);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);

    // Formulario de Producto
    const [nombre, setNombre] = useState('');
    const [categoria, setCategoria] = useState('Alimentos');
    const [precio, setPrecio] = useState('');
    const [stock, setStock] = useState('');

    // NUEVO: Estados para manejar la imagen
    const [fotoUrl, setFotoUrl] = useState('');
    const [fotoBase64, setFotoBase64] = useState(''); // Para la foto subida

    // Formulario de Cobro
    const [dueno, setDueno] = useState('');
    const [metodoPago, setMetodoPago] = useState('Efectivo');
    const [montoRecibido, setMontoRecibido] = useState('');

    const cargarProductos = () => {
        fetch('http://localhost:3000/api/tienda')
            .then(res => res.json())
            .then(data => setProductos(data));
    };

    useEffect(() => { cargarProductos(); }, []);

    const productosFiltrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    // --- MANEJADOR DE IMAGEN DESDE LA PC ---
    const manejarSubidaImagen = (e) => {
        const archivo = e.target.files[0];
        if (archivo) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFotoBase64(reader.result); // Guarda la imagen como texto
                setFotoUrl(''); // Limpia el link si usan archivo
            };
            reader.readAsDataURL(archivo);
        }
    };

    // --- ACCIONES CRUD ---
    const abrirModalCrear = () => {
        setEditandoId(null);
        setNombre(''); setCategoria('Alimentos'); setPrecio(''); setStock(''); setFotoUrl(''); setFotoBase64('');
        setModalFormulario(true);
    };

    const abrirModalEditar = (e, producto) => {
        e.stopPropagation();
        setEditandoId(producto.id);
        setNombre(producto.nombre);
        setCategoria(producto.categoria);
        setPrecio(producto.precio);
        setStock(producto.stock);

        // Validamos si la foto es un link o una imagen subida (Base64)
        if (producto.img && producto.img.startsWith('data:image')) {
            setFotoBase64(producto.img);
            setFotoUrl('');
        } else {
            setFotoUrl(producto.img || '');
            setFotoBase64('');
        }

        setModalFormulario(true);
    };

    const guardarProducto = (e) => {
        e.preventDefault();
        const imagenPorDefecto = 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80';

        // Lógica: Si subieron archivo, usa el Base64. Si pegaron link, usa el link. Si no, usa la default.
        let imagenFinal = imagenPorDefecto;
        if (fotoBase64) imagenFinal = fotoBase64;
        else if (fotoUrl) imagenFinal = fotoUrl;

        const datos = {
            nombre,
            categoria,
            precio,
            stock: Number(stock),
            img: imagenFinal
        };

        const url = editandoId
            ? `http://localhost:3000/api/tienda/${editandoId}`
            : 'http://localhost:3000/api/tienda';

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
            fetch(`http://localhost:3000/api/tienda/${id}`, { method: 'DELETE' })
                .then(() => cargarProductos());
        }
    };

    // --- ACCIONES DE COBRO ---
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
            folio: `#${Math.floor(Math.random() * 10000)}`,
            concepto: `Venta: ${productoSeleccionado.nombre}`,
            monto: productoSeleccionado.precio,
            estado: 'Pagado',
            fecha: new Date().toLocaleDateString(),
            metodo: metodoPago
        };

        fetch('http://localhost:3000/api/pagos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoPago)
        });

        const nuevoStock = productoSeleccionado.stock - 1;
        fetch(`http://localhost:3000/api/tienda/${productoSeleccionado.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...productoSeleccionado, stock: nuevoStock })
        }).then(() => {
            let mensaje = `¡Venta exitosa a ${dueno || 'Cliente'}!`;
            if (metodoPago === 'Efectivo' && montoRecibido) {
                mensaje += `\n\nCambio a devolver: $${cambioActual.toFixed(2)}`;
            }
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
                        key={prod.id}
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
                                <Trash2 size={18} color="#d32f2f" style={{ cursor: 'pointer' }} onClick={(e) => eliminarProducto(e, prod.id)} />
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
                    <div className="card" style={{ width: '400px', padding: '25px', position: 'relative' }}>
                        <button onClick={() => setModalFormulario(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer' }}>
                            <X size={24} color="var(--text-gray)" />
                        </button>

                        <h2 style={{ marginBottom: '20px', color: 'var(--primary-green)' }}>
                            {editandoId ? 'Editar Producto' : 'Nuevo Producto'}
                        </h2>

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

                            {/* NUEVOS CAMPOS PARA LA FOTO */}
                            <div style={{ border: '1px dashed var(--border-color)', padding: '15px', borderRadius: '8px' }}>
                                <label style={{ fontSize: '0.9rem', fontWeight: '500', display: 'block', marginBottom: '10px' }}>Imagen del Producto</label>

                                {/* Opción 1: Subir archivo */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                    <label className="btn-primary" style={{ cursor: 'pointer', fontSize: '0.8rem', padding: '8px 12px' }}>
                                        <Upload size={16} /> Subir Foto
                                        <input type="file" accept="image/*" onChange={manejarSubidaImagen} style={{ display: 'none' }} />
                                    </label>
                                    {fotoBase64 && <span style={{ fontSize: '0.8rem', color: 'var(--primary-green)', fontWeight: 'bold' }}>¡Imagen cargada!</span>}
                                </div>

                                {/* Opción 2: Pegar URL */}
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)', marginBottom: '5px' }}>O pega un enlace (URL):</p>
                                <input
                                    type="url"
                                    value={fotoUrl}
                                    onChange={(e) => { setFotoUrl(e.target.value); setFotoBase64(''); }}
                                    placeholder="https://..."
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                                />
                            </div>

                            <button type="submit" className="btn-primary" style={{ marginTop: '10px', justifyContent: 'center' }}>
                                {editandoId ? 'Guardar Cambios' : 'Crear Producto'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL DE COBRO */}
            {modalCobro && productoSeleccionado && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '400px', padding: '25px', position: 'relative' }}>
                        <button onClick={() => setModalCobro(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer' }}>
                            <X size={24} color="var(--text-gray)" />
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: 'var(--primary-green)' }}>
                            <ShoppingCart size={28} />
                            <h2>Cobrar Producto</h2>
                        </div>

                        <div style={{ backgroundColor: 'var(--light-green)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                            <p style={{ fontSize: '0.9rem', fontWeight: '500' }}>Producto: <span style={{ fontWeight: 'normal' }}>{productoSeleccionado.nombre}</span></p>
                            <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-green)', marginTop: '5px' }}>Total: {productoSeleccionado.precio}</p>
                        </div>

                        <form onSubmit={procesarCobro} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Nombre del cliente</label>
                                <input type="text" required value={dueno} onChange={(e) => setDueno(e.target.value)} placeholder="Ej. Mariana López" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px' }} />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Método de Pago</label>
                                <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px', backgroundColor: 'white' }}>
                                    <option value="Efectivo">Efectivo</option>
                                    <option value="Tarjeta">Tarjeta</option>
                                    <option value="Transferencia">Transferencia</option>
                                </select>
                            </div>

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
                                Confirmar Venta
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tienda;