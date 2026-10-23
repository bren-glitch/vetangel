import React, { useState, useEffect } from 'react';
import { Search, Plus, MoreVertical, X, Trash2, Eye, FileText, User, Edit } from 'lucide-react';

const Consultas = ({ pacientePrevio }) => {
    const [consultas, setConsultas] = useState([]);
    const [menuAbiertoId, setMenuAbiertoId] = useState(null);
    const [busqueda, setBusqueda] = useState('');

    const [modalFormulario, setModalFormulario] = useState(false);
    const [modalExpediente, setModalExpediente] = useState(false);
    const [consultaSeleccionada, setConsultaSeleccionada] = useState(null);

    const [editandoId, setEditandoId] = useState(null);

    const [fecha, setFecha] = useState('');
    const [mascota, setMascota] = useState('');
    const [dueno, setDueno] = useState('');
    const [motivo, setMotivo] = useState('');
    const [sintomas, setSintomas] = useState('');
    const [diagnostico, setDiagnostico] = useState('');
    const [tratamiento, setTratamiento] = useState('');
    const [medicamentos, setMedicamentos] = useState('');
    const [peso, setPeso] = useState('');
    const [temperatura, setTemperatura] = useState('');
    const [estado, setEstado] = useState('Pendiente');
    const [costo, setCosto] = useState('');

    const cargarConsultas = () => {
        fetch('http://localhost:3000/api/consultas')
            .then(res => res.json())
            .then(data => setConsultas(data));
    };

    useEffect(() => { cargarConsultas(); }, []);

    useEffect(() => {
        if (pacientePrevio) {
            setMascota(pacientePrevio.mascota);
            setMotivo(pacientePrevio.motivo);
            setFecha(new Date().toISOString().split('T')[0]);
            setModalFormulario(true);
        }
    }, [pacientePrevio]);

    const consultasFiltradas = consultas.filter(c =>
        (c.mascota && c.mascota.toLowerCase().includes(busqueda.toLowerCase())) ||
        (c.dueno && c.dueno.toLowerCase().includes(busqueda.toLowerCase()))
    );

    const abrirModalCrear = () => {
        setEditandoId(null);
        setFecha(''); setMascota(''); setDueno(''); setMotivo(''); setSintomas('');
        setDiagnostico(''); setTratamiento(''); setMedicamentos(''); setPeso(''); setTemperatura(''); setEstado('Pendiente'); setCosto('');
        setModalFormulario(true);
    };

    const abrirModalEditar = (consulta) => {
        setEditandoId(consulta.id);
        setFecha(consulta.fecha); setMascota(consulta.mascota); setDueno(consulta.dueno);
        setMotivo(consulta.motivo); setSintomas(consulta.sintomas); setDiagnostico(consulta.diagnostico);
        setTratamiento(consulta.tratamiento); setMedicamentos(consulta.medicamentos);
        setPeso(consulta.peso); setTemperatura(consulta.temperatura); setEstado(consulta.estado); setCosto(consulta.costo);
        setModalFormulario(true);
        setMenuAbiertoId(null);
    };

    const guardarConsulta = (e) => {
        e.preventDefault();
        const datosConsulta = { fecha, mascota, dueno, motivo, sintomas, diagnostico, tratamiento, medicamentos, peso, temperatura, estado, costo };

        const url = editandoId
            ? `http://localhost:3000/api/consultas/${editandoId}`
            : 'http://localhost:3000/api/consultas';

        const metodo = editandoId ? 'PUT' : 'POST';

        fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosConsulta)
        }).then(() => {

            // Si es nueva y tiene costo, genera el recibo en pagos
            if (!editandoId && costo && parseFloat(costo) > 0) {
                const nuevoPago = {
                    folio: `#C-${Math.floor(Math.random() * 10000)}`,
                    concepto: `Consulta: ${mascota} - ${motivo}`,
                    medicamentos: medicamentos,
                    monto: `$${parseFloat(costo).toFixed(2)}`,
                    estado: estado,
                    fecha: fecha,
                    metodo: 'Efectivo'
                };

                fetch('http://localhost:3000/api/pagos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(nuevoPago)
                });
            }

            cargarConsultas();
            setModalFormulario(false);
        });
    };

    const eliminarConsulta = (id) => {
        if (window.confirm("¿Eliminar este registro del expediente?")) {
            const idNumerico = parseInt(id);
            fetch(`http://localhost:3000/api/consultas/${idNumerico}`, { method: 'DELETE' })
                .then(() => cargarConsultas());
        }
    };

    const abrirExpediente = (consulta) => {
        setConsultaSeleccionada(consulta);
        setModalExpediente(true);
        setMenuAbiertoId(null);
    };

    const historialMascota = consultas.filter(c =>
        c.mascota.toLowerCase() === consultaSeleccionada?.mascota.toLowerCase() &&
        c.dueno.toLowerCase() === consultaSeleccionada?.dueno.toLowerCase() &&
        c.id !== consultaSeleccionada?.id
    );

    const getEstadoStyle = (estado) => {
        if (estado === 'Pagado') return { backgroundColor: '#e8f5e9', color: '#2e7d32' };
        if (estado === 'Pendiente') return { backgroundColor: '#fff3e0', color: '#ef6c00' };
        return { backgroundColor: '#eeeeee', color: '#616161' };
    };

    return (
        <div>
            <div className="header">
                <div>
                    <h1>Consultas y Expedientes</h1>
                    <p className="subtitle">Registra diagnósticos y consulta el historial clínico.</p>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div className="search-bar" style={{ width: '400px' }}>
                    <Search size={18} color="var(--text-gray)" />
                    <input type="text" placeholder="Buscar por mascota o dueño..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                </div>
                <button className="btn-primary" onClick={abrirModalCrear}>
                    <Plus size={18} /> Nueva consulta
                </button>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'visible' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: 'var(--light-green)', color: 'var(--primary-green)' }}>
                        <tr>
                            <th style={{ padding: '15px' }}>Fecha</th>
                            <th style={{ padding: '15px' }}>Paciente / Dueño</th>
                            <th style={{ padding: '15px' }}>Motivo</th>
                            <th style={{ padding: '15px' }}>Diagnóstico</th>
                            <th style={{ padding: '15px' }}>Signos Vitales</th>
                            <th style={{ padding: '15px' }}>Estado</th>
                            <th style={{ padding: '15px' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {consultasFiltradas.map((consulta) => (
                            <tr key={consulta.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '15px', fontWeight: '500' }}>{consulta.fecha}</td>
                                <td style={{ padding: '15px' }}>
                                    <div style={{ fontWeight: '600', color: 'var(--primary-green)' }}>{consulta.mascota}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-gray)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <User size={12} /> {consulta.dueno || 'Sin dueño'}
                                    </div>
                                </td>
                                <td style={{ padding: '15px' }}>{consulta.motivo}</td>
                                <td style={{ padding: '15px', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={consulta.diagnostico}>
                                    {consulta.diagnostico}
                                </td>
                                <td style={{ padding: '15px', fontSize: '0.85rem', color: 'var(--text-gray)' }}>
                                    {consulta.peso ? `⚖️ ${consulta.peso}kg` : ''} <br />
                                    {consulta.temperatura ? `🌡️ ${consulta.temperatura}°C` : ''}
                                </td>
                                <td style={{ padding: '15px' }}>
                                    <span style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '500', ...getEstadoStyle(consulta.estado || 'Pendiente') }}>
                                        {consulta.estado || 'Pendiente'}
                                    </span>
                                </td>
                                <td style={{ padding: '15px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

                                        <Edit size={18} color="var(--text-gray)" style={{ cursor: 'pointer' }} onClick={() => abrirModalEditar(consulta)} title="Editar Consulta" />

                                        <button onClick={() => abrirExpediente(consulta)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--primary-green)' }} title="Ver Expediente">
                                            <Eye size={18} />
                                        </button>

                                        <div style={{ position: 'relative' }}>
                                            <MoreVertical size={18} color="var(--text-gray)" style={{ cursor: 'pointer' }} onClick={() => setMenuAbiertoId(menuAbiertoId === consulta.id ? null : consulta.id)} />
                                            {menuAbiertoId === consulta.id && (
                                                <div style={{ position: 'absolute', right: '0px', top: '25px', backgroundColor: 'white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', borderRadius: '8px', padding: '5px', zIndex: 100, width: '120px' }}>
                                                    <button onClick={() => eliminarConsulta(consulta.id)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', border: 'none', background: 'none', cursor: 'pointer', color: '#d32f2f', width: '100%', textAlign: 'left', borderRadius: '5px' }}>
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

            {modalFormulario && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '25px', position: 'relative' }}>
                        <button onClick={() => setModalFormulario(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer' }}>
                            <X size={24} color="var(--text-gray)" />
                        </button>

                        <h2 style={{ marginBottom: '20px', color: 'var(--primary-green)' }}>
                            {editandoId ? 'Editar Consulta' : 'Nuevo Registro de Consulta'}
                        </h2>

                        <form onSubmit={guardarConsulta} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Dueño (Propietario)</label>
                                    <input type="text" required value={dueno} onChange={(e) => setDueno(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Mascota (Paciente)</label>
                                    <input type="text" required value={mascota} onChange={(e) => setMascota(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px' }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Fecha</label>
                                    <input type="date" required value={fecha} onChange={(e) => setFecha(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Peso (kg)</label>
                                    <input type="number" step="0.1" value={peso} onChange={(e) => setPeso(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Temp (°C)</label>
                                    <input type="number" step="0.1" value={temperatura} onChange={(e) => setTemperatura(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px' }} />
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Motivo de consulta</label>
                                <input type="text" required value={motivo} onChange={(e) => setMotivo(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Síntomas</label>
                                <textarea rows="2" value={sintomas} onChange={(e) => setSintomas(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px', fontFamily: 'inherit' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Diagnóstico</label>
                                <textarea rows="2" required value={diagnostico} onChange={(e) => setDiagnostico(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px', fontFamily: 'inherit' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Tratamiento general</label>
                                <textarea rows="2" value={tratamiento} onChange={(e) => setTratamiento(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px', fontFamily: 'inherit' }} />
                            </div>

                            <div style={{ backgroundColor: 'var(--light-green)', padding: '15px', borderRadius: '8px' }}>
                                <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--primary-green)' }}>💊 Medicamentos / Vacunas aplicadas</label>
                                <textarea rows="2" value={medicamentos} onChange={(e) => setMedicamentos(e.target.value)} placeholder="Ej. Amoxicilina 250mg..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px', fontFamily: 'inherit' }} />
                            </div>

                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Costo Estimado ($) <span style={{ fontWeight: 'normal', color: 'gray', fontSize: '0.8rem' }}>(Opcional)</span></label>
                                    <input type="number" value={costo} onChange={(e) => setCosto(e.target.value)} placeholder="Recepción lo calculará" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Estado del pago</label>
                                    <select value={estado} onChange={(e) => setEstado(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '5px', backgroundColor: 'white' }}>
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="Pagado">Pagado</option>
                                    </select>
                                </div>
                            </div>

                            <button type="submit" className="btn-primary" style={{ marginTop: '10px', justifyContent: 'center', padding: '12px' }}>
                                {editandoId ? 'Guardar Cambios' : 'Guardar y Generar Recibo'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {modalExpediente && consultaSeleccionada && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '700px', maxHeight: '90vh', overflowY: 'auto', padding: '0', position: 'relative' }}>

                        <div style={{ backgroundColor: 'var(--primary-green)', padding: '25px', color: 'white', position: 'relative' }}>
                            <button onClick={() => setModalExpediente(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}>
                                <X size={24} />
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <FileText size={40} />
                                <div>
                                    <h2 style={{ fontSize: '1.5rem', marginBottom: '5px' }}>Paciente: {consultaSeleccionada.mascota}</h2>
                                    <p style={{ fontSize: '0.9rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <User size={14} /> Dueño: {consultaSeleccionada.dueno}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '25px' }}>
                            <h3 style={{ color: 'var(--primary-green)', marginBottom: '15px', borderBottom: '2px solid var(--light-green)', paddingBottom: '5px' }}>Detalles de la Visita ({consultaSeleccionada.fecha})</h3>

                            <div className="grid-2" style={{ marginBottom: '20px' }}>
                                <div>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>Motivo</p>
                                    <p style={{ fontWeight: '500', marginBottom: '10px' }}>{consultaSeleccionada.motivo}</p>

                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>Síntomas</p>
                                    <p style={{ fontSize: '0.9rem', marginBottom: '10px' }}>{consultaSeleccionada.sintomas || 'No registrados'}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>Signos Vitales</p>
                                    <p style={{ fontWeight: '500', marginBottom: '10px' }}>
                                        ⚖️ Peso: {consultaSeleccionada.peso || '--'} kg <br />
                                        🌡️ Temp: {consultaSeleccionada.temperatura || '--'} °C
                                    </p>

                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>Estado de Pago</p>
                                    <span style={{ padding: '3px 10px', borderRadius: '15px', fontSize: '0.8rem', fontWeight: 'bold', ...getEstadoStyle(consultaSeleccionada.estado || 'Pendiente') }}>
                                        {consultaSeleccionada.estado || 'Pendiente'}
                                    </span>
                                </div>
                            </div>

                            <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginBottom: '5px' }}>Diagnóstico</p>
                                <p style={{ fontSize: '0.95rem' }}>{consultaSeleccionada.diagnostico}</p>
                            </div>

                            <div style={{ backgroundColor: 'var(--light-green)', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                                <p style={{ fontSize: '0.85rem', color: 'var(--primary-green)', marginBottom: '5px', fontWeight: 'bold' }}>Tratamiento General</p>
                                <p style={{ fontSize: '0.95rem' }}>{consultaSeleccionada.tratamiento || 'Sin indicaciones adicionales'}</p>
                            </div>

                            <div style={{ backgroundColor: '#e3f2fd', padding: '15px', borderRadius: '8px', marginBottom: '30px', borderLeft: '4px solid #1976d2' }}>
                                <p style={{ fontSize: '0.85rem', color: '#1976d2', marginBottom: '5px', fontWeight: 'bold' }}>💊 Medicamentos / Vacunas</p>
                                <p style={{ fontSize: '0.95rem' }}>{consultaSeleccionada.medicamentos || 'No se recetaron medicamentos.'}</p>
                            </div>

                            <h3 style={{ color: 'var(--text-gray)', marginBottom: '15px', borderBottom: '1px solid var(--border-color)', paddingBottom: '5px' }}>Historial de {consultaSeleccionada.mascota}</h3>

                            {historialMascota.length === 0 ? (
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-gray)', fontStyle: 'italic' }}>Esta es la primera consulta registrada para este paciente.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {historialMascota.map((hist) => (
                                        <div key={hist.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                                            <div>
                                                <p style={{ fontWeight: '500', fontSize: '0.9rem' }}>{hist.fecha} - {hist.motivo}</p>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>Diagnóstico: {hist.diagnostico}</p>
                                            </div>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>⚖️ {hist.peso}kg</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default Consultas;