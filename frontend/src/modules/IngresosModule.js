import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import IngresoFormulario from '../IngresoFormulario'; // Ajusta la ruta si es necesario

function IngresosModule({ usuarioLogueado }) {
  const [ingresos, setIngresos] = useState([]);
  const [ingresoEditando, setIngresoEditando] = useState(null);

  // Función para cargar los ingresos de un usuario específico
  const cargarIngresos = useCallback(async (userId) => {
    if (!userId) {
      console.log('cargarIngresos (IngresosModule): No userId provided, skipping fetch.');
      setIngresos([]);
      return;
    }
    try {
      console.log(`cargarIngresos (IngresosModule): Fetching incomes for userId: ${userId}`);
      const respuesta = await axios.get(`http://localhost:5000/ingresos/usuario/${userId}`);

      const ingresosConFechasReales = respuesta.data.map(ingreso => ({
        ...ingreso,
        fecha: new Date(ingreso.fecha)
      }));

      const ingresosOrdenados = ingresosConFechasReales.sort((a, b) => {
        const dateA = a.fecha instanceof Date && !isNaN(a.fecha) ? a.fecha.getTime() : 0;
        const dateB = b.fecha instanceof Date && !isNaN(b.fecha) ? b.fecha.getTime() : 0;
        return dateB - dateA;
      });

      setIngresos(ingresosOrdenados);
      console.log('¡Ingresos cargados desde el servidor para usuario (IngresosModule)!', userId, ingresosOrdenados);
    } catch (error) {
      console.error('¡Hubo un error al cargar los ingresos (IngresosModule)!', error);
      alert('No se pudieron cargar los ingresos. Revisa el Terminal del servidor.');
    }
  }, [setIngresos]);

  // Maneja el ingreso cuando se guarda o actualiza desde el formulario
  const manejarIngresoGuardado = useCallback((ingresoActualizadoONuevo) => {
    if (!ingresoActualizadoONuevo) {
      setIngresoEditando(null);
      return;
    }

    const ingresoConFechaReal = {
      ...ingresoActualizadoONuevo,
      fecha: new Date(ingresoActualizadoONuevo.fecha)
    };

    const existeEnLista = ingresos.some(ingreso => ingreso.id === ingresoConFechaReal.id);

    if (existeEnLista) {
      setIngresos(prevIngresos =>
        prevIngresos.map(ingreso =>
          ingreso.id === ingresoConFechaReal.id ? ingresoConFechaReal : ingreso
        )
      );
    } else {
      setIngresos(prevIngresos => [ingresoConFechaReal, ...prevIngresos]);
    }
    setIngresoEditando(null);
    console.log('Ingreso procesado y fecha corregida en manejarIngresoGuardado (IngresosModule):', ingresoConFechaReal);
  }, [ingresos]); // Dependencias para useCallback

  // Función para eliminar un ingreso
  const eliminarIngreso = async (idIngresoABorrar) => {
    const confirmar = window.confirm("¿Estás seguro de que quieres borrar este ingreso?");
    if (!confirmar) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/ingresos/${idIngresoABorrar}`);
      console.log(`Ingreso con ID ${idIngresoABorrar} borrado del servidor.`);
      setIngresos(prevIngresos => prevIngresos.filter(ingreso => ingreso.id !== idIngresoABorrar));
      alert('Ingreso borrado exitosamente.');
    } catch (error) {
      console.error('¡Hubo un error al borrar el ingreso (IngresosModule)!', error);
      alert('No se pudo borrar el ingreso. Revisa el Terminal del servidor.');
    }
  };

  // useEffect para cargar los ingresos cuando el componente se monta o el usuario cambia
  useEffect(() => {
    if (usuarioLogueado && usuarioLogueado.id) {
      cargarIngresos(usuarioLogueado.id);
    } else {
      setIngresos([]);
    }
  }, [usuarioLogueado, cargarIngresos]);


  return (
    <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
      {/* Formulario de Ingresos */}
      <IngresoFormulario
        onGuardarIngreso={manejarIngresoGuardado}
        ingresoAEditar={ingresoEditando}
        usuarioIdActual={usuarioLogueado.id}
      />

      {/* Lista de Ingresos */}
      <div style={{ marginTop: '30px', width: '100%', maxWidth: '600px', margin: '0 auto', backgroundColor: '#f0f0f0', padding: '15px', borderRadius: '8px', textAlign: 'left', color: '#333' }}>
        <h3>Mis Últimos Ingresos ({usuarioLogueado.nombre_usuario})</h3>
        {ingresos.length === 0 ? (
          <p>No hay ingresos registrados. ¡Añade uno!</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: '0' }}>
            {ingresos.map((ingreso) => (
              <li key={ingreso.id} style={{
                backgroundColor: 'white',
                margin: '8px 0',
                padding: '10px 15px',
                borderRadius: '5px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <div>
                  <strong>{ingreso.descripcion}</strong>
                  <br />
                  <small>
                    {ingreso.fecha instanceof Date && !isNaN(ingreso.fecha)
                      ? ingreso.fecha.toLocaleDateString()
                      : 'Fecha Desconocida'}
                  </small>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', color: 'green', marginRight: '10px' }}>
                    +${ingreso.monto.toFixed(2)}
                  </span>
                  <button
                    onClick={() => setIngresoEditando(ingreso)}
                    style={{
                      backgroundColor: '#ffc107',
                      color: 'black',
                      border: 'none',
                      borderRadius: '5px',
                      padding: '5px 10px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      marginRight: '5px'
                    }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => eliminarIngreso(ingreso.id)}
                    style={{
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      padding: '5px 10px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Borrar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default IngresosModule;
