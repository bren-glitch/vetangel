import React, { useState, useEffect } from 'react';
import { Download, DollarSign, FileText, TrendingUp } from 'lucide-react';

const Reportes = () => {
    const [pagos, setPagos] = useState([]);

    useEffect(() => {
        fetch('/api/pagos')
            .then(res => res.json())
            .then(data => setPagos(data));
    }, []);

    // Calcular ingresos totales (solo los que están "Pagado")
    const ingresosTotales = pagos
        .filter(p => p.estado === 'Pagado')
        .reduce((total, pago) => {
            // Limpiamos el string ($250.00 -> 250.00)
            const montoNumero = parseFloat(pago.monto.replace('$', '')) || 0;
            return total + montoNumero;
        }, 0);

    return (
        <div>
            <div className="header">
                <div>
                    <h1>Reportes</h1>
                    <p className="subtitle">Visualiza el rendimiento de tu clínica veterinaria.</p>
                </div>
                <button className="btn-primary" onClick={() => window.print()}>
                    <Download size={18} /> Exportar Reporte
                </button>
            </div>

            <div className="grid-4" style={{ marginBottom: '25px' }}>
                <div className="card">
                    <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>Ingresos Totales (Pagados)</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                        <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary-green)' }}>
                            ${ingresosTotales.toFixed(2)}
                        </span>
                        <DollarSign color="var(--primary-green)" />
                    </div>
                </div>

                <div className="card">
                    <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>Recibos Generados</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                        <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-dark)' }}>{pagos.length}</span>
                        <FileText color="var(--text-gray)" />
                    </div>
                </div>

                <div className="card">
                    <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>Pagos Pendientes</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                        <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#ef6c00' }}>
                            {pagos.filter(p => p.estado === 'Pendiente').length}
                        </span>
                        <TrendingUp color="#ef6c00" />
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
                    <h3 style={{ fontSize: '1.1rem' }}>Últimos Movimientos</h3>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: 'var(--light-green)', color: 'var(--primary-green)' }}>
                        <tr>
                            <th style={{ padding: '15px' }}>Fecha</th>
                            <th style={{ padding: '15px' }}>Concepto</th>
                            <th style={{ padding: '15px' }}>Método</th>
                            <th style={{ padding: '15px' }}>Monto</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pagos.slice(-5).reverse().map((pago) => ( // Muestra los últimos 5
                            <tr key={pago.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '15px', fontWeight: '500' }}>{pago.fecha}</td>
                                <td style={{ padding: '15px', color: 'var(--text-gray)' }}>{pago.concepto}</td>
                                <td style={{ padding: '15px' }}>{pago.metodo}</td>
                                <td style={{ padding: '15px', fontWeight: 'bold' }}>{pago.monto}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Reportes;