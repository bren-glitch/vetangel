import React, { useState, useEffect } from 'react';
import { Search, Plus, MoreVertical, Phone, Mail, PawPrint, X, Edit, Trash2 } from 'lucide-react';

const Propietarios = () => {
    const [propietarios, setPropietarios] = useState([]);
    const [cargando, setCargando] = useState(true);

    // Estados del Modal y Formulario
    const [modalAbierto, setModalAbierto] = useState(false);
    const [editandoId, setEditandoId] = useState(null); // Si es null, es Nuevo. Si tiene ID, es Editar.
    const [menuAbiertoId, setMenuAbiertoId] = useState(null); // Para los tres puntitos

    // Estados del Form
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [email, setEmail] = useState('');
    const [fotoUrl, setFotoUrl] = useState('');

    // Cargar datos
    const cargarPropietarios = () => {
        fetch('http://localhost:3000/api/propietarios')
            .then(res => res.json())
            .then(data => { setPropietarios(data); setCargando(false); })
            .catch(error => console.error("Error:", error));
    };

    useEffect(() => { cargarPropietarios(); }, []);

    // Abrir modal para Crear
    const abrirModalCrear = () => {
        setEditandoId(null);
        setNombre(''); setTelefono(''); setEmail(''); setFotoUrl('');
        setModalAbierto(true);
    };

    // Abrir modal para Editar
    const abrirModalEditar = (prop) => {
        setEditandoId(prop.id);
        setNombre(prop.name); setTelefono(prop.phone); setEmail(prop.email); setFotoUrl(prop.img);
        setModalAbierto(true);
        setMenuAbiertoId(null); // Cierra los puntitos
    };

    // Guardar (sirve para Crear y Editar)
    const guardarPropietario = (e) => {
        e.preventDefault();

        const datos = {
            name: nombre,
            phone: telefono,
            email: email,
            img: fotoUrl || `https://i.pravatar.cc/150?u=${email}`, // Si no ponen foto, usamos una genérica
            pets: editandoId ? propietarios.find(p => p.id === editandoId).pets : 0 // Mantiene las mascotas si edita
        };

        const url = editandoId
            ? `http://localhost:3000/api/propietarios/${editandoId}`
            : 'http://localhost:3000/api/propietarios';

        const metodo = editandoId ? 'PUT' : 'POST';

        fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        })
            .then(res => res.json())
            .then(() => {
                cargarPropietarios();
                setModalAbierto(false);
            });
    };

    // Eliminar
    const eliminarPropietario = (id) => {
        if (window.confirm("¿Estás seguro de eliminar a este propietario?")) {
            fetch(`http://localhost:3000/api/propietarios/${id}`, { method: 'DELETE' })
                .then(() => {
                    cargarPropietarios();
                    setMenuAbiertoId(null);
                });
        }
    };

    if (cargando) return <p style={{ padding: '20px' }}>Cargando propietarios...</p>;

    return (
        <div>
            <div className="header">
                <div>
                    <h1>Propietarios</h1>
                    <p className="subtitle">Gestión de la información de los dueños de las mascotas.</p>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div className="search-bar" style={{ width: '400px' }}>
                    <Search size={18} color="var(--text-gray)" />
                    <input type="text" placeholder="Buscar propietario..." />
                </div>
                <button className="btn-primary" onClick={abrirModalCrear}>
                    <Plus size={18} /> Nuevo propietario
                </button>
            </div>

            <div className="grid-2">
                {propietarios.map((prop) => (
                    <div key={prop.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <img src={prop.img} alt={prop.name} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
                            <div>
                                <h4 style={{ marginBottom: '4px', fontSize: '1rem' }}>{prop.name}</h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-gray)' }}>
                                    <Phone size={14} /> {prop.phone}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-gray)', marginTop: '2px' }}>
                                    <Mail size={14} /> {prop.email}
                                </div>
                            </div>
                        </div>

                        {/* MENÚ DE LOS TRES PUNTITOS */}
                        <div style={{ position: 'relative' }}>
                            <MoreVertical
                                color="var(--text-gray)"
                                style={{ cursor: 'pointer' }}
                                onClick={() => setMenuAbiertoId(menuAbiertoId === prop.id ? null : prop.id)}
                            />

                            {menuAbiertoId === prop.id && (
                                <div style={{
                                    position: 'absolute', right: 0, top: '25px', backgroundColor: 'white',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)', borderRadius: '8px',
                                    padding: '5px', zIndex: 10, display: 'flex', flexDirection: 'column', width: '120px'
                                }}>
                                    <button
                                        onClick={() => abrirModalEditar(prop)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-dark)' }}
                                    >
                                        <Edit size={16} /> Editar
                                    </button>
                                    <button
                                        onClick={() => eliminarPropietario(prop.id)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.9rem', color: '#d32f2f' }}
                                    >
                                        <Trash2 size={16} /> Eliminar
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL (CREAR / EDITAR) */}
            {modalAbierto && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '400px', padding: '25px', position: 'relative' }}>
                        <button onClick={() => setModalAbierto(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer' }}>
                            <X size={24} color="var(--text-gray)" />
                        </button>

                        <h2 style={{ marginBottom: '20px', color: 'var(--primary-green)' }}>
                            {editandoId ? 'Editar Propietario' : 'Nuevo Propietario'}
                        </h2>

                        <form onSubmit={guardarPropietario} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Nombre completo</label>
                                <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Teléfono</label>
                                <input type="text" required value={telefono} onChange={(e) => setTelefono(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Correo electrónico</label>
                                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>URL de la foto (Opcional)</label>
                                <input type="url" value={fotoUrl} onChange={(e) => setFotoUrl(e.target.value)} placeholder="https://..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px' }} />
                            </div>

                            <button type="submit" className="btn-primary" style={{ marginTop: '10px', justifyContent: 'center' }}>
                                {editandoId ? 'Guardar Cambios' : 'Guardar Propietario'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Propietarios;