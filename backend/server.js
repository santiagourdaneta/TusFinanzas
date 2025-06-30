// server.js
// Este es el primer archivo de tu "Cerebro Servidor"

const express = require('express'); // Traemos la guía Express
const cors = require('cors');       // Traemos el permiso de comunicación
const sqlite3 = require('sqlite3').verbose(); // Traemos la herramienta para SQLite
const bcrypt = require('bcryptjs'); // Importamos la librería para encriptar contraseñas


const app = express(); // Creamos una nueva "aplicación" de Express
const PORT = 5000;     // Elegimos un "puerto" (como un número de teléfono) para que la gente nos llame

// Le decimos a Express que use el permiso de comunicación (CORS)
app.use(cors());
// Le decimos a Express que entienda mensajes en formato JSON (como las tarjetitas de gasto)
app.use(express.json());

// --- CONEXIÓN A LA BASE DE DATOS (LA "CAJA FUERTE") ---
// Creamos una nueva base de datos o nos conectamos a una existente
// El archivo 'finadvisor.db' será nuestra caja fuerte.
// Conexión a la base de datos SQLite (tu "Caja Fuerte")
const db = new sqlite3.Database('./finadvisor.db', (err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err.message);
  } else {
    console.log('Conectado a la caja fuerte de SQLite!');
    // Asegurarse de que las tablas existen al iniciar el servidor
    db.serialize(() => { // db.serialize asegura que estas operaciones se hagan una por una
      // Tabla de Usuarios (¡Importante que se cree primero!)
      db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre_usuario TEXT UNIQUE NOT NULL,
          contrasena_hash TEXT NOT NULL,
          fecha_registro TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error al crear la tabla usuarios:', err.message);
        } else {
          console.log('Tabla usuarios lista.');
        }
      });

      // --- NUEVO: Tabla de Categorías ---
        db.run(`
          CREATE TABLE IF NOT EXISTS categorias (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT UNIQUE NOT NULL,             -- Nombre de la categoría (ej. "Comida", "Transporte")
            usuario_id INTEGER NOT NULL,             -- A qué usuario pertenece esta categoría (pueden ser categorías personalizadas)
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
          )
        `, (err) => {
          if (err) {
            console.error('Error al crear la tabla categorias:', err.message);
          } else {
            console.log('Tabla categorias lista.');
           
          }
        });

      // --- CORRECCIÓN AQUÍ: Tabla de Gastos ---
          // Todas las definiciones de columnas primero, luego todas las FOREIGN KEY
          db.run(`
            CREATE TABLE IF NOT EXISTS gastos (
              id TEXT PRIMARY KEY,
              descripcion TEXT NOT NULL,
              monto REAL NOT NULL,
              fecha TEXT NOT NULL,
              usuario_id INTEGER NOT NULL,
              categoria_id INTEGER, -- <<-- Definición de columna
              FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE, -- <<-- Restricción (FOREIGN KEY)
              FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL -- <<-- Restricción (FOREIGN KEY)
            )
          `, (err) => {
            if (err) {
              console.error('Error al crear la tabla gastos:', err.message);
            } else {
              console.log('Tabla gastos lista.');
            }
          });

      // Tabla de Ingresos
      db.run(`
        CREATE TABLE IF NOT EXISTS ingresos (
          id TEXT PRIMARY KEY,
          usuario_id INTEGER NOT NULL,
          descripcion TEXT NOT NULL,
          monto REAL NOT NULL,
          fecha TEXT NOT NULL,
          FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) {
          console.error('Error al crear la tabla ingresos:', err.message);
        } else {
          console.log('Tabla ingresos lista.');
        }
      });

      // Tabla de Objetivos
      db.run(`
        CREATE TABLE IF NOT EXISTS objetivos (
          id TEXT PRIMARY KEY,
          usuario_id INTEGER NOT NULL,
          nombre TEXT NOT NULL,
          monto_meta REAL NOT NULL,
          monto_actual REAL NOT NULL DEFAULT 0,
          fecha_limite TEXT,
          completado INTEGER NOT NULL DEFAULT 0,
          FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) {
          console.error('Error al crear la tabla objetivos:', err.message);
        } else {
          console.log('Tabla objetivos lista.');
        }
      });
    });
  }
});

