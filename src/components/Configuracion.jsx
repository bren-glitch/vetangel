import React, { useState, useEffect } from 'react';
import { Save, User, Building, Bell, Upload, Camera } from 'lucide-react';

const Configuracion = () => {
    // Estados para la Clínica
    const [nombreClinica, setNombreClinica] = useState('VetAngel');
    const [direccion, setDireccion] = useState('Av. Principal #123, Ciudad');
    const [telefono, setTelefono] = useState('442 123 4567');

    // Estados para el Perfil de Usuario
    const [nombreUsuario, setNombreUsuario] = useState('Dra. Ana Martínez');
    const [correo, setCorreo] = useState('ana.martinez@vetangel.com');
    const [rol, setRol] = useState('Veterinaria');
    const [notificaciones, setNotificaciones] = useState(true);

    // Estados para la foto de perfil
    const [fotoPerfilUrl, setFotoPerfilUrl] = useState('https://i.pravatar.cc/150?img=5');
    const [fotoPerfilBase64, setFotoPerfilBase64] = useState('');

    // Cargar datos guardados
    useEffect(() => {
        const datosGuardados = localStorage.getItem('configVetAngel');
        if (datosGuardados) {
            const config = JSON.parse(datosGuardados);
            setNombreClinica(config.nombreClinica || 'VetAngel');
            setDireccion(config.direccion || '');
            setTelefono(config.telefono || '');
            setNombreUsuario(config.nombreUsuario || '');
            setCorreo(config.correo || '');
            setRol(config.rol || 'Veterinaria');
            setNotificaciones(config.notificaciones ?? true);
            setFotoPerfilUrl(config.fotoPerfilUrl || 'https://i.pravatar.cc/150?img=5');
            setFotoPerfilBase64(config.fotoPerfilBase64 || '');
        }
    }, []);

    const manejarSubidaFoto = (e) => {
        const archivo = e.target.files[0];
        if (archivo) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFotoPerfilBase64(reader.result);
                setFotoPerfilUrl(''); // Limpiamos la URL por defecto
            };
            reader.readAsDataURL(archivo);
        }
    };

    const guardarCambios = (e) => {
        e.preventDefault();

        let imagenFinal = fotoPerfilUrl;
        if (fotoPerfilBase64) imagenFinal = fotoPerfilBase64;

        const config = {
            nombreClinica, direccion, telefono,
            nombreUsuario, correo, rol, notificaciones,
            fotoPerfilUrl: imagenFinal, fotoPerfilBase64
        };

        localStorage.setItem('configVetAngel', JSON.stringify(config));
        alert("¡Configuración y perfil guardados con éxito!");
    };

    return (
        <div>
            <div className="header">
                <div>
                    <h1>Configuración</h1>
                    <p className="subtitle">Administra los datos de tu clínica y tu perfil de usuario.</p>
                </div>
                <button className="btn-primary" onClick={guardarCambios}>
                    <Save size={18} /> Guardar cambios
                </button>
            </div>

            <div className="grid-2">
                {/* Lado Izquierdo: Datos de la Clínica */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: 'var(--primary-green)' }}>
                        <Building size={24} />
                        <h3 style={{ fontSize: '1.2rem' }}>Datos de la Clínica</h3>
                    </div>

                    <form onSubmit={guardarCambios} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '5px', display: 'block' }}>Nombre de la clínica</label>
                            <input type="text" value={nombreClinica} onChange={(e) => setNombreClinica(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '5px', display: 'block' }}>Dirección</label>
                            <input type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '5px', display: 'block' }}>Teléfono</label>
                            <input type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />
                        </div>
                    </form>
                </div>

                {/* Lado Derecho: Perfil de Usuario (CON FOTO Y ROL) */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: 'var(--primary-green)' }}>
                        <User size={24} />
                        <h3 style={{ fontSize: '1.2rem' }}>Perfil de Usuario</h3>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                        {/* Avatar con botón de cámara */}
                        <div style={{ position: 'relative' }}>
                            <img
                                src={fotoPerfilBase64 || fotoPerfilUrl || 'https://via.placeholder.com/150'}
                                alt="Perfil"
                                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--light-green)' }}
                            />
                            <label style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: 'var(--primary-green)', borderRadius: '50%', padding: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Camera size={14} color="white" />
                                <input type="file" accept="image/*" onChange={manejarSubidaFoto} style={{ display: 'none' }} />
                            </label>
                        </div>

                        <div>
                            <h4 style={{ fontSize: '1.1rem', marginBottom: '2px' }}>{nombreUsuario || 'Usuario'}</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>{rol}</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '5px', display: 'block' }}>Nombre completo</label>
                            <input type="text" value={nombreUsuario} onChange={(e) => setNombreUsuario(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '5px', display: 'block' }}>Correo</label>
                                <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '5px', display: 'block' }}>Rol</label>
                                <select value={rol} onChange={(e) => setRol(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'white' }}>
                                    <option value="Veterinaria">Veterinaria/o</option>
                                    <option value="Recepcionista">Recepcionista</option>
                                    <option value="Administrador">Administrador/a</option>
                                    <option value="Dueño">Dueño/a de la Clínica</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', padding: '15px', backgroundColor: 'var(--light-green)', borderRadius: '8px' }}>
                            <Bell size={20} color="var(--primary-green)" />
                            <div style={{ flex: 1 }}>
                                <p style={{ fontWeight: '500', fontSize: '0.9rem' }}>Notificaciones por correo</p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>Recibir alertas de citas y pagos.</p>
                            </div>
                            <input type="checkbox" checked={notificaciones} onChange={(e) => setNotificaciones(e.target.checked)} style={{ width: '20px', height: '20px', accentColor: 'var(--primary-green)' }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Configuracion;