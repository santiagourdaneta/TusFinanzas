import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios'; // Para llamadas específicas del dashboard o datos globales

// Importamos los componentes de cada módulo (los crearemos en los siguientes pasos)
import GastosModule from './modules/GastosModule';
import IngresosModule from './modules/IngresosModule';
import ObjetivosModule from './modules/ObjetivosModule';
import CategoriasModule from './modules/CategoriasModule';

function Dashboard({ usuarioLogueado, manejarLogout }) {
  // Estado para controlar qué módulo está activo
  const [moduloActivo, setModuloActivo] = useState('gastos'); // Por defecto, mostrar gastos

  // Estado para categorías, ya que se usan en varios módulos (gastos, y gestión de categorías)
  const [categorias, setCategorias] = useState([]);

  // Función para cargar las categorías del usuario
  const cargarCategorias = useCallback(async (userId) => {
    if (!userId) {
      console.log('cargarCategorias (Dashboard): No userId provided, skipping fetch.');
      setCategorias([]);
      return;
    }
    try {
      console.log(`cargarCategorias (Dashboard): Fetching categories for userId: ${userId}`);
      const respuesta = await axios.get(`http://localhost:5000/categorias/usuario/${userId}`);
      const data = respuesta.data;
      setCategorias(data);
      console.log('¡Categorías cargadas para usuario (Dashboard)!', userId, data);
    } catch (error) {
      console.error('¡Hubo un error al cargar las categorías (Dashboard)!', error);
      setCategorias([]);
      alert('No se pudieron cargar las categorías. Revisa el Terminal del servidor.');
    }
  }, [setCategorias]);

  // useEffect para cargar las categorías cuando el usuario logueado cambie
  useEffect(() => {
    if (usuarioLogueado && usuarioLogueado.id) {
      cargarCategorias(usuarioLogueado.id);
    } else {
      setCategorias([]); // Limpiar categorías si no hay usuario logueado
    }
  }, [usuarioLogueado, cargarCategorias]);


  // Función para renderizar el módulo correcto basado en 'moduloActivo'
  const renderModulo = () => {
    switch (moduloActivo) {
      case 'gastos':
        return (
          <GastosModule
            usuarioLogueado={usuarioLogueado}
            categoriasDisponibles={categorias} // Pasamos las categorías desde Dashboard
            cargarCategorias={cargarCategorias} // Pasamos la función para que GastosModule pueda recargar si es necesario
          />
        );
      case 'ingresos':
        return <IngresosModule usuarioLogueado={usuarioLogueado} />;
      case 'objetivos':
        return <ObjetivosModule usuarioLogueado={usuarioLogueado} />;
      case 'categorias':
        return (
          <CategoriasModule
            usuarioLogueado={usuarioLogueado}
            categorias={categorias} // Pasamos las categorías actuales
            cargarCategorias={cargarCategorias} // Pasamos la función para que CategoriasModule pueda recargar/actualizar
          />
        );
      default:
        return <GastosModule usuarioLogueado={usuarioLogueado} categoriasDisponibles={categorias} />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      {/* Barra de Navegación Lateral (Sidebar) */}
      <nav style={{
        width: '200px',
        backgroundColor: '#343a40',
        color: 'white',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '2px 0 5px rgba(0,0,0,0.2)'
      }}>
        <h2 style={{ marginBottom: '30px', color: '#61dafb' }}>Tus Finanzas</h2>
        <ul style={{ listStyle: 'none', padding: 0, width: '100%' }}>
          <li style={{ marginBottom: '15px' }}>
            <button
              onClick={() => setModuloActivo('gastos')}
              style={{
                width: '100%',
                padding: '10px 15px',
                backgroundColor: moduloActivo === 'gastos' ? '#007bff' : 'transparent',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '1rem',
                transition: 'background-color 0.3s ease'
              }}
            >
              Gastos
            </button>
          </li>
          <li style={{ marginBottom: '15px' }}>
            <button
              onClick={() => setModuloActivo('ingresos')}
              style={{
                width: '100%',
                padding: '10px 15px',
                backgroundColor: moduloActivo === 'ingresos' ? '#007bff' : 'transparent',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '1rem',
                transition: 'background-color 0.3s ease'
              }}
            >
              Ingresos
            </button>
          </li>
          
          <li style={{ marginBottom: '15px' }}>
            <button
              onClick={() => setModuloActivo('categorias')}
              style={{
                width: '100%',
                padding: '10px 15px',
                backgroundColor: moduloActivo === 'categorias' ? '#007bff' : 'transparent',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '1rem',
                transition: 'background-color 0.3s ease'
              }}
            >
              Categorías
            </button>
          </li>
        </ul>

        {/* Información del usuario y botón de cerrar sesión */}
        <div style={{ marginTop: 'auto', textAlign: 'center', width: '100%', paddingTop: '20px', borderTop: '1px solid #495057' }}>
          <span style={{ display: 'block', marginBottom: '10px', color: '#adb5bd' }}>
            Bienvenido, {usuarioLogueado.nombre_usuario}
          </span>
          <button
            onClick={manejarLogout}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              padding: '8px 15px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'background-color 0.3s ease'
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      </nav>

      {/* Contenido Principal del Dashboard */}
      <main style={{ flexGrow: 1, padding: '20px', backgroundColor: '#e9ecef' }}>
        <h1 style={{ marginBottom: '20px', color: '#343a40' }}>
          {moduloActivo.charAt(0).toUpperCase() + moduloActivo.slice(1)}
        </h1> {/* Título dinámico */}
        {renderModulo()}
      </main>
    </div>
  );
}

export default Dashboard;