// --- RUTAS PARA GASTOS ---

// --- RUTAS PARA GASTOS ---

    // Obtener gastos de un USUARIO específico (ahora también unimos con categorías)
    app.get('/gastos/usuario/:usuario_id', (req, res) => {
      const { usuario_id } = req.params;
      console.log(`Alguien pidió ver los gastos del usuario ID: ${usuario_id}`);
      // Unimos la tabla gastos con la tabla categorias para obtener el nombre de la categoría
      db.all(`
        SELECT
          g.id,
          g.descripcion,
          g.monto,
          g.fecha,
          g.usuario_id,
          g.categoria_id,
          c.nombre AS categoria_nombre -- Obtenemos el nombre de la categoría
        FROM gastos g
        LEFT JOIN categorias c ON g.categoria_id = c.id -- LEFT JOIN para incluir gastos sin categoría
        WHERE g.usuario_id = ?
        ORDER BY g.fecha DESC
      `, [usuario_id], (err, rows) => {
        if (err) {
          console.error('Error al obtener gastos:', err.message);
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(rows);
      });
    });

    // Crear un nuevo gasto (¡RECIBE Y GUARDA EL CATEGORIA_ID!)
    app.post('/gastos', (req, res) => {
      const { descripcion, monto, usuario_id, categoria_id } = req.body; // <-- Recibe categoria_id
      const id = Date.now().toString();
      const fecha = new Date().toISOString();

      if (!usuario_id || !descripcion || monto <= 0) {
        return res.status(400).json({ error: 'Datos de gasto incompletos o inválidos.' });
      }

      // Inserta el categoria_id en la base de datos (puede ser NULL)
      db.run(`INSERT INTO gastos (id, descripcion, monto, fecha, usuario_id, categoria_id) VALUES (?, ?, ?, ?, ?, ?)`,
        [id, descripcion, monto, fecha, usuario_id, categoria_id || null], // Si categoria_id es undefined/0, guarda NULL
        function(err) {
          if (err) {
            console.error('Error al guardar el gasto en la caja fuerte:', err.message);
            return res.status(500).json({ error: err.message });
          }
          console.log('Gasto guardado en la caja fuerte:', { id, descripcion, monto, fecha, usuario_id, categoria_id });
          // Para devolver el nombre de la categoría, necesitamos hacer otra consulta o un JOIN
          // Por simplicidad, devolvemos lo que tenemos y el frontend puede manejar la visualización.
          // En una app más compleja, haríamos un SELECT * JOIN categorias WHERE id = this.lastID
          res.status(201).json({ id, descripcion, monto, fecha, usuario_id, categoria_id });
        }
      );
    });

    // Actualizar un gasto (¡ACTUALIZA EL CATEGORIA_ID!)
    app.put('/gastos/:id', (req, res) => {
      const { id } = req.params;
      const { descripcion, monto, categoria_id } = req.body; // <-- Recibe categoria_id para actualizar

      console.log(`Solicitud para actualizar el gasto con ID: ${id}`);
      console.log(`Nuevos datos: Descripcion='${descripcion}', Monto=${monto}, Categoria ID=${categoria_id}`);

      // Actualiza la categoria_id en la base de datos
      db.run(`UPDATE gastos SET descripcion = ?, monto = ?, categoria_id = ? WHERE id = ?`,
        [descripcion, monto, categoria_id || null, id], // Si categoria_id es undefined/0, guarda NULL
        function(err) {
          if (err) {
            console.error('Error al actualizar el gasto en la caja fuerte:', err.message);
            res.status(500).json({ error: err.message });
            return;
          }
          if (this.changes === 0) {
            console.log(`Gasto con ID ${id} no encontrado para actualizar.`);
            res.status(404).json({ message: 'Gasto no encontrado para actualizar.' });
            return;
          }

          // Recuperamos el gasto completo (con nombre de categoría) para devolverlo
          db.get(`
            SELECT
              g.id,
              g.descripcion,
              g.monto,
              g.fecha,
              g.usuario_id,
              g.categoria_id,
              c.nombre AS categoria_nombre
            FROM gastos g
            LEFT JOIN categorias c ON g.categoria_id = c.id
            WHERE g.id = ?
          `, id, (err, row) => {
            if (err) {
              console.error('Error al recuperar el gasto actualizado de la caja fuerte:', err.message);
              res.status(500).json({ error: err.message });
              return;
            }
            if (row) {
              console.log(`Gasto con ID ${id} actualizado y recuperado de la caja fuerte.`, row);
              res.status(200).json(row);
            } else {
              res.status(404).json({ message: 'Gasto actualizado, pero no encontrado después de recuperar.' });
            }
          });
        }
      );
    });


// Eliminar un gasto
app.delete('/gastos/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM gastos WHERE id = ?`, id, function(err) {
    if (err) {
      console.error('Error al borrar el gasto de la caja fuerte:', err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      console.log(`Gasto con ID ${id} no encontrado.`);
      res.status(404).json({ message: 'Gasto no encontrado.' });
    } else {
      console.log(`Gasto con ID ${id} borrado de la caja fuerte.`);
      res.status(200).json({ message: 'Gasto borrado exitosamente.', id_borrado: id });
    }
  });
});


