import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ObjetivoFormulario from '../ObjetivoFormulario'; // ¡Asegúrate de que este componente exista!

function ObjetivosModule({ usuarioLogueado }) {
  const [objetivos, setObjetivos] = useState([]);
  const [objetivoEditando, setObjetivoEditando] = useState(null);

  // Función para cargar los objetivos de ahorro del usuario
  const cargarObjetivos = useCallback(async (userId) => {
    if (!userId) {
      console.log('cargarObjetivos (ObjetivosModule): No userId provided, skipping fetch.');
      setObjetivos([]);
      return;
    }
    try {
      console.log(`cargarObjetivos (ObjetivosModule): Fetching objectives for userId: ${userId}`);
      const respuesta = await axios.get(`http://localhost:5000/objetivos/usuario/${userId}`);
      const data = respuesta.data;
      setObjetivos(data);
      console.log('¡Objetivos cargados desde el servidor para usuario (ObjetivosModule)!', userId, data);
    } catch (error) {
      console.error('¡Hubo un error al cargar los objetivos (ObjetivosModule)!', error);
      alert('No se pudieron cargar los objetivos. Revisa el Terminal del servidor.');
    }
  }, [setObjetivos]);

  // Maneja el objetivo cuando se guarda o actualiza desde el formulario
  const manejarObjetivoGuardado = useCallback((objetivoActualizadoONuevo) => {
    if (!objetivoActualizadoONuevo) {
      setObjetivoEditando(null);
      return;
    }

    const existeEnLista = objetivos.some(obj => obj.id === objetivoActualizadoONuevo.id);

    if (existeEnLista) {
      setObjetivos(prevObjetivos =>
        prevObjetivos.map(obj =>
          obj.id === objetivoActualizadoONuevo.id ? objetivoActualizadoONuevo : obj
        )
      );
    } else {
      setObjetivos(prevObjetivos => [...prevObjetivos, objetivoActualizadoONuevo]); // Añadir nuevos al final
    }
    setObjetivoEditando(null);
    console.log('Objetivo procesado en manejarObjetivoGuardado (ObjetivosModule):', objetivoActualizadoONuevo);
  }, [objetivos]);

  // Función para eliminar un objetivo
  const eliminarObjetivo = async (idObjetivoABorrar) => {
    const confirmar = window.confirm("¿Estás seguro de que quieres borrar este objetivo de ahorro?");
    if (!confirmar) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/objetivos/${idObjetivoABorrar}`);
      console.log(`Objetivo con ID ${idObjetivoABorrar} borrado del servidor.`);
      setObjetivos(prevObjetivos => prevObjetivos.filter(obj => obj.id !== idObjetivoABorrar));
      alert('Objetivo borrado exitosamente.');
    } catch (error) {
      console.error('¡Hubo un error al borrar el objetivo (ObjetivosModule)!', error);
      alert('No se pudo borrar el objetivo. Revisa el Terminal del servidor.');
    }
  };

  // Función para manejar el aporte a un objetivo (simplemente actualiza el monto actual)
  const manejarAporteObjetivo = async (objetivoId, montoAporte) => {
    // Buscar el objetivo en la lista actual
    const objetivoActual = objetivos.find(obj => obj.id === objetivoId);
    if (!objetivoActual) return;

    const nuevoMontoActual = parseFloat((objetivoActual.monto_actual + montoAporte).toFixed(2));
    if (isNaN(nuevoMontoActual)) {
        alert('Monto de aporte inválido.');
        return;
    }

    try {
      const response = await axios.put(`http://localhost:5000/objetivos/${objetivoId}`, {
        ...objetivoActual, // Mantener las demás propiedades
        monto_actual: nuevoMontoActual,
        usuario_id: usuarioLogueado.id // Aseguramos el usuario_id para la validación del backend
      });
      manejarObjetivoGuardado(response.data); // Actualizar el estado con el objetivo modificado
      alert(`Aporte de $${montoAporte.toFixed(2)} añadido al objetivo "${objetivoActual.nombre}".`);
    } catch (error) {
      console.error('Error al añadir aporte al objetivo:', error);
      alert('No se pudo añadir el aporte. Revisa el Terminal del servidor.');
    }
  };


  // useEffect para cargar los objetivos cuando el componente se monta o el usuario cambia
  useEffect(() => {
    if (usuarioLogueado && usuarioLogueado.id) {
      cargarObjetivos(usuarioLogueado.id);
    } else {
      setObjetivos([]);
    }
  }, [usuarioLogueado, cargarObjetivos]);

  return (
    <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
      {/* Formulario de Objetivos */}
      <ObjetivoFormulario
        onGuardarObjetivo={manejarObjetivoGuardado}
        objetivoAEditar={objetivoEditando}
        usuarioIdActual={usuarioLogueado.id}
        onCancelEdit={() => setObjetivoEditando(null)}
      />

      {/* Lista de Objetivos */}
      <div style={{ marginTop: '30px', width: '100%', maxWidth: '600px', margin: '0 auto', backgroundColor: '#f0f0f0', padding: '15px', borderRadius: '8px', textAlign: 'left', color: '#333' }}>
        <h3>Mis Objetivos de Ahorro ({usuarioLogueado.nombre_usuario})</h3>
        {objetivos.length === 0 ? (
          <p>No tienes objetivos de ahorro. ¡Crea uno!</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: '0' }}>
            {objetivos.map((objetivo) => {

             // --- ¡INICIO DE LA CORRECCIÓN MÁS FUERTE AQUÍ! ---

              // Asegurarse de que el 'objetivo' en sí no es null/undefined
              if (!objetivo) return null; // Saltar si el objetivo es nulo o indefinido

              // Convertir a número y asegurar valor por defecto de 0 si no es válido
              const montoActual = parseFloat(objetivo.monto_actual) || 0;
              const montoObjetivo = parseFloat(objetivo.monto_objetivo) || 0;

              // Calcular progreso de forma segura
              const progreso = montoObjetivo > 0
                ? (montoActual / montoObjetivo) * 100
                : 0;
              const porcentaje = Math.min(100, Math.max(0, progreso)).toFixed(1);
              // --- ¡FIN DE LA CORRECCIÓN MÁS FUERTE AQUÍ! ---
              
              return (
                <li key={objetivo.id} style={{
                  backgroundColor: 'white',
                  margin: '8px 0',
                  padding: '10px 15px',
                  borderRadius: '5px',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{objetivo.nombre}</strong>
                    <span style={{ fontWeight: 'bold', color: progreso >= 100 ? 'green' : '#007bff' }}>
                      ${objetivo.monto_actual.toFixed(2)} / ${objetivo.monto_objetivo.toFixed(2)}
                    </span>
                  </div>
                  <div style={{ width: '100%', backgroundColor: '#e0e0e0', borderRadius: '5px', marginTop: '5px' }}>
                    <div style={{
                      width: `${porcentaje}%`,
                      height: '15px',
                      backgroundColor: progreso >= 100 ? '#28a745' : '#007bff',
                      borderRadius: '5px',
                      textAlign: 'center',
                      color: 'white',
                      fontSize: '0.8rem',
                      lineHeight: '15px'
                    }}>
                      {porcentaje}%
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <button
                      onClick={() => {
                        const aporte = parseFloat(prompt('¿Cuánto quieres aportar a este objetivo?'));
                        if (!isNaN(aporte) && aporte > 0) {
                          manejarAporteObjetivo(objetivo.id, aporte);
                        } else if (aporte !== null) { // Si el usuario no cancela y el input es inválido
                          alert('Por favor, introduce un número válido y positivo.');
                        }
                      }}
                      style={{
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        padding: '5px 10px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        marginRight: '5px'
                      }}
                    >
                      Aportar
                    </button>
                    <button
                      onClick={() => setObjetivoEditando(objetivo)}
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
                      onClick={() => eliminarObjetivo(objetivo.id)}
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
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ObjetivosModule;
