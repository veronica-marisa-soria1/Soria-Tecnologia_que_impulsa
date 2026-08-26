/**
 * Modelo de datos del demo: una biblioteca.
 *
 * Elegido porque cubre los casos que se practican en el cursado:
 *   - relación 1:N  -> un autor tiene muchos libros
 *   - relación N:M  -> libros y socios se relacionan a través de prestamos
 *   - NULL con significado -> fecha_devolucion vacía = préstamo aún abierto
 *
 * Para adaptar el demo a otro proyecto alcanza con reemplazar este archivo:
 * el motor y la interfaz leen el esquema desde acá, no lo tienen escrito.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else {
    root.WM_DATA = api;
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const autores = {
    name: "autores",
    label: "Autores",
    pk: "id",
    columns: ["id", "nombre", "nacionalidad", "anio_nacimiento"],
    types: {
      id: "INTEGER",
      nombre: "TEXT",
      nacionalidad: "TEXT",
      anio_nacimiento: "INTEGER",
    },
    fks: {},
    rows: [
      { id: 1, nombre: "Jorge Luis Borges", nacionalidad: "Argentina", anio_nacimiento: 1899 },
      { id: 2, nombre: "Julio Cortázar", nacionalidad: "Argentina", anio_nacimiento: 1914 },
      { id: 3, nombre: "Gabriel García Márquez", nacionalidad: "Colombia", anio_nacimiento: 1927 },
      { id: 4, nombre: "Isabel Allende", nacionalidad: "Chile", anio_nacimiento: 1942 },
      { id: 5, nombre: "Mariana Enriquez", nacionalidad: "Argentina", anio_nacimiento: 1973 },
      { id: 6, nombre: "Samanta Schweblin", nacionalidad: "Argentina", anio_nacimiento: 1978 },
      { id: 7, nombre: "Eduardo Galeano", nacionalidad: "Uruguay", anio_nacimiento: 1940 },
      { id: 8, nombre: "Alejandra Pizarnik", nacionalidad: "Argentina", anio_nacimiento: 1936 },
    ],
  };

  const libros = {
    name: "libros",
    label: "Libros",
    pk: "id",
    columns: ["id", "titulo", "autor_id", "anio", "genero", "ejemplares"],
    types: {
      id: "INTEGER",
      titulo: "TEXT",
      autor_id: "INTEGER",
      anio: "INTEGER",
      genero: "TEXT",
      ejemplares: "INTEGER",
    },
    fks: { autor_id: "autores.id" },
    rows: [
      { id: 1, titulo: "Ficciones", autor_id: 1, anio: 1944, genero: "Cuento", ejemplares: 4 },
      { id: 2, titulo: "El Aleph", autor_id: 1, anio: 1949, genero: "Cuento", ejemplares: 3 },
      { id: 3, titulo: "Rayuela", autor_id: 2, anio: 1963, genero: "Novela", ejemplares: 5 },
      { id: 4, titulo: "Bestiario", autor_id: 2, anio: 1951, genero: "Cuento", ejemplares: 2 },
      { id: 5, titulo: "Final del juego", autor_id: 2, anio: 1956, genero: "Cuento", ejemplares: 2 },
      { id: 6, titulo: "Cien años de soledad", autor_id: 3, anio: 1967, genero: "Novela", ejemplares: 6 },
      { id: 7, titulo: "El amor en los tiempos del cólera", autor_id: 3, anio: 1985, genero: "Novela", ejemplares: 3 },
      { id: 8, titulo: "La casa de los espíritus", autor_id: 4, anio: 1982, genero: "Novela", ejemplares: 4 },
      { id: 9, titulo: "Las cosas que perdimos en el fuego", autor_id: 5, anio: 2016, genero: "Cuento", ejemplares: 3 },
      { id: 10, titulo: "Nuestra parte de noche", autor_id: 5, anio: 2019, genero: "Novela", ejemplares: 2 },
      { id: 11, titulo: "Distancia de rescate", autor_id: 6, anio: 2014, genero: "Novela", ejemplares: 3 },
      { id: 12, titulo: "Pájaros en la boca", autor_id: 6, anio: 2009, genero: "Cuento", ejemplares: 1 },
      { id: 13, titulo: "Las venas abiertas de América Latina", autor_id: 7, anio: 1971, genero: "Ensayo", ejemplares: 5 },
      { id: 14, titulo: "Árbol de Diana", autor_id: 8, anio: 1962, genero: "Poesía", ejemplares: 2 },
    ],
  };

  const socios = {
    name: "socios",
    label: "Socios",
    pk: "id",
    columns: ["id", "nombre", "email", "ciudad", "fecha_alta"],
    types: {
      id: "INTEGER",
      nombre: "TEXT",
      email: "TEXT",
      ciudad: "TEXT",
      fecha_alta: "DATE",
    },
    fks: {},
    rows: [
      { id: 1, nombre: "Lucía Fernández", email: "lucia.f@correo.com", ciudad: "Quitilipi", fecha_alta: "2024-03-12" },
      { id: 2, nombre: "Martín Gómez", email: "martin.g@correo.com", ciudad: "Resistencia", fecha_alta: "2024-05-02" },
      { id: 3, nombre: "Carla Duarte", email: "carla.d@correo.com", ciudad: "Quitilipi", fecha_alta: "2024-06-21" },
      { id: 4, nombre: "Diego Sosa", email: "diego.s@correo.com", ciudad: "Sáenz Peña", fecha_alta: "2024-08-08" },
      { id: 5, nombre: "Ana Ramírez", email: "ana.r@correo.com", ciudad: "Resistencia", fecha_alta: "2025-01-15" },
      { id: 6, nombre: "Pablo Ojeda", email: "pablo.o@correo.com", ciudad: "Quitilipi", fecha_alta: "2025-02-27" },
      { id: 7, nombre: "Rocío Benítez", email: "rocio.b@correo.com", ciudad: "Machagai", fecha_alta: "2025-04-03" },
      { id: 8, nombre: "Tomás Aguirre", email: "tomas.a@correo.com", ciudad: "Sáenz Peña", fecha_alta: "2025-06-19" },
      // Sin préstamos a propósito: es lo que hace visible la diferencia entre
      // JOIN y LEFT JOIN en el ejemplo correspondiente.
      { id: 9, nombre: "Valentina Ruiz", email: "valentina.r@correo.com", ciudad: "Quitilipi", fecha_alta: "2025-08-20" },
    ],
  };

  const prestamos = {
    name: "prestamos",
    label: "Préstamos",
    pk: "id",
    columns: ["id", "libro_id", "socio_id", "fecha_prestamo", "fecha_devolucion"],
    types: {
      id: "INTEGER",
      libro_id: "INTEGER",
      socio_id: "INTEGER",
      fecha_prestamo: "DATE",
      fecha_devolucion: "DATE",
    },
    fks: { libro_id: "libros.id", socio_id: "socios.id" },
    rows: [
      { id: 1, libro_id: 3, socio_id: 1, fecha_prestamo: "2025-03-04", fecha_devolucion: "2025-03-18" },
      { id: 2, libro_id: 1, socio_id: 2, fecha_prestamo: "2025-03-09", fecha_devolucion: "2025-03-25" },
      { id: 3, libro_id: 6, socio_id: 3, fecha_prestamo: "2025-03-15", fecha_devolucion: "2025-04-02" },
      { id: 4, libro_id: 9, socio_id: 1, fecha_prestamo: "2025-04-01", fecha_devolucion: "2025-04-15" },
      { id: 5, libro_id: 11, socio_id: 4, fecha_prestamo: "2025-04-07", fecha_devolucion: null },
      { id: 6, libro_id: 3, socio_id: 5, fecha_prestamo: "2025-04-12", fecha_devolucion: "2025-05-01" },
      { id: 7, libro_id: 13, socio_id: 2, fecha_prestamo: "2025-04-20", fecha_devolucion: "2025-05-06" },
      { id: 8, libro_id: 6, socio_id: 6, fecha_prestamo: "2025-05-02", fecha_devolucion: "2025-05-19" },
      { id: 9, libro_id: 10, socio_id: 3, fecha_prestamo: "2025-05-11", fecha_devolucion: null },
      { id: 10, libro_id: 2, socio_id: 7, fecha_prestamo: "2025-05-18", fecha_devolucion: "2025-06-01" },
      { id: 11, libro_id: 3, socio_id: 8, fecha_prestamo: "2025-05-24", fecha_devolucion: "2025-06-10" },
      { id: 12, libro_id: 8, socio_id: 1, fecha_prestamo: "2025-06-03", fecha_devolucion: "2025-06-20" },
      { id: 13, libro_id: 9, socio_id: 5, fecha_prestamo: "2025-06-09", fecha_devolucion: null },
      { id: 14, libro_id: 6, socio_id: 2, fecha_prestamo: "2025-06-15", fecha_devolucion: "2025-07-04" },
      { id: 15, libro_id: 14, socio_id: 6, fecha_prestamo: "2025-06-22", fecha_devolucion: "2025-07-08" },
      { id: 16, libro_id: 11, socio_id: 3, fecha_prestamo: "2025-07-01", fecha_devolucion: "2025-07-17" },
      { id: 17, libro_id: 1, socio_id: 4, fecha_prestamo: "2025-07-06", fecha_devolucion: null },
      { id: 18, libro_id: 7, socio_id: 7, fecha_prestamo: "2025-07-14", fecha_devolucion: "2025-08-02" },
      { id: 19, libro_id: 3, socio_id: 2, fecha_prestamo: "2025-07-21", fecha_devolucion: null },
      { id: 20, libro_id: 13, socio_id: 8, fecha_prestamo: "2025-07-28", fecha_devolucion: "2025-08-12" },
      { id: 21, libro_id: 9, socio_id: 6, fecha_prestamo: "2025-08-04", fecha_devolucion: null },
      { id: 22, libro_id: 6, socio_id: 1, fecha_prestamo: "2025-08-09", fecha_devolucion: null },
    ],
  };

  const ejemplos = [
    {
      titulo: "Listar una tabla",
      nota: "El punto de partida: todo el contenido de una tabla.",
      sql: "SELECT * FROM libros;",
    },
    {
      titulo: "Filtrar y ordenar",
      nota: "WHERE descarta filas; ORDER BY define el orden de salida.",
      sql:
        "SELECT titulo, anio, genero\n" +
        "FROM libros\n" +
        "WHERE anio > 1960\n" +
        "ORDER BY anio DESC;",
    },
    {
      titulo: "JOIN de dos tablas",
      nota: "La clave foránea libros.autor_id apunta a autores.id.",
      sql:
        "SELECT l.titulo, a.nombre AS autor, l.anio\n" +
        "FROM libros l\n" +
        "JOIN autores a ON l.autor_id = a.id\n" +
        "ORDER BY a.nombre, l.anio;",
    },
    {
      titulo: "Contar agrupando",
      nota: "GROUP BY arma un grupo por autor y COUNT cuenta las filas de cada uno.",
      sql:
        "SELECT a.nombre AS autor, COUNT(*) AS libros\n" +
        "FROM autores a\n" +
        "JOIN libros l ON l.autor_id = a.id\n" +
        "GROUP BY a.nombre\n" +
        "ORDER BY libros DESC;",
    },
    {
      titulo: "Préstamos sin devolver",
      nota: "NULL no se compara con =. Para buscarlo hay que usar IS NULL.",
      sql:
        "SELECT s.nombre AS socio, l.titulo, p.fecha_prestamo\n" +
        "FROM prestamos p\n" +
        "JOIN socios s ON p.socio_id = s.id\n" +
        "JOIN libros l ON p.libro_id = l.id\n" +
        "WHERE p.fecha_devolucion IS NULL\n" +
        "ORDER BY p.fecha_prestamo;",
    },
    {
      titulo: "Los más prestados",
      nota: "Tres tablas encadenadas y un filtro sobre el resultado agrupado.",
      sql:
        "SELECT l.titulo, a.nombre AS autor, COUNT(*) AS veces\n" +
        "FROM prestamos p\n" +
        "JOIN libros l ON p.libro_id = l.id\n" +
        "JOIN autores a ON l.autor_id = a.id\n" +
        "GROUP BY l.titulo, a.nombre\n" +
        "HAVING COUNT(*) > 1\n" +
        "ORDER BY veces DESC;",
    },
    {
      titulo: "LEFT JOIN: incluir los que no tienen",
      nota:
        "Un JOIN común esconde a los socios sin préstamos. LEFT JOIN los conserva " +
        "y COUNT sobre la columna de la derecha les da 0.",
      sql:
        "SELECT s.nombre AS socio, COUNT(p.id) AS prestamos\n" +
        "FROM socios s\n" +
        "LEFT JOIN prestamos p ON p.socio_id = s.id\n" +
        "GROUP BY s.nombre\n" +
        "ORDER BY prestamos DESC, socio;",
    },
    {
      titulo: "Búsqueda por texto",
      nota: "LIKE con % busca coincidencias parciales.",
      sql:
        "SELECT titulo, anio\n" +
        "FROM libros\n" +
        "WHERE titulo LIKE '%de%'\n" +
        "ORDER BY titulo;",
    },
    {
      titulo: "Agregados por grupo",
      nota: "Varios agregados sobre el mismo grupo.",
      sql:
        "SELECT genero,\n" +
        "       COUNT(*) AS titulos,\n" +
        "       SUM(ejemplares) AS ejemplares,\n" +
        "       MIN(anio) AS mas_antiguo,\n" +
        "       MAX(anio) AS mas_nuevo\n" +
        "FROM libros\n" +
        "GROUP BY genero\n" +
        "ORDER BY titulos DESC;",
    },
    {
      titulo: "Socios por ciudad",
      nota: "DISTINCT elimina duplicados; IN filtra contra una lista.",
      sql:
        "SELECT DISTINCT ciudad\n" +
        "FROM socios\n" +
        "WHERE ciudad IN ('Quitilipi', 'Resistencia', 'Machagai')\n" +
        "ORDER BY ciudad;",
    },
  ];

  return {
    nombre: "Biblioteca",
    tables: [autores, libros, socios, prestamos],
    ejemplos: ejemplos,
  };
});
