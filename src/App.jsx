import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Propietarios from './components/Propietarios';
import Mascotas from './components/Mascotas';
import Citas from './components/Citas';
import Consultas from './components/Consultas';
import Servicios from './components/Servicios';
import Tienda from './components/Tienda';
import Pagos from './components/Pagos';
import Reportes from './components/Reportes';
import Configuracion from './components/Configuracion';

function App() {
  const [activeTab, setActiveTab] = useState('inicio');

  // ESTADO NUEVO: Guarda los datos de la cita para pasarlos a consulta
  const [pacienteParaConsulta, setPacienteParaConsulta] = useState(null);

  const renderContent = () => {
    switch (activeTab) {
      case 'inicio': return <Dashboard setActiveTab={setActiveTab} />;
      case 'propietarios': return <Propietarios />;
      case 'mascotas': return <Mascotas />;

      // Le pasamos las funciones a Citas
      case 'citas': return <Citas setActiveTab={setActiveTab} setPacienteParaConsulta={setPacienteParaConsulta} />;

      // Le pasamos los datos del paciente a Consultas
      case 'consultas': return <Consultas pacientePrevio={pacienteParaConsulta} />;
      case 'citas': return <Citas />;
      case 'servicios': return <Servicios />;
      case 'tienda': return <Tienda />;
      case 'pagos': return <Pagos />;
      case 'reportes': return <Reportes />;
      case 'configuracion': return <Configuracion />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-content">
        {renderContent()}
      </div>
    </div>
  );
}

export default App;