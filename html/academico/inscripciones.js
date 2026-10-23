const formularioPreinscripcion = document.getElementById('formularioPreinscripcion');
const estadoPreinscripcion = document.getElementById('estadoPreinscripcion');
const fechaNacimiento = document.getElementById('fechaNacimiento');

function obtenerFechaLocal() {
    const hoy = new Date();
    hoy.setMinutes(hoy.getMinutes() - hoy.getTimezoneOffset());
    return hoy.toISOString().slice(0, 10);
}

fechaNacimiento.max = obtenerFechaLocal();

formularioPreinscripcion.addEventListener('submit', event => {
    event.preventDefault();
    estadoPreinscripcion.textContent =
        'El formulario está completo, pero todavía no se envió ni se guardó tu información. Para formalizar la preinscripción, comunicate con la institución.';
});
