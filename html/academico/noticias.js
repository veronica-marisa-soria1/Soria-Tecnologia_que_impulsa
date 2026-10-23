const CLAVE_NOTICIAS = 'epgs12-noticias';
const MAX_NOTICIAS = 10;
const TAMANO_MAXIMO_IMAGEN = 1.5 * 1024 * 1024;
const TIPOS_IMAGEN_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];

const formulario = document.getElementById('formularioNoticia');
const listado = document.getElementById('listadoNoticias');
const estadoFormulario = document.getElementById('estadoFormularioNoticia');
const entradaImagen = document.getElementById('imagenNoticia');
const vistaPrevia = document.getElementById('vistaPreviaNoticia');

function leerNoticias() {
    const guardadas = localStorage.getItem(CLAVE_NOTICIAS);
    if (!guardadas) return [];

    const noticias = JSON.parse(guardadas);
    if (!Array.isArray(noticias) || noticias.some(noticia =>
        !noticia || typeof noticia.id !== 'string' ||
        typeof noticia.titulo !== 'string' ||
        typeof noticia.categoria !== 'string' ||
        typeof noticia.fecha !== 'string' ||
        typeof noticia.resumen !== 'string' ||
        typeof noticia.contenido !== 'string' ||
        (noticia.imagen !== null && typeof noticia.imagen !== 'string')
    )) {
        throw new Error('El formato de las noticias guardadas no es válido.');
    }

    const recientes = noticias.sort((a, b) =>
        b.fecha.localeCompare(a.fecha) || b.id.localeCompare(a.id)
    );
    const limitadas = recientes.slice(0, MAX_NOTICIAS);
    if (limitadas.length !== noticias.length) {
        localStorage.setItem(CLAVE_NOTICIAS, JSON.stringify(limitadas));
    }
    return limitadas;
}

function mostrarError(mensaje) {
    estadoFormulario.textContent = mensaje;
}

function mostrarNoticias() {
    const noticias = leerNoticias();
    const botonPublicar = formulario.querySelector('[type="submit"]');
    const contador = document.getElementById('contadorNoticias');
    contador.textContent = `${noticias.length} de ${MAX_NOTICIAS} noticias publicadas`;
    botonPublicar.disabled = noticias.length >= MAX_NOTICIAS;
    if (botonPublicar.disabled) {
        mostrarError(`Alcanzaste el límite de ${MAX_NOTICIAS} noticias. Eliminá una para publicar otra.`);
    }
    listado.replaceChildren();

    if (noticias.length === 0) {
        const vacio = document.createElement('p');
        vacio.className = 'noticias-vacio';
        vacio.textContent = 'Todavía no hay noticias publicadas. ¡Podés compartir la primera!';
        listado.append(vacio);
        return;
    }

    noticias.forEach(noticia => {
        const tarjeta = document.createElement('article');
        tarjeta.className = 'noticia-tarjeta';

        if (noticia.imagen) {
            const imagen = document.createElement('img');
            imagen.className = 'noticia-imagen';
            imagen.src = noticia.imagen;
            imagen.alt = `Imagen de la noticia: ${noticia.titulo}`;
            tarjeta.append(imagen);
        }

        const cuerpo = document.createElement('div');
        cuerpo.className = 'noticia-cuerpo';

        const meta = document.createElement('div');
        meta.className = 'noticia-meta';

        const categoria = document.createElement('span');
        categoria.className = 'noticia-categoria';
        categoria.textContent = noticia.categoria;

        const fecha = document.createElement('time');
        fecha.dateTime = noticia.fecha;
        const fechaLocal = new Date(`${noticia.fecha}T00:00:00`);
        fecha.textContent = Number.isNaN(fechaLocal.getTime())
            ? noticia.fecha
            : new Intl.DateTimeFormat('es-AR', { dateStyle: 'long' }).format(fechaLocal);
        meta.append(categoria, fecha);

        const titulo = document.createElement('h3');
        titulo.textContent = noticia.titulo;

        const resumen = document.createElement('p');
        resumen.className = 'noticia-resumen';
        resumen.textContent = noticia.resumen;

        const contenido = document.createElement('p');
        contenido.className = 'noticia-contenido';
        contenido.textContent = noticia.contenido;

        const eliminar = document.createElement('button');
        eliminar.className = 'noticia-eliminar';
        eliminar.type = 'button';
        eliminar.dataset.noticiaId = noticia.id;
        eliminar.textContent = 'Eliminar noticia';
        eliminar.setAttribute('aria-label', `Eliminar noticia: ${noticia.titulo}`);

        cuerpo.append(meta, titulo, resumen, contenido, eliminar);
        tarjeta.append(cuerpo);
        listado.append(tarjeta);
    });
}

