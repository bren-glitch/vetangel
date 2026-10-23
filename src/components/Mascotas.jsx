import React, { useState, useEffect } from 'react';
import { Search, Plus, MoreVertical, X, Edit, Trash2, Upload } from 'lucide-react';

const Mascotas = () => {
    const [mascotas, setMascotas] = useState([]);
    const [consultas, setConsultas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState('');

    const [modalFormulario, setModalFormulario] = useState(false);
    const [modalPerfil, setModalPerfil] = useState(false);
    const [mascotaSeleccionada, setMascotaSeleccionada] = useState(null);

    const [editandoId, setEditandoId] = useState(null);
    const [menuAbiertoId, setMenuAbiertoId] = useState(null);

    // Estados del formulario
    const [nombre, setNombre] = useState('');
    const [especie, setEspecie] = useState('Perro'); // NUEVO
    const [tipo, setTipo] = useState('');
    const [edad, setEdad] = useState(''); // NUEVO
    const [dueno, setDueno] = useState('');
    const [estado, setEstado] = useState('Activo');
    const [fotoUrl, setFotoUrl] = useState('');
    const [fotoBase64, setFotoBase64] = useState('');

    const cargarDatos = () => {
        fetch('/api/mascotas')
            .then(res => res.json())
            .then(data => { setMascotas(data); setCargando(false); });

        fetch('/api/consultas')
            .then(res => res.json())
            .then(data => setConsultas(data));
    };

    useEffect(() => { cargarDatos(); }, []);

    const mascotasFiltradas = mascotas.filter(m =>
        (m.name && m.name.toLowerCase().includes(busqueda.toLowerCase())) ||
        (m.owner && m.owner.toLowerCase().includes(busqueda.toLowerCase()))
    );

    const manejarSubidaImagen = (e) => {
        const archivo = e.target.files[0];
        if (archivo) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFotoBase64(reader.result);
                setFotoUrl('');
            };
            reader.readAsDataURL(archivo);
        }
    };

    const abrirModalCrear = (e) => {
        e.stopPropagation();
        setEditandoId(null);
        setNombre(''); setEspecie('Perro'); setTipo(''); setEdad(''); setDueno(''); setEstado('Activo'); setFotoUrl(''); setFotoBase64('');
        setModalFormulario(true);
    };

    const abrirModalEditar = (e, mascota) => {
        e.stopPropagation();
        setEditandoId(mascota.id);
        setNombre(mascota.name);
        setEspecie(mascota.especie || 'Perro');
        setTipo(mascota.type);
        setEdad(mascota.edad || '');
        setDueno(mascota.owner);
        setEstado(mascota.status || 'Activo');

        if (mascota.img && mascota.img.startsWith('data:image')) {
            setFotoBase64(mascota.img); setFotoUrl('');
        } else {
            setFotoUrl(mascota.img || ''); setFotoBase64('');
        }

        setModalFormulario(true);
        setMenuAbiertoId(null);
    };

    const guardarMascota = (e) => {
        e.preventDefault();
        const imagenPorDefecto = 'https://via.placeholder.com/300x150?text=Sin+Foto';

        let imagenFinal = imagenPorDefecto;
        if (fotoBase64) imagenFinal = fotoBase64;
        else if (fotoUrl) imagenFinal = fotoUrl;

        // AGREGAMOS ESPECIE Y EDAD A LOS DATOS QUE SE GUARDAN
        const datos = {
            name: nombre,
            especie: especie,
            type: tipo,
            edad: edad,
            owner: dueno,
            img: imagenFinal,
            status: estado
        };

        const url = editandoId
            ? `/api/mascotas/${editandoId}`
            : '/api/mascotas';

        const metodo = editandoId ? 'PUT' : 'POST';

        fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        }).then(() => {
            cargarDatos();
            setModalFormulario(false);
        });
    };

    const eliminarMascota = (e, id) => {
        e.stopPropagation();
        if (window.confirm("¿Estás seguro de eliminar a esta mascota?")) {
            fetch(`/api/mascotas/${id}`, { method: 'DELETE' })
                .then(() => { cargarDatos(); setMenuAbiertoId(null); });
        }
    };

    const abrirPerfil = (mascota) => {
        setMascotaSeleccionada(mascota);
        setModalPerfil(true);
        setMenuAbiertoId(null);
    };

    const historialPaciente = consultas.filter(c =>
        c.mascota.toLowerCase() === mascotaSeleccionada?.name.toLowerCase()
    );

    const deudaTotal = historialPaciente
        .filter(c => c.estado === 'Pendiente')
        .reduce((sum, c) => sum + (parseFloat(c.costo) || 0), 0);

    if (cargando) return <p style={{ padding: '20px' }}>Cargando mascotas...</p>;

    return (
        <div>
            <div className="header">
                <div>
                    <h1>Mascotas</h1>
                    <p className="subtitle">Da clic a una tarjeta para ver el expediente clínico.</p>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div className="search-bar" style={{ width: '350px' }}>
                    <Search size={18} color="var(--text-gray)" />
                    <input type="text" placeholder="Buscar por mascota o dueño..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                </div>
                <button className="btn-primary" onClick={abrirModalCrear}>
                    <Plus size={18} /> Nueva mascota
                </button>
            </div>

            <div className="grid-4">
                {mascotasFiltradas.map((mascota) => (
                    <div
                        key={mascota.id}
                        className="card"
                        style={{ padding: '15px', cursor: 'pointer', transition: 'transform 0.2s' }}
                        onClick={() => abrirPerfil(mascota)}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <img src={mascota.img || 'https://via.placeholder.com/300x150?text=Sin+Foto'} alt={mascota.name} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '10px', marginBottom: '15px' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h4 style={{ marginBottom: '2px', fontSize: '1rem' }}>{mascota.name}</h4>
                                {/* MOSTRAMOS LA EDAD Y LA ESPECIE AQUÍ */}
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>
                                    {mascota.especie || 'Mascota'} {mascota.edad ? `• ${mascota.edad}` : ''}
                                </p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>{mascota.type}</p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>Dueño: {mascota.owner}</p>
                            </div>

                            <div style={{ position: 'relative' }}>
                                <MoreVertical size={18} color="var(--text-gray)" style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setMenuAbiertoId(menuAbiertoId === mascota.id ? null : mascota.id); }} />
                                {menuAbiertoId === mascota.id && (
                                    <div style={{ position: 'absolute', right: 0, top: '25px', backgroundColor: 'white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', borderRadius: '8px', padding: '5px', zIndex: 10, display: 'flex', flexDirection: 'column', width: '120px' }}>
                                        <button type="button" onClick={(e) => abrirModalEditar(e, mascota)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                                            <Edit size={16} /> Editar
                                        </button>
                                        <button type="button" onClick={(e) => eliminarMascota(e, mascota.id)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.9rem', color: '#d32f2f' }}>
                                            <Trash2 size={16} /> Eliminar
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <span style={{ display: 'inline-block', marginTop: '10px', padding: '3px 10px', backgroundColor: 'var(--light-green)', color: 'var(--primary-green)', borderRadius: '15px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                            {mascota.status}
                        </span>
                    </div>
                ))}
            </div>

            {/* MODAL 1: FORMULARIO CREAR/EDITAR */}
            {modalFormulario && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '400px', maxHeight: '90vh', overflowY: 'auto', padding: '25px', position: 'relative' }}>
                        <button type="button" onClick={() => setModalFormulario(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer' }}>
                            <X size={24} color="var(--text-gray)" />
                        </button>

                        <h2 style={{ marginBottom: '20px', color: 'var(--primary-green)' }}>
                            {editandoId ? 'Editar Mascota' : 'Nueva Mascota'}
                        </h2>

                        <form onSubmit={guardarMascota} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Nombre de la mascota</label>
                                <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px' }} />
                            </div>

                            {/* FILA CON ESPECIE Y EDAD */}
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Especie</label>
                                    <select value={especie} onChange={(e) => setEspecie(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px', backgroundColor: 'white' }}>
                                        <option value="Perro">Perro</option>
                                        <option value="Gato">Gato</option>
                                        <option value="Ave">Ave</option>
                                        <option value="Roedor">Roedor</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Edad</label>
                                    <input type="text" value={edad} onChange={(e) => setEdad(e.target.value)} placeholder="Ej. 2 años" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px' }} />
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Raza</label>
                                <input type="text" required value={tipo} onChange={(e) => setTipo(e.target.value)} placeholder="Ej. Beagle" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Nombre del Dueño</label>
                                <input type="text" required value={dueno} onChange={(e) => setDueno(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px' }} />
                            </div>

                            <div style={{ border: '1px dashed var(--border-color)', padding: '15px', borderRadius: '8px' }}>
                                <label style={{ fontSize: '0.9rem', fontWeight: '500', display: 'block', marginBottom: '10px' }}>Foto de la Mascota</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                    <label className="btn-primary" style={{ cursor: 'pointer', fontSize: '0.8rem', padding: '8px 12px' }}>
                                        <Upload size={16} /> Subir Foto
                                        <input type="file" accept="image/*" onChange={manejarSubidaImagen} style={{ display: 'none' }} />
                                    </label>
                                    {fotoBase64 && <span style={{ fontSize: '0.8rem', color: 'var(--primary-green)', fontWeight: 'bold' }}>¡Imagen cargada!</span>}
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)', marginBottom: '5px' }}>O pega un enlace (URL):</p>
                                <input type="url" value={fotoUrl} onChange={(e) => { setFotoUrl(e.target.value); setFotoBase64(''); }} placeholder="https://..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Estado</label>
                                <select value={estado} onChange={(e) => setEstado(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px', backgroundColor: 'white' }}>
                                    <option value="Activo">Activo</option>
                                    <option value="Inactivo">Inactivo</option>
                                </select>
                            </div>

                            <button type="submit" className="btn-primary" style={{ marginTop: '10px', justifyContent: 'center' }}>
                                {editandoId ? 'Guardar Cambios' : 'Guardar Mascota'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: PERFIL 360° DEL PACIENTE */}
            {modalPerfil && mascotaSeleccionada && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '0', position: 'relative', display: 'flex', flexDirection: 'column' }}>

                        <div style={{ backgroundColor: 'var(--primary-green)', padding: '25px', color: 'white', display: 'flex', alignItems: 'center', gap: '20px', position: 'relative' }}>
                            <button onClick={() => setModalPerfil(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}>
                                <X size={24} />
                            </button>

                            <img src={mascotaSeleccionada.img || 'https://via.placeholder.com/150'} alt="perfil" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid white' }} />

                            <div>
                                <h2 style={{ fontSize: '1.8rem', marginBottom: '5px' }}>{mascotaSeleccionada.name}</h2>
                                <p style={{ fontSize: '1rem', opacity: 0.9 }}>
                                    {mascotaSeleccionada.especie || 'Mascota'} • {mascotaSeleccionada.type} {mascotaSeleccionada.edad ? `• ${mascotaSeleccionada.edad}` : ''}
                                </p>
                                <p style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '5px' }}><strong>Dueño:</strong> {mascotaSeleccionada.owner}</p>
                            </div>
                        </div>

                        <div style={{ padding: '25px', display: 'flex', gap: '20px' }}>

                            <div style={{ flex: 2 }}>
                                <h3 style={{ color: 'var(--primary-green)', marginBottom: '15px', borderBottom: '2px solid var(--light-green)', paddingBottom: '5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Plus size={20} /> Historial de Consultas
                                </h3>

                                {historialPaciente.length === 0 ? (
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-gray)', fontStyle: 'italic' }}>No hay consultas registradas aún.</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        {historialPaciente.map((consulta) => (
                                            <div key={consulta.id} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '15px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                                    <span style={{ fontWeight: 'bold', color: 'var(--primary-green)' }}>{consulta.fecha}</span>
                                                    <span style={{ fontSize: '0.8rem', backgroundColor: consulta.estado === 'Pagado' ? '#e8f5e9' : '#fff3e0', color: consulta.estado === 'Pagado' ? '#2e7d32' : '#ef6c00', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                                                        {consulta.estado}
                                                    </span>
                                                </div>
                                                <p style={{ fontSize: '0.9rem', marginBottom: '5px' }}><strong>Motivo:</strong> {consulta.motivo}</p>
                                                <p style={{ fontSize: '0.9rem', marginBottom: '5px' }}><strong>Diagnóstico:</strong> {consulta.diagnostico}</p>
                                                {consulta.medicamentos && (
                                                    <p style={{ fontSize: '0.85rem', color: '#1976d2', backgroundColor: '#e3f2fd', padding: '8px', borderRadius: '5px', marginTop: '5px' }}>
                                                        💊 <strong>Receta:</strong> {consulta.medicamentos}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div style={{ flex: 1 }}>
                                <h3 style={{ color: 'var(--text-dark)', marginBottom: '15px', borderBottom: '2px solid var(--border-color)', paddingBottom: '5px' }}>
                                    Resumen de Cuenta
                                </h3>

                                <div style={{ backgroundColor: deudaTotal > 0 ? '#ffebee' : '#e8f5e9', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: deudaTotal > 0 ? '#d32f2f' : '#2e7d32', display: 'block' }}>
                                        ${deudaTotal.toFixed(2)}
                                    </span>
                                    <p style={{ fontSize: '0.9rem', color: deudaTotal > 0 ? '#d32f2f' : '#2e7d32', marginTop: '5px' }}>
                                        {deudaTotal > 0 ? 'Saldo Pendiente' : 'Cuenta al día'}
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Mascotas;