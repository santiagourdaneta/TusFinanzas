import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import CategoriaFormulario from '../CategoriaFormulario'; // Ajusta la ruta si es necesario

function CategoriasModule({ usuarioLogueado, categorias, cargarCategorias }) {
  const [categoriaSeleccionadaParaEditar, setCategoriaSeleccionadaParaEditar] = useState(null);

  // Callback para manejar la creación de una nueva categoría
  const handleCategoriaCreada = useCallback((nuevaCategoria) => {
    console.log('Categoría creada en CategoriasModule, recargando...');
    cargarCategorias(usuarioLogueado.id); // Recargar la lista de categorías en Dashboard
    setCategoriaSeleccionadaParaEditar(null); // Limpiar si estábamos en modo edición
  }, [cargarCategorias, usuarioLogueado]);

  // Callback para manejar la actualización de una categoría existente
  const handleCategoriaActualizada = useCallback((categoriaActualizada) => {
    console.log('Categoría actualizada en CategoriasModule, recargando...');
    cargarCategorias(usuarioLogueado.id); // Recargar la lista de categorías en Dashboard
    setCategoriaSeleccionadaParaEditar(null); // Salir del modo edición
  }, [cargarCategorias, usuarioLogueado]);

  // Función para eliminar una categoría
  const handleEliminarCategoriaClick = async (categoriaId, categoriaNombre) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar la categoría "${categoriaNombre}"? Los gastos asociados perderán su categoría.`)) {
      return;
    }
    try {
      await axios.delete(`http://localhost:5000/categorias/${categoriaId}`);
      console.log(`Categoría con ID ${categoriaId} eliminada.`);
      cargarCategorias(usuarioLogueado.id); // Recargar la lista de categorías
      setCategoriaSeleccionadaParaEditar(null); // Asegurarse de salir del modo edición si eliminamos la que se estaba editando
      alert(`Categoría "${categoriaNombre}" eliminada exitosamente.`);
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      alert(`No se pudo eliminar la categoría. Error: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
      {/* Formulario de Creación/Edición de Categorías */}
      <CategoriaFormulario
        usuarioId={usuarioLogueado.id}
        onCategoriaCreada={handleCategoriaCreada}
        onCategoriaActualizada={handleCategoriaActualizada}
        categoriaAEditar={categoriaSeleccionadaParaEditar}
        onCancelEdit={() => setCategoriaSeleccionadaParaEditar(null)}
      />

      {/* Lista de Categorías Existentes */}
      <div style={{ marginTop: '30px', width: '100%', maxWidth: '600px', margin: '0 auto', backgroundColor: '#f0f0f0', padding: '15px', borderRadius: '8px', textAlign: 'left', color: '#333' }}>
        <h3>Tus Categorías ({usuarioLogueado.nombre_usuario})</h3>
        {categorias.length === 0 ? (
          <p>No tienes categorías creadas. ¡Crea una!</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {categorias.map(cat => (
              <li key={cat.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px',
                borderBottom: '1px solid #eee',
                backgroundColor: categoriaSeleccionadaParaEditar && categoriaSeleccionadaParaEditar.id === cat.id ? '#e7f3ff' : 'transparent',
                transition: 'background-color 0.2s ease'
              }}>
                <span>{cat.nombre}</span>
                <div>
                  <button
                    onClick={() => setCategoriaSeleccionadaParaEditar(cat)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginRight: '8px'
                    }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleEliminarCategoriaClick(cat.id, cat.nombre)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Eliminar
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

export default CategoriasModule;