// --- RUTAS PARA USUARIOS ---

// Ruta para CREAR un nuevo usuario (Registro)
app.post('/usuarios', (req, res) => {
  const { nombre_usuario, contrasena } = req.body;

  if (!nombre_usuario || !contrasena) {
    return res.status(400).json({ error: 'Nombre de usuario y contraseña son requeridos.' });
  }

  // --- ADVERTENCIA DE SEGURIDAD: TEMPORALMENTE SE GUARDA LA CONTRASEÑA SIN HASH ---
  // En una aplicación real, NUNCA debes guardar la contraseña directamente.
  // Usa bcryptjs para hashear la contraseña de forma segura:
  // const contrasena_hash = bcrypt.hashSync(contrasena, 10); // '10' es el número de rondas (costo)
  const contrasena_hash = contrasena; // <<-- ¡MODIFICAR ESTO EN PRODUCCIÓN!

  db.run(`INSERT INTO usuarios (nombre_usuario, contrasena_hash) VALUES (?, ?)`,
    [nombre_usuario, contrasena_hash],
    function(err) {
      if (err) {
        console.error('Error al insertar nuevo usuario:', err.message);
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(409).json({ error: 'El nombre de usuario ya existe.' });
        }
        return res.status(500).json({ error: err.message });
      }
      console.log(`Nuevo usuario registrado con ID: ${this.lastID}`);
      res.status(201).json({
        id: this.lastID,
        nombre_usuario: nombre_usuario,
        fecha_registro: new Date().toISOString()
      });

      const nuevoUsuarioId = this.lastID; // Obtener el ID del usuario recién creado
          console.log(`Nuevo usuario registrado con ID: ${nuevoUsuarioId}`);

      // --- ¡NUEVO: Insertar categorías por defecto para este nuevo usuario! ---
          const categoriasPorDefecto = [
            'Comida', 'Transporte', 'Entretenimiento', 'Servicios', 'Vivienda',
            'Salud', 'Educación', 'Ropa', 'Regalos', 'Viajes', 'Ahorro'
          ];
          const placeholders = categoriasPorDefecto.map(() => '(?, ?)').join(',');
          const values = categoriasPorDefecto.flatMap(cat => [cat, nuevoUsuarioId]);

          db.run(`INSERT INTO categorias (nombre, usuario_id) VALUES ${placeholders}`, values, (insertErr) => {
            if (insertErr) {
              console.error('Error al insertar categorías por defecto para el nuevo usuario:', insertErr.message);
              // No es un error crítico para el registro del usuario, pero lo logueamos
            } else {
              console.log(`Categorías por defecto insertadas para el usuario ID: ${nuevoUsuarioId}`);
            }
          });
          // ----------------------------------------------------------------------

          res.status(201).json({
            id: nuevoUsuarioId,
            nombre_usuario: nombre_usuario,
            fecha_registro: new Date().toISOString()
          });
    }
  );
});

