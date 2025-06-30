// AuthForm.js
import React, { useState } from 'react';
import axios from 'axios';

// Este componente manejará el registro y el inicio de sesión
// Recibe una prop 'onLoginSuccess' que es una función para avisar a App.js
function AuthForm({ onLoginSuccess }) {
    const [esModoRegistro, setEsModoRegistro] = useState(true);
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [mensajeError, setMensajeError] = useState(''); // <--- ¡Esta línea es la solución!
    const [mensajeExito, setMensajeExito] = useState('');

  // Función para manejar el envío del formulario (Registro o Login)
  const manejarEnvio = async (evento) => {
      
      evento.preventDefault(); // Evita que la página se recargue
    
      setMensajeError(''); // Limpia cualquier error previo
      setMensajeExito(''); // Limpia cualquier mensaje de éxito previo


    if (!nombreUsuario || !contrasena) {
      setMensajeError('Por favor, ingresa nombre de usuario y contraseña.');
      return;
    }

    try {
      let respuesta;
      if (esModoRegistro) {
        // Modo Registro: Llama a la ruta POST /usuarios
        respuesta = await axios.post('https://tusfinanzas.onrender.com/usuarios', {
          nombre_usuario: nombreUsuario,
          contrasena: contrasena, // Recordatorio: en producción, esto se hashea en el backend
        });
        alert('¡Registro exitoso! Ya puedes iniciar sesión.');
        setEsModoRegistro(false); // Después de registrar, vamos al modo login
      } else {
        // Modo Login: Llama a la ruta POST /login
        respuesta = await axios.post('https://tusfinanzas.onrender.com/login', {
          nombre_usuario: nombreUsuario,
          contrasena: contrasena,
        });
      //  alert('¡Inicio de sesión exitoso!');
        // Si el login fue exitoso, avisamos a App.js con los datos del usuario
        onLoginSuccess(respuesta.data); // Le pasamos el ID y nombre del usuario
      }
      // Limpiamos los campos después de la operación exitosa
      setNombreUsuario('');
      setContrasena('');

    } catch (error) {
      console.error('Error de autenticación:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setMensajeError(error.response.data.error); // Muestra el error que viene del servidor
      } else {
        setMensajeError('Error de conexión o inesperado. Inténtalo de nuevo.');
      }
    }
  };

  return (
    <div style={{ color: '#000', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', maxWidth: '400px', margin: '50px auto', backgroundColor: '#f9f9f9', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
      <h2>{esModoRegistro ? '🚀 Registrarse' : '🔑 Iniciar Sesión'}</h2>

      {mensajeError && <p style={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>{mensajeError}</p>}

      <form onSubmit={manejarEnvio}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="nombreUsuario" style={{ display: 'block', marginBottom: '5px' }}>Nombre de Usuario:</label>
          <input
            type="text"
            id="nombreUsuario"
            value={nombreUsuario}
            onChange={(e) => setNombreUsuario(e.target.value)}
            placeholder="Tu nombre de usuario"
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="contrasena" style={{ display: 'block', marginBottom: '5px' }}>Contraseña:</label>
          <input
            type="password" // Tipo 'password' para que se oculten los caracteres
            id="contrasena"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            placeholder="Tu contraseña"
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <button type="submit" style={{
          backgroundColor: '#28a745', // Verde para el botón principal
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
          width: '100%',
          marginBottom: '10px'
        }}>
          {esModoRegistro ? 'Crear Cuenta' : 'Entrar al Club'}
        </button>
      </form>

      {/* Botón para cambiar entre Registro y Login */}
      <button
        type="button" // Es un botón normal, no envía el formulario
        onClick={() => setEsModoRegistro(!esModoRegistro)} // Cambia el modo
        style={{
          backgroundColor: '#007bff', // Azul para el botón secundario
          color: 'white',
          padding: '8px 15px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '14px',
          width: '100%'
        }}
      >
        {esModoRegistro ? 'Ya tengo cuenta (Iniciar Sesión)' : 'No tengo cuenta (Registrarse)'}
      </button>
    </div>
  );
}

export default AuthForm;
