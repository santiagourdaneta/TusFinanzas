# TusFinanzas
Aplicación web sencilla y eficiente diseñada para ayudarte a llevar un control detallado de tus gastos e ingresos diarios. Olvídate de las hojas de cálculo complicadas; esta herramienta te permite registrar tus transacciones, categorizar tus gastos y obtener una visión clara de tu flujo de dinero, todo desde una interfaz intuitiva.

Características Principales
Autenticación de Usuarios: Registro e inicio de sesión seguro para que cada usuario gestione sus propias finanzas.

Registro de Gastos: Añade tus gastos con descripción, monto y fecha.

Categorización de Gastos: Asigna categorías personalizadas a tus gastos para un análisis más organizado (ej. Comida, Transporte, Entretenimiento).

Registro de Ingresos: Documenta tus fuentes de ingresos para tener un panorama completo.

Listado Detallado: Visualiza todas tus transacciones de gastos e ingresos de forma clara y ordenada.

Edición y Eliminación: Modifica o borra cualquier registro de gasto o ingreso fácilmente.

Tecnologías Utilizadas

Frontend

React.js: Biblioteca de JavaScript para construir la interfaz de usuario.
Axios: Cliente HTTP para realizar peticiones al backend.
HTML & CSS: Estructura y estilos básicos.

Backend

Node.js: Entorno de ejecución de JavaScript.
Express.js: Framework web para construir la API REST.
SQLite3: Base de datos ligera y basada en archivos para almacenar los datos.
CORS: Middleware para habilitar la comunicación entre el frontend y el backend.
Bcryptjs: Para el manejo básico de contraseñas (aunque se recomienda un hashing más robusto en producción).

Configuración y Ejecución Local
Sigue estos pasos para poner la aplicación en marcha en tu máquina local.

Requisitos
Node.js (versión 14 o superior)
npm (Node Package Manager)

1. Configuración del Backend
Dirígete a la carpeta backend y ejecuta los siguientes comandos:

cd backend
npm install
node server.js

El servidor se iniciará en http://localhost:5000. Verás un mensaje en tu terminal como: El Cerebro Servidor está escuchando en el puerto 5000.

Nota Importante: Si es la primera vez que ejecutas el servidor o si has modificado la estructura de la base de datos (tablas), elimina el archivo finadvisor.db de la carpeta backend antes de ejecutar node server.js. Esto asegurará que la base de datos se cree con la estructura más reciente.

2. Configuración del Frontend
Abre una nueva terminal, dirígete a la carpeta frontend (o a la raíz del proyecto si es donde está tu package.json principal) y ejecuta:

cd frontend
npm install
npm start

La aplicación de React se abrirá automáticamente en tu navegador en http://localhost:3000.

Uso de la Aplicación

Registro / Inicio de Sesión: Al abrir la aplicación, serás recibido por la pantalla de autenticación. Regístrate como un nuevo usuario o inicia sesión si ya tienes una cuenta.

Dashboard: Una vez logueado, accederás al dashboard principal.

Navegación: Utiliza la barra lateral izquierda para navegar entre los módulos de "Gastos", "Ingresos" y "Categorías".

Gestión de Gastos:

En el módulo de Gastos, puedes añadir nuevos gastos, especificando una descripción, un monto y seleccionando una categoría.

La lista de gastos mostrará tus transacciones más recientes, con opciones para editar o eliminar.

Gestión de Ingresos:

Similar a los gastos, en el módulo de Ingresos puedes registrar tus entradas de dinero.

La lista de ingresos te dará una visión de tus fuentes de dinero.

Gestión de Categorías:

En el módulo de Categorías, puedes crear nuevas categorías personalizadas para tus gastos.

También puedes editar o eliminar categorías existentes. Ten en cuenta que al eliminar una categoría, los gastos asociados a ella simplemente perderán su categoría (no se eliminarán los gastos).

react, node-js, express, sqlite, finanzas-personales, gestion-gastos, control-ingresos, web-app, javascript.
gestion-finanzas-personales, control-gastos-ingresos, personal-finance-tracker.
