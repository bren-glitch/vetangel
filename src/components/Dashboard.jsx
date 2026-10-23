import React, { useState, useEffect } from 'react';
import { CalendarPlus, UserPlus, ShoppingCart, DollarSign, PawPrint, Calendar, Stethoscope, ArrowRight } from 'lucide-react';

const Dashboard = ({ setActiveTab }) => {
    const [stats, setStats] = useState({
        mascotas: 0,
        citasHoy: 0,
        consultasHoy: 0,
        ingresosHoy: 0
    });

    // Estado para el perfil dinámico
    const [perfil, setPerfil] = useState({
        nombre: 'Dra. Ana',
        foto: 'https://i.pravatar.cc/40?img=5',
        rol: 'Administradora'
    });

    useEffect(() => {
        // 1. Cargar perfil desde LocalStorage
        const config = localStorage.getItem('configVetAngel');
        if (config) {
            const parsed = JSON.parse(config);
            setPerfil({
                nombre: parsed.nombreUsuario || 'Usuario',
                foto: parsed.fotoPerfilBase64 || parsed.fotoPerfilUrl || 'https://i.pravatar.cc/40?img=5',
                rol: parsed.rol || 'Administrador'
            });
        }

        // 2. Cargar estadísticas reales
        Promise.all([
            fetch('/api/mascotas').then(res => res.json()),
            fetch('/api/citas').then(res => res.json()),
            fetch('/api/consultas').then(res => res.json()),
            fetch('/api/pagos').then(res => res.json())
        ]).then(([mascotas, citas, consultas, pagos]) => {
            const hoy = new Date().toISOString().split('T')[0];

            const citasDeHoy = citas.filter(c => c.fecha === hoy).length;
            const consultasDeHoy = consultas.filter(c => c.fecha === hoy).length;
            const ingresosDeHoy = pagos
                .filter(p => p.fecha === hoy && p.estado === 'Pagado')
                .reduce((sum, p) => {
                    const monto = parseFloat(p.monto.replace('$', '')) || 0;
                    return sum + monto;
                }, 0);

            setStats({
                mascotas: mascotas.length,
                citasHoy: citasDeHoy,
                consultasHoy: consultasDeHoy,
                ingresosHoy: ingresosDeHoy
            });
        });
    }, []);

    return (
        <div>
            {/* Header Dinámico */}
            <div className="header">
                <div>
                    <h1>Bienvenido/a, {perfil.nombre}</h1>
                    <p className="subtitle">Hoy es un gran día para hacer la diferencia 💚</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={perfil.foto} alt="User" style={{ borderRadius: '50%', width: '40px', height: '40px', objectFit: 'cover' }} />
                    <div style={{ fontSize: '0.9rem' }}>
                        <strong>{perfil.nombre}</strong>
                        <p style={{ color: 'var(--text-gray)', fontSize: '0.75rem' }}>{perfil.rol}</p>
                    </div>
                </div>
            </div>

            {/* Banner Principal */}
            <div className="card" style={{
                background: 'linear-gradient(90deg, #3b8259 0%, #4caf50 100%)',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '25px',
                padding: '0 30px',
                borderRadius: '15px',
                height: '180px',
                overflow: 'hidden'
            }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '10px', fontWeight: '600' }}>Pequeños pacientes,<br />grandes historias</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                        <PawPrint size={20} /> VetAngel
                    </div>
                </div>
                <img
                    src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                    alt="Mascotas"
                    style={{ height: '100%', objectFit: 'cover', maskImage: 'linear-gradient(to left, black, transparent)' }}
                />
            </div>

            {/* Tarjetas de Resumen */}
            <div className="grid-4" style={{ marginBottom: '30px' }}>
                <div className="card">
                    <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>Mascotas registradas</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                        <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-green)' }}>{stats.mascotas}</span>
                        <PawPrint color="var(--primary-green)" />
                    </div>
                </div>
                <div className="card">
                    <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>Citas hoy</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                        <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-dark)' }}>{stats.citasHoy}</span>
                        <Calendar color="var(--text-gray)" />
                    </div>
                </div>
                <div className="card">
                    <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>Consultas hoy</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                        <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-dark)' }}>{stats.consultasHoy}</span>
                        <Stethoscope color="var(--text-gray)" />
                    </div>
                </div>
                <div className="card">
                    <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>Ingresos del día</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                        <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-dark)' }}>${stats.ingresosHoy.toFixed(2)}</span>
                        <DollarSign color="var(--text-gray)" />
                    </div>
                </div>
            </div>

            {/* Accesos Rápidos */}
            <h3 style={{ marginBottom: '15px', fontSize: '1.2rem' }}>Accesos rápidos</h3>
            <div className="grid-4">
                {[
                    { icon: <CalendarPlus />, label: 'Registrar cita', tab: 'citas' },
                    { icon: <UserPlus />, label: 'Nueva consulta', tab: 'consultas' },
                    { icon: <ShoppingCart />, label: 'Venta en tienda', tab: 'tienda' },
                    { icon: <DollarSign />, label: 'Registrar pago', tab: 'pagos' }
                ].map((item, idx) => (
                    <div
                        key={idx}
                        className="card"
                        style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', padding: '15px 20px', transition: 'transform 0.2s' }}
                        onClick={() => setActiveTab(item.tab)}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <div style={{ backgroundColor: 'var(--light-green)', padding: '15px', borderRadius: '50%', color: 'var(--primary-green)' }}>
                            {item.icon}
                        </div>
                        <span style={{ fontWeight: '500', fontSize: '0.9rem', flex: 1 }}>{item.label}</span>
                        <ArrowRight size={16} color="var(--text-gray)" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;