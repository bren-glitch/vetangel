import React from 'react';
import { Home, Users, PawPrint, Calendar, Stethoscope, ShoppingBag, DollarSign, FileText, Settings, Heart } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
    const menuItems = [
        { id: 'inicio', label: 'Inicio', icon: <Home size={20} /> },
        { id: 'propietarios', label: 'Propietarios', icon: <Users size={20} /> },
        { id: 'mascotas', label: 'Mascotas', icon: <PawPrint size={20} /> },
        { id: 'citas', label: 'Citas', icon: <Calendar size={20} /> },
        { id: 'consultas', label: 'Consultas', icon: <Stethoscope size={20} /> },
        { id: 'servicios', label: 'Servicios', icon: <ShoppingBag size={20} /> },
        { id: 'tienda', label: 'Tienda / Inventario', icon: <ShoppingBag size={20} /> },
        { id: 'pagos', label: 'Pagos y recibos', icon: <DollarSign size={20} /> },
        { id: 'reportes', label: 'Reportes', icon: <FileText size={20} /> },
        { id: 'configuracion', label: 'Configuración', icon: <Settings size={20} /> },
    ];

    return (
        <div className="sidebar">
            <div className="logo-container">
                <PawPrint size={28} color="var(--primary-green)" fill="var(--primary-green)" />
                <span>VetAngel</span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
                {menuItems.map((item) => (
                    <div
                        key={item.id}
                        className={`menu-item ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(item.id)}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </div>
                ))}
            </div>

            <div style={{ padding: '20px', fontSize: '0.8rem', color: 'var(--text-gray)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Heart size={14} /> Cuidamos lo que más amas
            </div>
        </div>
    );
};

export default Sidebar;