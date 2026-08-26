/**
 * Motor SQL mínimo, sin dependencias.
 *
 * Implementa un subconjunto de SELECT suficiente para practicar consultas:
 *   SELECT [DISTINCT] cols | * | agregados
 *   FROM tabla [alias]
 *   [INNER | LEFT] JOIN tabla [alias] ON cond   (varios)
 *   WHERE cond
 *   GROUP BY cols
 *   HAVING cond
 *   ORDER BY cols [ASC|DESC]
 *   LIMIT n
 *
 * Operadores: = != <> < <= > >= AND OR NOT LIKE IN IS NULL, aritmética + - * /
 * Agregados: COUNT, SUM, AVG, MIN, MAX
 *
 * Respeta la lógica de tres valores de SQL: comparar contra NULL da desconocido,
 * y WHERE solo conserva las filas cuya condición evalúa estrictamente a verdadero.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else {
    root.WM_SQL = api;
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /* ---------------------------------------------------------------- errores */

  class SqlError extends Error {
    constructor(message, pos) {
      super(message);
      this.name = "SqlError";
      this.pos = pos;
    }
  }

  /* ------------------------------------------------------------ tokenizador */

  const KEYWORDS = new Set([
    "SELECT", "DISTINCT", "FROM", "WHERE", "GROUP", "BY", "HAVING", "ORDER",
    "LIMIT", "JOIN", "INNER", "LEFT", "ON", "AS", "AND", "OR", "NOT", "NULL",
    "IS", "LIKE", "IN", "ASC", "DESC",
  ]);

  const AGGREGATES = new Set(["COUNT", "SUM", "AVG", "MIN", "MAX"]);

  function tokenize(sql) {
    const tokens = [];
    let i = 0;

    const isDigit = (c) => c >= "0" && c <= "9";
    const isIdentStart = (c) => /[A-Za-z_À-ɏ]/.test(c);
    const isIdentPart = (c) => /[A-Za-z0-9_À-ɏ]/.test(c);

    while (i < sql.length) {
      const c = sql[i];

      if (c === " " || c === "\t" || c === "\n" || c === "\r") {
        i++;
        continue;
      }

      // Comentarios -- hasta fin de línea
      if (c === "-" && sql[i + 1] === "-") {
        while (i < sql.length && sql[i] !== "\n") i++;
        continue;
      }

      // Comentarios /* ... */
      if (c === "/" && sql[i + 1] === "*") {
        const cierre = sql.indexOf("*/", i + 2);
        if (cierre === -1) throw new SqlError("Comentario /* sin cerrar", i);
        i = cierre + 2;
        continue;
      }

      // Cadenas entre comillas simples, con '' como escape
      if (c === "'") {
        let valor = "";
        let j = i + 1;
        for (;;) {
          if (j >= sql.length) {
            throw new SqlError("Falta cerrar la comilla simple", i);
          }
          if (sql[j] === "'") {
            if (sql[j + 1] === "'") {
              valor += "'";
              j += 2;
              continue;
            }
            break;
          }
          valor += sql[j];
          j++;
        }
        tokens.push({ t: "str", v: valor, pos: i });
        i = j + 1;
        continue;
      }

      if (isDigit(c) || (c === "." && isDigit(sql[i + 1]))) {
        let j = i;
        while (j < sql.length && (isDigit(sql[j]) || sql[j] === ".")) j++;
        const texto = sql.slice(i, j);
        if ((texto.match(/\./g) || []).length > 1) {
          throw new SqlError("Número mal formado: " + texto, i);
        }
        tokens.push({ t: "num", v: Number(texto), pos: i });
        i = j;
        continue;
      }

      if (isIdentStart(c)) {
        let j = i;
        while (j < sql.length && isIdentPart(sql[j])) j++;
        const texto = sql.slice(i, j);
        const arriba = texto.toUpperCase();
        tokens.push({
          t: KEYWORDS.has(arriba) ? "kw" : "id",
          v: KEYWORDS.has(arriba) ? arriba : texto,
          pos: i,
        });
        i = j;
        continue;
      }

      const dos = sql.slice(i, i + 2);
      if (dos === "<=" || dos === ">=" || dos === "<>" || dos === "!=") {
        tokens.push({ t: "op", v: dos === "!=" ? "<>" : dos, pos: i });
        i += 2;
        continue;
      }

      if ("=<>+-*/".includes(c)) {
        tokens.push({ t: "op", v: c, pos: i });
        i++;
        continue;
      }

      if ("(),.;".includes(c)) {
        tokens.push({ t: "punc", v: c, pos: i });
        i++;
        continue;
      }

      throw new SqlError("Carácter inesperado: " + c, i);
    }

    tokens.push({ t: "eof", v: null, pos: sql.length });
    return tokens;
  }

  /* ----------------------------------------------------------------- parser */

  function parse(sql) {
    const tokens = tokenize(sql);
    let p = 0;

    const mirar = (n) => tokens[p + (n || 0)];
    const fin = () => tokens[p].t === "eof";

    function esKw(...nombres) {
      return tokens[p].t === "kw" && nombres.includes(tokens[p].v);
    }
    function esPunc(ch) {
      return tokens[p].t === "punc" && tokens[p].v === ch;
    }
    function esOp(...ops) {
      return tokens[p].t === "op" && ops.includes(tokens[p].v);
    }
    function comer() {
      return tokens[p++];
    }
    function exigirKw(nombre) {
      if (!esKw(nombre)) {
        throw new SqlError(
          "Se esperaba " + nombre + " y se encontró " + describir(tokens[p]),
          tokens[p].pos
        );
      }
      return comer();
    }
    function exigirPunc(ch) {
      if (!esPunc(ch)) {
        throw new SqlError(
          "Se esperaba '" + ch + "' y se encontró " + describir(tokens[p]),
          tokens[p].pos
        );
      }
      return comer();
    }
    function exigirId() {
      if (tokens[p].t !== "id") {
        throw new SqlError(
          "Se esperaba un nombre y se encontró " + describir(tokens[p]),
          tokens[p].pos
        );
      }
      return comer().v;
    }
    function describir(tok) {
      if (tok.t === "eof") return "el final de la consulta";
      if (tok.t === "str") return "'" + tok.v + "'";
      return "'" + tok.v + "'";
    }

    /* --- expresiones, de menor a mayor precedencia --- */

    function parseExpr() {
      return parseOr();
    }

    function parseOr() {
      let izq = parseAnd();
      while (esKw("OR")) {
        comer();
        izq = { type: "binary", op: "OR", left: izq, right: parseAnd() };
      }
      return izq;
    }

    function parseAnd() {
      let izq = parseNot();
      while (esKw("AND")) {
        comer();
        izq = { type: "binary", op: "AND", left: izq, right: parseNot() };
      }
      return izq;
    }

    function parseNot() {
      if (esKw("NOT")) {
        comer();
        return { type: "unary", op: "NOT", expr: parseNot() };
      }
      return parseComparacion();
    }

    function parseComparacion() {
      let izq = parseAditiva();

      for (;;) {
        if (esOp("=", "<>", "<", "<=", ">", ">=")) {
          const op = comer().v;
          izq = { type: "binary", op: op, left: izq, right: parseAditiva() };
          continue;
        }

        // IS [NOT] NULL
        if (esKw("IS")) {
          comer();
          let negado = false;
          if (esKw("NOT")) {
            comer();
            negado = true;
          }
          exigirKw("NULL");
          izq = { type: "isnull", expr: izq, negated: negado };
          continue;
        }

        // [NOT] LIKE / [NOT] IN
        let negado = false;
        if (esKw("NOT") && mirar(1).t === "kw" && ["LIKE", "IN"].includes(mirar(1).v)) {
          comer();
          negado = true;
        }

        if (esKw("LIKE")) {
          comer();
          izq = { type: "like", expr: izq, pattern: parseAditiva(), negated: negado };
          continue;
        }

        if (esKw("IN")) {
          comer();
          exigirPunc("(");
          const lista = [];
          if (!esPunc(")")) {
            lista.push(parseExpr());
            while (esPunc(",")) {
              comer();
              lista.push(parseExpr());
            }
          }
          exigirPunc(")");
          izq = { type: "in", expr: izq, list: lista, negated: negado };
          continue;
        }

        if (negado) {
          throw new SqlError("Se esperaba LIKE o IN después de NOT", tokens[p].pos);
        }
        return izq;
      }
    }

    function parseAditiva() {
      let izq = parseMultiplicativa();
      while (esOp("+", "-")) {
        const op = comer().v;
        izq = { type: "binary", op: op, left: izq, right: parseMultiplicativa() };
      }
      return izq;
    }

    function parseMultiplicativa() {
      let izq = parseUnaria();
      while (esOp("*", "/")) {
        const op = comer().v;
        izq = { type: "binary", op: op, left: izq, right: parseUnaria() };
      }
      return izq;
    }

    function parseUnaria() {
      if (esOp("-")) {
        comer();
        return { type: "unary", op: "-", expr: parseUnaria() };
      }
      return parsePrimaria();
    }

    function parsePrimaria() {
      const tok = tokens[p];

      if (tok.t === "num") {
        comer();
        return { type: "num", value: tok.v };
      }

      if (tok.t === "str") {
        comer();
        return { type: "str", value: tok.v };
      }

      if (esKw("NULL")) {
        comer();
        return { type: "null" };
      }

      if (esPunc("(")) {
        comer();
        const e = parseExpr();
        exigirPunc(")");
        return e;
      }

      if (tok.t === "id") {
        const nombre = comer().v;

        // Agregado: COUNT(*), SUM(col), ...
        if (esPunc("(") && AGGREGATES.has(nombre.toUpperCase())) {
          comer();
          const fn = nombre.toUpperCase();
          if (esOp("*")) {
            comer();
            exigirPunc(")");
            if (fn !== "COUNT") {
              throw new SqlError(fn + "(*) no es válido; usá " + fn + "(columna)", tok.pos);
            }
            return { type: "agg", fn: fn, arg: null, star: true };
          }
          const arg = parseExpr();
          exigirPunc(")");
          return { type: "agg", fn: fn, arg: arg, star: false };
        }

        if (esPunc("(")) {
          throw new SqlError("Función no soportada: " + nombre, tok.pos);
        }

        // tabla.columna
        if (esPunc(".")) {
          comer();
          if (esOp("*")) {
            comer();
            return { type: "starcol", table: nombre };
          }
          const col = exigirId();
          return { type: "col", table: nombre, name: col };
        }

        return { type: "col", table: null, name: nombre };
      }

      throw new SqlError("Expresión inesperada: " + describir(tok), tok.pos);
    }

    /* --- sentencia SELECT --- */

    exigirKw("SELECT");

    let distinct = false;
    if (esKw("DISTINCT")) {
      comer();
      distinct = true;
    }

    const columnas = [];
    for (;;) {
      if (esOp("*")) {
        comer();
        columnas.push({ star: true, table: null });
      } else {
        const e = parseExpr();
        if (e.type === "starcol") {
          columnas.push({ star: true, table: e.table });
        } else {
          let alias = null;
          if (esKw("AS")) {
            comer();
            alias = exigirId();
          } else if (tokens[p].t === "id") {
            alias = comer().v;
          }
          columnas.push({ star: false, expr: e, alias: alias });
        }
      }
      if (esPunc(",")) {
        comer();
        continue;
      }
      break;
    }

    exigirKw("FROM");
    const tablaBase = exigirId();
    let aliasBase = tablaBase;
    if (esKw("AS")) {
      comer();
      aliasBase = exigirId();
    } else if (tokens[p].t === "id") {
      aliasBase = comer().v;
    }

    const joins = [];
    for (;;) {
      let tipo = null;
      if (esKw("LEFT")) {
        comer();
        tipo = "left";
      } else if (esKw("INNER")) {
        comer();
        tipo = "inner";
      }
      if (!esKw("JOIN")) {
        if (tipo) throw new SqlError("Se esperaba JOIN", tokens[p].pos);
        break;
      }
      comer();
      const tabla = exigirId();
      let alias = tabla;
      if (esKw("AS")) {
        comer();
        alias = exigirId();
      } else if (tokens[p].t === "id") {
        alias = comer().v;
      }
      exigirKw("ON");
      const on = parseExpr();
      joins.push({ kind: tipo || "inner", table: tabla, alias: alias, on: on });
    }

    let where = null;
    if (esKw("WHERE")) {
      comer();
      where = parseExpr();
    }

    let groupBy = [];
    if (esKw("GROUP")) {
      comer();
      exigirKw("BY");
      groupBy.push(parseExpr());
      while (esPunc(",")) {
        comer();
        groupBy.push(parseExpr());
      }
    }

    let having = null;
    if (esKw("HAVING")) {
      comer();
      having = parseExpr();
    }

    const orderBy = [];
    if (esKw("ORDER")) {
      comer();
      exigirKw("BY");
      for (;;) {
        const e = parseExpr();
        let dir = "asc";
        if (esKw("ASC")) comer();
        else if (esKw("DESC")) {
          comer();
          dir = "desc";
        }
        orderBy.push({ expr: e, dir: dir });
        if (esPunc(",")) {
          comer();
          continue;
        }
        break;
      }
    }

    let limit = null;
    if (esKw("LIMIT")) {
      comer();
      if (tokens[p].t !== "num") {
        throw new SqlError("LIMIT necesita un número", tokens[p].pos);
      }
      limit = comer().v;
    }

    if (esPunc(";")) comer();

    if (!fin()) {
      throw new SqlError(
        "Sobra texto al final de la consulta: " + describir(tokens[p]),
        tokens[p].pos
      );
    }

    return {
      type: "select",
      distinct: distinct,
      columns: columnas,
      from: { table: tablaBase, alias: aliasBase },
      joins: joins,
      where: where,
      groupBy: groupBy,
      having: having,
      orderBy: orderBy,
      limit: limit,
    };
  }

  /* -------------------------------------------------------------- ejecución */

  // Lógica de tres valores: null representa "desconocido".
  function esVerdadero(v) {
    return v === true;
  }

  function compararValores(a, b) {
    if (a === null && b === null) return 0;
    if (a === null) return -1;
    if (b === null) return 1;
    if (typeof a === "number" && typeof b === "number") return a < b ? -1 : a > b ? 1 : 0;
    const sa = String(a);
    const sb = String(b);
    return sa < sb ? -1 : sa > sb ? 1 : 0;
  }

  function likeARegex(patron) {
    let re = "";
    for (const ch of String(patron)) {
      if (ch === "%") re += "[\\s\\S]*";
      else if (ch === "_") re += "[\\s\\S]";
      else re += ch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    return new RegExp("^" + re + "$", "i");
  }

  function crearBase(dataset) {
    const tablas = {};
    for (const t of dataset.tables) {
      tablas[t.name.toLowerCase()] = t;
    }

    function buscarTabla(nombre) {
      const t = tablas[String(nombre).toLowerCase()];
      if (!t) {
        const disponibles = dataset.tables.map((x) => x.name).join(", ");
        throw new SqlError(
          "No existe la tabla '" + nombre + "'. Disponibles: " + disponibles
        );
      }
      return t;
    }

    function ejecutar(sql) {
      const ast = parse(sql);

      // Mapa alias -> definición de tabla
      const alcance = {};
      const registrar = (alias, tabla) => {
        if (alcance[alias.toLowerCase()]) {
          throw new SqlError("El alias '" + alias + "' está repetido");
        }
        alcance[alias.toLowerCase()] = tabla;
      };

      const tablaBase = buscarTabla(ast.from.table);
      registrar(ast.from.alias, tablaBase);
      for (const j of ast.joins) {
        registrar(j.alias, buscarTabla(j.table));
      }

      const aliases = Object.keys(alcance);

      function resolverColumna(fila, ref) {
        if (ref.table) {
          const clave = ref.table.toLowerCase();
          if (!(clave in alcance)) {
            throw new SqlError("No existe la tabla o alias '" + ref.table + "'");
          }
          const def = alcance[clave];
          if (!def.columns.includes(ref.name)) {
            throw new SqlError(
              "La tabla '" + ref.table + "' no tiene la columna '" + ref.name + "'"
            );
          }
          const r = fila[clave];
          return r ? (r[ref.name] === undefined ? null : r[ref.name]) : null;
        }

        const candidatos = aliases.filter((a) => alcance[a].columns.includes(ref.name));
        if (candidatos.length === 0) {
          throw new SqlError("No existe la columna '" + ref.name + "'");
        }
        if (candidatos.length > 1) {
          throw new SqlError(
            "La columna '" + ref.name + "' es ambigua: está en " +
              candidatos.join(" y ") + ". Escribila como tabla." + ref.name
          );
        }
        const r = fila[candidatos[0]];
        return r ? (r[ref.name] === undefined ? null : r[ref.name]) : null;
      }

      function evaluar(expr, fila, agregados) {
        switch (expr.type) {
          case "num":
            return expr.value;
          case "str":
            return expr.value;
          case "null":
            return null;
          case "col":
            return resolverColumna(fila, expr);

          case "agg": {
            if (!agregados) {
              throw new SqlError(
                "No se puede usar " + expr.fn + "() acá; va en SELECT o HAVING"
              );
            }
            const clave = claveAgregado(expr);
            if (!(clave in agregados)) {
              throw new SqlError("Agregado no calculado: " + clave);
            }
            return agregados[clave];
          }

          case "unary": {
            if (expr.op === "NOT") {
              const v = evaluar(expr.expr, fila, agregados);
              if (v === null) return null;
              return !v;
            }
            const v = evaluar(expr.expr, fila, agregados);
            if (v === null) return null;
            return -Number(v);
          }

          case "isnull": {
            const v = evaluar(expr.expr, fila, agregados);
            return expr.negated ? v !== null : v === null;
          }

          case "like": {
            const v = evaluar(expr.expr, fila, agregados);
            const pat = evaluar(expr.pattern, fila, agregados);
            if (v === null || pat === null) return null;
            const r = likeARegex(pat).test(String(v));
            return expr.negated ? !r : r;
          }

          case "in": {
            const v = evaluar(expr.expr, fila, agregados);
            if (v === null) return null;
            let hayNull = false;
            for (const item of expr.list) {
              const iv = evaluar(item, fila, agregados);
              if (iv === null) {
                hayNull = true;
                continue;
              }
              if (compararValores(v, iv) === 0) return !expr.negated;
            }
            if (hayNull) return null;
            return expr.negated;
          }

          case "binary": {
            const op = expr.op;

            if (op === "AND") {
              const a = evaluar(expr.left, fila, agregados);
              if (a === false) return false;
              const b = evaluar(expr.right, fila, agregados);
              if (b === false) return false;
              if (a === null || b === null) return null;
              return true;
            }

            if (op === "OR") {
              const a = evaluar(expr.left, fila, agregados);
              if (a === true) return true;
              const b = evaluar(expr.right, fila, agregados);
              if (b === true) return true;
              if (a === null || b === null) return null;
              return false;
            }

            const a = evaluar(expr.left, fila, agregados);
            const b = evaluar(expr.right, fila, agregados);
            if (a === null || b === null) return null;

            switch (op) {
              case "=": return compararValores(a, b) === 0;
              case "<>": return compararValores(a, b) !== 0;
              case "<": return compararValores(a, b) < 0;
              case "<=": return compararValores(a, b) <= 0;
              case ">": return compararValores(a, b) > 0;
              case ">=": return compararValores(a, b) >= 0;
              case "+": return Number(a) + Number(b);
              case "-": return Number(a) - Number(b);
              case "*": return Number(a) * Number(b);
              case "/": return Number(b) === 0 ? null : Number(a) / Number(b);
              default:
                throw new SqlError("Operador no soportado: " + op);
            }
          }

          default:
            throw new SqlError("Expresión no soportada: " + expr.type);
        }
      }

      /* --- FROM + JOIN --- */

      let filas = tablaBase.rows.map((r) => {
        const f = {};
        f[ast.from.alias.toLowerCase()] = r;
        return f;
      });

      for (const j of ast.joins) {
        const def = alcance[j.alias.toLowerCase()];
        const clave = j.alias.toLowerCase();
        const salida = [];

        for (const fila of filas) {
          let encontrado = false;
          for (const cand of def.rows) {
            const combinada = Object.assign({}, fila);
            combinada[clave] = cand;
            if (esVerdadero(evaluar(j.on, combinada, null))) {
              salida.push(combinada);
              encontrado = true;
            }
          }
          if (!encontrado && j.kind === "left") {
            const combinada = Object.assign({}, fila);
            combinada[clave] = null;
            salida.push(combinada);
          }
        }
        filas = salida;
      }

      /* --- WHERE --- */

      if (ast.where) {
        filas = filas.filter((f) => esVerdadero(evaluar(ast.where, f, null)));
      }

      /* --- agregados y GROUP BY --- */

      const listaAgregados = [];
      const recolectar = (e) => {
        if (!e || typeof e !== "object") return;
        if (e.type === "agg") {
          listaAgregados.push(e);
          return;
        }
        for (const k of ["expr", "left", "right", "pattern", "arg"]) {
          if (e[k]) recolectar(e[k]);
        }
        if (e.list) e.list.forEach(recolectar);
      };
      ast.columns.forEach((c) => !c.star && recolectar(c.expr));
      if (ast.having) recolectar(ast.having);
      ast.orderBy.forEach((o) => recolectar(o.expr));

      const hayAgregados = listaAgregados.length > 0;
      const agrupado = ast.groupBy.length > 0;

      let grupos;
      if (agrupado || hayAgregados) {
        const mapa = new Map();
        if (agrupado) {
          for (const f of filas) {
            const clave = JSON.stringify(ast.groupBy.map((g) => evaluar(g, f, null)));
            if (!mapa.has(clave)) mapa.set(clave, []);
            mapa.get(clave).push(f);
          }
        } else {
          mapa.set("__todo__", filas);
        }
        grupos = [...mapa.values()].map((rs) => ({
          filas: rs,
          representante: rs[0] || {},
          agregados: calcularAgregados(listaAgregados, rs, evaluar),
        }));
        // Sin GROUP BY y sin filas, un agregado igual devuelve una fila
        if (!agrupado && filas.length === 0) {
          grupos = [{
            filas: [],
            representante: {},
            agregados: calcularAgregados(listaAgregados, [], evaluar),
          }];
        }
      } else {
        grupos = filas.map((f) => ({ filas: [f], representante: f, agregados: null }));
      }

      /* --- HAVING --- */

      if (ast.having) {
        grupos = grupos.filter((g) =>
          esVerdadero(evaluar(ast.having, g.representante, g.agregados))
        );
      }

      /* --- SELECT --- */

      const columnasSalida = [];
      for (const c of ast.columns) {
        if (c.star) {
          const objetivo = c.table ? [c.table.toLowerCase()] : aliases;
          for (const a of objetivo) {
            if (!(a in alcance)) {
              throw new SqlError("No existe la tabla o alias '" + c.table + "'");
            }
            for (const col of alcance[a].columns) {
              columnasSalida.push({
                nombre: aliases.length > 1 ? a + "." + col : col,
                expr: { type: "col", table: a, name: col },
              });
            }
          }
        } else {
          // Igual que SQLite: una columna sin alias sale con su nombre pelado,
          // sin el prefijo de tabla. Si dos columnas chocan se califica la
          // segunda, porque las filas se arman como objetos y una se perdería.
          let nombre = c.alias;
          if (!nombre) {
            nombre = c.expr.type === "col" ? c.expr.name : nombrarExpr(c.expr);
          }
          if (columnasSalida.some((x) => x.nombre === nombre)) {
            nombre = nombrarExpr(c.expr);
            let n = 2;
            while (columnasSalida.some((x) => x.nombre === nombre)) {
              nombre = nombrarExpr(c.expr) + "_" + n++;
            }
          }
          columnasSalida.push({ nombre: nombre, expr: c.expr });
        }
      }

      let salida = grupos.map((g) => {
        const fila = {};
        for (const c of columnasSalida) {
          fila[c.nombre] = evaluar(c.expr, g.representante, g.agregados);
        }
        return { valores: fila, grupo: g };
      });

      /* --- ORDER BY --- */

      if (ast.orderBy.length) {
        // ORDER BY puede referirse a un alias del SELECT (ORDER BY veces DESC).
        // Ese nombre no existe en las tablas de origen, así que primero se
        // busca entre las columnas de salida y recién después se evalúa.
        const nombresSalida = new Set(columnasSalida.map((c) => c.nombre));
        const valorOrden = (o, item) => {
          if (o.expr.type === "col" && !o.expr.table && nombresSalida.has(o.expr.name)) {
            return item.valores[o.expr.name];
          }
          return evaluar(o.expr, item.grupo.representante, item.grupo.agregados);
        };

        salida = salida.slice().sort((x, y) => {
          for (const o of ast.orderBy) {
            const cmp = compararValores(valorOrden(o, x), valorOrden(o, y));
            if (cmp !== 0) return o.dir === "desc" ? -cmp : cmp;
          }
          return 0;
        });
      }

      let filasFinales = salida.map((s) => s.valores);

      /* --- DISTINCT --- */

      if (ast.distinct) {
        const vistas = new Set();
        filasFinales = filasFinales.filter((f) => {
          const clave = JSON.stringify(columnasSalida.map((c) => f[c.nombre]));
          if (vistas.has(clave)) return false;
          vistas.add(clave);
          return true;
        });
      }

      /* --- LIMIT --- */

      if (ast.limit !== null) {
        filasFinales = filasFinales.slice(0, ast.limit);
      }

      return {
        columns: columnasSalida.map((c) => c.nombre),
        rows: filasFinales,
      };
    }

    return { ejecutar: ejecutar, tablas: dataset.tables };
  }

  function claveAgregado(expr) {
    return expr.fn + "(" + (expr.star ? "*" : nombrarExpr(expr.arg)) + ")";
  }

  function nombrarExpr(e) {
    if (!e) return "?";
    switch (e.type) {
      case "col": return e.table ? e.table + "." + e.name : e.name;
      case "num": return String(e.value);
      case "str": return "'" + e.value + "'";
      case "null": return "NULL";
      case "agg": return claveAgregado(e);
      case "binary": return nombrarExpr(e.left) + " " + e.op + " " + nombrarExpr(e.right);
      case "unary": return e.op + " " + nombrarExpr(e.expr);
      case "isnull": return nombrarExpr(e.expr) + (e.negated ? " IS NOT NULL" : " IS NULL");
      case "like": return nombrarExpr(e.expr) + (e.negated ? " NOT LIKE " : " LIKE ") + nombrarExpr(e.pattern);
      case "in": return nombrarExpr(e.expr) + (e.negated ? " NOT IN (...)" : " IN (...)");
      default: return "expr";
    }
  }

  function calcularAgregados(lista, filas, evaluar) {
    const salida = {};
    for (const agg of lista) {
      const clave = claveAgregado(agg);

      if (agg.star) {
        salida[clave] = filas.length;
        continue;
      }

      const valores = filas
        .map((f) => evaluar(agg.arg, f, null))
        .filter((v) => v !== null);

      switch (agg.fn) {
        case "COUNT":
          salida[clave] = valores.length;
          break;
        case "SUM":
          salida[clave] = valores.length
            ? valores.reduce((a, b) => a + Number(b), 0)
            : null;
          break;
        case "AVG":
          salida[clave] = valores.length
            ? valores.reduce((a, b) => a + Number(b), 0) / valores.length
            : null;
          break;
        case "MIN":
          salida[clave] = valores.length
            ? valores.reduce((a, b) => (compararValores(a, b) <= 0 ? a : b))
            : null;
          break;
        case "MAX":
          salida[clave] = valores.length
            ? valores.reduce((a, b) => (compararValores(a, b) >= 0 ? a : b))
            : null;
          break;
        default:
          throw new SqlError("Agregado no soportado: " + agg.fn);
      }
    }
    return salida;
  }

  return { crearBase: crearBase, parse: parse, tokenize: tokenize, SqlError: SqlError };
});
