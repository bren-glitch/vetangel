import React, { useState, useEffect } from 'react';
import { Search, Plus, MoreVertical, X, Trash2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const Citas = () => {
    const [citas, setCitas] = useState([]);
    const [consultasPendientes, setConsultasPendientes] = useState([]);
    const [menuAbiertoId, setMenuAbiertoId] = useState(null);
    const [modalAbierto, setModalAbierto] = useState(false);

    const [fecha, setFecha] = useState('');
    const [hora, setHora] = useState('');
    const [mascota, setMascota] = useState('');
    const [motivo, setMotivo] = useState('');
    const [estado, setEstado] = useState('Pendiente');

    const cargarDatos = () => {
        fetch('/api/citas')
            .then(res => res.json())
            .then(data => setCitas(data));

        fetch('/api/consultas')
            .then(res => res.json())
            .then(data => {
                const pendientes = data.filter(c => c.estado === 'Pendiente' && c.costo);
                setConsultasPendientes(pendientes);
            });
    };

    useEffect(() => { cargarDatos(); }, []);

    const guardarCita = (e) => {
        e.preventDefault();
        fetch('/api/citas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fecha, hora, mascota, motivo, estado })
        }).then(() => {
            cargarDatos();
            setModalAbierto(false);
            setFecha(''); setHora(''); setMascota(''); setMotivo(''); setEstado('Pendiente');
        });
    };

    // FUNCIÓN CORREGIDA PARA CAMBIAR ESTADO (usa el _id)
    const cambiarEstadoCita = (id, nuevoEstado) => {
        fetch(`/api/citas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
        }).then(() => {
            cargarDatos();
            setMenuAbiertoId(null);
        });
    };

    const eliminarCita = (id) => {
        if (window.confirm("¿Eliminar cita permanentemente?")) {
            fetch(`/api/citas/${id}`, { method: 'DELETE' }).then(() => cargarDatos());
        }
    };

    const getEstadoStyle = (estado) => {
        if (estado === 'Confirmada') return { backgroundColor: '#e8f5e9', color: '#2e7d32' };
        if (estado === 'Pendiente') return { backgroundColor: '#fff3e0', color: '#ef6c00' };
        if (estado === 'Completada') return { backgroundColor: '#e3f2fd', color: '#1976d2' };
        if (estado === 'Cancelada') return { backgroundColor: '#ffebee', color: '#d32f2f' };
        return { backgroundColor: '#eeeeee', color: '#616161' };
    };

    const getDeuda = (nombreMascota) => {
        const deudas = consultasPendientes.filter(c => c.mascota.toLowerCase() === nombreMascota.toLowerCase());
        if (deudas.length > 0) {
            const total = deudas.reduce((sum, c) => sum + (parseFloat(c.costo) || 0), 0);
            return total;
        }
        return 0;
    };

    return (
        <div>
            <div className="header">
                <div>
                    <h1>Citas</h1>
                    <p className="subtitle">Programa y consulta las citas de tus pacientes.</p>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div className="search-bar" style={{ width: '250px' }}>
                    <Search size={18} color="var(--text-gray)" />
                    <input type="text" placeholder="Buscar cita..." />
                </div>
                <button className="btn-primary" onClick={() => setModalAbierto(true)}>
                    <Plus size={18} /> Nueva cita
                </button>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'visible' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: 'var(--light-green)', color: 'var(--primary-green)' }}>
                        <tr>
                            <th style={{ padding: '15px' }}>Fecha y hora</th>
                            <th style={{ padding: '15px' }}>Mascota</th>
                            <th style={{ padding: '15px' }}>Motivo</th>
                            <th style={{ padding: '15px' }}>Estado</th>
                            <th style={{ padding: '15px' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {citas.map((cita) => {
                            const deuda = getDeuda(cita.mascota);
                            return (
                                <tr key={cita._id} style={{ borderBottom: '1px solid var(--border-color)' }}> {/* <-- _id */}
                                    <td style={{ padding: '15px' }}>
                                        <div style={{ fontWeight: '500' }}>{cita.fecha}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>{cita.hora}</div>
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <div>{cita.mascota}</div>
                                        {deuda > 0 && (
                                            <div style={{ fontSize: '0.75rem', color: '#d32f2f', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '4px' }}>
                                                <AlertCircle size={12} /> Debe: ${deuda.toFixed(2)}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '15px' }}>{cita.motivo}</td>
                                    <td style={{ padding: '15px' }}>
                                        <span style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '500', ...getEstadoStyle(cita.estado) }}>
                                            {cita.estado}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            {(cita.estado === 'Pendiente' || cita.estado === 'Confirmada') && (
                                                <>
                                                    {/* BOTONES CON _id */}
                                                    <button onClick={() => cambiarEstadoCita(cita._id, 'Completada')} style={{ border: 'none', backgroundColor: '#e3f2fd', color: '#1976d2', padding: '5px', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Completar">
                                                        <CheckCircle size={16} />
                                                    </button>
                                                    <button onClick={() => cambiarEstadoCita(cita._id, 'Cancelada')} style={{ border: 'none', backgroundColor: '#ffebee', color: '#d32f2f', padding: '5px', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Cancelar">
                                                        <XCircle size={16} />
                                                    </button>
                                                </>
                                            )}
                                            <div style={{ position: 'relative' }}>
                                                <MoreVertical size={18} color="var(--text-gray)" style={{ cursor: 'pointer' }} onClick={() => setMenuAbiertoId(menuAbiertoId === cita._id ? null : cita._id)} />
                                                {menuAbiertoId === cita._id && (
                                                    <div style={{ position: 'absolute', right: 0, top: '25px', backgroundColor: 'white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', borderRadius: '8px', padding: '5px', zIndex: 10 }}>
                                                        <button onClick={() => eliminarCita(cita._id)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', border: 'none', background: 'none', cursor: 'pointer', color: '#d32f2f' }}>
                                                            <Trash2 size={16} /> Eliminar
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {modalAbierto && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '400px', padding: '25px', position: 'relative' }}>
                        <button onClick={() => setModalAbierto(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer' }}>
                            <X size={24} color="var(--text-gray)" />
                        </button>
                        <h2 style={{ marginBottom: '20px', color: 'var(--primary-green)' }}>Agendar Nueva Cita</h2>
                        <form onSubmit={guardarCita} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Fecha</label>
                                <input type="date" required value={fecha} onChange={(e) => setFecha(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Hora</label>
                                <input type="time" required value={hora} onChange={(e) => setHora(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Nombre de la mascota</label>
                                <input type="text" required value={mascota} onChange={(e) => setMascota(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Motivo</label>
                                <input type="text" required value={motivo} onChange={(e) => setMotivo(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Estado de la cita</label>
                                <select value={estado} onChange={(e) => setEstado(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px', backgroundColor: 'white' }}>
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="Confirmada">Confirmada</option>
                                </select>
                            </div>
                            <button type="submit" className="btn-primary" style={{ marginTop: '10px', justifyContent: 'center' }}>
                                Agendar Cita
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Citas;