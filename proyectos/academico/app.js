/**
 * Interfaz del demo: arma el panel de esquema, la lista de ejemplos y muestra
 * los resultados que devuelve el motor de sql.js.
 */
(() => {
  "use strict";

  const datos = window.WM_DATA;
  const motor = window.WM_SQL;

  if (!datos || !motor) {
    return;
  }

  const db = motor.crearBase(datos);

  const editor = document.querySelector("#consulta");
  const salida = document.querySelector("#salida");
  const estado = document.querySelector("#estado");
  const btnEjecutar = document.querySelector("#ejecutar");
  const btnLimpiar = document.querySelector("#limpiar");
  const contenedorEsquema = document.querySelector("#esquema");
  const listaEjemplos = document.querySelector("#ejemplos");
  const statFilas = document.querySelector("#stat-filas");

  /* ------------------------------------------------------------- esquema */

  const totalFilas = datos.tables.reduce((n, t) => n + t.rows.length, 0);
  if (statFilas) {
    statFilas.textContent = String(totalFilas);
  }

  function pintarEsquema() {
    const fragmento = document.createDocumentFragment();

    for (const tabla of datos.tables) {
      const caja = document.createElement("div");
      caja.className = "tabla-esquema";

      const cabecera = document.createElement("div");
      cabecera.className = "tabla-esquema__nombre";
      cabecera.appendChild(document.createTextNode(tabla.name));
      const conteo = document.createElement("span");
      conteo.textContent = tabla.rows.length + " filas";
      cabecera.appendChild(conteo);
      caja.appendChild(cabecera);

      const lista = document.createElement("ul");

      for (const col of tabla.columns) {
        const item = document.createElement("li");
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "col-btn";

        const esPk = tabla.pk === col;
        const esFk = Object.prototype.hasOwnProperty.call(tabla.fks, col);

        boton.title = esFk
          ? "Clave foránea hacia " + tabla.fks[col]
          : esPk
          ? "Clave primaria"
          : "Insertar " + tabla.name + "." + col;

        boton.appendChild(document.createTextNode(col));

        if (esPk || esFk) {
          const pill = document.createElement("span");
          pill.className = "pill " + (esPk ? "pill-pk" : "pill-fk");
          pill.textContent = esPk ? "PK" : "FK";
          boton.appendChild(pill);
        }

        const tipo = document.createElement("span");
        tipo.className = "tipo";
        tipo.textContent = tabla.types[col] || "";
        boton.appendChild(tipo);

        boton.addEventListener("click", () => insertarEnEditor(tabla.name + "." + col));
        item.appendChild(boton);
        lista.appendChild(item);
      }

      caja.appendChild(lista);
      fragmento.appendChild(caja);
    }

    contenedorEsquema.appendChild(fragmento);
  }

  function insertarEnEditor(texto) {
    const inicio = editor.selectionStart;
    const fin = editor.selectionEnd;
    const valor = editor.value;
    editor.value = valor.slice(0, inicio) + texto + valor.slice(fin);
    const cursor = inicio + texto.length;
    editor.setSelectionRange(cursor, cursor);
    editor.focus();
  }

  /* ------------------------------------------------------------ ejemplos */

  function pintarEjemplos() {
    const fragmento = document.createDocumentFragment();

    datos.ejemplos.forEach((ejemplo, indice) => {
      const item = document.createElement("li");
      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = "ejemplo-btn";
      boton.dataset.indice = String(indice);

      const titulo = document.createElement("strong");
      titulo.textContent = ejemplo.titulo;
      boton.appendChild(titulo);

      const nota = document.createElement("span");
      nota.textContent = ejemplo.nota;
      boton.appendChild(nota);

      boton.addEventListener("click", () => cargarEjemplo(indice));
      item.appendChild(boton);
      fragmento.appendChild(item);
    });

    listaEjemplos.appendChild(fragmento);
  }

  function cargarEjemplo(indice) {
    const ejemplo = datos.ejemplos[indice];
    editor.value = ejemplo.sql;

    listaEjemplos.querySelectorAll(".ejemplo-btn").forEach((b) => {
      b.classList.toggle("is-active", b.dataset.indice === String(indice));
    });

    ejecutar();
  }

  /* ----------------------------------------------------------- resultado */

  function vaciar(nodo) {
    while (nodo.firstChild) {
      nodo.removeChild(nodo.firstChild);
    }
  }

  function mostrarMensaje(texto, esError, detalle) {
    vaciar(salida);
    const p = document.createElement("p");
    p.className = "mensaje" + (esError ? " mensaje-error" : "");
    p.textContent = texto;

    if (detalle) {
      const code = document.createElement("code");
      code.textContent = detalle;
      p.appendChild(code);
    }

    salida.appendChild(p);
  }

  // Marca con una flecha la posición exacta donde falló el análisis.
  function señalarPosicion(sql, pos) {
    if (typeof pos !== "number") {
      return null;
    }
    const antes = sql.slice(0, pos);
    const linea = antes.split("\n").length;
    const lineas = sql.split("\n");
    const columna = pos - antes.lastIndexOf("\n") - 1;
    const texto = lineas[linea - 1] || "";
    return texto + "\n" + " ".repeat(Math.max(0, columna)) + "^";
  }

  function pintarTabla(resultado) {
    vaciar(salida);

    if (resultado.rows.length === 0) {
      const p = document.createElement("p");
      p.className = "mensaje";
      p.textContent =
        "La consulta es válida pero no devolvió ninguna fila. Probá relajar el WHERE.";
      salida.appendChild(p);
      return;
    }

    const tabla = document.createElement("table");
    tabla.className = "tabla-resultado";

    const thead = document.createElement("thead");
    const filaCabecera = document.createElement("tr");
    for (const col of resultado.columns) {
      const th = document.createElement("th");
      th.scope = "col";
      th.textContent = col;
      filaCabecera.appendChild(th);
    }
    thead.appendChild(filaCabecera);
    tabla.appendChild(thead);

    const tbody = document.createElement("tbody");
    for (const fila of resultado.rows) {
      const tr = document.createElement("tr");
      for (const col of resultado.columns) {
        const td = document.createElement("td");
        const valor = fila[col];

        if (valor === null || valor === undefined) {
          const marca = document.createElement("span");
          marca.className = "nulo";
          marca.textContent = "NULL";
          td.appendChild(marca);
        } else if (typeof valor === "number") {
          td.className = "num";
          td.textContent = Number.isInteger(valor) ? String(valor) : valor.toFixed(2);
        } else if (typeof valor === "boolean") {
          td.textContent = valor ? "verdadero" : "falso";
        } else {
          td.textContent = String(valor);
        }

        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
    tabla.appendChild(tbody);
    salida.appendChild(tabla);
  }

  function ejecutar() {
    const sql = editor.value.trim();

    if (!sql) {
      estado.textContent = "";
      mostrarMensaje("Escribí una consulta o elegí un ejemplo de la izquierda.", false);
      return;
    }

    const inicio = performance.now();

    try {
      const resultado = db.ejecutar(sql);
      const ms = performance.now() - inicio;
      const n = resultado.rows.length;

      estado.textContent =
        n + (n === 1 ? " fila" : " filas") + " · " + ms.toFixed(1) + " ms";
      pintarTabla(resultado);
    } catch (error) {
      estado.textContent = "error";
      const detalle = señalarPosicion(sql, error.pos);
      mostrarMensaje(error.message, true, detalle);
    }
  }

  /* --------------------------------------------------------------- eventos */

  btnEjecutar.addEventListener("click", ejecutar);

  btnLimpiar.addEventListener("click", () => {
    editor.value = "";
    estado.textContent = "";
    listaEjemplos.querySelectorAll(".ejemplo-btn").forEach((b) => {
      b.classList.remove("is-active");
    });
    mostrarMensaje("Escribí una consulta o elegí un ejemplo de la izquierda.", false);
    editor.focus();
  });

  editor.addEventListener("keydown", (evento) => {
    if ((evento.ctrlKey || evento.metaKey) && evento.key === "Enter") {
      evento.preventDefault();
      ejecutar();
    }
  });

  /* ----------------------------------------------------------------- tema */

  const themeToggle = document.querySelector("#theme-toggle");
  const htmlEl = document.documentElement;

  if (themeToggle) {
    const etiquetar = (tema) => {
      themeToggle.setAttribute(
        "aria-label",
        tema === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"
      );
    };

    etiquetar(htmlEl.getAttribute("data-theme"));

    themeToggle.addEventListener("click", () => {
      const siguiente = htmlEl.getAttribute("data-theme") === "light" ? "dark" : "light";
      htmlEl.setAttribute("data-theme", siguiente);
      etiquetar(siguiente);
      try {
        localStorage.setItem("wm-theme", siguiente);
      } catch (e) {
        /* modo privado: el tema no persiste, pero la página sigue funcionando */
      }
    });
  }

  /* --------------------------------------------------------------- arranque */

  pintarEsquema();
  pintarEjemplos();
  cargarEjemplo(0);
})();
