// src/ObjetivoFormulario.js
    import React, { useState, useEffect } from 'react';
    import axios from 'axios';

    function ObjetivoFormulario({ onGuardarObjetivo, objetivoAEditar, usuarioIdActual }) {
      const [nombre, setNombre] = useState('');
      const [montoMeta, setMontoMeta] = useState(0.0);
      const [montoActual, setMontoActual] = useState(0.0);
      const [fechaLimite, setFechaLimite] = useState(''); // Formato YYYY-MM-DD
      const [completado, setCompletado] = useState(false); // Checkbox para completado
      const [mensajeError, setMensajeError] = useState('');

      // useEffect para rellenar el formulario cuando 'objetivoAEditar' cambie
      useEffect(() => {
        if (objetivoAEditar) {
          setNombre(objetivoAEditar.nombre);
          setMontoMeta(typeof objetivoAEditar.monto_meta === 'number' ? objetivoAEditar.monto_meta : 0.0);
          setMontoActual(typeof objetivoAEditar.monto_actual === 'number' ? objetivoAEditar.monto_actual : 0.0);
          // Formatear la fecha para el input type="date"
          setFechaLimite(objetivoAEditar.fecha_limite ? objetivoAEditar.fecha_limite.split('T')[0] : '');
          setCompletado(objetivoAEditar.completado === 1); // Convertir 0/1 a boolean
        } else {
          setNombre('');
          setMontoMeta(0.0);
          setMontoActual(0.0);
          setFechaLimite('');
          setCompletado(false);
        }
        setMensajeError('');
      }, [objetivoAEditar]);

      const manejarEnvioFormulario = async (evento) => {
        evento.preventDefault();
        setMensajeError('');

        if (!nombre || montoMeta <= 0 || montoActual < 0) {
          setMensajeError('Por favor, ingresa un nombre, monto meta válido y monto actual.');
          return;
        }
        if (!usuarioIdActual) {
          setMensajeError('Debes iniciar sesión para registrar objetivos.');
          return;
        }

        const datosObjetivo = {
          nombre: nombre,
          monto_meta: parseFloat(montoMeta),
          monto_actual: parseFloat(montoActual),
          fecha_limite: fechaLimite || null, // Si está vacío, guarda null
          completado: completado ? 1 : 0, // Convertir boolean a 0/1
          usuario_id: usuarioIdActual,
        };

        try {
          let respuesta;
          if (objetivoAEditar) {
            console.log(`Enviando actualización para objetivo ID: ${objetivoAEditar.id}`);
            respuesta = await axios.put(`http://localhost:5000/objetivos/${objetivoAEditar.id}`, datosObjetivo);
          //  alert('Objetivo actualizado exitosamente!');
          } else {
            console.log('Enviando nuevo objetivo...');
            respuesta = await axios.post('http://localhost:5000/objetivos', datosObjetivo);
          //  alert('Objetivo guardado exitosamente!');
          }

          onGuardarObjetivo(respuesta.data); // Avisamos a App.js con los datos del objetivo

          setNombre('');
          setMontoMeta(0.0);
          setMontoActual(0.0);
          setFechaLimite('');
          setCompletado(false);
        } catch (error) {
          console.error('¡Hubo un error al guardar/actualizar el objetivo!', error);
          if (error.response && error.response.data && error.response.data.error) {
            setMensajeError(error.response.data.error);
          } else {
            setMensajeError('Error de conexión o inesperado. Inténtalo de nuevo.');
          }
        }
      };

      return (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '400px', margin: '20px auto', backgroundColor: '#e6f2ff' }}> {/* Color de fondo diferente */}
          <h2>{objetivoAEditar ? '✏️ Editar Objetivo' : '🎯 Registrar Nuevo Objetivo'}</h2>
          {mensajeError && <p style={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>{mensajeError}</p>}
          <form onSubmit={manejarEnvioFormulario}>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="nombreObjetivo" style={{ display: 'block', marginBottom: '5px' }}>Nombre del Objetivo:</label>
              <input
                type="text"
                id="nombreObjetivo"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Ahorrar para Vacaciones"
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="montoMeta" style={{ display: 'block', marginBottom: '5px' }}>Monto Meta:</label>
              <input
                type="number"
                id="montoMeta"
                value={montoMeta}
                onChange={(e) => setMontoMeta(parseFloat(e.target.value))}
                step="0.01"
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="montoActual" style={{ display: 'block', marginBottom: '5px' }}>Monto Actual Ahorrado:</label>
              <input
                type="number"
                id="montoActual"
                value={montoActual}
                onChange={(e) => setMontoActual(parseFloat(e.target.value))}
                step="0.01"
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="fechaLimite" style={{ display: 'block', marginBottom: '5px' }}>Fecha Límite (Opcional):</label>
              <input
                type="date" // Input de fecha
                id="fechaLimite"
                value={fechaLimite}
                onChange={(e) => setFechaLimite(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>

            <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                id="completado"
                checked={completado}
                onChange={(e) => setCompletado(e.target.checked)}
                style={{ marginRight: '10px' }}
              />
              <label htmlFor="completado">Objetivo Completado</label>
            </div>

            <button type="submit" style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}>
              {objetivoAEditar ? 'Guardar Cambios' : 'Guardar Objetivo'}
            </button>
            {objetivoAEditar && (
                <button
                    type="button"
                    onClick={() => onGuardarObjetivo(null)}
                    style={{
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        padding: '10px 20px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        marginLeft: '10px'
                    }}
                >
                    Cancelar Edición
                </button>
            )}
          </form>
        </div>
      );
    }

    export default ObjetivoFormulario;
    