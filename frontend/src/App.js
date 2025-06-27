import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios'; // Mantenemos axios por si acaso para futuras llamadas globales
import logo from './logo.svg'; // Mantenemos el logo si quieres usarlo en el Dashboard
import './App.css'; // Mantenemos los estilos generales
import AuthForm from './AuthForm';
import Dashboard from './Dashboard'; // ¡Importamos el nuevo componente Dashboard!

function App() {
  // El único estado principal aquí es el usuario logueado
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);

  // Función que se llama cuando el login es exitoso
  const manejarLoginExitoso = (datosUsuario) => {
    setUsuarioLogueado(datosUsuario);
    console.log('Usuario logueado en App.js:', datosUsuario);
    // Las cargas iniciales de datos ahora se manejarán dentro del Dashboard
  };

  // Función para cerrar sesión
  const manejarLogout = () => {
    setUsuarioLogueado(null);
    console.log('Usuario ha cerrado sesión en App.js.');
    // Los estados de datos se limpiarán automáticamente al desmontar Dashboard
  };

  // useEffect para manejar la persistencia de la sesión (opcional, para el futuro)
  // Por ahora, solo loguea el estado inicial.
  useEffect(() => {
    console.log('App.js useEffect: Estado de usuarioLogueado:', usuarioLogueado);
  }, [usuarioLogueado]);


  // Lógica principal para decidir qué mostrar: AuthForm o Dashboard
  if (!usuarioLogueado) {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            ¡Bienvenido a Tu Gestión Financiera!
          </p>
          <AuthForm onLoginSuccess={manejarLoginExitoso} />
        </header>
      </div>
    );
  }

  // Si hay un usuario logueado, mostramos el Dashboard
  return (
    <Dashboard
      usuarioLogueado={usuarioLogueado}
      manejarLogout={manejarLogout}
      // Aquí podrías pasar cualquier dato o función global que necesite el Dashboard
      // Por ejemplo, si las categorías fueran globales a todos los módulos, las pasarías aquí.
      // Pero por ahora, cada módulo gestionará sus propios datos.
    />
  );
}

export default App;