// Ruta para OBTENER todos los usuarios (¡Solo para pruebas, no para producción!)
app.get('/usuarios', (req, res) => {
  db.all(`SELECT id, nombre_usuario, fecha_registro FROM usuarios`, [], (err, rows) => {
    if (err) {
      console.error('Error al obtener usuarios:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(rows);
  });
});

// --- RUTA CLAVE: INICIAR SESIÓN (LOGIN) ---
app.post('/login', (req, res) => {
  const { nombre_usuario, contrasena } = req.body;

  if (!nombre_usuario || !contrasena) {
    return res.status(400).json({ error: 'Nombre de usuario y contraseña son requeridos.' });
  }

  // 1. Buscar al usuario por su nombre de usuario en la base de datos
  db.get(`SELECT id, nombre_usuario, contrasena_hash FROM usuarios WHERE nombre_usuario = ?`, nombre_usuario, async (err, row) => {
    if (err) {
      console.error('Error al buscar usuario para login:', err.message);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
    if (!row) {
      // Si no se encuentra ningún usuario con ese nombre
      console.log(`Intento de login fallido: Usuario '${nombre_usuario}' no encontrado.`);
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    }

    // 2. Comparar la contraseña ingresada con la contraseña almacenada
    // --- ADVERTENCIA DE SEGURIDAD: TEMPORALMENTE SE COMPARA LA CONTRASEÑA DIRECTAMENTE ---
    // En una aplicación real, DEBERÍAS comparar con el hash guardado de forma segura:
    // const esContrasenaValida = await bcrypt.compare(contrasena, row.contrasena_hash);
    const esContrasenaValida = (contrasena === row.contrasena_hash); // <<-- ¡MODIFICAR ESTO EN PRODUCCIÓN!

    if (!esContrasenaValida) {
      // Si la contraseña no coincide
      console.log(`Intento de login fallido para '${nombre_usuario}': Contraseña incorrecta.`);
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    }

    // 3. Si las credenciales son válidas, el usuario ha iniciado sesión con éxito
    console.log(`Usuario '${nombre_usuario}' con ID ${row.id} ha iniciado sesión.`);
    // Devolvemos la información del usuario (¡nunca la contraseña!)
    res.status(200).json({
      id: row.id,
      nombre_usuario: row.nombre_usuario
    });
  });
});


// --- RUTAS PARA INGRESOS ---

// Crear un nuevo ingreso
app.post('/ingresos', (req, res) => {
  const { usuario_id, descripcion, monto } = req.body;
  const id = Date.now().toString();
  const fecha = new Date().toISOString();

  if (!usuario_id || !descripcion || monto <= 0) {
    return res.status(400).json({ error: 'Datos de ingreso incompletos o inválidos.' });
  }

  db.run(`INSERT INTO ingresos (id, usuario_id, descripcion, monto, fecha) VALUES (?, ?, ?, ?, ?)`,
    [id, usuario_id, descripcion, monto, fecha],
    function(err) {
      if (err) {
        console.error('Error al insertar nuevo ingreso:', err.message);
        return res.status(500).json({ error: err.message });
      }
      console.log(`Nuevo ingreso registrado con ID: ${id} para usuario ID: ${usuario_id}`);
      res.status(201).json({ id, usuario_id, descripcion, monto, fecha });
    }
  );
});

// Obtener ingresos de un USUARIO específico
app.get('/ingresos/usuario/:usuario_id', (req, res) => {
  const { usuario_id } = req.params;
  db.all(`SELECT * FROM ingresos WHERE usuario_id = ? ORDER BY fecha DESC`, usuario_id, (err, rows) => {
    if (err) {
      console.error('Error al obtener ingresos:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(rows);
  });
});

// Actualizar un ingreso
app.put('/ingresos/:id', (req, res) => {
  const { id } = req.params;
  const { descripcion, monto } = req.body;

  if (!descripcion || monto <= 0) {
    return res.status(400).json({ error: 'Datos de ingreso incompletos o inválidos para actualizar.' });
  }

  db.run(`UPDATE ingresos SET descripcion = ?, monto = ? WHERE id = ?`,
    [descripcion, monto, id],
    function(err) {
      if (err) {
        console.error('Error al actualizar el ingreso:', err.message);
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        console.log(`Ingreso con ID ${id} no encontrado para actualizar.`);
        return res.status(404).json({ message: 'Ingreso no encontrado para actualizar.' });
      }
      db.get(`SELECT * FROM ingresos WHERE id = ?`, id, (err, row) => {
        if (err) {
          console.error('Error al recuperar ingreso actualizado:', err.message);
          return res.status(500).json({ error: err.message });
        }
        res.status(200).json(row);
      });
    }
  );
});

// Eliminar un ingreso
app.delete('/ingresos/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM ingresos WHERE id = ?`, id, function(err) {
    if (err) {
      console.error('Error al eliminar ingreso:', err.message);
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      console.log(`Ingreso con ID ${id} no encontrado para eliminar.`);
      return res.status(404).json({ message: 'Ingreso no encontrado.' });
    }
    console.log(`Ingreso con ID ${id} eliminado.`);
    res.status(200).json({ message: 'Ingreso eliminado exitosamente.', id_eliminado: id });
  });
});


// --- RUTAS PARA OBJETIVOS ---

// Crear un nuevo objetivo
app.post('/objetivos', (req, res) => {
  const { usuario_id, nombre, monto_meta, monto_actual = 0, fecha_limite } = req.body;
  const id = Date.now().toString();
  const completado = 0;

  if (!usuario_id || !nombre || monto_meta <= 0) {
    return res.status(400).json({ error: 'Datos de objetivo incompletos o inválidos.' });
  }

  db.run(`INSERT INTO objetivos (id, usuario_id, nombre, monto_meta, monto_actual, fecha_limite, completado) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, usuario_id, nombre, monto_meta, monto_actual, fecha_limite, completado],
    function(err) {
      if (err) {
        console.error('Error al insertar nuevo objetivo:', err.message);
        return res.status(500).json({ error: err.message });
      }
      console.log(`Nuevo objetivo registrado con ID: ${id} para usuario ID: ${usuario_id}`);
      res.status(201).json({ id, usuario_id, nombre, monto_meta, monto_actual, fecha_limite, completado });
    }
  );
});

// Obtener objetivos de un USUARIO específico
app.get('/objetivos/usuario/:usuario_id', (req, res) => {
  const { usuario_id } = req.params;
  db.all(`SELECT * FROM objetivos WHERE usuario_id = ? ORDER BY id DESC`, usuario_id, (err, rows) => {
    if (err) {
      console.error('Error al obtener objetivos:', err.message);
      return res.status(500).json({ error: err.message });
    }

    // Map rows to ensure numeric types
  const objetivos = rows.map(row => ({
    ...row,
    monto_meta: parseFloat(row.monto_meta) || 0, // Ensure it's a number, default to 0
    monto_actual: parseFloat(row.monto_actual) || 0 // Ensure it's a number, default to 0
  }));
  res.json(objetivos);

    //res.status(200).json(rows);
  });
});

// Actualizar un objetivo
app.put('/objetivos/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, monto_meta, monto_actual, fecha_limite, completado } = req.body;

  if (!nombre || monto_meta <= 0 || monto_actual < 0) {
    return res.status(400).json({ error: 'Datos de objetivo incompletos o inválidos para actualizar.' });
  }

  db.run(`UPDATE objetivos SET nombre = ?, monto_meta = ?, monto_actual = ?, fecha_limite = ?, completado = ? WHERE id = ?`,
    [nombre, monto_meta, monto_actual, fecha_limite, completado, id],
    function(err) {
      if (err) {
        console.error('Error al actualizar el objetivo:', err.message);
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        console.log(`Objetivo con ID ${id} no encontrado para actualizar.`);
        return res.status(404).json({ message: 'Objetivo no encontrado para actualizar.' });
      }
      db.get(`SELECT * FROM objetivos WHERE id = ?`, id, (err, row) => {
        if (err) {
          console.error('Error al recuperar objetivo actualizado:', err.message);
          return res.status(500).json({ error: err.message });
        }
        res.status(200).json(row);
      });
    }
  );
});

// Eliminar un objetivo
app.delete('/objetivos/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM objetivos WHERE id = ?`, id, function(err) {
    if (err) {
      console.error('Error al eliminar objetivo:', err.message);
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      console.log(`Objetivo con ID ${id} no encontrado para eliminar.`);
      return res.status(404).json({ message: 'Objetivo no encontrado.' });
    }
    console.log(`Objetivo con ID ${id} eliminado.`);
    res.status(200).json({ message: 'Objetivo eliminado exitosamente.', id_eliminado: id });
  });
});

// --- NUEVAS RUTAS PARA CATEGORÍAS ---

    // 1. Ruta para CREAR una nueva categoría
    app.post('/categorias', (req, res) => {
      const { nombre, usuario_id } = req.body;
      if (!nombre || !usuario_id) {
        return res.status(400).json({ error: 'Nombre de categoría y usuario_id son requeridos.' });
      }
      db.run(`INSERT INTO categorias (nombre, usuario_id) VALUES (?, ?)`,
        [nombre, usuario_id],
        function(err) {
          if (err) {
            console.error('Error al insertar nueva categoría:', err.message);
            if (err.message.includes('UNIQUE constraint failed')) {
              return res.status(409).json({ error: 'Ya existe una categoría con ese nombre para este usuario.' });
            }
            return res.status(500).json({ error: err.message });
          }
          console.log(`Nueva categoría creada con ID: ${this.lastID} para usuario ID: ${usuario_id}`);
          res.status(201).json({ id: this.lastID, nombre, usuario_id });
        }
      );
    });

    // 2. Ruta para OBTENER categorías de un USUARIO específico
    app.get('/categorias/usuario/:usuario_id', (req, res) => {
      const { usuario_id } = req.params;
      db.all(`SELECT * FROM categorias WHERE usuario_id = ? ORDER BY nombre ASC`, [usuario_id], (err, rows) => {
        if (err) {
          console.error('Error al obtener categorías:', err.message);
          return res.status(500).json({ error: err.message });
        }
        res.status(200).json(rows);
      });
    });

    // Ruta para ACTUALIZAR una categoría
    app.put('/categorias/:id', (req, res) => {
      const { id } = req.params; // ID de la categoría a actualizar
      const { nombre, usuario_id } = req.body; // Nuevo nombre y usuario_id para verificación

      if (!nombre || !usuario_id) {
        return res.status(400).json({ error: 'Nombre de categoría y usuario_id son requeridos.' });
      }

      db.run(`UPDATE categorias SET nombre = ? WHERE id = ? AND usuario_id = ?`,
        [nombre, id, usuario_id], // Aseguramos que solo el propietario pueda editar
        function(err) {
          if (err) {
            console.error('Error al actualizar categoría:', err.message);
            if (err.message.includes('UNIQUE constraint failed')) {
              return res.status(409).json({ error: 'Ya existe una categoría con ese nombre para este usuario.' });
            }
            return res.status(500).json({ error: err.message });
          }
          if (this.changes === 0) {
            console.log(`Categoría con ID ${id} no encontrada o no pertenece al usuario ${usuario_id}.`);
            return res.status(404).json({ message: 'Categoría no encontrada o no tiene permisos para editarla.' });
          }
          console.log(`Categoría con ID ${id} actualizada a "${nombre}".`);
          res.status(200).json({ id, nombre, usuario_id });
        }
      );
    });

    // 3. Ruta para ELIMINAR una categoría
    app.delete('/categorias/:id', (req, res) => {
      const { id } = req.params;
      db.run(`DELETE FROM categorias WHERE id = ?`, id, function(err) {
        if (err) {
          console.error('Error al eliminar categoría:', err.message);
          return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
          console.log(`Categoría con ID ${id} no encontrada para eliminar.`);
          return res.status(404).json({ message: 'Categoría no encontrada.' });
        }
        console.log(`Categoría con ID ${id} eliminada.`);
        res.status(200).json({ message: 'Categoría eliminada exitosamente.', id_eliminado: id });
      });
    });


// --- Iniciar el servidor ---
app.listen(PORT, () => {
  console.log(`El Cerebro Servidor está escuchando en el puerto ${PORT}`);
  console.log(`Puedes probarlo en tu navegador: https://tusfinanzas.onrender.com/gastos`);
});
