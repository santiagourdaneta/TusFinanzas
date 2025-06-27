// src/IngresoFormulario.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function IngresoFormulario({ onGuardarIngreso, ingresoAEditar, usuarioIdActual }) {
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState(0.0);
  const [mensajeError, setMensajeError] = useState('');

  // useEffect para rellenar el formulario cuando 'ingresoAEditar' cambie
  useEffect(() => {
    if (ingresoAEditar) {
      setDescripcion(ingresoAEditar.descripcion);
      // Aseguramos que el monto sea un número al rellenar el formulario
      setMonto(typeof ingresoAEditar.monto === 'number' ? ingresoAEditar.monto : 0.0);
    } else {
      // Limpiar campos si no hay ingreso para editar o si se cancela la edición
      setDescripcion('');
      setMonto(0.0);
    }
    setMensajeError('');
  }, [ingresoAEditar]);

  const manejarEnvioFormulario = async (evento) => {
    evento.preventDefault();
    setMensajeError('');

    if (!descripcion || monto <= 0) {
      setMensajeError('Por favor, ingresa una descripción y un monto válido para el ingreso.');
      return;
    }
    if (!usuarioIdActual) {
      setMensajeError('Debes iniciar sesión para registrar ingresos.');
      return;
    }

    const datosIngreso = {
      descripcion: descripcion,
      monto: parseFloat(monto),
      usuario_id: usuarioIdActual, // ¡Incluimos el ID del usuario!
    };

    try {
      let respuesta;
      if (ingresoAEditar) {
        // Si estamos EDITANDO, hacemos una petición PUT con el ID del ingreso
        console.log(`Enviando actualización para ingreso ID: ${ingresoAEditar.id}`);
        respuesta = await axios.put(`http://localhost:5000/ingresos/${ingresoAEditar.id}`, datosIngreso);
       // alert('Ingreso actualizado exitosamente!');
      } else {
        // Si NO estamos editando, hacemos una petición POST (para un nuevo ingreso)
        console.log('Enviando nuevo ingreso...');
        respuesta = await axios.post('http://localhost:5000/ingresos', datosIngreso);
        //alert('Ingreso guardado exitosamente!');
      }

      onGuardarIngreso(respuesta.data); // Avisamos a App.js con los datos del ingreso

      // Limpiamos los campos después de guardar o actualizar
      setDescripcion('');
      setMonto(0.0);

    } catch (error) {
      console.error('¡Hubo un error al guardar/actualizar el ingreso!', error);
      if (error.response && error.response.data && error.response.data.error) {
        setMensajeError(error.response.data.error);
      } else {
        setMensajeError('Error de conexión o inesperado. Inténtalo de nuevo.');
      }
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '400px', margin: '20px auto', backgroundColor: '#e6ffe6' }}> {/* Color de fondo diferente */}
      <h2>{ingresoAEditar ? '✏️ Editar Ingreso' : '💸 Registrar Nuevo Ingreso'}</h2>
      {mensajeError && <p style={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>{mensajeError}</p>}
      <form onSubmit={manejarEnvioFormulario}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="descripcionIngreso" style={{ display: 'block', marginBottom: '5px' }}>Descripción:</label>
          <input
            type="text"
            id="descripcionIngreso"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej. Salario, Venta, Regalo"
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="montoIngreso" style={{ display: 'block', marginBottom: '5px' }}>Monto:</label>
          <input
            type="number"
            id="montoIngreso"
            value={monto}
            onChange={(e) => setMonto(parseFloat(e.target.value))}
            step="0.01"
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>

        <button type="submit" style={{
          backgroundColor: '#28a745', // Verde para ingresos
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px'
        }}>
          {ingresoAEditar ? 'Guardar Cambios' : 'Guardar Ingreso'}
        </button>
        {ingresoAEditar && (
            <button
                type="button"
                onClick={() => onGuardarIngreso(null)}
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

export default IngresoFormulario;