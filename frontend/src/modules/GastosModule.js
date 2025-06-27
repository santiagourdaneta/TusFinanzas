import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import GastoFormulario from '../GastoFormulario'; // Ajusta la ruta si es necesario

function GastosModule({ usuarioLogueado, categoriasDisponibles, cargarCategorias }) {
  const [gastos, setGastos] = useState([]);
  const [gastoEditando, setGastoEditando] = useState(null);

  // Función para cargar los gastos de un usuario específico
  const cargarGastos = useCallback(async (userId) => {
    if (!userId) {
      console.log('cargarGastos (GastosModule): No userId provided, skipping fetch.');
      setGastos([]);
      return;
    }
    try {
      console.log(`cargarGastos (GastosModule): Fetching expenses for userId: ${userId}`);
      const respuesta = await axios.get(`http://localhost:5000/gastos/usuario/${userId}`);

      const gastosConFechasReales = respuesta.data.map(gasto => ({
        ...gasto,
        fecha: new Date(gasto.fecha)
      }));

      const gastosOrdenados = gastosConFechasReales.sort((a, b) => {
        const dateA = a.fecha instanceof Date && !isNaN(a.fecha) ? a.fecha.getTime() : 0;
        const dateB = b.fecha instanceof Date && !isNaN(b.fecha) ? b.fecha.getTime() : 0;
        return dateB - dateA;
      });

      setGastos(gastosOrdenados);
      console.log('¡Gastos cargados desde el servidor para usuario (GastosModule)!', userId, gastosOrdenados);
    } catch (error) {
      console.error('¡Hubo un error al cargar los gastos (GastosModule)!', error);
      alert('No se pudieron cargar los gastos. Revisa el Terminal del servidor.');
    }
  }, [setGastos]);

  // Maneja el gasto cuando se guarda o actualiza desde el formulario
  const manejarGastoGuardado = useCallback((gastoActualizadoONuevo) => {
    if (!gastoActualizadoONuevo) {
      setGastoEditando(null);
      return;
    }

    const gastoConFechaReal = {
      ...gastoActualizadoONuevo,
      fecha: new Date(gastoActualizadoONuevo.fecha)
    };

    const existeEnLista = gastos.some(gasto => gasto.id === gastoConFechaReal.id);

    if (existeEnLista) {
      setGastos(prevGastos =>
        prevGastos.map(gasto =>
          gasto.id === gastoConFechaReal.id ? gastoConFechaReal : gasto
        )
      );
    } else {
      setGastos(prevGastos => [gastoConFechaReal, ...prevGastos]);
    }
    setGastoEditando(null);
    console.log('Gasto procesado y fecha corregida en manejarGastoGuardado (GastosModule):', gastoConFechaReal);
    cargarCategorias(usuarioLogueado.id); // Recargar categorías para asegurar que el dropdown esté actualizado si se añadió una nueva
  }, [gastos, usuarioLogueado, cargarCategorias]); // Dependencias para useCallback

  // Función para eliminar un gasto
  const eliminarGasto = async (idGastoABorrar) => {
    const confirmar = window.confirm("¿Estás seguro de que quieres borrar este gasto?");
    if (!confirmar) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/gastos/${idGastoABorrar}`);
      console.log(`Gasto con ID ${idGastoABorrar} borrado del servidor.`);
      setGastos(prevGastos => prevGastos.filter(gasto => gasto.id !== idGastoABorrar));
      alert('Gasto borrado exitosamente.');
    } catch (error) {
      console.error('¡Hubo un error al borrar el gasto (GastosModule)!', error);
      alert('No se pudo borrar el gasto. Revisa el Terminal del servidor.');
    }
  };

  // useEffect para cargar los gastos cuando el componente se monta o el usuario cambia
  useEffect(() => {
    if (usuarioLogueado && usuarioLogueado.id) {
      cargarGastos(usuarioLogueado.id);
    } else {
      setGastos([]);
    }
  }, [usuarioLogueado, cargarGastos]);

  return (
    <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
      {/* Formulario de Gastos */}
      <GastoFormulario
        onGuardarGasto={manejarGastoGuardado}
        gastoAEditar={gastoEditando}
        usuarioIdActual={usuarioLogueado.id}
        categoriasDisponibles={categoriasDisponibles} // Pasamos las categorías desde Dashboard
      />

      {/* Lista de Gastos */}
      <div style={{ marginTop: '30px', width: '100%', maxWidth: '600px', margin: '0 auto', backgroundColor: '#f0f0f0', padding: '15px', borderRadius: '8px', textAlign: 'left', color: '#333' }}>
        <h3>Mis Últimos Gastos ({usuarioLogueado.nombre_usuario})</h3>
        {gastos.length === 0 ? (
          <p>No hay gastos registrados. ¡Añade uno!</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: '0' }}>
            {gastos.map((gasto) => (
              <li key={gasto.id} style={{
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
                  <strong>{gasto.descripcion}</strong>
                  <br />
                  <small>
                    {gasto.fecha instanceof Date && !isNaN(gasto.fecha)
                      ? gasto.fecha.toLocaleDateString()
                      : 'Fecha Desconocida'}
                    {gasto.categoria_nombre && ` - Categoría: ${gasto.categoria_nombre}`}
                  </small>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', color: 'red', marginRight: '10px' }}>
                    -${gasto.monto.toFixed(2)}
                  </span>
                  <button
                    onClick={() => setGastoEditando(gasto)}
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
                    onClick={() => eliminarGasto(gasto.id)}
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

export default GastosModule;
