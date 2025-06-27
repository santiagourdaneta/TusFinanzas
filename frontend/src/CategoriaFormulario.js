import React, { useState, useEffect } from 'react';

const CategoriaFormulario = ({
  usuarioId,
  onCategoriaCreada,
  onCategoriaActualizada,
  categoriaAEditar = null, // Propiedad opcional para modo edición
  onCancelEdit = () => {} // Función para cancelar la edición
}) => {
  const [nombreCategoria, setNombreCategoria] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  // Efecto para precargar datos si estamos en modo edición
  useEffect(() => {
    if (categoriaAEditar) {
      setNombreCategoria(categoriaAEditar.nombre);
      setError('');
      setMensaje('');
    } else {
      setNombreCategoria(''); // Limpiar si no hay categoría a editar
    }
  }, [categoriaAEditar]); // Se ejecuta cada vez que 'categoriaAEditar' cambia

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    if (!nombreCategoria.trim()) {
      setError('El nombre de la categoría no puede estar vacío.');
      return;
    }

    // Determina si es una creación o una actualización
    const method = categoriaAEditar ? 'PUT' : 'POST';
    const url = categoriaAEditar
      ? `http://localhost:5000/categorias/${categoriaAEditar.id}`
      : 'http://localhost:5000/categorias';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre: nombreCategoria, usuario_id: usuarioId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error al ${categoriaAEditar ? 'actualizar' : 'crear'} la categoría.`);
      }

      const categoriaProcesada = await response.json();

      if (categoriaAEditar) {
        setMensaje(`Categoría "${categoriaProcesada.nombre}" actualizada con éxito.`);
        if (onCategoriaActualizada) {
          onCategoriaActualizada(categoriaProcesada);
        }
        onCancelEdit(); // Sale del modo edición
      } else {
        setMensaje(`Categoría "${categoriaProcesada.nombre}" creada con éxito.`);
        if (onCategoriaCreada) {
          onCategoriaCreada(categoriaProcesada);
        }
      }
      setNombreCategoria(''); // Limpiar el campo después de la operación
    } catch (err) {
      console.error(`Error al ${categoriaAEditar ? 'actualizar' : 'crear'} categoría:`, err);
      setError(err.message);
    }
  };

  return (
    <div style={{
      padding: '20px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      marginBottom: '20px',
      backgroundColor: '#f9f9f9',
      color:'#000' ,
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }}>
      <h3>{categoriaAEditar ? 'Editar Categoría' : 'Crear Nueva Categoría'}</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="nombreCategoria" style={{
            display: 'block',
            marginBottom: '5px',
            fontWeight: 'bold',
            color: '#333'
          }}>
            Nombre de la Categoría:
          </label>
          <input
            type="text"
            id="nombreCategoria"
            value={nombreCategoria}
            onChange={(e) => setNombreCategoria(e.target.value)}
            style={{
              width: 'calc(100% - 18px)', // Ajuste para padding
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ccc',
              fontSize: '1rem'
            }}
            required
            aria-label="Nombre de la categoría"
            placeholder="Ej: Comida, Transporte"
          />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="submit"
            style={{
              padding: '10px 20px',
              backgroundColor: categoriaAEditar ? '#2196F3' : '#4CAF50', // Azul para editar, verde para crear
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              transition: 'background-color 0.2s ease-in-out'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = categoriaAEditar ? '#1976D2' : '#45a049'}
            onMouseOut={(e) => e.target.style.backgroundColor = categoriaAEditar ? '#2196F3' : '#4CAF50'}
          >
            {categoriaAEditar ? 'Guardar Cambios' : 'Crear Categoría'}
          </button>
          {categoriaAEditar && (
            <button
              type="button"
              onClick={onCancelEdit}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f44336', // Rojo para cancelar
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
                transition: 'background-color 0.2s ease-in-out'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#d32f2f'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#f44336'}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
      {mensaje && <p style={{ color: '#28a745', marginTop: '10px', fontSize: '0.9rem' }}>{mensaje}</p>}
      {error && <p style={{ color: '#dc3545', marginTop: '10px', fontSize: '0.9rem' }}>{error}</p>}
    </div>
  );
};

export default CategoriaFormulario;