function leerImagen(archivo) {
    return new Promise((resolve, reject) => {
        const lector = new FileReader();
        lector.addEventListener('load', () => {
            if (typeof lector.result !== 'string') {
                reject(new Error('No se pudo leer el archivo de imagen.'));
                return;
            }
            resolve(lector.result);
        });
        lector.addEventListener('error', () => reject(new Error('No se pudo leer el archivo de imagen.')));
        lector.readAsDataURL(archivo);
    });
}

function fechaActual() {
    const ahora = new Date();
    const desplazamiento = ahora.getTimezoneOffset() * 60000;
    return new Date(ahora.getTime() - desplazamiento).toISOString().slice(0, 10);
}

entradaImagen.addEventListener('change', async () => {
    estadoFormulario.textContent = '';
    vistaPrevia.hidden = true;
    vistaPrevia.removeAttribute('src');
    const archivo = entradaImagen.files[0];
    if (!archivo) return;

    if (!TIPOS_IMAGEN_PERMITIDOS.includes(archivo.type)) {
        entradaImagen.value = '';
        mostrarError('El formato de imagen no es válido. Elegí un archivo JPG, PNG o WebP.');
        return;
    }
    if (archivo.size > TAMANO_MAXIMO_IMAGEN) {
        entradaImagen.value = '';
        mostrarError('La imagen supera el máximo permitido de 1,5 MB.');
        return;
    }

    try {
        vistaPrevia.src = await leerImagen(archivo);
        vistaPrevia.hidden = false;
    } catch (error) {
        mostrarError(error.message);
    }
});

formulario.addEventListener('submit', async event => {
    event.preventDefault();
    estadoFormulario.textContent = '';

    const botonPublicar = formulario.querySelector('[type="submit"]');
    botonPublicar.disabled = true;

    try {
        const datos = new FormData(formulario);
        const noticias = leerNoticias();
        if (noticias.length >= MAX_NOTICIAS) {
            throw new Error(`Alcanzaste el límite de ${MAX_NOTICIAS} noticias. Eliminá una para publicar otra.`);
        }

        const archivo = entradaImagen.files[0];
        let imagen = null;

        if (archivo) {
            if (!TIPOS_IMAGEN_PERMITIDOS.includes(archivo.type)) {
                throw new Error('El formato de imagen no es válido. Elegí un archivo JPG, PNG o WebP.');
            }
            if (archivo.size > TAMANO_MAXIMO_IMAGEN) {
                throw new Error('La imagen supera el máximo permitido de 1,5 MB.');
            }
            imagen = await leerImagen(archivo);
        }

        const noticia = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            titulo: datos.get('titulo').trim(),
            categoria: datos.get('categoria'),
            fecha: datos.get('fecha'),
            resumen: datos.get('resumen').trim(),
            contenido: datos.get('contenido').trim(),
            imagen
        };

        noticias.push(noticia);
        localStorage.setItem(CLAVE_NOTICIAS, JSON.stringify(noticias));
        formulario.reset();
        document.getElementById('fechaNoticia').value = fechaActual();
        vistaPrevia.hidden = true;
        vistaPrevia.removeAttribute('src');
        mostrarNoticias();
        estadoFormulario.textContent = noticias.length >= MAX_NOTICIAS
            ? `La noticia se publicó. Alcanzaste el límite de ${MAX_NOTICIAS}; eliminá una para publicar otra.`
            : 'La noticia se publicó y quedó guardada en este navegador.';
    } catch (error) {
        mostrarError(`No se pudo publicar la noticia. ${error.message}`);
    } finally {
        botonPublicar.disabled = false;
    }
});

listado.addEventListener('click', event => {
    const boton = event.target.closest('[data-noticia-id]');
    if (!boton) return;

    try {
        const noticias = leerNoticias().filter(noticia => noticia.id !== boton.dataset.noticiaId);
        localStorage.setItem(CLAVE_NOTICIAS, JSON.stringify(noticias));
        mostrarNoticias();
        estadoFormulario.textContent = 'La noticia se eliminó.';
    } catch (error) {
        mostrarError(`No se pudo eliminar la noticia. ${error.message}`);
    }
});

document.getElementById('fechaNoticia').value = fechaActual();

try {
    mostrarNoticias();
} catch (error) {
    listado.replaceChildren();
    mostrarError(`No se pudieron cargar las noticias guardadas. ${error.message}`);
}
