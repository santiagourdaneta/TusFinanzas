// src/GastoFormulario.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Ahora recibe 'categoriasDisponibles' como una nueva prop
function GastoFormulario({ onGuardarGasto, gastoAEditar, usuarioIdActual, categoriasDisponibles }) {
  
  console.log('GastoFormulario: Received categoriasDisponibles prop:', categoriasDisponibles); // See what GastoFormulario gets

  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState(0.0);
  const [selectedCategoriaId, setSelectedCategoriaId] = useState(''); // Nuevo estado para la categoría seleccionada
  const [mensajeError, setMensajeError] = useState('');

  // useEffect para rellenar el formulario cuando 'gastoAEditar' cambie
  useEffect(() => {
    if (gastoAEditar) {
      setDescripcion(gastoAEditar.descripcion);
      setMonto(typeof gastoAEditar.monto === 'number' ? gastoAEditar.monto : 0.0);
      // Rellena la categoría si el gasto tiene una
      setSelectedCategoriaId(gastoAEditar.categoria_id ? gastoAEditar.categoria_id.toString() : '');
    } else {
      setDescripcion('');
      setMonto(0.0);
      setSelectedCategoriaId(''); // Limpiar la categoría seleccionada
    }
    setMensajeError('');
  }, [gastoAEditar]);

  const manejarEnvioFormulario = async (evento) => {
    evento.preventDefault();
    setMensajeError('');

    if (!descripcion || monto <= 0) {
      setMensajeError('Por favor, ingresa una descripción y un monto válido para el gasto.');
      return;
    }
    if (!usuarioIdActual) {
      setMensajeError('Debes iniciar sesión para registrar gastos.');
      return;
    }

    // Datos del gasto a enviar al servidor
    const datosGasto = {
      descripcion: descripcion,
      monto: parseFloat(monto),
      usuario_id: usuarioIdActual,
      categoria_id: selectedCategoriaId ? parseInt(selectedCategoriaId) : null, // Envía el ID de la categoría (o null si no hay)
    };

    try {
      let respuesta;
      if (gastoAEditar) {
        console.log(`Enviando actualización para ID: ${gastoAEditar.id}`);
        respuesta = await axios.put(`http://localhost:5000/gastos/${gastoAEditar.id}`, datosGasto);
       // alert('Gasto actualizado exitosamente!');
      } else {
        console.log('Enviando nuevo gasto...');
        respuesta = await axios.post('http://localhost:5000/gastos', datosGasto);
       // alert('Gasto guardado exitosamente!');
      }

      onGuardarGasto(respuesta.data); // Avisamos a App.js con los datos del gasto

      setDescripcion('');
      setMonto(0.0);
      setSelectedCategoriaId(''); // Limpiar la categoría seleccionada
    } catch (error) {
      console.error('¡Hubo un error al guardar/actualizar el gasto!', error);
      if (error.response && error.response.data && error.response.data.error) {
        setMensajeError(error.response.data.error);
      } else {
        setMensajeError('Error de conexión o inesperado. Inténtalo de nuevo.');
      }
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '400px', margin: '20px auto', backgroundColor: '#fff', color: '#000' }}>
      <h2>{gastoAEditar ? '✏️ Editar Gasto' : '💰 Registrar Nuevo Gasto'}</h2>
      {mensajeError && <p style={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>{mensajeError}</p>}
      <form onSubmit={manejarEnvioFormulario}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="descripcionGasto" style={{ display: 'block', marginBottom: '5px' }}>Descripción:</label>
          <input
            type="text"
            id="descripcionGasto"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej. Comida, Transporte, Ropa"
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="montoGasto" style={{ display: 'block', marginBottom: '5px' }}>Monto:</label>
          <input
            type="number"
            id="montoGasto"
            value={monto}
            onChange={(e) => setMonto(parseFloat(e.target.value))}
            step="0.01"
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>

       {/* Selector de Categorías */}
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="categoriaGasto" style={{ display: 'block', marginBottom: '5px' }}>Categoría:</label>
            <select
              id="categoriaGasto"
              value={selectedCategoriaId}
              onChange={(e) => setSelectedCategoriaId(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="">-- Selecciona una Categoría --</option>
              {/* --- ¡AQUÍ ESTÁ LA CLAVE! Verificamos si categoriasDisponibles existe y es un array --- */}
              {categoriasDisponibles && Array.isArray(categoriasDisponibles) && categoriasDisponibles.map(categoria => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
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
          {gastoAEditar ? 'Guardar Cambios' : 'Guardar Gasto'}
        </button>
        {gastoAEditar && (
            <button
                type="button"
                onClick={() => onGuardarGasto(null)}
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

export default GastoFormulario;