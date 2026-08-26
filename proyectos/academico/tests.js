/* Pruebas del motor SQL: resultados esperados calculados a mano. */
// Ejecutar con:  node tests.js
const SQL = require("./sql.js");
const DATA = require("./data.js");

const db = SQL.crearBase(DATA);

let ok = 0;
let fallo = 0;

function eq(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function test(nombre, sql, esperado) {
  let r;
  try {
    r = db.ejecutar(sql);
  } catch (e) {
    fallo++;
    console.log("FALLA  " + nombre + "\n       error inesperado: " + e.message);
    return;
  }
  const obtenido = { columns: r.columns, rows: r.rows };
  if (eq(obtenido, esperado)) {
    ok++;
    console.log("ok     " + nombre);
  } else {
    fallo++;
    console.log("FALLA  " + nombre);
    console.log("       esperado: " + JSON.stringify(esperado));
    console.log("       obtenido: " + JSON.stringify(obtenido));
  }
}

function testError(nombre, sql, fragmento) {
  try {
    db.ejecutar(sql);
    fallo++;
    console.log("FALLA  " + nombre + " -> se esperaba un error y no hubo");
  } catch (e) {
    if (e.message.includes(fragmento)) {
      ok++;
      console.log("ok     " + nombre);
    } else {
      fallo++;
      console.log("FALLA  " + nombre + "\n       mensaje: " + e.message);
    }
  }
}

/* ------------------------------------------------------------ básicos */

test("conteo total de libros", "SELECT COUNT(*) AS n FROM libros", {
  columns: ["n"],
  rows: [{ n: 14 }],
});

test("conteo de socios", "SELECT COUNT(*) AS n FROM socios", {
  columns: ["n"],
  rows: [{ n: 9 }],
});

test("conteo de prestamos", "SELECT COUNT(*) AS n FROM prestamos", {
  columns: ["n"],
  rows: [{ n: 22 }],
});

test(
  "proyeccion con alias y filtro",
  "SELECT titulo, anio FROM libros WHERE anio < 1950 ORDER BY anio",
  {
    columns: ["titulo", "anio"],
    rows: [
      { titulo: "Ficciones", anio: 1944 },
      { titulo: "El Aleph", anio: 1949 },
    ],
  }
);

test("ORDER BY DESC con LIMIT", "SELECT titulo FROM libros ORDER BY anio DESC LIMIT 2", {
  columns: ["titulo"],
  rows: [{ titulo: "Nuestra parte de noche" }, { titulo: "Las cosas que perdimos en el fuego" }],
});

/* -------------------------------------------------------------- WHERE */

test(
  "AND / OR con precedencia",
  "SELECT titulo FROM libros WHERE genero = 'Novela' AND anio < 1970 ORDER BY titulo",
  {
    columns: ["titulo"],
    rows: [{ titulo: "Cien años de soledad" }, { titulo: "Rayuela" }],
  }
);

test("IN con lista", "SELECT COUNT(*) AS n FROM libros WHERE genero IN ('Ensayo','Poesía')", {
  columns: ["n"],
  rows: [{ n: 2 }],
});

test("NOT IN", "SELECT COUNT(*) AS n FROM libros WHERE genero NOT IN ('Novela','Cuento')", {
  columns: ["n"],
  rows: [{ n: 2 }],
});

test("LIKE con %", "SELECT COUNT(*) AS n FROM libros WHERE titulo LIKE 'El %'", {
  columns: ["n"],
  rows: [{ n: 2 }],
});

test("LIKE es insensible a mayusculas", "SELECT COUNT(*) AS n FROM libros WHERE titulo LIKE 'el %'", {
  columns: ["n"],
  rows: [{ n: 2 }],
});

// ejemplares >= 4 -> ids 1(4), 3(5), 6(6), 8(4), 13(5) = 5 libros
test("aritmetica en WHERE", "SELECT COUNT(*) AS n FROM libros WHERE ejemplares * 2 >= 8", {
  columns: ["n"],
  rows: [{ n: 5 }],
});

/* --------------------------------------------------------------- NULL */

// prestamos sin devolver: ids 5, 9, 13, 17, 19, 21, 22 = 7 de 22
test("IS NULL", "SELECT COUNT(*) AS n FROM prestamos WHERE fecha_devolucion IS NULL", {
  columns: ["n"],
  rows: [{ n: 7 }],
});

test("IS NOT NULL", "SELECT COUNT(*) AS n FROM prestamos WHERE fecha_devolucion IS NOT NULL", {
  columns: ["n"],
  rows: [{ n: 15 }],
});

// Lógica de tres valores: comparar con NULL nunca es verdadero
test("comparar con NULL no devuelve filas", "SELECT COUNT(*) AS n FROM prestamos WHERE fecha_devolucion = NULL", {
  columns: ["n"],
  rows: [{ n: 0 }],
});

test("NOT sobre NULL tampoco devuelve filas", "SELECT COUNT(*) AS n FROM prestamos WHERE NOT (fecha_devolucion = NULL)", {
  columns: ["n"],
  rows: [{ n: 0 }],
});

test("COUNT(col) ignora los NULL", "SELECT COUNT(fecha_devolucion) AS n FROM prestamos", {
  columns: ["n"],
  rows: [{ n: 15 }],
});

/* --------------------------------------------------------------- JOIN */

test(
  "JOIN simple",
  "SELECT COUNT(*) AS n FROM libros l JOIN autores a ON l.autor_id = a.id",
  { columns: ["n"], rows: [{ n: 14 }] }
);

test(
  "JOIN filtrado por autor",
  "SELECT l.titulo FROM libros l JOIN autores a ON l.autor_id = a.id WHERE a.nombre = 'Julio Cortázar' ORDER BY l.anio",
  {
    columns: ["titulo"],
    rows: [{ titulo: "Bestiario" }, { titulo: "Final del juego" }, { titulo: "Rayuela" }],
  }
);

test(
  "triple JOIN",
  "SELECT COUNT(*) AS n FROM prestamos p JOIN libros l ON p.libro_id = l.id JOIN autores a ON l.autor_id = a.id",
  { columns: ["n"], rows: [{ n: 22 }] }
);

// Valentina (id 9) no tiene prestamos: con JOIN desaparece, con LEFT JOIN queda en 0
test(
  "JOIN esconde al socio sin prestamos",
  "SELECT COUNT(*) AS n FROM socios s JOIN prestamos p ON p.socio_id = s.id GROUP BY s.id",
  {
    columns: ["n"],
    rows: [{ n: 4 }, { n: 4 }, { n: 3 }, { n: 2 }, { n: 2 }, { n: 3 }, { n: 2 }, { n: 2 }],
  }
);

test(
  "LEFT JOIN conserva al socio sin prestamos",
  "SELECT s.nombre AS socio, COUNT(p.id) AS n FROM socios s LEFT JOIN prestamos p ON p.socio_id = s.id GROUP BY s.nombre ORDER BY n, socio LIMIT 1",
  { columns: ["socio", "n"], rows: [{ socio: "Valentina Ruiz", n: 0 }] }
);

test(
  "LEFT JOIN produce NULL en la tabla derecha",
  "SELECT s.nombre AS socio, p.id AS prestamo FROM socios s LEFT JOIN prestamos p ON p.socio_id = s.id WHERE p.id IS NULL",
  { columns: ["socio", "prestamo"], rows: [{ socio: "Valentina Ruiz", prestamo: null }] }
);

/* ----------------------------------------------------- GROUP BY / agg */

test(
  "GROUP BY con COUNT",
  "SELECT genero, COUNT(*) AS n FROM libros GROUP BY genero ORDER BY n DESC, genero",
  {
    columns: ["genero", "n"],
    rows: [
      { genero: "Cuento", n: 6 },
      { genero: "Novela", n: 6 },
      { genero: "Ensayo", n: 1 },
      { genero: "Poesía", n: 1 },
    ],
  }
);

test(
  "SUM y MIN y MAX",
  "SELECT SUM(ejemplares) AS total, MIN(anio) AS viejo, MAX(anio) AS nuevo FROM libros",
  { columns: ["total", "viejo", "nuevo"], rows: [{ total: 45, viejo: 1944, nuevo: 2019 }] }
);

test("AVG", "SELECT AVG(ejemplares) AS promedio FROM libros WHERE genero = 'Novela'", {
  columns: ["promedio"],
  rows: [{ promedio: (5 + 6 + 3 + 4 + 2 + 3) / 6 }],
});

test(
  "HAVING filtra grupos",
  "SELECT genero, COUNT(*) AS n FROM libros GROUP BY genero HAVING COUNT(*) > 1 ORDER BY genero",
  {
    columns: ["genero", "n"],
    rows: [{ genero: "Cuento", n: 6 }, { genero: "Novela", n: 6 }],
  }
);

// Rayuela (id 3) y Cien años (id 6) empatan en 4; desempata el titulo
test(
  "libros mas prestados, con empate",
  "SELECT l.titulo, COUNT(*) AS veces FROM prestamos p JOIN libros l ON p.libro_id = l.id GROUP BY l.titulo ORDER BY veces DESC, l.titulo LIMIT 2",
  {
    columns: ["titulo", "veces"],
    rows: [
      { titulo: "Cien años de soledad", veces: 4 },
      { titulo: "Rayuela", veces: 4 },
    ],
  }
);

test("agregado sobre conjunto vacio", "SELECT COUNT(*) AS n, SUM(ejemplares) AS s FROM libros WHERE anio > 3000", {
  columns: ["n", "s"],
  rows: [{ n: 0, s: null }],
});

/* ----------------------------------------------------------- DISTINCT */

test("DISTINCT", "SELECT DISTINCT genero FROM libros ORDER BY genero", {
  columns: ["genero"],
  rows: [{ genero: "Cuento" }, { genero: "Ensayo" }, { genero: "Novela" }, { genero: "Poesía" }],
});

test("DISTINCT sobre ciudades", "SELECT COUNT(*) AS n FROM socios", { columns: ["n"], rows: [{ n: 9 }] });

/* -------------------------------------------------------- SELECT star */

test("SELECT * expande columnas", "SELECT * FROM autores LIMIT 1", {
  columns: ["id", "nombre", "nacionalidad", "anio_nacimiento"],
  rows: [{ id: 1, nombre: "Jorge Luis Borges", nacionalidad: "Argentina", anio_nacimiento: 1899 }],
});

test(
  "SELECT tabla.* con JOIN",
  "SELECT a.* FROM autores a JOIN libros l ON l.autor_id = a.id WHERE l.titulo = 'Rayuela'",
  {
    columns: ["a.id", "a.nombre", "a.nacionalidad", "a.anio_nacimiento"],
    rows: [{ "a.id": 2, "a.nombre": "Julio Cortázar", "a.nacionalidad": "Argentina", "a.anio_nacimiento": 1914 }],
  }
);

/* -------------------------------------------------------------- errores */

testError("tabla inexistente", "SELECT * FROM pepe", "No existe la tabla");
testError("columna inexistente", "SELECT pepe FROM libros", "No existe la columna");
testError("columna ambigua", "SELECT id FROM libros JOIN autores ON libros.autor_id = autores.id", "ambigua");
testError("sintaxis: falta FROM", "SELECT titulo libros", "Se esperaba FROM");
testError("sintaxis: parentesis", "SELECT COUNT(* FROM libros", "Se esperaba ')'");
testError("comilla sin cerrar", "SELECT * FROM libros WHERE titulo = 'x", "comilla simple");
testError("funcion no soportada", "SELECT UPPER(titulo) FROM libros", "no soportada");
testError("texto sobrante", "SELECT * FROM libros basura extra", "Sobra texto");

console.log("\n" + ok + " ok, " + fallo + " fallas");
process.exit(fallo ? 1 : 0);
